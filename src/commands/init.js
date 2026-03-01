import pc from 'picocolors';
import { mkdir, readFile, writeFile, appendFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { createInterface } from 'node:readline';
import { getSkillsDir, writeManifest, readManifest } from '../config.js';
import { log } from '../utils.js';

function prompt(question) {
  const rl = createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer.trim());
    });
  });
}

const AGENT_CONFIGS = {
  '1': {
    name: 'Claude Code',
    file: 'CLAUDE.md',
    template: (skills) => `
## Skills

This project uses BoxClaw Skills for expert guidance.
Load the appropriate skill based on the task at hand:

${skills.map((s) => `- **${s}**: Read and follow .skills/${s}/SKILL.md`).join('\n')}

Reference documents are available in each skill's \`references/\` directory.
Automation scripts are in each skill's \`scripts/\` directory.
`,
  },
  '2': {
    name: 'Cursor',
    file: '.cursorrules',
    template: (skills) =>
      `You are a senior developer. Follow the expert patterns from BoxClaw Skills.\n\nInstalled skills:\n${skills.map((s) => `- .skills/${s}/SKILL.md`).join('\n')}\n\nRead the relevant SKILL.md based on the current task and follow its patterns.\n`,
  },
  '3': {
    name: 'Windsurf',
    file: '.windsurfrules',
    template: (skills) =>
      `You are a senior developer. Follow the expert patterns from BoxClaw Skills.\n\nInstalled skills:\n${skills.map((s) => `- .skills/${s}/SKILL.md`).join('\n')}\n\nRead the relevant SKILL.md based on the current task and follow its patterns.\n`,
  },
  '4': {
    name: 'Cline',
    file: '.clinerules',
    template: (skills) =>
      `You are a senior developer. Follow the expert patterns from BoxClaw Skills.\n\nInstalled skills:\n${skills.map((s) => `- .skills/${s}/SKILL.md`).join('\n')}\n\nRead the relevant SKILL.md based on the current task and follow its patterns.\n`,
  },
};

export async function initCommand() {
  console.log('');
  console.log(pc.bold('  BoxClaw Skills — Project Setup'));
  console.log('');

  // Create .skills directory
  const skillsDir = getSkillsDir();
  if (!existsSync(skillsDir)) {
    await mkdir(skillsDir, { recursive: true });
    log.success('Created .skills/ directory');
  } else {
    log.dim('.skills/ directory already exists');
  }

  // Create manifest
  const manifest = await readManifest();
  await writeManifest(manifest);
  log.success('Initialized .skills/.boxclaw.json manifest');

  // Ask which agent
  console.log('');
  console.log('  Which AI agent do you use?');
  console.log('');
  console.log('  1) Claude Code');
  console.log('  2) Cursor');
  console.log('  3) Windsurf');
  console.log('  4) Cline');
  console.log('  5) Skip (configure manually)');
  console.log('');

  const choice = await prompt('  Select (1-5): ');

  if (choice === '5' || !AGENT_CONFIGS[choice]) {
    console.log('');
    log.info('Skipped agent configuration');
    log.dim('Install skills with: boxclaw install skill <name>');
    console.log('');
    return;
  }

  const agent = AGENT_CONFIGS[choice];
  const installedSkills = Object.keys(manifest.installed);

  // Generate config
  const configPath = join(process.cwd(), agent.file);
  const skillsList =
    installedSkills.length > 0
      ? installedSkills
      : ['<skill-name>'];

  const content = agent.template(skillsList);

  if (existsSync(configPath)) {
    // Append to existing file
    await appendFile(configPath, '\n' + content, 'utf-8');
    log.success(`Updated ${pc.bold(agent.file)} with skill references`);
  } else {
    await writeFile(configPath, content.trimStart(), 'utf-8');
    log.success(`Created ${pc.bold(agent.file)} with skill references`);
  }

  console.log('');
  log.info('Next steps:');
  log.dim('  1. Install skills:  boxclaw install skill frontend-developer');
  log.dim('  2. Start coding — your agent now has expert guidance!');
  console.log('');
}
