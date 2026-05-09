import { homedir, platform } from 'node:os';
import { join } from 'node:path';
import { existsSync } from 'node:fs';
import type { MCPClientConfig } from './types.js';

function getClaudeDesktopPaths(): string[] {
  const home = homedir();
  switch (platform()) {
    case 'win32': {
      const appData = process.env.APPDATA || join(home, 'AppData', 'Roaming');
      return [join(appData, 'Claude', 'claude_desktop_config.json')];
    }
    case 'darwin':
      return [join(home, 'Library', 'Application Support', 'Claude', 'claude_desktop_config.json')];
    default:
      return [join(home, '.config', 'Claude', 'claude_desktop_config.json')];
  }
}

export function detectMCPClients(): MCPClientConfig[] {
  const home = homedir();

  const configs: { name: string; paths: string[]; configKey: string }[] = [
    {
      name: 'Claude Desktop',
      paths: getClaudeDesktopPaths(),
      configKey: 'mcpServers',
    },
    {
      name: 'Cursor',
      paths: [join(home, '.cursor', 'mcp.json')],
      configKey: 'mcpServers',
    },
    {
      name: 'Windsurf',
      paths: [join(home, '.windsurf', 'mcp.json')],
      configKey: 'mcpServers',
    },
    {
      name: 'Continue',
      paths: [join(home, '.continue', 'config.json')],
      configKey: 'mcpServers',
    },
    {
      name: 'VS Code',
      paths: [join(home, '.vscode', 'mcp.json')],
      configKey: 'mcpServers',
    },
  ];

  return configs.map(({ name, paths, configKey }) => ({
    name,
    configPath: paths[0],
    configKey,
    detected: existsSync(paths[0]),
  }));
}
