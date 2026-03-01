import ora from 'ora';
import pc from 'picocolors';
import { fetchRegistry } from '../registry.js';
import { getInstalled } from '../config.js';
import { log, formatTable } from '../utils.js';

export async function listCommand(options) {
  const type = options.type || 'all';
  const spinner = ora('Fetching catalog...').start();

  const types = type === 'all' ? ['skill', 'mcp', 'rag'] : [type];
  const sections = [];

  for (const t of types) {
    try {
      const registry = await fetchRegistry(t);
      const collection = registry.skills || registry.servers || registry.templates || {};
      const installed = await getInstalled(t);
      const installedSet = new Set(Object.keys(installed));

      const items = Object.values(collection);
      const rows = items.map((item) => {
        const status = installedSet.has(item.name)
          ? pc.green('installed')
          : pc.dim('available');
        const emoji = item.emoji || '';
        const label = item.role || item.description || item.name;
        return [emoji, item.name, label, status];
      });

      sections.push({
        type: t,
        rows,
        installed: installedSet.size,
        total: items.length,
      });
    } catch {
      // Registry not available for this type yet
    }
  }

  spinner.stop();

  if (sections.length === 0) {
    log.warn('Could not fetch registries. Check your network connection.');
    return;
  }

  for (const section of sections) {
    const typeLabel = { skill: 'Skills', mcp: 'MCP Servers', rag: 'RAG Templates' }[section.type];
    console.log('');
    console.log(pc.bold(`  ${typeLabel}`));
    console.log('');
    console.log(formatTable(section.rows, ['', 'Name', 'Description', 'Status']));
    console.log('');
    log.dim(
      `${section.installed} installed, ${section.total - section.installed} available`
    );
  }
  console.log('');
}
