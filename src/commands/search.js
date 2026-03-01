import ora from 'ora';
import pc from 'picocolors';
import { searchAll, searchItems } from '../registry.js';
import { log, formatTable } from '../utils.js';

export async function searchCommand(query, options) {
  const type = options.type;
  const spinner = ora(`Searching for "${query}"...`).start();

  try {
    if (type) {
      const results = await searchItems(type, query);
      spinner.stop();

      if (results.length === 0) {
        log.warn(`No ${type}s found matching "${pc.bold(query)}"`);
        return;
      }

      const rows = results.map((s) => [
        s.emoji || '',
        s.name,
        s.role || s.description || '',
        (s.tags || []).slice(0, 4).join(', '),
      ]);

      console.log('');
      console.log(formatTable(rows, ['', 'Name', 'Description', 'Tags']));
      console.log('');
      log.dim(`Found ${results.length} result${results.length !== 1 ? 's' : ''}`);
    } else {
      const allResults = await searchAll(query);
      spinner.stop();

      const typeLabels = { skill: 'Skills', mcp: 'MCP Servers', rag: 'RAG Templates' };
      let totalFound = 0;

      for (const [t, results] of Object.entries(allResults)) {
        if (results.length === 0) continue;
        totalFound += results.length;

        const rows = results.map((s) => [
          s.emoji || '',
          s.name,
          s.role || s.description || '',
          (s.tags || []).slice(0, 4).join(', '),
        ]);

        console.log('');
        console.log(pc.bold(`  ${typeLabels[t]}`));
        console.log('');
        console.log(formatTable(rows, ['', 'Name', 'Description', 'Tags']));
      }

      if (totalFound === 0) {
        log.warn(`No results matching "${pc.bold(query)}"`);
        log.dim('Try a different keyword or run `boxclaw list` to see everything');
      } else {
        console.log('');
        log.dim(`Found ${totalFound} result${totalFound !== 1 ? 's' : ''} total`);
      }
    }
    console.log('');
  } catch (err) {
    spinner.fail('Search failed');
    log.error(err.message);
    process.exit(1);
  }
}
