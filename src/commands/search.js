import ora from 'ora';
import pc from 'picocolors';
import { searchSkills } from '../registry.js';
import { log, formatTable } from '../utils.js';

export async function searchCommand(query) {
  const spinner = ora(`Searching for "${query}"...`).start();

  let results;
  try {
    results = await searchSkills(query);
  } catch (err) {
    spinner.fail('Failed to search');
    log.error(err.message);
    process.exit(1);
  }

  spinner.stop();

  if (results.length === 0) {
    log.warn(`No skills found matching "${pc.bold(query)}"`);
    log.dim('Try a different keyword or run `boxclaw list` to see all skills');
    return;
  }

  const rows = results.map((s) => [
    s.emoji,
    s.name,
    s.role,
    s.tags.slice(0, 4).join(', '),
  ]);

  console.log('');
  console.log(formatTable(rows, ['', 'Skill', 'Role', 'Tags']));
  console.log('');
  log.dim(`Found ${results.length} skill${results.length !== 1 ? 's' : ''}`);
  console.log('');
}
