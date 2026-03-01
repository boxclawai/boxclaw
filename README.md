# boxclaw

Install production-grade AI agent skills into any project.

```bash
npm install -g boxclaw
boxclaw install skill devops-engineer
```

BoxClaw downloads expert skill modules from the [BoxClaw Skills](https://github.com/boxclawai/skills) catalog and installs them into your project's `.skills/` directory. Your AI coding agent (Claude Code, Cursor, Windsurf, Cline) can then use these skills for expert-level guidance.

## Install

```bash
npm install -g boxclaw
```

Requires Node.js 18+.

## Commands

### `boxclaw install skill <name>`

Download and install a skill into `.skills/<name>/`.

```bash
boxclaw install skill frontend-developer
boxclaw install skill devops-engineer
boxclaw install skill security-engineer --force   # reinstall
```

### `boxclaw uninstall skill <name>`

Remove an installed skill.

```bash
boxclaw uninstall skill frontend-developer
```

### `boxclaw list`

Show all 13 available skills and which ones are installed.

```
     Skill                   Role                    Status
     frontend-developer      Frontend Developer      installed
     backend-developer       Backend Developer       available
     devops-engineer         DevOps Engineer         installed
     ...
```

### `boxclaw search <query>`

Search skills by keyword, tag, or role.

```bash
boxclaw search react          # finds frontend-developer, fullstack-developer
boxclaw search kubernetes     # finds devops-engineer
boxclaw search testing        # finds qa-test-engineer
```

### `boxclaw update [name]`

Update one or all installed skills to the latest version.

```bash
boxclaw update                        # update all
boxclaw update frontend-developer     # update one
```

### `boxclaw init`

Initialize `.skills/` directory and configure your AI agent. Supports Claude Code, Cursor, Windsurf, and Cline.

```bash
boxclaw init
```

This creates the `.skills/` directory, a manifest file, and generates the appropriate configuration file for your agent (CLAUDE.md, .cursorrules, .windsurfrules, or .clinerules).

## Available Skills

| Emoji | Skill | Role |
|:-----:|-------|------|
| 🎨 | frontend-developer | Frontend Developer |
| 🔧 | backend-developer | Backend Developer |
| 🔮 | fullstack-developer | Full-Stack Developer |
| 🚀 | devops-engineer | DevOps Engineer |
| 📱 | mobile-developer | Mobile Developer |
| 🧪 | qa-test-engineer | QA Test Engineer |
| 🔄 | data-engineer | Data Engineer |
| 🛡️ | security-engineer | Security Engineer |
| 🏗️ | system-architect | System Architect |
| 👔 | tech-lead | Tech Lead |
| 🤖 | ai-ml-engineer | AI/ML Engineer |
| 🗄️ | database-administrator | Database Administrator |
| ☁️ | cloud-architect | Cloud Architect |

Each skill includes expert instructions (SKILL.md), deep reference documents, and automation scripts. See the [skills repo](https://github.com/boxclawai/skills) for details.

## How It Works

```
boxclaw install skill devops-engineer
        │
        ▼
┌──────────────────────────────┐
│  Fetch registry.json         │  ← skill catalog from GitHub
│  Download skills tarball     │  ← single .tar.gz download
│  Extract devops-engineer/    │  ← only the requested skill
│  Save to .skills/            │  ← your project directory
│  Update manifest             │  ← track what's installed
└──────────────────────────────┘
        │
        ▼
your-project/
└── .skills/
    └── devops-engineer/
        ├── SKILL.md            ← expert instructions
        ├── references/         ← deep-dive documents
        └── scripts/            ← automation tools
```

## License

[MIT](LICENSE)
