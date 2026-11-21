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

  it("enforces SemVer as a repository policy", () => {
    for (const version of ["one", "01.2.3", "1.2.3-01", "1.2.3-.."]) {
      const root = copyRepo();
      const manifestPath = join(root, "plugin.json");
      const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
      writeFileSync(manifestPath, JSON.stringify({ ...manifest, version }));
      const problems = validateRepository(root).join();
      assert.match(problems, /plugin\.json: version must be SemVer/);
      assert.doesNotMatch(problems, /plugin\.json: \/version must be string/);
    }

    const root = copyRepo();
    const manifestPath = join(root, "plugin.json");
    const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
    writeFileSync(manifestPath, JSON.stringify({ ...manifest, version: "1.2.3-alpha.1+build.5" }));
    assert.doesNotMatch(validateRepository(root).join(), /plugin\.json: version must be SemVer/);
  });

  it("rejects manifests that violate the Agent Plugins schema", () => {
    const sourceRoot = copyRepo();
    const baseManifest = JSON.parse(readFileSync(join(sourceRoot, "plugin.json"), "utf8"));
    const invalidManifests: Array<{ manifest: object; error: RegExp }> = [
      { manifest: { name: "agent-loadout" }, error: /plugin\.json: \/ must have required property '\$schema'/ },
      { manifest: { ...baseManifest, version: 1 }, error: /plugin\.json: \/version must be string/ },
      { manifest: { ...baseManifest, unexpected: true }, error: /plugin\.json: \/ must NOT have additional properties/ },
    ];

    for (const { manifest, error } of invalidManifests) {
      const root = copyRepo();
      writeFileSync(join(root, "plugin.json"), JSON.stringify(manifest));
      assert.match(validateRepository(root).join(), error);
    }
  });
});
