export type TransportType = 'stdio' | 'sse' | 'http' | 'streamable-http';

export interface FrameworkCompat {
  openai: 'native' | 'adapter' | 'unknown' | 'none';
  anthropic: 'native' | 'adapter' | 'unknown' | 'none';
  langchain: 'native' | 'adapter' | 'unknown' | 'none';
  cursor: 'native' | 'adapter' | 'unknown' | 'none';
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
