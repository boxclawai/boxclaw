import ora from 'ora';
import pc from 'picocolors';
import { getSkillInfo } from '../registry.js';
import { downloadSkill } from '../downloader.js';
import {
  getSkillPath,
  getSkillsDir,
  isSkillInstalled,
  addToManifest,
} from '../config.js';
import { log } from '../utils.js';
import { mkdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';

export async function installCommand(name, options) {
  // Validate skill exists in registry
  const spinner = ora(`Looking up skill ${pc.bold(name)}...`).start();

  let info;
  try {
    info = await getSkillInfo(name);
  } catch (err) {
    spinner.fail('Failed to fetch skill registry');
    log.error(err.message);
    process.exit(1);
  }

  if (!info) {
    spinner.fail(`Skill ${pc.bold(name)} not found`);
    log.dim('Run `boxclaw list` to see available skills');
    process.exit(1);
  }

  // Check if already installed
  if (isSkillInstalled(name) && !options.force) {
    spinner.fail(`Skill ${pc.bold(name)} is already installed`);
    log.dim('Use --force to reinstall');
    process.exit(1);
  }

  // Ensure .skills/ directory exists
  const skillsDir = getSkillsDir();
  if (!existsSync(skillsDir)) {
    await mkdir(skillsDir, { recursive: true });
  }

  // Download and extract
  const destDir = getSkillPath(name);
  spinner.text = `Downloading ${info.emoji} ${pc.bold(info.role)}...`;

  try {
    await downloadSkill(name, destDir);
  } catch (err) {
    spinner.fail('Download failed');
    log.error(err.message);
    process.exit(1);
  }

  // Update manifest
  await addToManifest(name, info.version || '1.0.0');

  spinner.succeed(`Installed ${info.emoji} ${pc.bold(info.role)}`);
  console.log('');
  log.dim(`  Location:    .skills/${name}/`);
  log.dim(`  References:  ${info.refs} document${info.refs !== 1 ? 's' : ''}`);
  log.dim(`  Scripts:     ${info.scripts} script${info.scripts !== 1 ? 's' : ''}`);
  console.log('');
  log.info(`Read the skill: ${pc.underline(`.skills/${name}/SKILL.md`)}`);
}
