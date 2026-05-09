# @mcpub/config

> Detect MCP clients and manage their config files — zero runtime dependencies.

`@mcpub/config` provides a simple API for discovering installed MCP (Model Context Protocol) clients on the current machine and reading/writing their configuration files. This lets you programmatically install, remove, and list MCP server tools across Claude Desktop, Cursor, Windsurf, Continue, and VS Code.

## Install

```bash
npm install @mcpub/config
```

Zero runtime dependencies — only uses Node.js built-in modules (`fs`, `os`, `path`).

## Quick Start

```typescript
import { detectMCPClients, addToolToConfig, listInstalledTools } from '@mcpub/config';

// Discover which MCP clients are installed
const clients = detectMCPClients();
console.log(clients.filter(c => c.detected).map(c => c.name));
// → ['Claude Desktop', 'Cursor']

// Install a tool (writes mcpServers entry to config)
const result = addToolToConfig(clients[0], 'my-tool', {
  command: 'npx',
  args: ['-y', '@my/mcp-tool'],
});
console.log(result.added ? '✅ Added' : '⚠️ Already present');

// List installed tools
for (const client of clients.filter(c => c.detected)) {
  const tools = listInstalledTools(client);
  console.log(`${client.name}: ${tools.map(t => t.slug).join(', ')}`);
}
```

## Supported Clients

| Client | Config File Path | Key |
|--------|-----------------|-----|
| Claude Desktop | `~/Library/Application Support/Claude/claude_desktop_config.json` (macOS), `%APPDATA%\Claude\claude_desktop_config.json` (Windows) | `mcpServers` |
| Cursor | `~/.cursor/mcp.json` | `mcpServers` |
| Windsurf | `~/.windsurf/mcp.json` | `mcpServers` |
| Continue | `~/.continue/config.json` | `mcpServers` |
| VS Code | `~/.vscode/mcp.json` | `mcpServers` |

## API Reference

### `detectMCPClients(): MCPClientConfig[]`

Scans the filesystem for MCP client config files. Returns all known clients with their resolved paths and whether the config file exists on disk.

```typescript
interface MCPClientConfig {
  name: string;        // Human-readable client name
  configPath: string;   // Absolute path to config file
  configKey: string;    // JSON key for mcpServers (usually 'mcpServers')
  detected: boolean;    // Whether the config file exists on disk
}
```

### `readClientConfig(client: MCPClientConfig): Record<string, unknown> | null`

Reads and parses the client's config file. Returns `null` if the file doesn't exist or contains invalid JSON.

### `writeClientConfig(client: MCPClientConfig, config: Record<string, unknown>): void`

Atomically writes a config file using a temp file + rename strategy. Creates parent directories if they don't exist.

### `addToolToConfig(client: MCPClientConfig, toolSlug: string, installEntry: MCPInstallEntry): AddToolResult`

Adds a tool entry to the client's `mcpServers` config. Returns whether the tool was added or already present.

```typescript
interface MCPInstallEntry {
  command: string;
  args: string[];
  env?: Record<string, string>;
  type?: string;     // 'stdio' (default for OpenCode-style configs)
}

interface AddToolResult {
  added: boolean;
  alreadyPresent: boolean;
}
```

### `removeToolFromConfig(client: MCPClientConfig, toolSlug: string): RemoveToolResult`

Removes a tool entry from the client's config. Returns whether the tool was removed or not found.

```typescript
interface RemoveToolResult {
  removed: boolean;
  wasPresent: boolean;
}
```

### `listInstalledTools(client: MCPClientConfig): InstalledTool[]`

Lists all tools currently configured in the client's `mcpServers`.

```typescript
interface InstalledTool {
  slug: string;
  entry: Record<string, unknown>;  // The full entry object
}
```

## License

MIT
