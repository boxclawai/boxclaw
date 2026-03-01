# boxclaw

Install AI agent skills, MCP servers, and RAG templates into any project.

```bash
npm install -g boxclaw
boxclaw install skill devops-engineer
boxclaw install mcp github
boxclaw install rag codebase-rag
```

BoxClaw downloads expert modules from the [BoxClaw Skills](https://github.com/boxclawai/skills) catalog and installs them into your project. Your AI coding agent (Claude Code, Cursor, Windsurf, Cline) can then use these for expert-level guidance.

## Install

```bash
npm install -g boxclaw
```

Requires Node.js 18+.

## Commands

### Skills

Install production-grade AI agent skills into `.skills/<name>/`.

```bash
boxclaw install skill frontend-developer
boxclaw install skill devops-engineer --force   # reinstall
boxclaw uninstall skill frontend-developer
```

Each skill includes expert instructions (SKILL.md), reference documents, and automation scripts.

### MCP Servers

Configure Model Context Protocol servers in your AI agent's config.

```bash
boxclaw install mcp github
boxclaw install mcp postgres
boxclaw uninstall mcp github
```

MCP servers are auto-configured in your agent's settings file (Claude Code, Cursor, etc).

### RAG Templates

Download ready-to-use RAG pipeline templates into `.rag/<name>/`.

```bash
boxclaw install rag codebase-rag
boxclaw install rag docs-rag
boxclaw uninstall rag docs-rag
```

Each template includes Python code, config, and setup instructions.

### List & Search

```bash
boxclaw list                    # show all types
boxclaw list --type skill       # skills only
boxclaw list --type mcp         # MCP servers only
boxclaw list --type rag         # RAG templates only

boxclaw search react            # search across all types
boxclaw search database         # finds skills + MCP servers
boxclaw search --type skill kubernetes
```

### Update

```bash
boxclaw update                          # update all skills
boxclaw update frontend-developer       # update one skill
boxclaw update --type rag               # update all RAG templates
boxclaw update --type mcp github        # update one MCP server
```

### Init

Initialize project directories and configure your AI agent.

```bash
boxclaw init
```

Creates `.skills/`, `.mcp/`, `.rag/` directories, a `.boxclaw.json` manifest, and generates the appropriate config file for your agent (CLAUDE.md, .cursorrules, .windsurfrules, or .clinerules).

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

## Available MCP Servers

| Emoji | Server | Description |
|:-----:|--------|-------------|
| 📁 | filesystem | Read, write, and manage local files |
| 🐙 | github | Access GitHub repos, issues, PRs |
| 🐘 | postgres | Query PostgreSQL databases |
| 📦 | sqlite | Query SQLite databases |
| 🧠 | memory | Persistent memory with knowledge graph |
| 🌐 | fetch | Fetch and extract web content |
| 🎭 | puppeteer | Browser automation with Puppeteer |
| 🔍 | brave-search | Web search using Brave Search API |
| 💬 | slack | Read and send Slack messages |
| 💭 | sequential-thinking | Structured sequential thinking |

## Available RAG Templates

| Emoji | Template | Stack |
|:-----:|----------|-------|
| 💻 | codebase-rag | Python, ChromaDB, OpenAI Embeddings |
| 📖 | docs-rag | Python, FAISS, LangChain |
| 📄 | pdf-rag | Python, PyPDF2, ChromaDB, LangChain |

## How It Works

```
boxclaw install skill devops-engineer
        │
        ▼
┌──────────────────────────────┐
│  Fetch registry              │  ← catalog from GitHub
│  Download tarball            │  ← single .tar.gz download
│  Extract requested item      │  ← only what you need
│  Save to project directory   │  ← .skills/, .mcp/, or .rag/
│  Update manifest             │  ← track what's installed
└──────────────────────────────┘
```

## Project Structure

```
your-project/
├── .boxclaw.json              ← manifest (tracks installed items)
├── .skills/
│   └── devops-engineer/
│       ├── SKILL.md           ← expert instructions
│       ├── references/        ← deep-dive documents
│       └── scripts/           ← automation tools
├── .mcp/                      ← MCP configs (managed in agent settings)
└── .rag/
    └── codebase-rag/
        ├── config.py          ← configuration
        ├── index.py           ← build embeddings index
        ├── query.py           ← search your codebase
        └── requirements.txt   ← Python dependencies
```

## License

[MIT](LICENSE)
