import pc from 'picocolors';
import { isInstalled, getItemPath, getTypeDir, removeFromManifest } from '../config.js';
import { assertPathWithin, log } from '../utils.js';
import { rm, readFile, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { homedir, platform } from 'node:os';

function getClaudeDesktopPath() {
  const home = homedir();
  switch (platform()) {
    case 'darwin':
      return join(home, 'Library', 'Application Support', 'Claude', 'claude_desktop_config.json');
    case 'win32':
      return join(process.env.APPDATA || join(home, 'AppData', 'Roaming'), 'Claude', 'claude_desktop_config.json');
    default:
      return join(home, '.config', 'Claude', 'claude_desktop_config.json');
  }
}

export async function uninstallSkill(name) {
  if (!isInstalled('skill', name)) {
    log.error(`Skill ${pc.bold(name)} is not installed`);
    process.exit(1);
  }

  const destDir = getItemPath('skill', name);
  assertPathWithin(destDir, getTypeDir('skill'));

  await rm(destDir, { recursive: true, force: true });
  await removeFromManifest('skill', name);
  log.success(`Uninstalled skill ${pc.bold(name)}`);
}

export async function uninstallMcp(name) {
  if (!isInstalled('mcp', name)) {
    log.error(`MCP server ${pc.bold(name)} is not configured`);
    process.exit(1);
  }

  // Remove from agent config files
  const configPaths = [
    join(process.cwd(), '.claude', 'settings.json'),
    join(homedir(), '.claude', 'settings.json'),
    getClaudeDesktopPath(),
  ];

  let removed = false;
  for (const configPath of configPaths) {
    if (!existsSync(configPath)) continue;
    try {
      const config = JSON.parse(await readFile(configPath, 'utf-8'));
      if (config.mcpServers && config.mcpServers[name]) {
        delete config.mcpServers[name];
        await writeFile(configPath, JSON.stringify(config, null, 2) + '\n', 'utf-8');
        log.dim(`  Removed from ${configPath}`);
        removed = true;
      }
    } catch {
      // Skip unreadable configs
    }
  }

  if (!removed) {
    log.dim('  No agent config files contained this server');
  }

  await removeFromManifest('mcp', name);
  log.success(`Unconfigured MCP server ${pc.bold(name)}`);
}

export async function uninstallRag(name) {
  if (!isInstalled('rag', name)) {
    log.error(`RAG template ${pc.bold(name)} is not installed`);
    process.exit(1);
  }

  const destDir = getItemPath('rag', name);
  assertPathWithin(destDir, getTypeDir('rag'));

  await rm(destDir, { recursive: true, force: true });
  await removeFromManifest('rag', name);
  log.success(`Uninstalled RAG template ${pc.bold(name)}`);
}
