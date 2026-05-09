export { type MCPTool, type MCPInstallConfig, type TransportType, type FrameworkCompat, type ScanResult, type ScanIssue, type SearchResult, type RegistryConfig, type ClientType } from './types.js';
export { detectMCPClients, readClientConfig, writeClientConfig, addToolToConfig, removeToolFromConfig, listInstalledTools } from './mcp-clients.js';
export type { MCPClientConfig, MCPInstallEntry } from './mcp-clients.js';
