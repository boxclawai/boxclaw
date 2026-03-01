import ora from 'ora';
import pc from 'picocolors';
import { getSkillInfo } from '../registry.js';
import { downloadSkill } from '../downloader.js';
import {
  readManifest,
  getSkillPath,
  addToManifest,
  isSkillInstalled,
} from '../config.js';
import { log } from '../utils.js';
import { rm } from 'node:fs/promises';

export async function updateCommand(name) {
  const manifest = await readManifest();
  const installed = Object.keys(manifest.installed);

  if (installed.length === 0) {
    log.warn('No skills installed');
    log.dim('Run `boxclaw install skill <name>` to install a skill');
    return;
  }

  const toUpdate = name ? [name] : installed;

  // Validate all skills exist
  if (name && !isSkillInstalled(name)) {
    log.error(`Skill ${pc.bold(name)} is not installed`);
    process.exit(1);
  }

  const spinner = ora(
    `Updating ${toUpdate.length} skill${toUpdate.length !== 1 ? 's' : ''}...`
  ).start();

  let updated = 0;
  for (const skillName of toUpdate) {
    spinner.text = `Updating ${pc.bold(skillName)}...`;

    try {
      const info = await getSkillInfo(skillName);
      if (!info) {
        log.warn(`Skill ${skillName} not found in registry, skipping`);
        continue;
      }

      const destDir = getSkillPath(skillName);

      // Remove old files and re-download
      await rm(destDir, { recursive: true, force: true });
      await downloadSkill(skillName, destDir);
      await addToManifest(skillName, info.version || '1.0.0');
      updated++;
    } catch (err) {
      spinner.warn(`Failed to update ${skillName}: ${err.message}`);
    }
  }

  spinner.succeed(`Updated ${updated} skill${updated !== 1 ? 's' : ''}`);
}
