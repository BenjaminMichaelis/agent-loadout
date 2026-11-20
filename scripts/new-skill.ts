import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { isMain, ROOT } from "./lib/repo.ts";
import { MAX_NAME, SKILL_NAME } from "./lib/skills.ts";

export function skillTemplate(name: string): string {
  return `---
name: ${name}
description: TODO Say what this skill does and when to use it. Include the words a user would say.
license: MIT
---

# ${name}

TODO Write the instructions the agent follows once this skill activates.
`;
}

export function evalTemplate(name: string): string {
  return `name: ${name}
description: TODO Describe what this eval checks.
version: "1.0"
type: capability
defaults:
  runs: 3
  timeout: 3m
scoring:
  threshold: 1.0
agent_environment:
  skills:
    - ../../skills/${name}
stimuli:
  - name: should-trigger
    prompt: |
      TODO A realistic request that should activate the skill.
    tags: { priority: p0, kind: trigger }
    graders:
      - type: skill-invocation
        config:
          required: [${name}]

  - name: should-not-trigger
    prompt: |
      TODO A nearby request that should not activate the skill.
    tags: { priority: p0, kind: non-trigger }
    graders:
      - type: skill-invocation
        config:
          disallowed: [${name}]
`;
}

export function scaffoldSkill(name: string, root = ROOT): string[] {
  if (!SKILL_NAME.test(name) || name.length > MAX_NAME) {
    throw new Error(`"${name}" is not a valid skill name: use lowercase letters, digits, and single hyphens (max ${MAX_NAME}).`);
  }
  const skillDir = join(root, "skills", name);
  const evalDir = join(root, "evals", name);
  if (existsSync(skillDir) || existsSync(evalDir)) {
    throw new Error(`skills/${name} or evals/${name} already exists.`);
  }
  mkdirSync(skillDir, { recursive: true });
  mkdirSync(evalDir, { recursive: true });
  writeFileSync(join(skillDir, "SKILL.md"), skillTemplate(name));
  writeFileSync(join(evalDir, "eval.yaml"), evalTemplate(name));
  return [`skills/${name}/SKILL.md`, `evals/${name}/eval.yaml`];
}

if (isMain(import.meta.url)) {
  const name = process.argv[2];
  if (!name) {
    console.error("Usage: npm run new:skill -- <name>");
    process.exit(1);
  }
  try {
    for (const path of scaffoldSkill(name)) console.log(`created ${path}`);
    console.log('Replace every TODO, then run "npm run check".');
  } catch (error) {
    console.error((error as Error).message);
    process.exit(1);
  }
}
