import assert from "node:assert/strict";
import { join } from "node:path";
import { describe, it } from "node:test";
import { listSkills } from "../scripts/lib/repo.ts";
import { validateSkill } from "../scripts/lib/skills.ts";
import { scaffoldSkill } from "../scripts/new-skill.ts";
import { tempDir } from "./helpers.ts";

describe("scaffoldSkill", () => {
  it("creates a skill and eval that fail validation until TODOs are replaced", () => {
    const root = tempDir();
    assert.deepEqual(scaffoldSkill("my-skill", root), ["skills/my-skill/SKILL.md", "evals/my-skill/eval.yaml"]);
    const [skill] = listSkills(join(root, "skills"));
    assert.match(validateSkill(skill).join(), /TODO/);
  });

  it("rejects invalid and existing names", () => {
    const root = tempDir();
    assert.throws(() => scaffoldSkill("My_Skill", root), /not a valid skill name/);
    scaffoldSkill("dup", root);
    assert.throws(() => scaffoldSkill("dup", root), /already exists/);
  });
});
