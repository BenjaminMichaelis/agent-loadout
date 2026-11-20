import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { parse as parseYaml } from "yaml";

export const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..", "..");

export interface PluginManifest {
  $schema: string;
  name: string;
  version?: string;
  description?: string;
  author?: { name?: string; email?: string; url?: string };
  homepage?: string;
  repository?: string;
  license?: string;
  keywords?: string[];
  extensions?: Record<string, object>;
}

export interface Skill {
  dirName: string;
  dir: string;
  file: string;
  frontmatter: Record<string, unknown> | undefined;
  frontmatterError?: string;
  body: string;
  lineCount: number;
}

export function isMain(moduleUrl: string): boolean {
  return process.argv[1] !== undefined && pathToFileURL(resolve(process.argv[1])).href === moduleUrl;
}

export function readJson<T = unknown>(path: string): T {
  return JSON.parse(readFileSync(path, "utf8")) as T;
}

export function loadPluginManifest(root = ROOT): PluginManifest {
  return readJson<PluginManifest>(join(root, "plugin.json"));
}

const FRONTMATTER = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/;

export function parseSkillFile(text: string): Pick<Skill, "frontmatter" | "frontmatterError" | "body"> {
  const match = FRONTMATTER.exec(text);
  if (!match) {
    return { frontmatter: undefined, frontmatterError: "missing YAML frontmatter", body: text };
  }
  try {
    const data: unknown = parseYaml(match[1]);
    if (data === null || typeof data !== "object" || Array.isArray(data)) {
      return { frontmatter: undefined, frontmatterError: "frontmatter must be a YAML mapping", body: match[2] };
    }
    return { frontmatter: data as Record<string, unknown>, body: match[2] };
  } catch (error) {
    return { frontmatter: undefined, frontmatterError: `invalid YAML: ${(error as Error).message}`, body: match[2] };
  }
}

export function listSkills(skillsDir: string): Skill[] {
  if (!existsSync(skillsDir)) {
    return [];
  }
  return readdirSync(skillsDir)
    .filter((entry) => statSync(join(skillsDir, entry)).isDirectory())
    .sort()
    .map((dirName) => {
      const dir = join(skillsDir, dirName);
      const file = join(dir, "SKILL.md");
      const text = existsSync(file) ? readFileSync(file, "utf8") : "";
      return {
        dirName,
        dir,
        file,
        ...parseSkillFile(text),
        lineCount: text.split(/\r?\n/).length,
      };
    });
}
