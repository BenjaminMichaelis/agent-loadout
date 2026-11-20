import { existsSync } from "node:fs";
import { relative, resolve, sep } from "node:path";
import type { Skill } from "./repo.ts";

export const SKILL_NAME = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
export const MAX_NAME = 64;
export const MAX_DESCRIPTION = 1024;
export const MAX_COMPATIBILITY = 500;
export const MAX_LINES = 500;
export const ALLOWED_KEYS = new Set(["name", "description", "license", "compatibility", "metadata", "allowed-tools"]);

const MARKDOWN_LINK = /\[[^\]]*\]\(([^)\s]+)(?:\s+"[^"]*")?\)/g;

export function validateSkill(skill: Skill): string[] {
  const errors: string[] = [];
  if (!existsSync(skill.file)) {
    return ["missing SKILL.md"];
  }
  if (!skill.frontmatter) {
    return [skill.frontmatterError ?? "missing frontmatter"];
  }

  const fm = skill.frontmatter;
  for (const key of Object.keys(fm)) {
    if (!ALLOWED_KEYS.has(key)) {
      errors.push(`unknown frontmatter key "${key}" (allowed: ${[...ALLOWED_KEYS].join(", ")})`);
    }
  }

  const name = fm.name;
  if (typeof name !== "string" || name.length === 0) {
    errors.push("name is required");
  } else {
    if (name.length > MAX_NAME) errors.push(`name exceeds ${MAX_NAME} characters`);
    if (!SKILL_NAME.test(name)) errors.push("name must be lowercase letters, digits, and single hyphens");
    if (name !== skill.dirName) errors.push(`name "${name}" must match directory "${skill.dirName}"`);
  }

  const description = fm.description;
  if (typeof description !== "string" || description.trim().length === 0) {
    errors.push("description is required");
  } else {
    if (description.length > MAX_DESCRIPTION) errors.push(`description exceeds ${MAX_DESCRIPTION} characters`);
    if (/\bTODO\b/.test(description)) errors.push("description still contains TODO");
  }

  if (fm.compatibility !== undefined) {
    if (typeof fm.compatibility !== "string") errors.push("compatibility must be a string");
    else if (fm.compatibility.length > MAX_COMPATIBILITY) errors.push(`compatibility exceeds ${MAX_COMPATIBILITY} characters`);
  }

  if (fm.license !== undefined && typeof fm.license !== "string") {
    errors.push("license must be a string");
  }

  if (fm["allowed-tools"] !== undefined && typeof fm["allowed-tools"] !== "string") {
    errors.push("allowed-tools must be a space-delimited string");
  }

  if (fm.metadata !== undefined) {
    const metadata = fm.metadata;
    if (metadata === null || typeof metadata !== "object" || Array.isArray(metadata)) {
      errors.push("metadata must be a string-to-string map");
    } else {
      for (const [key, value] of Object.entries(metadata)) {
        if (typeof value !== "string") errors.push(`metadata.${key} must be a string`);
      }
    }
  }

  if (skill.body.trim().length === 0) errors.push("SKILL.md body is empty");
  if (/\bTODO\b/.test(stripCode(skill.body))) errors.push("SKILL.md body still contains TODO");
  if (skill.lineCount > MAX_LINES) errors.push(`SKILL.md has ${skill.lineCount} lines (max ${MAX_LINES}); move detail into references/`);

  errors.push(...validateLinks(skill));
  return errors;
}

function stripCode(markdown: string): string {
  return markdown.replace(/```[\s\S]*?```/g, "").replace(/`[^`\n]*`/g, "");
}

export function validateLinks(skill: Skill): string[] {
  const errors: string[] = [];
  for (const match of stripCode(skill.body).matchAll(MARKDOWN_LINK)) {
    const target = match[1];
    if (/^[a-z][a-z0-9+.-]*:/i.test(target) || target.startsWith("#")) continue;
    const path = decodeURIComponent(target.split("#")[0]);
    if (path.length === 0) continue;
    const resolved = resolve(skill.dir, path);
    const rel = relative(skill.dir, resolved);
    if (rel.startsWith("..") || rel.split(sep).includes("..")) {
      errors.push(`link "${target}" points outside the skill directory`);
    } else if (!existsSync(resolved)) {
      errors.push(`link "${target}" does not exist`);
    }
  }
  return errors;
}
