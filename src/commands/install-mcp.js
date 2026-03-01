import ora from 'ora';
import pc from 'picocolors';
import { getItemInfo } from '../registry.js';
import { addToManifest, isInstalled } from '../config.js';
import { log } from '../utils.js';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { homedir } from 'node:os';

function findAgentConfig() {
  const cwd = process.cwd();

  // Claude Code project config
  const claudeProjectDir = join(cwd, '.claude');
  const claudeProjectConfig = join(claudeProjectDir, 'settings.json');
  if (existsSync(claudeProjectConfig)) {
    return { type: 'claude-code-project', path: claudeProjectConfig, dir: claudeProjectDir };
  }

  // Claude Code global config
  const claudeGlobal = join(homedir(), '.claude', 'settings.json');
  if (existsSync(claudeGlobal)) {
    return { type: 'claude-code-global', path: claudeGlobal, dir: join(homedir(), '.claude') };
  }

  // Claude Desktop
  const claudeDesktop = join(
    homedir(),
    'Library',
    'Application Support',
    'Claude',
    'claude_desktop_config.json'
  );
  if (existsSync(claudeDesktop)) {
    return { type: 'claude-desktop', path: claudeDesktop, dir: join(homedir(), 'Library', 'Application Support', 'Claude') };
  }

  // Default: create Claude Code project config
  return { type: 'claude-code-project', path: claudeProjectConfig, dir: claudeProjectDir, create: true };
}

async function readJsonFile(path) {
  if (!existsSync(path)) return {};
  const data = await readFile(path, 'utf-8');
  return JSON.parse(data);
}

export async function installMcp(name, options) {
  const spinner = ora(`Looking up MCP server ${pc.bold(name)}...`).start();

  let info;
  try {
    info = await getItemInfo('mcp', name);
  } catch (err) {
    spinner.fail('Failed to fetch MCP registry');
    log.error(err.message);
    process.exit(1);
  }

  if (!info) {
    spinner.fail(`MCP server ${pc.bold(name)} not found`);
    log.dim('Run `boxclaw list --type mcp` to see available MCP servers');
    process.exit(1);
  }

  if (isInstalled('mcp', name) && !options.force) {
    spinner.fail(`MCP server ${pc.bold(name)} is already configured`);
    log.dim('Use --force to reconfigure');
    process.exit(1);
  }

  // Find agent config file
  const agentConfig = findAgentConfig();
  spinner.text = `Configuring ${pc.bold(name)} in ${agentConfig.type}...`;

  try {
    // Ensure directory exists
    if (!existsSync(agentConfig.dir)) {
      await mkdir(agentConfig.dir, { recursive: true });
    }

    // Read existing config
    const config = await readJsonFile(agentConfig.path);

    // Add MCP server
    if (!config.mcpServers) config.mcpServers = {};

    // Replace {PROJECT_DIR} placeholder with actual cwd
    const args = (info.args || []).map((arg) =>
      arg.replace('{PROJECT_DIR}', process.cwd())
    );

    config.mcpServers[name] = {
      command: info.command,
      args,
    };

    if (info.env && Object.keys(info.env).length > 0) {
      config.mcpServers[name].env = info.env;
    }

    // Write config
    await writeFile(agentConfig.path, JSON.stringify(config, null, 2) + '\n', 'utf-8');

    // Track in manifest
    await addToManifest('mcp', name, info.version || '1.0.0');

    spinner.succeed(`Configured MCP server ${pc.bold(name)}`);
    console.log('');
    log.dim(`  Server:   ${info.description}`);
    log.dim(`  Command:  ${info.command} ${args.join(' ')}`);
    log.dim(`  Config:   ${agentConfig.path}`);

    if (info.package) {
      console.log('');
      log.info(`Package ${pc.bold(info.package)} will be auto-installed via npx on first use`);
    }
    console.log('');
  } catch (err) {
    spinner.fail('Configuration failed');
    log.error(err.message);
    process.exit(1);
  }
}
