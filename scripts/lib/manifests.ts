import type { PluginManifest } from "./repo.ts";

export interface GeneratedFile {
  path: string;
  content: string;
}

function definedOnly<T extends object>(value: T): T {
  return Object.fromEntries(Object.entries(value).filter(([, v]) => v !== undefined)) as T;
}

function sharedMetadata(manifest: PluginManifest) {
  return definedOnly({
    name: manifest.name,
    version: manifest.version,
    description: manifest.description,
    author: manifest.author,
    homepage: manifest.homepage,
    repository: manifest.repository,
    license: manifest.license,
    keywords: manifest.keywords,
  });
}

export function claudePlugin(manifest: PluginManifest): object {
  return sharedMetadata(manifest);
}

// Copilot CLI also reads .claude-plugin/marketplace.json, so one marketplace file serves both.
export function claudeMarketplace(manifest: PluginManifest): object {
  return definedOnly({
    name: manifest.name,
    owner: definedOnly({ name: manifest.author?.name ?? manifest.name, url: manifest.author?.url, email: manifest.author?.email }),
    metadata: definedOnly({ description: manifest.description, version: manifest.version }),
    plugins: [{ ...sharedMetadata(manifest), source: "./" }],
  });
}

export function toJson(value: object): string {
  return `${JSON.stringify(value, null, 2)}\n`;
}

export function generatedFiles(manifest: PluginManifest): GeneratedFile[] {
  return [
    { path: ".claude-plugin/plugin.json", content: toJson(claudePlugin(manifest)) },
    { path: ".claude-plugin/marketplace.json", content: toJson(claudeMarketplace(manifest)) },
  ];
}
