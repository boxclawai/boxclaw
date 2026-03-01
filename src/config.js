import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join } from 'node:path';

const SKILLS_DIR = '.skills';
const MANIFEST_FILE = '.boxclaw.json';

export function getSkillsDir(cwd = process.cwd()) {
  return join(cwd, SKILLS_DIR);
}

export function getManifestPath(cwd = process.cwd()) {
  return join(cwd, SKILLS_DIR, MANIFEST_FILE);
}

export function getSkillPath(name, cwd = process.cwd()) {
  return join(cwd, SKILLS_DIR, name);
}

export function skillsExist(cwd = process.cwd()) {
  return existsSync(getSkillsDir(cwd));
}

export function isSkillInstalled(name, cwd = process.cwd()) {
  return existsSync(getSkillPath(name, cwd));
}

export async function readManifest(cwd = process.cwd()) {
  const path = getManifestPath(cwd);
  if (!existsSync(path)) {
    return { version: '1.0.0', installed: {} };
  }
  const data = await readFile(path, 'utf-8');
  return JSON.parse(data);
}

export async function writeManifest(manifest, cwd = process.cwd()) {
  const dir = getSkillsDir(cwd);
  if (!existsSync(dir)) {
    await mkdir(dir, { recursive: true });
  }
  const path = getManifestPath(cwd);
  await writeFile(path, JSON.stringify(manifest, null, 2) + '\n', 'utf-8');
}

export async function addToManifest(name, version = '1.0.0', cwd = process.cwd()) {
  const manifest = await readManifest(cwd);
  manifest.installed[name] = {
    version,
    installedAt: new Date().toISOString(),
  };
  await writeManifest(manifest, cwd);
}

export async function removeFromManifest(name, cwd = process.cwd()) {
  const manifest = await readManifest(cwd);
  delete manifest.installed[name];
  await writeManifest(manifest, cwd);
}
