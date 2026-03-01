import ora from 'ora';
import pc from 'picocolors';
import { getItemInfo } from '../registry.js';
import { downloadFromTarball } from '../downloader.js';
import { getItemPath, getTypeDir, addToManifest, isInstalled } from '../config.js';
import { installMcp } from './install-mcp.js';
import { installRag } from './install-rag.js';
import { log } from '../utils.js';
import { mkdir, rm } from 'node:fs/promises';
import { existsSync } from 'node:fs';

export async function installSkill(name, options) {
  const spinner = ora(`Looking up skill ${pc.bold(name)}...`).start();

  let info;
  try {
    info = await getItemInfo('skill', name);
  } catch (err) {
    spinner.fail('Failed to fetch skill registry');
    log.error(err.message);
    process.exit(1);
  }

  if (!info) {
    spinner.fail(`Skill ${pc.bold(name)} not found`);
    log.dim('Run `boxclaw list --type skill` to see available skills');
    process.exit(1);
  }

  if (isInstalled('skill', name) && !options.force) {
    spinner.fail(`Skill ${pc.bold(name)} is already installed`);
    log.dim('Use --force to reinstall');
    process.exit(1);
  }

  const dir = getTypeDir('skill');
  if (!existsSync(dir)) await mkdir(dir, { recursive: true });

  const destDir = getItemPath('skill', name);
  spinner.text = `Downloading ${info.emoji || ''} ${pc.bold(info.role || info.name)}...`;

  try {
    await downloadFromTarball(name, destDir);
    await addToManifest('skill', name, info.version || '1.0.0');
  } catch (err) {
    // Clean up partial download
    await rm(destDir, { recursive: true, force: true }).catch(() => {});
    spinner.fail('Download failed');
    log.error(err.message);
    process.exit(1);
  }

  spinner.succeed(`Installed ${info.emoji || ''} ${pc.bold(info.role || info.name)}`);
  console.log('');
  log.dim(`  Location:    .skills/${name}/`);
  log.dim(`  References:  ${info.refs ?? 0} document${(info.refs ?? 0) !== 1 ? 's' : ''}`);
  log.dim(`  Scripts:     ${info.scripts ?? 0} script${(info.scripts ?? 0) !== 1 ? 's' : ''}`);
  console.log('');
  log.info(`Read the skill: ${pc.underline(`.skills/${name}/SKILL.md`)}`);
}

export { installMcp, installRag };
