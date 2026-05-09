# MCPub — Agent Guide

MCPub is a registry + CLI for discovering, installing, and security-scanning MCP (Model Context Protocol) servers. "The npm for AI Tools."

## Quick Start

```bash
pnpm install
pnpm dev              # runs all apps (web + registry-api + cli build --watch)
pnpm build            # builds all packages and apps
pnpm cli search db    # search the registry from CLI
```

## Architecture (pnpm monorepo)

```
apps/
  web/                 # Next.js 15 landing + search page (app/page.tsx, app/search/page.tsx, app/tool/[slug]/page.tsx)
  registry-api/        # Cloudflare Workers API (itty-router + D1 + Vectorize)
  cli/                 # Commander-based CLI (search, install, info, scan)
packages/
  shared/              # Types: MCPTool, ScanResult, SearchResult, etc.
  security/            # Scanner class + 17 detection patterns for MCP security scanning
scripts/
  discover.ts          # Scrapes GitHub (topic:mcp-server) + npm (keywords:mcp-server) → generated-seed.json
  seed-from-file.ts    # POSTs generated-seed.json to running registry API
  gen-top100.mjs       # Generates top 100 table markdown for README
```

## Key Environment Variables

- `GITHUB_TOKEN` — required for `pnpm discover` (avoids rate limiting)
- `REGISTRY_URL` — defaults to `http://localhost:8787` for seed, `https://registry.mcpub.dev` for web
- `CLOUDFLARE_API_TOKEN` — required for `pnpm deploy` (registry-api)

## Key Commands

| Command | Description |
|---------|-------------|
| `pnpm discover` | Scrape GitHub + npm for new MCP tools, writes `apps/registry-api/src/generated-seed.json` |
| `pnpm seed-from-file` | POST generated-seed.json to a running local registry at `REGISTRY_URL` |
| `pnpm gen-top100` | Regenerate `scripts/top100-table.md` from generated-seed.json |
| `pnpm cli search <q>` | Search registry via CLI |
| `pnpm cli install <name>` | Look up + security-scan a tool |
| `pnpm cli info <name>` | Show tool details |
| `pnpm cli scan <name>` | Security scan a tool |
| `pnpm format` | Format all files with prettier |
| `pnpm lint` | Lint with eslint |

## Workflows

### Update seed data & refresh README top 100

1. `pnpm discover` (scrape latest from GitHub + npm)
2. `pnpm gen-top100` (regenerate markdown table)
3. Copy `scripts/top100-table.md` table body into `README.md`
4. `pnpm seed-from-file` (push to running registry — `pnpm dev` in another terminal first)

**Note**: `seed.ts` contains a hardcoded `SEED_TOOLS` array (50 tools) used as fallback. The `generated-seed.json` (1,574 tools) is the real data and takes priority when seeded via the POST endpoint.

### Add a new security pattern

Edit `packages/security/src/patterns.ts` — patterns auto-register in both the `Scanner` class (CLI) and the registry API scan endpoint.

## API Routes (registry-api)

| Route | Description |
|-------|-------------|
| `GET /api/search?q=<query>&limit=10&category=<cat>` | Search tools |
| `GET /api/tools/<slug>` | Tool detail by slug or name |
| `GET /api/scan/<slug>` | Security scan a tool (returns ScanResult) |
| `GET /api/health` | Health check |
| `POST /api/seed` | Bulk import tools (auth: `x-api-key: dev-seed-key`) |

## Important Gotchas

- **Seed data**: `generated-seed.json` is committed (1.5MB). Don't commit if you rescrape with sensitive tokens.
- **CLI registry URL**: Stored in `~/.config/mcpub/config.json` (via `conf` package). Defaults to `https://registry.mcpub.dev`.
- **Registry API**: Runs on Cloudflare Workers (wrangler). Local dev uses `wrangler dev` with D1 + Vectorize bindings.
- **Top 100 table**: `gen-top100.mjs` truncates descriptions at 100 chars with word-boundary awareness + `...`. Rerun and copy to README after rescraping.
- **Description truncation in discover.ts**: `shortDescription` is already truncated at 97 chars in `makeTool()`. The gen-top100 script may further truncate.
- **No tests yet**: Project currently has no test files. Skip any test-related tasks.
