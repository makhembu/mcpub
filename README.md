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
| 1 | [TrendRadar](https://github.com/sansan0/TrendRadar) | ⭐AI-driven public opinion & trend monitor with multi-platform aggregation, RSS, and smart alerts.... | 57066 | — |
| 2 | [Scrapling](https://github.com/D4Vinci/Scrapling) | 🕷️ An adaptive Web Scraping framework that handles everything from a single request to a full-sc... | 47970 | — |
| 3 | [ruflo](https://github.com/ruvnet/ruflo) | 🌊 The leading agent orchestration platform for Claude. Deploy intelligent multi-agent swarms, co... | 47040 | — |
| 4 | [chrome-devtools-mcp](https://github.com/ChromeDevTools/chrome-devtools-mcp) | Chrome DevTools for coding agents | 38555 | — |
| 5 | [UI-TARS-desktop](https://github.com/bytedance/UI-TARS-desktop) | The Open-Source Multimodal AI Agent Stack: Connecting Cutting-Edge AI Models and Agent Infra | 30972 | — |
| 6 | [gpt-researcher](https://github.com/assafelovic/gpt-researcher) | An autonomous agent that conducts deep research on any data using any LLM providers | 26949 | — |
| 7 | [activepieces](https://github.com/activepieces/activepieces) | AI Agents & MCPs & AI Workflow Automation • (~400 MCP servers for AI agents) • AI Automation / AI... | 22114 | — |
| 8 | [MaxKB](https://github.com/1Panel-dev/MaxKB) | 🔥 MaxKB is an open-source platform for building enterprise-grade agents.  强大易用的开源企业级智能体平台。 | 20900 | — |
| 9 | [n8n-mcp](https://github.com/czlonkowski/n8n-mcp) | A MCP for Claude Desktop / Claude Code / Windsurf / Cursor to build n8n workflows for you  | 20381 | — |
| 10 | [nuclear](https://github.com/nukeop/nuclear) | Streaming music player that finds free music for you | 17477 | — |
| 11 | [mcp-for-beginners](https://github.com/microsoft/mcp-for-beginners) | This open-source curriculum introduces the fundamentals of Model Context Protocol (MCP) | 16053 | — |
| 12 | [trigger.dev](https://github.com/triggerdotdev/trigger.dev) | Trigger.dev – build and deploy fully‑managed AI agents, workflows and MCP servers | 14831 | — |
| 13 | [context-mode](https://github.com/mksglu/context-mode) | Context window optimization for AI coding agents. Sandbox mode execution and codebase analysis | 14062 | — |
| 14 | [OpenMetadata](https://github.com/open-metadata/OpenMetadata) | OpenMetadata is a unified metadata platform for data discovery, data quality, observability,... | 13850 | — |
| 15 | [Skill_Seekers](https://github.com/yusufkaraaslan/Skill_Seekers) | Convert documentation websites, GitHub repositories, and more into AI-accessible skills | 13371 | — |
| 16 | [xiaohongshu-mcp](https://github.com/xpzouying/xiaohongshu-mcp) | MCP for xiaohongshu.com | 13369 | — |
| 17 | [fastapi_mcp](https://github.com/tadata-org/fastapi_mcp) | Expose your FastAPI endpoints as Model Context Protocol (MCP) tools with zero effort | 11854 | — |
| 18 | [nginx-ui](https://github.com/0xJacky/nginx-ui) | Yet another WebUI for Nginx | 11127 | — |
| 19 | [XHS-Downloader](https://github.com/JoeanAmier/XHS-Downloader) | 小红书（XiaoHongShu、RedNote）链接提取/作品采集工具：提取账号发布、收藏、点赞、专辑作品链接 | 11102 | — |
| 20 | [mcp-use](https://github.com/mcp-use/mcp-use) | The fullstack MCP framework to develop MCP Apps for Chat Clients | 9910 | — |
| 21 | [xiaozhi-esp32-server](https://github.com/xinnan-tech/xiaozhi-esp32-server) | 本项目为xiaozhi-esp32提供后端服务，帮助您快速搭建ESP32设备控制服务器。Backend ser... | 9481 | — |
| 22 | [hexstrike-ai](https://github.com/0x4m4/hexstrike-ai) | HexStrike AI MCP Agents is an advanced MCP server that integrates with HexStrike's infrastructu... | 8636 | — |
| 23 | [Auto-claude-code-research-in-sleep](https://github.com/wanshuiyin/Auto-claude-code-research-in-sleep) | ARIS ⚔️ (Auto-Research-In-Sleep) — Lightweight Markdown-based research automation framework... | 8501 | — |
| 24 | [ida-pro-mcp](https://github.com/mrexodia/ida-pro-mcp) | AI-powered reverse engineering assistant that bridges IDA Pro with AI agents via MCP | 8333 | — |
| 25 | [lamda](https://github.com/firerpa/lamda) | The most powerful Android RPA agent framework, next generation of automation for Android devices | 7775 | — |
| 26 | [browser-tools-mcp](https://github.com/AgentDeskAI/browser-tools-mcp) | Monitor browser logs directly from Cursor and other MCP-compatible AI assistants | 7215 | — |
| 27 | [Awesome-MCP-ZH](https://github.com/yzfly/Awesome-MCP-ZH) | MCP 资源精选， MCP指南，Claude MCP，MCP Servers, MCP Clients，MCP Tools 和 MCP 学习资料 | 7035 | — |
| 28 | [mcp](https://github.com/BrowserMCP/mcp) | Browser MCP is a Model Context Provider (MCP) server that connects to the browser | 6472 | — |
| 29 | [firecrawl-mcp-server](https://github.com/firecrawl/firecrawl-mcp-server) | 🔥 Official Firecrawl MCP Server - Adds powerful web scraping to Claude and any MCP-compatible... | 6248 | — |
| 30 | [klavis](https://github.com/Klavis-AI/klavis) | Klavis AI:  MCP integration platforms that let AI agents interact with data sources | 5734 | — |
| 31 | [XcodeBuildMCP](https://github.com/getsentry/XcodeBuildMCP) | A Model Context Protocol (MCP) server and CLI that provides Xcode builds, errors, and more | 5460 | — |
| 32 | [osaurus](https://github.com/osaurus-ai/osaurus) | Own your AI. The native macOS harness for AI agents -- run prompts, files, and MCPs | 5204 | — |
| 33 | [Viper](https://github.com/FunnyWolf/Viper) | Adversary simulation and Red teaming platform with AI | 5038 | — |
| 34 | [bifrost](https://github.com/maximhq/bifrost) | Fastest enterprise AI gateway (50x faster than LiteLLM) | 4722 | — |
| 35 | [deep-research](https://github.com/u14app/deep-research) | Use any LLMs (Large Language Models) for Deep Research. | 4581 | — |
| 36 | [exa-mcp-server](https://github.com/exa-labs/exa-mcp-server) | Exa MCP for web search and web crawling! | 4400 | — |
| 37 | [ENScan_GO](https://github.com/wgpsec/ENScan_GO) | 一款基于各大企业信息API的工具，解决在遇到的各种针对国内企业信息收集难题。一键收集控股公司ICP备案、APP... | 4383 | — |
| 38 | [httprunner](https://github.com/httprunner/httprunner) | HttpRunner 是一款开源的 API/UI 测试框架，简单易用，功能强大，具有丰富的插件化机制和高度的可... | 4276 | — |
| 39 | [csharp-sdk](https://github.com/modelcontextprotocol/csharp-sdk) | The official C# SDK for Model Context Protocol servers | 4251 | — |
| 40 | [mcpo](https://github.com/open-webui/mcpo) | A simple, secure MCP-to-OpenAPI proxy server | 4181 | — |
| 41 | [kubefwd](https://github.com/txn2/kubefwd) | Bulk port forwarding Kubernetes services for local development | 4103 | — |
| 42 | [mcp-server-chart](https://github.com/antvis/mcp-server-chart) | 🤖 A visualization mcp & skills contains 25+ visual charts for data visualization | 4047 | — |
| 43 | [lemonade](https://github.com/lemonade-sdk/lemonade) | Lemonade helps users discover and run local AI apps by turning open-source models into one-click... | 3868 | — |
| 44 | [excel-mcp-server](https://github.com/haris-musa/excel-mcp-server) | A Model Context Protocol server for Excel file manipulation and automation | 3791 | — |
| 45 | [fast-agent](https://github.com/evalstate/fast-agent) | Code, Build and Evaluate agents - excellent Model and Server support | 3769 | — |
| 46 | [archestra](https://github.com/archestra-ai/archestra) | Enterprise AI Platform with guardrails, MCP registry, gateways, and agentic automation | 3637 | — |
| 47 | [MCP-Chinese-Getting-Started-Guide](https://github.com/liaokongVFX/MCP-Chinese-Getting-Started-Guide) | Model Context Protocol(MCP) 编程极速入门 | 3484 | — |
| 48 | [py-xiaozhi](https://github.com/huangjunsen0406/py-xiaozhi) | A Python-based Xiaozhi AI for users who want the full Xiaozhi experience without an ESP32 | 3304 | — |
| 49 | [buildwithclaude](https://github.com/davepoon/buildwithclaude) | A single hub to find Claude Skills, Agents, Commands, Hacks and more | 2893 | — |
| 50 | [solon](https://github.com/opensolon/solon) | 🔥 Java enterprise application development framework for building modern cloud-native applications | 2725 | — |
| 51 | [dbhub](https://github.com/bytebase/dbhub) | Zero-dependency, token-efficient database MCP server for connecting any database to MCP clients | 2715 | — |
| 52 | [arxiv-mcp-server](https://github.com/blazickjp/arxiv-mcp-server) | A Model Context Protocol server for searching and analyzing arXiv academic papers | 2677 | — |
| 53 | [Unity-MCP](https://github.com/IvanMurzak/Unity-MCP) | AI Skills, MCP Tools, and CLI for Unity Engine. Full AI integration for Unity development | 2644 | — |
| 54 | [ddgs](https://github.com/deedy5/ddgs) | A metasearch library that aggregates results from diverse web sources | 2607 | — |
| 55 | [slackdump](https://github.com/rusq/slackdump) | Save or export your private and public Slack messages, threads, files, and users | 2581 | — |
| 56 | [nunu](https://github.com/go-nunu/nunu) | A CLI tool for building Go applications. | 2559 | — |
| 57 | [mcp-proxy](https://github.com/sparfenyuk/mcp-proxy) | A bridge between Streamable HTTP and stdio MCP transport protocols | 2495 | — |
| 58 | [fli](https://github.com/punitarani/fli) | Google Flights MCP and Python Library | 2372 | — |
| 59 | [design-extract](https://github.com/Manavarya09/design-extract) | Extract any website's complete design system with one click | 2368 | — |
| 60 | [brightdata-mcp](https://github.com/brightdata/brightdata-mcp) | A powerful Model Context Protocol (MCP) server that provides 50+ Bright Data web unlocker APIs | 2352 | — |
| 61 | [tradingview-mcp](https://github.com/atilaahmettaner/tradingview-mcp) | Real-time crypto & stock screening, advanced technical analysis with TradingView indicator access | 2345 | — |
| 62 | [google_workspace_mcp](https://github.com/taylorwilsdon/google_workspace_mcp) | Control Gmail, Google Calendar, Docs, Sheets, Slides, Contacts and more | 2320 | — |
| 63 | [metamcp](https://github.com/metatool-ai/metamcp) | MCP Aggregator, Orchestrator, Middleware, Gateway in one | 2304 | — |
| 64 | [codebase-memory-mcp](https://github.com/DeusData/codebase-memory-mcp) | High-performance code intelligence MCP server. Indexes codebases for AI-assisted development | 2173 | — |
| 65 | [Unla](https://github.com/AmoyLab/Unla) | 🧩 MCP Gateway - A lightweight gateway service that instantiates MCP server processes | 2108 | — |
| 66 | [mcp-shrimp-task-manager](https://github.com/cjo4m06/mcp-shrimp-task-manager) | Shrimp Task Manager is a task tool built for AI Agents, offering intuitive task and note manage... | 2093 | — |
| 67 | [carbon](https://github.com/crbnos/carbon) | Carbon is an open source ERP, MES and QMS for manufacturing excellence | 2092 | — |
| 68 | [fusio](https://github.com/apioo/fusio) | Self-Hosted API Management for Builders | 2085 | — |
| 69 | [mcphub](https://github.com/samanhappy/mcphub) | A unified hub for centrally managing and dynamically orchestrating MCP servers | 2063 | — |
| 70 | [mcp-router](https://github.com/mcp-router/mcp-router) | A Unified MCP Server Management App (MCP Manager). | 1999 | — |
| 71 | [jadx-ai-mcp](https://github.com/zinja-coder/jadx-ai-mcp) | Plugin for JADX to integrate MCP server | 1975 | — |
| 72 | [esp32_nat_router](https://github.com/martin-ger/esp32_nat_router) | An AI-enabled NAT Router/Firewall for the ESP32 | 1941 | — |
| 73 | [inspector](https://github.com/MCPJam/inspector) | Development platform to debug, chat, inspect, and evaluate MCP servers from desktop | 1928 | — |
| 74 | [unreal-mcp](https://github.com/chongdashu/unreal-mcp) | Enable AI assistant clients like Cursor, Windsurf and Claude to control the Unreal Editor | 1852 | — |
| 75 | [contextplus](https://github.com/forloopcodes/contextplus) | Semantic Intelligence for Large-Scale Engineering. Context-aware code assistant | 1831 | — |
| 76 | [linkedin-mcp-server](https://github.com/stickerdaniel/linkedin-mcp-server) | Open-source MCP server for LinkedIn. Give Claude and any MCP client access to LinkedIn | 1816 | — |
| 77 | [mcp-memory-service](https://github.com/doobidoo/mcp-memory-service) | Open-source persistent memory for AI agent pipelines (Local & S3) | 1815 | — |
| 78 | [Dive](https://github.com/OpenAgentPlatform/Dive) | Dive is an open-source MCP Host Desktop Application that gives you a dedicated space to run,... | 1788 | — |
| 79 | [mcphub.nvim](https://github.com/ravitemer/mcphub.nvim) | An MCP client for Neovim that seamlessly integrates MCP servers into your editor | 1765 | — |
| 80 | [radar](https://github.com/skyhook-io/radar) | The missing open source Kubernetes UI. Topology, event timeline, pod details | 1756 | — |
| 81 | [pg-aiguide](https://github.com/timescale/pg-aiguide) | MCP server and Claude plugin for Postgres skills and documentation | 1717 | — |
| 82 | [korean-law-mcp](https://github.com/chrisryugj/korean-law-mcp) | 국가법령정보MCP v4.0 \| 법제처 41개 API → 17개 MCP 도구. 법령·판례·조례 검색 | 1686 | `korean-law-mcp` |
| 83 | [zenfeed](https://github.com/glidea/zenfeed) | Make RSS 📰 great again with AI 🧠✨!! [gpt-5.5 -> https | 1675 | — |
| 84 | [slack-mcp-server](https://github.com/korotovsky/slack-mcp-server) | The most powerful MCP Slack Server with no permission requests | 1584 | — |
| 85 | [mcptools](https://github.com/f/mcptools) | A command-line interface for interacting with MCP (Model Context Protocol) servers | 1577 | — |
| 86 | [mcp-brasil](https://github.com/Mcp-Brasil/mcp-brasil) | MCP Server para 70 APIs públicas brasileiras | 1543 | — |
| 87 | [mcp-language-server](https://github.com/isaacphi/mcp-language-server) | mcp-language-server gives MCP enabled clients access semantic and syntactic information about... | 1526 | — |
| 88 | [rulego](https://github.com/rulego/rulego) | ⛓️RuleGo is a lightweight, high-performance, embedded, and scalable component orchestration ru... | 1503 | — |
| 89 | [MiniMax-MCP](https://github.com/MiniMax-AI/MiniMax-MCP) | Official MiniMax Model Context Protocol (MCP) server that provides MiniMax AI capabilities | 1471 | — |
| 90 | [PrismerCloud](https://github.com/Prismer-AI/PrismerCloud) | Prismer Cloud | 1465 | — |
| 91 | [paperdebugger](https://github.com/PaperDebugger/paperdebugger) | A Plugin-Based Multi-Agent System for In-Editor Academic Paper Debugging | 1453 | — |
| 92 | [datagouv-mcp](https://github.com/datagouv/datagouv-mcp) | Official data.gouv.fr Model Context Protocol (MCP) server | 1433 | — |
| 93 | [LitterBox](https://github.com/BlackSnufkin/LitterBox) | A self-hosted sandbox for red teams to test payloads against EDR solutions | 1413 | — |
| 94 | [paperbanana](https://github.com/llmsresearch/paperbanana) | Open source implementation and extension of Google Research's "Authentication as a Service" (Au... | 1404 | — |
| 95 | [data-api-builder](https://github.com/Azure/data-api-builder) | Data API builder provides modern REST, GraphQL endpoints for your Azure databases | 1401 | — |
| 96 | [mcp-server-qdrant](https://github.com/qdrant/mcp-server-qdrant) | An official Qdrant Model Context Protocol (MCP) server for vector search | 1389 | — |
| 97 | [paper-search-mcp](https://github.com/openags/paper-search-mcp) | MCP, CLI, Skills for searching and downloading academic papers | 1367 | — |
| 98 | [awesome-hacking-lists](https://github.com/taielab/awesome-hacking-lists) | A curated collection of top-tier penetration testing tools and security resources | 1333 | — |
| 99 | [npcpy](https://github.com/NPC-Worldwide/npcpy) | The python library for research and development in NLP, computer vision, and multi-modal AI | 1332 | — |
| 100 | [mcp-windbg](https://github.com/svnscha/mcp-windbg) | Model Context Protocol for WinDBG | 1274 | — |

---

## 🔧 CLI Commands

| Command | Description |
|---------|-------------|
| `mcpub search [query]` | Search the MCP tool registry |
| `mcpub install <name>` | Install a tool to Claude Desktop, Cursor, Windsurf, or OpenCode |
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

> Install Playwright MCP to which clients?
  ◻  Claude Desktop   (detected)
  ◼  Cursor           (detected)
  ◻  Windsurf
  ◻  OpenCode

✔ Cursor: written to /Users/you/project/.cursor/mcp.json
   → Restart Cursor or reload window (Cmd/Ctrl+Shift+P → Developer: Reload Window)

Done.

# Skip prompts: auto-install to all detected clients
$ npx mcpub install playwright -y

# Target specific client
$ npx mcpub install playwright --client claude-desktop,cursor
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

## 🤖 Automated Discovery Setup

To enable daily automated discovery, add these secrets to your GitHub repo
(Settings → Secrets and Variables → Actions):

| Secret | Description | How to get it |
|--------|-------------|---------------|
| `GH_DISCOVERY_TOKEN` | GitHub PAT for API access | [Create token](https://github.com/settings/tokens) with `public_repo` scope |
| `REGISTRY_URL` | Your deployed Workers URL | e.g. `https://mcpub-registry.yourname.workers.dev` |
| `SEED_API_KEY` | Registry seed API key | Set in Cloudflare Workers environment variables |

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
