#!/usr/bin/env python3
"""Check generated DocFX links offline with Python 3.10+."""

import argparse
import json
import posixpath
import re
import sys
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import quote, unquote, urljoin, urlsplit


class Page(HTMLParser):
    def __init__(self, content: str):
        super().__init__(convert_charrefs=True)
        self.ids: set[str] = set()
        self.links: list[str] = []
        self.has_base = False
        self.feed(content)

    def handle_starttag(self, tag, attributes):
        attributes = dict(attributes)
        if attributes.get("id"):
            self.ids.add(attributes["id"])
        if tag == "a" and attributes.get("name"):
            self.ids.add(attributes["name"])
        for key in ("href", "src"):
            if attributes.get(key):
                self.links.append(attributes[key])
        if tag == "base" and "href" in attributes:
            self.has_base = True
        if tag == "meta" and attributes.get("name") in (
            "docfx:navrel",
            "docfx:tocrel",
        ):
            if attributes.get("content"):
                self.links.append(attributes["content"])

    handle_startendtag = handle_starttag


class SiteChecker:
    def __init__(self, site: Path, base_url: str):
        self.root = site.resolve()
        if not self.root.is_dir():
            raise ValueError(f"site directory does not exist: {site}")
        base = urlsplit(base_url)
        if (
            base.scheme not in ("https", "http")
            or not base.netloc
            or base.query
            or base.fragment
            or not base.path.endswith("/")
            or base.username
            or base.password
        ):
            raise ValueError("base URL must be an HTTP(S) site URL ending in '/'")
        self.base_url = base_url
        self.base = base
        self.prefix = unquote(base.path, errors="strict")
        self.errors: list[str] = []
        self.pages: dict[Path, Page] = {}
        self.checked = 0

    def exact_file(self, relative: str) -> Path:
        current = self.root
        for part in Path(relative).parts:
            if not current.is_dir():
                raise ValueError(f"missing file: {relative}")
            names = {entry.name: entry for entry in current.iterdir()}
            if part not in names:
                mismatch = next(
                    (name for name in names if name.casefold() == part.casefold()),
                    None,
                )
                if mismatch:
                    raise ValueError(f"filename case mismatch: {part!r}, found {mismatch!r}")
                raise ValueError(f"missing file: {relative}")
            current = names[part]
        if current.is_dir():
            if "index.html" not in {entry.name for entry in current.iterdir()}:
                raise ValueError(f"directory has no index.html: {relative or '/'}")
            current = current / "index.html"
        if not current.is_file() or not current.resolve().is_relative_to(self.root):
            raise ValueError(f"not a file within the site: {relative}")
        return current.relative_to(self.root)

    def destination(self, source: Path, reference: str):
        original = urlsplit(reference)
        if original.scheme and original.scheme not in ("http", "https"):
            return None
        source_url = urljoin(self.base_url, quote(source.as_posix(), safe="/"))
        target = urlsplit(urljoin(source_url, reference))
        if (target.scheme, target.netloc.lower()) != (
            self.base.scheme,
            self.base.netloc.lower(),
        ):
            return None
        if re.search(r"%(?![0-9a-fA-F]{2})", target.path):
            raise ValueError("invalid percent-encoding in URL")
        path = unquote(target.path, errors="strict")
        if "\\" in path or "\0" in path:
            raise ValueError("invalid URL path")
        normalized = posixpath.normpath(path)
        if normalized == self.prefix.rstrip("/"):
            relative = ""
        elif (normalized + "/").startswith(self.prefix):
            relative = normalized[len(self.prefix):]
        elif original.scheme or original.netloc:
            return None
        else:
            raise ValueError(f"link escapes site base path {self.prefix!r}")
        return self.exact_file(relative), unquote(target.fragment, errors="strict")

    def check_reference(self, source: Path, reference: str, html_only=False):
        try:
            destination = self.destination(source, reference)
            if destination is None:
                if html_only:
                    raise ValueError("expected a local HTML destination")
                return
            target, fragment = destination
            self.checked += 1
            is_html = target.suffix.lower() in (".html", ".htm")
            if html_only and not is_html:
                raise ValueError("expected a local HTML destination")
            if is_html and target not in self.pages:
                raise ValueError(f"HTML destination could not be parsed: {target}")
            if is_html and fragment and fragment not in self.pages[target].ids:
                raise ValueError(f"missing fragment #{fragment} in {target.as_posix()}")
        except (ValueError, OSError, UnicodeError) as error:
            self.errors.append(f"{source.as_posix()}: {reference!r}: {error}")

    def check(self, required_anchors=()) -> list[str]:
        self.errors.clear()
        self.pages.clear()
        self.checked = 0
        css_files = []
        for file in sorted(self.root.rglob("*")):
            if not file.is_file() or file.suffix.lower() not in (".html", ".htm", ".css"):
                continue
            relative = file.relative_to(self.root)
            if not file.resolve().is_relative_to(self.root):
                self.errors.append(f"file escapes site directory: {relative}")
                continue
            try:
                content = file.read_text(encoding="utf-8-sig")
            except (OSError, UnicodeError) as error:
                self.errors.append(f"{relative}: cannot read file: {error}")
                continue
            if file.suffix.lower() == ".css":
                css_files.append((relative, content))
            else:
                self.pages[relative] = Page(content)
        if not self.pages:
            self.errors.append("site contains no HTML pages")
        self.check_reference(Path("index.html"), "index.html", html_only=True)
        for path, page in self.pages.items():
            if page.has_base:
                self.errors.append(f"{path}: <base href> is unsupported by this checker")
                continue
            for reference in page.links:
                self.check_reference(path, reference)
        for path, content in css_files:
            content = re.sub(r"/\*.*?\*/", "", content, flags=re.DOTALL)
            for match in re.finditer(r"""url\(\s*(?:"([^"]*)"|'([^']*)'|([^)]*?))\s*\)""", content):
                reference = next(group for group in match.groups() if group is not None).strip()
                if reference and not reference.startswith("#"):
                    self.check_reference(path, reference)
        try:
            index = json.loads((self.root / "index.json").read_text(encoding="utf-8-sig"))
            if not isinstance(index, dict) or not index:
                raise ValueError("expected a nonempty object mapping URLs to search entries")
            for reference, entry in index.items():
                if not reference or not isinstance(entry, dict):
                    raise ValueError(f"invalid search entry: {reference!r}")
                self.check_reference(Path("index.json"), reference, html_only=True)
                if "href" in entry:
                    if not isinstance(entry["href"], str) or not entry["href"]:
                        raise ValueError(f"invalid search href: {reference!r}")
                    self.check_reference(Path("index.json"), entry["href"], html_only=True)
        except (OSError, ValueError, UnicodeError) as error:
            self.errors.append(f"index.json: {error}")
        for reference in required_anchors:
            try:
                if not urlsplit(reference).fragment:
                    raise ValueError("required anchor must include a fragment")
            except ValueError as error:
                self.errors.append(f"{reference!r}: {error}")
            else:
                self.check_reference(Path("index.html"), reference, html_only=True)
        return self.errors


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("site", type=Path)
    parser.add_argument("--base-url", required=True)
    parser.add_argument("--require-anchor", action="append", default=[])
    arguments = parser.parse_args()
    try:
        checker = SiteChecker(arguments.site, arguments.base_url)
    except (ValueError, OSError) as error:
        parser.error(str(error))
    errors = checker.check(arguments.require_anchor)
    if errors:
        for error in errors:
            print(f"FAIL {error}", file=sys.stderr)
        return 1
    print(f"Checked {len(checker.pages)} HTML files and {checker.checked} local references.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
