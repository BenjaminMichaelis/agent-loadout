import json
import tempfile
import unittest
from pathlib import Path

from check_docs import SiteChecker


class SiteCheckerTests(unittest.TestCase):
    def setUp(self):
        self.temporary = tempfile.TemporaryDirectory()
        self.addCleanup(self.temporary.cleanup)
        self.site = Path(self.temporary.name)
        self.write("index.html", '<a href="docs/guide.html#start">Guide</a>')
        self.write("docs/guide.html", '<h1 id="start">Guide</h1><a href="../index.html">Home</a>')
        self.write("index.json", json.dumps({
            "index.html": {"title": "Home"},
            "docs/guide.html": {"href": "docs/guide.html", "title": "Guide"},
        }))

    def write(self, name, content):
        file = self.site / name
        file.parent.mkdir(parents=True, exist_ok=True)
        file.write_text(content, encoding="utf-8")

    def check(self, anchors=(), base_url="https://example.test/Project/"):
        return SiteChecker(self.site, base_url).check(anchors)

    def test_links_metadata_decoding_and_css_assets(self):
        self.write("index.html", """
            <meta name="docfx:tocrel" content="toc.html">
            <a href="/Project/docs/guide.html?view=full#start">Rooted</a>
            <a href="https://example.test/Project/docs/guide.html#start">Absolute</a>
            <a href="https://example.test/another-project/">External project</a>
            <a href="https://elsewhere.test/no-network-check">External</a>
            <a href="mailto:docs@example.test">Mail</a>
            <a href="docs/a%20space.html#some%20id">Encoded</a>
            <link rel="stylesheet" href="assets/site.css">
        """)
        self.write("toc.html", '<a href="docs/guide.html#start">Guide</a>')
        self.write("docs/a space.html", '<h1 id="some id">Title</h1>')
        self.write("assets/site.css", """
            /* url(missing-in-comment.png) */
            a { background: url('./icon.svg'); }
            b { background: url(data:image/svg+xml;base64,AAAA); }
            c { filter: url(#inline-filter); }
        """)
        self.write("assets/icon.svg", "<svg></svg>")
        self.assertEqual([], self.check(["docs/guide.html#start"]))

    def test_missing_files_fragments_and_case(self):
        for href, expected in (
            ("missing.html", "missing file"),
            ("docs/guide.html#absent", "missing fragment"),
            ("docs/Guide.html", "filename case mismatch"),
        ):
            with self.subTest(href=href):
                self.write("index.html", f'<a href="{href}">Broken</a>')
                self.assertTrue(any(expected in error for error in self.check()))

    def test_prefix_and_traversal_fail_even_on_windows(self):
        for href in (
            "/docs/guide.html",
            "../guide.html",
            "docs/%2e%2e/%2e%2e/guide.html",
            "/ProjectExtra/guide.html",
        ):
            with self.subTest(href=href):
                self.write("index.html", f'<a href="{href}">Broken</a>')
                self.assertTrue(any("escapes site base path" in error for error in self.check()))

    def test_required_legacy_anchor_is_checked_without_incoming_links(self):
        self.assertEqual([], self.check(["docs/guide.html#start"]))
        self.assertTrue(any("missing fragment" in error for error in self.check(["docs/guide.html#old"])))
        self.assertTrue(any("must include a fragment" in error for error in self.check(["index.html"])))

    def test_missing_toc_and_css_asset(self):
        self.write("index.html", '<meta name="docfx:navrel" content="missing-toc.html">')
        self.write("assets/site.css", "a { background: url(missing.svg); }")
        errors = self.check()
        self.assertTrue(any("missing-toc.html" in error for error in errors))
        self.assertTrue(any("missing.svg" in error for error in errors))

    def test_search_data_must_be_valid_local_html(self):
        for index in ("not json", "[]", "{}", '{"missing.html": {}}', '{"index.html": []}',
                      '{"index.html": {"href": 7}}', '{"https://elsewhere.test/": {}}'):
            with self.subTest(index=index):
                self.write("index.json", index)
                self.assertTrue(any("index.json" in error for error in self.check()))

    def test_missing_search_index_and_empty_output_fail(self):
        (self.site / "index.json").unlink()
        self.assertTrue(any("index.json" in error for error in self.check()))
        with tempfile.TemporaryDirectory() as empty:
            self.assertTrue(SiteChecker(Path(empty), "https://example.test/").check())

    def test_directory_indexes_and_domain_root(self):
        self.write("index.html", '<a href="/docs/">Docs</a>')
        self.write("docs/index.html", '<a href="../index.html">Home</a>')
        self.assertEqual([], self.check(base_url="https://example.test/"))

    def test_unsupported_base_element_fails_explicitly(self):
        self.write("index.html", '<base href="https://elsewhere.test/">')
        self.assertTrue(any("<base href>" in error for error in self.check()))

    def test_malformed_urls_fail_without_aborting_the_report(self):
        self.write("index.html", '<a href="https://[">Invalid</a><a href="bad%URL">Invalid</a>')
        errors = self.check(["https://["])
        self.assertEqual(3, len(errors))
        self.assertTrue(any("invalid percent-encoding" in error for error in errors))


if __name__ == "__main__":
    unittest.main()
