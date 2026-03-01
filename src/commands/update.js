import ora from 'ora';
import pc from 'picocolors';
import { getItemInfo } from '../registry.js';
import { downloadFromTarball } from '../downloader.js';
import { getInstalled, getItemPath, addToManifest } from '../config.js';
import { installMcp } from './install-mcp.js';
import { log } from '../utils.js';
import { rm } from 'node:fs/promises';

export async function updateCommand(name, options) {
  const type = options.type || 'skill';

  const installed = await getInstalled(type);
  const entries = Object.keys(installed);

  if (entries.length === 0) {
    log.warn(`No ${type}s installed`);
    log.dim(`Run \`boxclaw install ${type} <name>\` to install one`);
    return;
  }

  const toUpdate = name ? [name] : entries;

  if (name && !installed[name]) {
    log.error(`${type} ${pc.bold(name)} is not installed`);
    process.exit(1);
  }

  const spinner = ora(
    `Updating ${toUpdate.length} ${type}${toUpdate.length !== 1 ? 's' : ''}...`
  ).start();

  let updated = 0;
  for (const itemName of toUpdate) {
    spinner.text = `Updating ${pc.bold(itemName)}...`;

    try {
      const info = await getItemInfo(type, itemName);
      if (!info) {
        log.warn(`${itemName} not found in registry, skipping`);
        continue;
      }

      if (type === 'skill') {
        const destDir = getItemPath('skill', itemName);
        await rm(destDir, { recursive: true, force: true });
        await downloadFromTarball(itemName, destDir);
        await addToManifest('skill', itemName, info.version || '1.0.0');
      } else if (type === 'mcp') {
        await installMcp(itemName, { force: true });
      } else if (type === 'rag') {
        const destDir = getItemPath('rag', itemName);
        await rm(destDir, { recursive: true, force: true });
        await downloadFromTarball(`rags/${itemName}`, destDir);
        await addToManifest('rag', itemName, info.version || '1.0.0');
      }
      updated++;
    } catch (err) {
      spinner.warn(`Failed to update ${itemName}: ${err.message}`);
    }
  }

  spinner.succeed(`Updated ${updated} ${type}${updated !== 1 ? 's' : ''}`);
}
