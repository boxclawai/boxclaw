import ora from 'ora';
import pc from 'picocolors';
import { getItemInfo } from '../registry.js';
import { downloadFromTarball } from '../downloader.js';
import { getInstalled, getItemPath, getTypeDir, addToManifest } from '../config.js';
import { log } from '../utils.js';
import { rm, rename, mkdir } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';

async function safeReplace(subdir, destDir) {
  // Download to a temp dir first, then swap -- prevents data loss on failure
  const tmpDest = join(tmpdir(), `boxclaw-update-${Date.now()}`);
  try {
    await downloadFromTarball(subdir, tmpDest);
    await rm(destDir, { recursive: true, force: true });
    await mkdir(join(destDir, '..'), { recursive: true });
    await rename(tmpDest, destDir);
  } catch (err) {
    await rm(tmpDest, { recursive: true, force: true }).catch(() => {});
    throw err;
  }
}

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
  let failed = 0;
  for (const itemName of toUpdate) {
    spinner.text = `Updating ${pc.bold(itemName)}...`;

    try {
      const info = await getItemInfo(type, itemName);
      if (!info) {
        failed++;
        continue;
      }

      if (type === 'skill') {
        const destDir = getItemPath('skill', itemName);
        await safeReplace(itemName, destDir);
        await addToManifest('skill', itemName, info.version || '1.0.0');
      } else if (type === 'mcp') {
        // MCP re-config: import and call directly to avoid process.exit
        const { installMcpCore } = await import('./install-mcp.js');
        await installMcpCore(itemName, info);
        await addToManifest('mcp', itemName, info.version || '1.0.0');
      } else if (type === 'rag') {
        const destDir = getItemPath('rag', itemName);
        await safeReplace(`rags/${itemName}`, destDir);
        await addToManifest('rag', itemName, info.version || '1.0.0');
      }
      updated++;
    } catch (err) {
      failed++;
      log.warn(`  Failed to update ${itemName}: ${err.message}`);
    }
  }

  if (failed > 0) {
    spinner.warn(`Updated ${updated}, failed ${failed}`);
  } else {
    spinner.succeed(`Updated ${updated} ${type}${updated !== 1 ? 's' : ''}`);
  }
}
