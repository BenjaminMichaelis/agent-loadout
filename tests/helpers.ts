import { cpSync, mkdirSync, mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { listSkills, ROOT, type Skill } from "../scripts/lib/repo.ts";

export function tempDir(): string {
  return mkdtempSync(join(tmpdir(), "agent-loadout-"));
}

export function copyRepo(): string {
  const dir = tempDir();
  for (const path of ["plugin.json", "schemas", "skills", "evals", ".claude-plugin"]) {
    cpSync(join(ROOT, path), join(dir, path), { recursive: true });
  }
  return dir;
}

export function writeSkill(root: string, dirName: string, text: string, files: Record<string, string> = {}): Skill {
  const dir = join(root, dirName);
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, "SKILL.md"), text);
  for (const [path, content] of Object.entries(files)) {
    mkdirSync(join(dir, path, ".."), { recursive: true });
    writeFileSync(join(dir, path), content);
  }
  return listSkills(root).find((skill) => skill.dirName === dirName)!;
}

export function skillText(frontmatter: string, body = "Do the thing.\n"): string {
  return `---\n${frontmatter}\n---\n\n${body}`;
}
