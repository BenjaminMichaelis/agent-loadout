import { existsSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { Ajv2020 } from "ajv/dist/2020.js";
import { findDrift } from "./generate.ts";
import { isMain, listSkills, loadPluginManifest, readJson, ROOT } from "./lib/repo.ts";
import { validateSkill } from "./lib/skills.ts";

const SEMVER = /^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?(?:\+[0-9A-Za-z.-]+)?$/;

export function validateRepository(root = ROOT): string[] {
  const problems: string[] = [];
  const report = (where: string, messages: string[]) => problems.push(...messages.map((m) => `${where}: ${m}`));

  const ajv = new Ajv2020({ allErrors: true, strict: false });
  const pluginSchema = readJson<object>(join(root, "schemas", "agent-plugins-plugin-1.0.0.schema.json"));
  const mcpSchema = readJson<object>(join(root, "schemas", "agent-plugins-mcp-1.0.0.schema.json"));

  const manifest = loadPluginManifest(root);
  const validatePlugin = ajv.compile(pluginSchema);
  if (!validatePlugin(manifest)) {
    report("plugin.json", (validatePlugin.errors ?? []).map((e) => `${e.instancePath || "/"} ${e.message}`));
  }
  if (manifest.version === undefined || !SEMVER.test(manifest.version)) {
    report("plugin.json", ["version must be SemVer"]);
  }
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(manifest.name)) {
    report("plugin.json", ["name must be kebab-case so every harness accepts it"]);
  }

  const mcpPath = join(root, "mcp.json");
  if (existsSync(mcpPath)) {
    const validateMcp = ajv.compile(mcpSchema);
    if (!validateMcp(readJson(mcpPath))) {
      report("mcp.json", (validateMcp.errors ?? []).map((e) => `${e.instancePath || "/"} ${e.message}`));
    }
  }

  const shipped = listSkills(join(root, "skills"));
  if (shipped.length === 0) {
    report("skills", ["no shipped skills found"]);
  }
  for (const skill of shipped) {
    const where = relative(root, skill.dir).replaceAll("\\", "/");
    report(where, validateSkill(skill));
    if (!existsSync(join(root, "evals", skill.dirName, "eval.yaml"))) {
      report(where, [`missing evals/${skill.dirName}/eval.yaml`]);
    }
  }

  const evalsDir = join(root, "evals");
  if (existsSync(evalsDir)) {
    const shippedNames = new Set(shipped.map((s) => s.dirName));
    for (const entry of readdirSync(evalsDir)) {
      if (statSync(join(evalsDir, entry)).isDirectory() && !shippedNames.has(entry)) {
        report(`evals/${entry}`, ["has no matching skill in skills/"]);
      }
    }
  }

  for (const skill of listSkills(join(root, ".claude", "skills"))) {
    report(relative(root, skill.dir).replaceAll("\\", "/"), validateSkill(skill));
  }

  for (const path of findDrift(root)) {
    report(path, ['out of date; run "npm run generate"']);
  }

  return problems;
}

if (isMain(import.meta.url)) {
  const problems = validateRepository();
  if (problems.length > 0) {
    console.error(`Validation failed with ${problems.length} problem(s):`);
    for (const problem of problems) console.error(`  ${problem}`);
    process.exit(1);
  }
  console.log("Validation passed.");
}
