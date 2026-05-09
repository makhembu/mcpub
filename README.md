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

## 📋 Table of Contents

- [✨ Features](#-features)
- [🚀 Quick Start](#-quick-start)
- [📊 Registry Stats](#-registry-stats)
- [🏆 Top 100 Tools](#-top-100-tools)
- [🔧 CLI Commands](#-cli-commands)
- [🌐 Web UI](#-web-ui)
- [🏗️ Architecture](#️-architecture)
- [🔒 Security Scanner](#-security-scanner)
- [🚀 Self-Hosting](#-self-hosting)
- [📦 Packages](#-packages)
- [🤝 Contributing](#-contributing)
- [📄 License](#-license)

---

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

## 🏆 Top 100 Tools

The registry ships with **1,574 MCP tools** pre-scraped from GitHub and npm. Here are the top 100 by stars:

| # | Tool | Description | ⭐ Stars | Package |
|---|---|---|---|---|
| 1 | **TrendRadar** | ⭐AI-driven public opinion & trend monitor with multi-pl | 57066 | — |
| 2 | **Scrapling** | 🕷️ An adaptive Web Scraping framework that handles eve | 47970 | — |
| 3 | **ruflo** | 🌊 The leading agent orchestration platform for Claude. | 47040 | — |
| 4 | **chrome-devtools-mcp** | Chrome DevTools for coding agents | 38555 | — |
| 5 | **UI-TARS-desktop** | The Open-Source Multimodal AI Agent Stack: Connecting C | 30972 | — |
| 6 | **gpt-researcher** | An autonomous agent that conducts deep research on any | 26949 | — |
| 7 | **activepieces** | AI Agents & MCPs & AI Workflow Automation • (~400 MCP s | 22114 | — |
| 8 | **MaxKB** | 🔥 MaxKB is an open-source platform for building enterp | 20900 | — |
| 9 | **n8n-mcp** | A MCP for Claude Desktop / Claude Code / Windsurf / Cur | 20381 | — |
| 10 | **mcp-for-beginners** | This open-source curriculum introduces the fundamentals | 16053 | — |
| 11 | **trigger.dev** | Trigger.dev – build and deploy fully‑managed AI agents | 14831 | — |
| 12 | **context-mode** | Context window optimization for AI coding agents. Sandb | 14062 | — |
| 13 | **OpenMetadata** | OpenMetadata is a unified metadata platform for data di | 13850 | — |
| 14 | **Skill_Seekers** | Convert documentation websites, GitHub repositories, an | 13371 | — |
| 15 | **xiaohongshu-mcp** | MCP for xiaohongshu.com | 13369 | — |
| 16 | **fastapi_mcp** | Expose your FastAPI endpoints as Model Context Protocol | 11854 | — |
| 17 | **mcp-use** | The fullstack MCP framework to develop MCP Apps for Cha | 9910 | — |
| 18 | **hexstrike-ai** | HexStrike AI MCP Agents is an advanced MCP server that | 8636 | — |
| 19 | **ida-pro-mcp** | AI-powered reverse engineering assistant that bridges I | 8333 | — |
| 20 | **browser-tools-mcp** | Monitor browser logs directly from Cursor and other MCP | 7215 | — |
| 21 | **firecrawl-mcp-server** | 🔥 Official Firecrawl MCP Server - Adds powerful web sc | 6248 | — |
| 22 | **XcodeBuildMCP** | A Model Context Protocol (MCP) server and CLI that prov | 5460 | — |
| 23 | **osaurus** | Own your AI. The native macOS harness for AI agents -- | 5204 | — |
| 24 | **bifrost** | Fastest enterprise AI gateway (50x faster than LiteLLM) | 4722 | — |
| 25 | **deep-research** | Use any LLMs (Large Language Models) for Deep Research. | 4581 | — |
| 26 | **exa-mcp-server** | Exa MCP for web search and web crawling! | 4400 | — |
| 27 | **mcpo** | A simple, secure MCP-to-OpenAPI proxy server | 4181 | — |
| 28 | **mcp-server-chart** | 🤖 A visualization mcp & skills contains 25+ visual cha | 4047 | — |
| 29 | **excel-mcp-server** | A Model Context Protocol server for Excel file manipula | 3791 | — |
| 30 | **fast-agent** | Code, Build and Evaluate agents - excellent Model and S | 3769 | — |
| 31 | **archestra** | Enterprise AI Platform with guardrails, MCP registry, g | 3637 | — |
| 32 | **dbhub** | Zero-dependency, token-efficient database MCP server fo | 2715 | — |
| 33 | **arxiv-mcp-server** | A Model Context Protocol server for searching and analy | 2677 | — |
| 34 | **Unity-MCP** | AI Skills, MCP Tools, and CLI for Unity Engine. Full AI | 2644 | — |
| 35 | **mcp-proxy** | A bridge between Streamable HTTP and stdio MCP transpor | 2495 | — |
| 36 | **fli** | Google Flights MCP and Python Library | 2372 | — |
| 37 | **design-extract** | Extract any website's complete design system with one c | 2368 | — |
| 38 | **brightdata-mcp** | A powerful Model Context Protocol (MCP) server that pro | 2352 | — |
| 39 | **tradingview-mcp** | Real-time crypto & stock screening, advanced technical | 2345 | — |
| 40 | **google_workspace_mcp** | Control Gmail, Google Calendar, Docs, Sheets, Slides, C | 2320 | — |
| 41 | **metamcp** | MCP Aggregator, Orchestrator, Middleware, Gateway in on | 2304 | — |
| 42 | **codebase-memory-mcp** | High-performance code intelligence MCP server. Indexes | 2173 | — |
| 43 | **mcp-shrimp-task-manager** | Shrimp Task Manager is a task tool built for AI Agents, | 2093 | — |
| 44 | **mcphub** | A unified hub for centrally managing and dynamically or | 2063 | — |
| 45 | **mcp-router** | A Unified MCP Server Management App (MCP Manager). | 1999 | — |
| 46 | **jadx-ai-mcp** | Plugin for JADX to integrate MCP server | 1975 | — |
| 47 | **inspector** | Development platform to debug, chat, inspect, and evalu | 1928 | — |
| 48 | **unreal-mcp** | Enable AI assistant clients like Cursor, Windsurf and C | 1852 | — |
| 49 | **contextplus** | Semantic Intelligence for Large-Scale Engineering. Cont | 1831 | — |
| 50 | **linkedin-mcp-server** | Open-source MCP server for LinkedIn. Give Claude and an | 1816 | — |
| 51 | **mcp-memory-service** | Open-source persistent memory for AI agent pipelines (L | 1815 | — |
| 52 | **Dive** | Dive is an open-source MCP Host Desktop Application tha | 1788 | — |
| 53 | **mcphub.nvim** | An MCP client for Neovim that seamlessly integrates MCP | 1765 | — |
| 54 | **pg-aiguide** | MCP server and Claude plugin for Postgres skills and do | 1717 | — |
| 55 | **korean-law-mcp** | 국가법령정보MCP v4.0 \| 법제처 41개 API → 17개 MCP 도구 | 1686 | `korean-law-mcp` |
| 56 | **slack-mcp-server** | The most powerful MCP Slack Server with no permission r | 1584 | — |
| 57 | **mcptools** | A command-line interface for interacting with MCP (Mode | 1577 | — |
| 58 | **mcp-brasil** | MCP Server para 70 APIs públicas brasileiras | 1543 | — |
| 59 | **mcp-language-server** | mcp-language-server gives MCP enabled clients access se | 1526 | — |
| 60 | **MiniMax-MCP** | Official MiniMax Model Context Protocol (MCP) server th | 1471 | — |
| 61 | **paperdebugger** | A Plugin-Based Multi-Agent System for In-Editor Academi | 1453 | — |
| 62 | **datagouv-mcp** | Official data.gouv.fr Model Context Protocol (MCP) serv | 1433 | — |
| 63 | **paper-search-mcp** | MCP, CLI, Skills for searching and downloading academic | 1367 | — |
| 64 | **mcp-windbg** | Model Context Protocol for WinDBG | 1274 | — |
| 65 | **mcp-server-sse** | A ready-to-use MCP SSE server template implementing the | 1229 | — |
| 66 | **googlesheet-mcp** | Google Sheets MCP server for structured data management | 1196 | — |
| 67 | **tavily-mcp-server** | A powerful MCP server that gives AI language models acc | 1165 | — |
| 68 | **mcp-factory** | Click, ship, done — deploy MCP servers in seconds from | 1163 | — |
| 69 | **cloudflare-mcp** | MCP server for Cloudflare API with access to Workers, K | 1132 | — |
| 70 | **hunter-mcp** | MCP server to verify emails and search professional ema | 1114 | — |
| 71 | **mcp-doctor** | MCP Doctor is an advanced quality assurance and debuggin | 1089 | — |
| 72 | **clickhouse-mcp** | MCP server to query and analyze ClickHouse databases | 1071 | — |
| 73 | **mcp-agent** | Build effective agents with Model Context Protocol in m | 1031 | — |
| 74 | **mcp-agents-hub** | Agent infrastructure for MCP, providing agent and multi | 1031 | — |
| 75 | **steam-mcp** | A MCP server for querying Steam data | 1003 | — |
| 76 | **helm-mcp** | A MCP server for managing Kubernetes Helm deployments | 993 | — |
| 77 | **mcp-timesync** | MCP server providing current time and time conversions | 963 | — |
| 78 | **mcp-server-openapi** | Connect any OpenAPI API to an MCP client (Claude, Curs | 941 | — |
| 79 | **mcp-server-ollama** | A Model Context Protocol Server for Ollama | 930 | — |
| 80 | **xcode-mcp** | Apple开发者加速器 - 赋能 AI 高效构建 Apple 平台应用 | 926 | — |
| 81 | **mcp-linkedin** | MCP Server to interact with LinkedIn | 909 | — |
| 82 | **mcp-server-da** | A MCP server to manage, query, and visualize developer | 896 | — |
| 83 | **mcp-porter** | Shipping your local MCP server to the cloud in minutes | 879 | — |
| 84 | **mcp-github** | MCP server for GitHub API | 858 | — |
| 85 | **mcp-pinecone** | MCP server for Pinecone vector database | 850 | — |
| 86 | **mcp-server-jdbc** | A Model Context Protocol server that enables AI agents | 840 | — |
| 87 | **ha-mcp** | Home Assistant MCP Server for AI Assistants | 832 | — |
| 88 | **mcp-mysql** | A robust MySQL MCP server for AI agents to interact wit | 830 | — |
| 89 | **mcp-server-filesystem** | Secure file operations MCP server | 829 | — |
| 90 | **mcp-pinecone-mcp-server** | A Model Context Protocol server that provides semantic | 818 | — |
| 91 | **mcp-packager** | Packaging tool for MCP servers, enabling deployment on | 798 | — |
| 92 | **mcp-mqtt** | MCP server for MQTT protocol | 789 | — |
| 93 | **mcp-worker** | Deploy MCP servers on Cloudflare Workers | 780 | — |
| 94 | **ginko** | Ginkō — bring your own content to MCP, without the infr | 778 | — |
| 95 | **youtube-mcp** | MCP server for YouTube | 770 | — |
| 96 | **mcp-server-wordpress** | MCP server for Wordpress | 769 | — |
| 97 | **mcp-kubernetes** | MCP server for Kubernetes | 768 | — |
| 98 | **mcp-server-discord** | MCP Server for Discord | 748 | — |
| 99 | **qwen-mcp-server** | Qwen MCP server implementation. | 734 | — |
| 100 | **mcp-server-llm** | MCP server that enables LLM to call each other | 733 | — |

---

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
