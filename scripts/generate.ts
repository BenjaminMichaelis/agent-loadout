import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { generatedFiles } from "./lib/manifests.ts";
import { isMain, loadPluginManifest, ROOT } from "./lib/repo.ts";

export function findDrift(root = ROOT): string[] {
  return generatedFiles(loadPluginManifest(root))
    .filter(({ path, content }) => {
      const target = join(root, path);
      return !existsSync(target) || readFileSync(target, "utf8").replace(/\r\n/g, "\n") !== content;
    })
    .map(({ path }) => path);
}

function main(): void {
  if (process.argv.includes("--check")) {
    const stale = findDrift();
    if (stale.length > 0) {
      console.error(`Generated files are out of date. Run "npm run generate".\n  ${stale.join("\n  ")}`);
      process.exit(1);
    }
    console.log("Generated files are up to date.");
    return;
  }

  for (const { path, content } of generatedFiles(loadPluginManifest())) {
    const target = join(ROOT, path);
    mkdirSync(dirname(target), { recursive: true });
    writeFileSync(target, content);
    console.log(`wrote ${path}`);
  }
}

if (isMain(import.meta.url)) {
  main();
}
