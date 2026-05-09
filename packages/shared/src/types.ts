export type TransportType = 'stdio' | 'sse' | 'http' | 'streamable-http';

export interface FrameworkCompat {
  openai: 'native' | 'adapter' | 'unknown' | 'none';
  anthropic: 'native' | 'adapter' | 'unknown' | 'none';
  langchain: 'native' | 'adapter' | 'unknown' | 'none';
  cursor: 'native' | 'adapter' | 'unknown' | 'none';
}

export interface MCPInstallConfig {
  type: 'npx' | 'uvx' | 'node' | 'python' | 'docker';
  command: string;
  args: string[];
  env?: Record<string, string>;
}

export interface MCPTool {
  id: string;
  slug: string;
  name: string;
  description: string;
  shortDescription: string;
  githubUrl: string;
  npmPackage: string | null;
  pyPackage: string | null;
  homeUrl: string | null;
  author: string;
  stars: number;
  license: string | null;
  createdAt: string;
  lastUpdated: string;
  transports: TransportType[];
  categories: string[];
  compatibility: FrameworkCompat;
  securityScore: number | null;
  installCommand: string;
  installConfig?: MCPInstallConfig;
}

export interface ScanResult {
  score: number;
  severity: 'critical' | 'high' | 'medium' | 'low' | 'info';
  issues: ScanIssue[];
  summary: string;
}

export interface ScanIssue {
  id: string;
  category: 'prompt-injection' | 'data-exfiltration' | 'tool-poisoning' | 'supply-chain' | 'misconfiguration';
  severity: 'critical' | 'high' | 'medium' | 'low' | 'info';
  title: string;
  description: string;
  recommendation: string;
  pattern: string;
}

export interface SearchResult {
  tools: MCPTool[];
  total: number;
  query: string;
  took: number;
}

export interface RegistryConfig {
  registryUrl: string;
  cacheDir: string;
}

export type ClientType = 'claude-desktop' | 'cursor' | 'windsurf' | 'opencode';

export interface InstallTarget {
  client: ClientType;
  configPath: string;
  detected: boolean;
}
