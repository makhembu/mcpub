# ⚡ MCPHub

**The npm for AI Tools** — One command to install, search, and secure MCP servers.

```bash
npx mcpub search "database"
npx mcpub install playwright
npx mcpub scan my-tool
```

## Features

- **Search** — Discover MCP tools from an expanding registry
- **Install** — One-command install: `npx mcpub install <tool>`
- **Security** — Built-in scanning (17 detection patterns) for every tool
- **Compatibility** — See which tools work with OpenAI SDK, Anthropic, LangChain, Cursor
- **Open Source** — MIT licensed, self-hostable

## Quick Start

```bash
# Search for tools
npx mcpub search "database"

# Install a tool
npx mcpub install playwright

# Get tool details
npx mcpub info github

# Security scan
npx mcpub scan my-tool
```

## Architecture

```
mcpub/
├── apps/
│   ├── cli/           # TypeScript CLI (npx mcpub)
│   ├── registry-api/  # Cloudflare Workers + D1 registry
│   └── web/           # Next.js web UI
├── packages/
│   ├── shared/        # Shared TypeScript types
│   └── security/      # Security scanner (17 patterns)
└── scripts/           # Seed/scrape utilities
```

## Registry API

The registry API runs on Cloudflare Workers with D1:

- `GET /api/search?q=<query>` — Search tools
- `GET /api/tools/:slug` — Tool details
- `GET /api/scan/:slug` — Security scan
- `GET /api/health` — Health check

## Development

```bash
# Install dependencies
pnpm install

# Build all packages
pnpm build

# Run CLI locally
node apps/cli/dist/index.js --help
```

## Security Scanner

MCPHub includes a built-in security scanner with 17 detection patterns across 5 categories:

- **Prompt Injection** (6 patterns) — Instruction override, role manipulation, memory manipulation
- **Data Exfiltration** (3 patterns) — Prompt extraction, credential harvesting, external data send
- **Tool Poisoning** (3 patterns) — Unsafe command execution, dynamic code, piped remote execution
- **Supply Chain** (2 patterns) — Remote code fetch, suspicious package references
- **Misconfiguration** (2 patterns) — Broad filesystem access, unrestricted network access

## License

MIT
