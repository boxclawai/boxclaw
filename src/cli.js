import { Command } from 'commander';
import { installCommand } from './commands/install.js';
import { uninstallCommand } from './commands/uninstall.js';
import { listCommand } from './commands/list.js';
import { searchCommand } from './commands/search.js';
import { updateCommand } from './commands/update.js';
import { initCommand } from './commands/init.js';

export function run() {
  const program = new Command();

  program
    .name('boxclaw')
    .description('Install production-grade AI agent skills into any project')
    .version('1.0.0');

  // boxclaw install skill <name>
  const install = program.command('install');
  install
    .command('skill <name>')
    .description('Install a skill into .skills/<name>/')
    .option('-f, --force', 'Overwrite if already installed')
    .action(installCommand);

  // boxclaw uninstall skill <name>
  const uninstall = program.command('uninstall');
  uninstall
    .command('skill <name>')
    .description('Remove an installed skill')
    .action(uninstallCommand);

  // boxclaw list
  program
    .command('list')
    .description('List all available and installed skills')
    .action(listCommand);

  // boxclaw search <query>
  program
    .command('search <query>')
    .description('Search skills by keyword, tag, or role')
    .action(searchCommand);

  // boxclaw update [name]
  program
    .command('update [name]')
    .description('Update one or all installed skills')
    .action(updateCommand);

  // boxclaw init
  program
    .command('init')
    .description('Initialize .skills/ directory and configure your AI agent')
    .action(initCommand);

  program.parse();
}
