import ora from 'ora';
import pc from 'picocolors';
import { fetchRegistry } from '../registry.js';
import { readManifest } from '../config.js';
import { log, formatTable } from '../utils.js';

export async function listCommand() {
  const spinner = ora('Fetching skills catalog...').start();

  let registry;
  try {
    registry = await fetchRegistry();
  } catch (err) {
    spinner.fail('Failed to fetch skill registry');
    log.error(err.message);
    process.exit(1);
  }

  const manifest = await readManifest();
  const installed = new Set(Object.keys(manifest.installed));

  spinner.stop();

  const skills = Object.values(registry.skills);
  const rows = skills.map((s) => {
    const status = installed.has(s.name)
      ? pc.green('installed')
      : pc.dim('available');
    return [s.emoji, s.name, s.role, status];
  });

  console.log('');
  console.log(formatTable(rows, ['', 'Skill', 'Role', 'Status']));
  console.log('');

  const installedCount = installed.size;
  const totalCount = skills.length;
  log.dim(
    `${installedCount} installed, ${totalCount - installedCount} available`
  );
  console.log('');
}
