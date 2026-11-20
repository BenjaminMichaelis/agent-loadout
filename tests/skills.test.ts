import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { validateSkill } from "../scripts/lib/skills.ts";
import { skillText, tempDir, writeSkill } from "./helpers.ts";

const VALID = "name: demo\ndescription: Demo skill. Use when testing.";

function errorsFor(text: string, files?: Record<string, string>, dirName = "demo"): string[] {
  return validateSkill(writeSkill(tempDir(), dirName, text, files));
}

describe("validateSkill", () => {
  it("accepts a valid skill with an existing relative link", () => {
    const body = "See [details](references/details.md).\n";
    assert.deepEqual(errorsFor(skillText(VALID, body), { "references/details.md": "x" }), []);
  });

  it("requires name to match the directory", () => {
    assert.match(errorsFor(skillText(VALID), {}, "other").join(), /must match directory "other"/);
  });

  it("rejects names that break the spec", () => {
    const errors = errorsFor(skillText("name: Demo--x\ndescription: d"), {}, "Demo--x");
    assert.match(errors.join(), /lowercase letters, digits, and single hyphens/);
  });

  it("rejects unknown frontmatter keys", () => {
    assert.match(errorsFor(skillText(`${VALID}\nversion: 1`)).join(), /unknown frontmatter key "version"/);
  });

  it("rejects leftover TODO markers outside code", () => {
    assert.match(errorsFor(skillText("name: demo\ndescription: TODO later")).join(), /description still contains TODO/);
    assert.match(errorsFor(skillText(VALID, "TODO write this\n")).join(), /body still contains TODO/);
    assert.deepEqual(errorsFor(skillText(VALID, "Run `grep TODO`.\n")), []);
  });

  it("rejects missing links and links outside the skill", () => {
    const errors = errorsFor(skillText(VALID, "[a](missing.md) [b](../escape.md)\n")).join();
    assert.match(errors, /"missing.md" does not exist/);
    assert.match(errors, /"..\/escape.md" points outside/);
  });

  it("reports invalid YAML frontmatter", () => {
    assert.match(errorsFor(skillText("name: [unclosed")).join(), /invalid YAML/);
  });
});
