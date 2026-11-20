import assert from "node:assert/strict";
import { mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { describe, it } from "node:test";
import { findDrift } from "../scripts/generate.ts";
import { validateRepository } from "../scripts/validate.ts";
import { copyRepo } from "./helpers.ts";

describe("validateRepository", () => {
  it("passes on the current repository contents", () => {
    assert.deepEqual(validateRepository(copyRepo()), []);
  });

  it("detects generated manifests that drift from plugin.json", () => {
    const root = copyRepo();
    const manifestPath = join(root, "plugin.json");
    const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
    writeFileSync(manifestPath, JSON.stringify({ ...manifest, version: "9.9.9" }));
    assert.deepEqual(findDrift(root), [".claude-plugin/plugin.json", ".claude-plugin/marketplace.json"]);
  });

  it("requires an eval for each skill and a skill for each eval", () => {
    const root = copyRepo();
    rmSync(join(root, "evals", "conventional-commits"), { recursive: true });
    mkdirSync(join(root, "evals", "orphan"));
    const problems = validateRepository(root).join("\n");
    assert.match(problems, /missing evals\/conventional-commits\/eval.yaml/);
    assert.match(problems, /evals\/orphan: has no matching skill/);
  });

  it("rejects a plugin.json that breaks the Agent Plugins schema", () => {
    const root = copyRepo();
    const manifestPath = join(root, "plugin.json");
    const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
    writeFileSync(manifestPath, JSON.stringify({ ...manifest, version: "one" }));
    assert.match(validateRepository(root).join(), /version must be SemVer/);
  });
});
