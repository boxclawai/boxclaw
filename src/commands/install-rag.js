import ora from 'ora';
import pc from 'picocolors';
import { getItemInfo } from '../registry.js';
import { downloadFromTarball } from '../downloader.js';
import { getItemPath, getTypeDir, addToManifest, isInstalled } from '../config.js';
import { log } from '../utils.js';
import { mkdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';

export async function installRag(name, options) {
  const spinner = ora(`Looking up RAG template ${pc.bold(name)}...`).start();

  let info;
  try {
    info = await getItemInfo('rag', name);
  } catch (err) {
    spinner.fail('Failed to fetch RAG registry');
    log.error(err.message);
    process.exit(1);
  }

  if (!info) {
    spinner.fail(`RAG template ${pc.bold(name)} not found`);
    log.dim('Run `boxclaw list --type rag` to see available RAG templates');
    process.exit(1);
  }

  if (isInstalled('rag', name) && !options.force) {
    spinner.fail(`RAG template ${pc.bold(name)} is already installed`);
    log.dim('Use --force to reinstall');
    process.exit(1);
  }

  const dir = getTypeDir('rag');
  if (!existsSync(dir)) await mkdir(dir, { recursive: true });

  const destDir = getItemPath('rag', name);
  spinner.text = `Downloading ${info.emoji || '📚'} ${pc.bold(info.name)}...`;

  try {
    // RAG templates stored in rags/<name> directory in the skills repo
    await downloadFromTarball(`rags/${name}`, destDir);
  } catch (err) {
    spinner.fail('Download failed');
    log.error(err.message);
    process.exit(1);
  }

  await addToManifest('rag', name, info.version || '1.0.0');

  spinner.succeed(`Installed RAG template ${info.emoji || '📚'} ${pc.bold(info.name)}`);
  console.log('');
  log.dim(`  Location:    .rag/${name}/`);
  log.dim(`  Description: ${info.description}`);

  if (info.setup) {
    console.log('');
    log.info('Setup steps:');
    info.setup.forEach((step, i) => log.dim(`  ${i + 1}. ${step}`));
  }
  console.log('');
}
