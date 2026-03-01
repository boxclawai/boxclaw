import pc from 'picocolors';
import { isInstalled, getItemPath, removeFromManifest } from '../config.js';
import { log } from '../utils.js';
import { rm, readFile, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { homedir } from 'node:os';

export async function uninstallSkill(name) {
  if (!isInstalled('skill', name)) {
    log.error(`Skill ${pc.bold(name)} is not installed`);
    process.exit(1);
  }

  const destDir = getItemPath('skill', name);
  await rm(destDir, { recursive: true, force: true });
  await removeFromManifest('skill', name);
  log.success(`Uninstalled skill ${pc.bold(name)}`);
}

export async function uninstallMcp(name) {
  if (!isInstalled('mcp', name)) {
    log.error(`MCP server ${pc.bold(name)} is not configured`);
    process.exit(1);
  }

  // Remove from agent config
  const configPaths = [
    join(process.cwd(), '.claude', 'settings.json'),
    join(homedir(), '.claude', 'settings.json'),
    join(homedir(), 'Library', 'Application Support', 'Claude', 'claude_desktop_config.json'),
  ];

  for (const configPath of configPaths) {
    if (!existsSync(configPath)) continue;
    try {
      const config = JSON.parse(await readFile(configPath, 'utf-8'));
      if (config.mcpServers && config.mcpServers[name]) {
        delete config.mcpServers[name];
        await writeFile(configPath, JSON.stringify(config, null, 2) + '\n', 'utf-8');
        log.dim(`  Removed from ${configPath}`);
      }
    } catch {
      // Skip unreadable configs
    }
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
  await rm(destDir, { recursive: true, force: true });
  await removeFromManifest('rag', name);
  log.success(`Uninstalled RAG template ${pc.bold(name)}`);
}
