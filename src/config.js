import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const TYPE_DIRS = {
  skill: '.skills',
  mcp: '.mcp',
  rag: '.rag',
};

const MANIFEST_FILE = '.boxclaw.json';

export function getTypeDir(type, cwd = process.cwd()) {
  return join(cwd, TYPE_DIRS[type] || `.${type}`);
}

export function getManifestPath(cwd = process.cwd()) {
  return join(cwd, MANIFEST_FILE);
}

export function getItemPath(type, name, cwd = process.cwd()) {
  return join(cwd, TYPE_DIRS[type] || `.${type}`, name);
}

export function isInstalled(type, name, cwd = process.cwd()) {
  const manifest = readManifestSync(cwd);
  return !!(manifest[type] && manifest[type][name]);
}

function readManifestSync(cwd) {
  const path = getManifestPath(cwd);
  if (!existsSync(path)) return { version: '1.0.0' };
  try {
    return JSON.parse(readFileSync(path, 'utf-8'));
  } catch {
    return { version: '1.0.0' };
  }
}

export async function readManifest(cwd = process.cwd()) {
  const path = getManifestPath(cwd);
  if (!existsSync(path)) {
    return { version: '1.0.0' };
  }
  const data = await readFile(path, 'utf-8');
  return JSON.parse(data);
}

export async function writeManifest(manifest, cwd = process.cwd()) {
  const path = getManifestPath(cwd);
  await writeFile(path, JSON.stringify(manifest, null, 2) + '\n', 'utf-8');
}

export async function addToManifest(type, name, version = '1.0.0', cwd = process.cwd()) {
  const manifest = await readManifest(cwd);
  if (!manifest[type]) manifest[type] = {};
  manifest[type][name] = {
    version,
    installedAt: new Date().toISOString(),
  };
  await writeManifest(manifest, cwd);
}

export async function removeFromManifest(type, name, cwd = process.cwd()) {
  const manifest = await readManifest(cwd);
  if (manifest[type]) {
    delete manifest[type][name];
  }
  await writeManifest(manifest, cwd);
}

export async function getInstalled(type, cwd = process.cwd()) {
  const manifest = await readManifest(cwd);
  return manifest[type] || {};
}
