export interface MCPInstallEntry {
  command: string;
  args: string[];
  env?: Record<string, string>;
  type?: string;
  url?: string;
}

export type ConfigFormat = 'standard' | 'opencode';

export interface MCPClientConfig {
  name: string;
  configPath: string;
  configKey: string;
  format: ConfigFormat;
  detected: boolean;
}

export interface AddToolResult {
  added: boolean;
  alreadyPresent: boolean;
}

export interface RemoveToolResult {
  removed: boolean;
  wasPresent: boolean;
}

export interface InstalledTool {
  slug: string;
  entry: Record<string, unknown>;
}
