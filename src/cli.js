import { Command } from 'commander';
import { installSkill } from './commands/install.js';
import { installMcp } from './commands/install-mcp.js';
import { installRag } from './commands/install-rag.js';
import { uninstallSkill, uninstallMcp, uninstallRag } from './commands/uninstall.js';
import { listCommand } from './commands/list.js';
import { searchCommand } from './commands/search.js';
import { updateCommand } from './commands/update.js';
import { initCommand } from './commands/init.js';

export function run() {
  const program = new Command();

  program
    .name('boxclaw')
    .description('Install AI agent skills, MCP servers, and RAG templates into any project')
    .version('1.1.0');

  // --- install ---
  const install = program.command('install');

  install
    .command('skill <name>')
    .description('Install a skill into .skills/<name>/')
    .option('-f, --force', 'Overwrite if already installed')
    .action(installSkill);

  install
    .command('mcp <name>')
    .description('Configure an MCP server in your AI agent')
    .option('-f, --force', 'Overwrite if already configured')
    .action(installMcp);

  install
    .command('rag <name>')
    .description('Install a RAG template into .rag/<name>/')
    .option('-f, --force', 'Overwrite if already installed')
    .action(installRag);

  // --- uninstall ---
  const uninstall = program.command('uninstall');

  uninstall
    .command('skill <name>')
    .description('Remove an installed skill')
    .action(uninstallSkill);

  uninstall
    .command('mcp <name>')
    .description('Remove an MCP server configuration')
    .action(uninstallMcp);

  uninstall
    .command('rag <name>')
    .description('Remove an installed RAG template')
    .action(uninstallRag);

  // --- list ---
  program
    .command('list')
    .description('List all available and installed resources')
    .option('-t, --type <type>', 'Filter by type: skill, mcp, rag', 'all')
    .action(listCommand);

  // --- search ---
  program
    .command('search <query>')
    .description('Search by keyword, tag, or description')
    .option('-t, --type <type>', 'Filter by type: skill, mcp, rag')
    .action(searchCommand);

  // --- update ---
  program
    .command('update [name]')
    .description('Update one or all installed resources')
    .option('-t, --type <type>', 'Resource type: skill, mcp, rag', 'skill')
    .action(updateCommand);

  // --- init ---
  program
    .command('init')
    .description('Initialize project and configure your AI agent')
    .action(initCommand);

  program.parse();
}
