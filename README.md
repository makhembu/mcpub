<p align="center">
  <h1 align="center">⚡ MCPHub</h1>
  <p align="center"><strong>The npm for AI Tools</strong></p>
  <p align="center">
    One command to install, search, and secure MCP servers.
  </p>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/tools-1,574-8A2BE2" alt="1,574 tools"/>
  <img src="https://img.shields.io/badge/categories-19-blue" alt="19 categories"/>
  <img src="https://img.shields.io/badge/license-MIT-green" alt="MIT License"/>
</p>

---

**MCPHub** is a registry, CLI, and web UI for discovering, installing, and security-scanning MCP (Model Context Protocol) servers. Think of it as **npm for AI tools**.

## ✨ Features

- **🔍 Search** — 1,574 MCP tools indexed across 19 categories
- **📦 Install** — One-command install with `npx mcpub install <tool>`
- **🔒 Security** — Built-in scanner with 17 detection patterns across 5 categories
- **🔄 Compatibility** — See which tools work with OpenAI SDK, Anthropic, LangChain, Cursor
- **🌐 Web UI** — Browse and search at your registry's web interface
- **☁️ Self-hostable** — Deploy your own registry on Cloudflare Workers + D1

## 🚀 Quick Start

```bash
# Search for database tools
npx mcpub search "database"

# Get detailed info
npx mcpub info playwright

# Install a tool
npx mcpub install github

# Security scan
npx mcpub scan my-tool
```

## 📊 Registry Stats

The registry comes pre-populated with **1,574 MCP tools** discovered from GitHub and npm:

| Stat | Count |
|------|-------|
| Total tools | 1,574 |
| With GitHub stars | 993 |
| With npm packages | 617 |
| With > 100 stars | 697 |
| With > 1,000 stars | 127 |
| Categories | 19 |
| Unique authors | 1,335 |

### Category Breakdown

| Category | Tools |
|----------|-------|
| AI / LLM | 963 |
| Developer Tools | 675 |
| Web & Search | 373 |
| Browser Automation | 205 |
| Analytics | 198 |
| Security | 125 |
| Database | 118 |
| Framework / SDK | 118 |
| Memory & Knowledge | 101 |
| Infrastructure | 95 |
| Cloud | 85 |
| Filesystem | 78 |
| Testing | 66 |
| Productivity | 53 |
| Finance | 49 |
| Design | 45 |
| Monitoring | 44 |
| Communication | 27 |
| CRM | 12 |

## 🔧 CLI Commands

| Command | Description |
|---------|-------------|
| `mcpub search [query]` | Search the MCP tool registry |
| `mcpub install <name>` | Look up a tool and show install instructions |
| `mcpub info <name>` | Show detailed tool info with compatibility badges |
| `mcpub scan [target]` | Security scan a tool, file, or local config |

### Search Example

```bash
$ npx mcpub search database --limit 5

  Found 118 tools in 12ms

┌────────────────────────┬──────────────────────────────────────────────────────┬────────┬──────────────────┐
│ Name                   │ Description                                          │ Stars  │ Transport        │
├────────────────────────┼──────────────────────────────────────────────────────┼────────┼──────────────────┤
│ supabase               │ Database, auth, and storage via Supabase             │ 8,500  │ http             │
│ neon                   │ Serverless Postgres database management              │ 1,900  │ http             │
│ postgres               │ PostgreSQL database interaction                      │ 18,500 │ stdio            │
│ sqlite                 │ SQLite database management                           │ 18,500 │ stdio            │
│ redis                  │ Redis database operations                            │ 18,500 │ stdio            │
└────────────────────────┴──────────────────────────────────────────────────────┴────────┴──────────────────┘
```

### Install Example

```bash
$ npx mcpub install playwright
✔ Found Playwright MCP

  Playwright MCP — Browser automation and testing MCP server
  Author: Microsoft  Stars: ⭐ 26,700  Transports: stdio

✔ Security score: 92/100

  Install command:
  $ npx -y @playwright/mcp
```

## 🌐 Web UI

MCPHub includes a Next.js web interface for browsing and searching tools:

- **Home page** — Trending tools with security score badges
- **Search page** — Full-text search with category filters
- **Tool details** — Install commands, compatibility matrix, GitHub stats

```bash
# Run locally
cd apps/web
pnpm dev
```

## 🏗️ Architecture

```
mcpub/
├── apps/
│   ├── cli/              # TypeScript CLI (npx mcpub)
│   ├── registry-api/     # Cloudflare Workers + D1 registry
│   └── web/              # Next.js web UI
├── packages/
│   ├── shared/           # Shared TypeScript types
│   └── security/         # Security scanner (17 patterns)
└── scripts/              # Seed/scrape utilities
```

### API Endpoints

| Endpoint | Description |
|----------|-------------|
| `GET /api/search?q=<query>` | Search tools (supports category, pagination) |
| `GET /api/tools/:slug` | Get tool details |
| `GET /api/scan/:slug` | Security scan a tool |
| `GET /api/health` | Health check |
| `POST /api/seed` | Seed/import tools (API key protected) |

## 🔒 Security Scanner

Each tool is scanned for security issues across 5 categories:

| Category | Patterns | Examples |
|----------|----------|----------|
| Prompt Injection | 6 | Instruction override, role manipulation, memory manipulation |
| Data Exfiltration | 3 | Prompt extraction, credential harvesting, external data send |
| Tool Poisoning | 3 | Unsafe command execution, dynamic code, piped remote execution |
| Supply Chain | 2 | Remote code fetch, suspicious package references |
| Misconfiguration | 2 | Broad filesystem access, unrestricted network access |

## 🚀 Self-Hosting

```bash
# 1. Clone the repo
git clone https://github.com/makhembu/mcpub.git
cd mcpub

# 2. Install dependencies
pnpm install

# 3. Build packages
pnpm build

# 4. Deploy the registry API
cd apps/registry-api
npx wrangler deploy

# 5. Seed the database
# (requires running registry)
npx tsx scripts/seed-from-file.ts
```

### Populating the Registry

To refresh or expand the tool dataset:

```bash
# Scrape the latest MCP tools from GitHub + npm
pnpm discover

# Import into a running registry
pnpm seed-from-file
```

## 📦 Packages

| Package | Description |
|---------|-------------|
| `@mcpub/shared` | Shared TypeScript types (MCPTool, ScanResult, etc.) |
| `@mcpub/security` | Reusable security scanner library |
| `@mcpub/cli` | CLI application (Commander.js, tsup) |
| `@mcpub/registry-api` | Cloudflare Workers registry backend |
| `@mcpub/web` | Next.js 15 web frontend |

## 🤝 Contributing

Contributions are welcome! Submit a PR or open an issue on GitHub.

## 📄 License

MIT
