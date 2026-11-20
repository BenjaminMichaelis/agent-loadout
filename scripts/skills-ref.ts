import { spawnSync } from "node:child_process";
import { join } from "node:path";
import { ROOT, isMain, listSkills } from "./lib/repo.ts";

const SKILLS_REF = "skills-ref==0.1.1";
const SKILL_DIRS = ["skills", join(".claude", "skills")];

if (isMain(import.meta.url)) {
  let failed = false;
  for (const parent of SKILL_DIRS) {
    for (const skill of listSkills(join(ROOT, parent))) {
      const result = spawnSync("uvx", ["--from", SKILLS_REF, "agentskills", "validate", skill.dir], { stdio: "inherit" });
      if (result.error) {
        console.error(`Could not run uvx: ${result.error.message}. Install uv from https://docs.astral.sh/uv/.`);
        process.exit(2);
      }
      failed ||= result.status !== 0;
    }
  }
  process.exit(failed ? 1 : 0);
}
