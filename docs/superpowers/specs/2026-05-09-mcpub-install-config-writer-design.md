# Phase 2 — `mcpub install` Config Writer

**Date:** 2026-05-09
**Status:** Approved

## Problem

`mcpub install <tool>` is read-only: it looks up a tool, scans it, and prints install instructions. Users still manually edit config files (`claude_desktop_config.json`, `.cursor/mcp.json`, etc.). The "one-command install" promise is unfulfilled.

## Goal

Make `mcpub install <tool>` actually install — write the MCP server entry to one or more client config files with a single command.

## Target Clients

| Client | Config File | `env` Format | Lookup Strategy |
|--------|------------|-------------|-----------------|
| Claude Desktop | Platform-dependent path | object `{"KEY":"val"}` | Platform-aware global path |
| Cursor | `.cursor/mcp.json` (in CWD or parents) | object `{"KEY":"val"}` | Walk up from CWD |
| Windsurf | `.windsurf/mcp_config.json` (in CWD or parents) | object `{"KEY":"val"}` | Walk up from CWD |
| OpenCode | `.opencode.json` (CWD) or `~/.opencode/config.json` | array `["KEY=val"]` | CWD first, then global |

### Config Formats Detail

**Claude Desktop / Cursor / Windsurf** (standard `mcpServers` format):
```json
{
  "mcpServers": {
    "<slug>": {
      "command": "npx",
      "args": ["-y", "<npm-package>"],
      "env": { "KEY": "value" }
    }
  }
}
```

**OpenCode** (`type` field required, `env` as string array):
```json
{
  "mcpServers": {
    "<slug>": {
      "type": "stdio",
      "command": "npx",
      "args": ["-y", "<npm-package>"],
      "env": ["KEY=value"]
    }
  }
}
```

### Entry Creation Logic (`createMcpEntry`)

For stdio tools, select command/args based on what the tool provides (first match):

1. `tool.npmPackage` → `{ command: "npx", args: ["-y", tool.npmPackage] }`
2. `tool.pyPackage` → `{ command: "uvx", args: [tool.pyPackage] }`
3. `tool.installCommand` → parse into `command` + `args` (split on spaces, first token is command)
4. Fallback → `{ command: "npx", args: ["-y", tool.slug] }`

For SSE tools (transport includes `'sse'` or `'streamable-http'`), the entry uses `url` instead of `command`. This is tracked as a future concern — no current seed data has SSE-only tools.

The `env` field is always omitted from the auto-generated entry. The registry has no per-tool environment variable data, and env vars are user-specific.

## CLI Interface

```
mcpub install <name>                  # Interactive: auto-detect + prompt for targets
mcpub install <name> -y               # Auto-install to all detected configs (skip prompt)
mcpub install <name> -c claude,cursor # Target specific client(s) only
mcpub install <name> --no-scan        # Skip security scan
```

### Behavior

1. **Lookup** — Fetch tool from registry by slug (existing, unchanged)
2. **Scan** — Run security scan (existing, skipped with `--no-scan`)
3. **Detect** — Scan filesystem for existing config files for all 4 clients
4. **Confirm** — Show detected targets, ask user which to write to (unless `-y` or `-c`)
5. **Write** — For each selected target:
   a. Read existing config file
   b. If it has an `mcpServers` key, ensure tool entry exists (merge, don't overwrite existing entries)
   c. If file doesn't exist, create it with `{ "mcpServers": { ... } }`
   d. Write with 2-space indent
   e. Create `.bak` backup of original before overwriting
6. **Report** — Print success per target with reload instructions

### Error Handling

- Config file has invalid JSON → print error with path, skip that target, continue others
- Registry unreachable → print "offline" message, exit non-zero (existing)
- Security scan fails (score < 40) → block install (existing behavior)
- No configs detected and no `-c` flag → print suggestion to use `-c` flag, exit non-zero
- Tool entry already exists in config → warn user, ask to overwrite (unless `-y`, then overwrite silently)
- Claude Desktop parent directory missing (Claude not installed) → warn and skip that target

### Claude Desktop Platform Paths

| Platform | Config Path |
|----------|------------|
| Windows | `%APPDATA%\Claude\claude_desktop_config.json` |
| macOS | `~/Library/Application Support/Claude/claude_desktop_config.json` |
| Linux | `~/.config/Claude/claude_desktop_config.json` |

## Modules

### `lib/config-writer.ts`

Exports:
- `getClientConfigPath(client: ClientType): string | null` — Resolve config file path for client
- `readClientConfig(client: ClientType): Record<string, unknown> | null` — Read and parse config
- `writeClientConfig(client: ClientType, config: Record<string, unknown>): void` — Write config with backup
- `addMcpServerEntry(config, slug, command, args, env, clientType): Record<string, unknown>` — Pure merge function
- `createMcpEntry(tool: MCPTool, clientType: ClientType): { command, args, env, type? }` — Build entry from tool data

### `lib/config-detector.ts`

Exports:
- `detectInstalledClients(): Promise<ClientType[]>` — Check which config files exist and are valid JSON
- `resolveConfigPath(client: ClientType): string` — Absolute path logic per client

### `commands/install.ts` — Rewritten

New flow:
1. Lookup tool (existing)
2. Scan tool (existing)
3. Detect configs (new)
4. Prompt for targets if interactive (new, skip if `-y`/`-c`)
5. Write configs (new)
6. Print success (updated)

### Types to add to `@mcpub/shared`

```typescript
export type ClientType = 'claude-desktop' | 'cursor' | 'windsurf' | 'opencode';

export interface InstallTarget {
  client: ClientType;
  configPath: string;
  detected: boolean; // true if file already exists
}
```

## Dependencies

- `@clack/prompts` — interactive multiselect, confirm, spinner (lighter than enquirer, ESM-native)
- No runtime deps for JSON merge — use `structuredClone` + spread

## Files Changed

| File | Action |
|------|--------|
| `apps/cli/src/lib/config-writer.ts` | **Create** |
| `apps/cli/src/lib/config-detector.ts` | **Create** |
| `apps/cli/src/commands/install.ts` | **Rewrite** |
| `packages/shared/src/types.ts` | **Add** `ClientType`, `InstallTarget` |
| `apps/cli/package.json` | **Add** `@clack/prompts` dependency |
| `pnpm-lock.yaml` | Regenerate |
| `README.md` | Update install command example |
