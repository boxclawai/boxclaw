import pc from 'picocolors';
import { isSkillInstalled, getSkillPath, removeFromManifest } from '../config.js';
import { log } from '../utils.js';
import { rm } from 'node:fs/promises';

export async function uninstallCommand(name) {
  if (!isSkillInstalled(name)) {
    log.error(`Skill ${pc.bold(name)} is not installed`);
    log.dim('Run `boxclaw list` to see installed skills');
    process.exit(1);
  }

  const destDir = getSkillPath(name);

  try {
    await rm(destDir, { recursive: true, force: true });
    await removeFromManifest(name);
    log.success(`Uninstalled ${pc.bold(name)}`);
  } catch (err) {
    log.error(`Failed to uninstall: ${err.message}`);
    process.exit(1);
  }
}
