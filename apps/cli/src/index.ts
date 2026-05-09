#!/usr/bin/env node
import { Command } from 'commander';
import { installCommand } from './commands/install.js';
import { uninstallCommand } from './commands/uninstall.js';
import { listCommand } from './commands/list.js';
import { searchCommand } from './commands/search.js';
import { scanCommand } from './commands/scan.js';
import { infoCommand } from './commands/info.js';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

interface PackageJson {
  version: string;
}

const pkg = JSON.parse(
  readFileSync(resolve(__dirname, '../package.json'), 'utf-8')
) as PackageJson;

const program = new Command();

program
  .name('mcpub')
  .description('MCPHub — The npm for AI Tools')
  .version(pkg.version);

program
  .command('search')
  .description('Search the MCP tool registry')
  .argument('[query]', 'Search query')
  .option('-l, --limit <number>', 'Maximum results', '10')
  .option('-c, --category <category>', 'Filter by category')
  .option('--json', 'Output as JSON')
  .action(searchCommand);

program
  .command('install')
  .description('Install an MCP tool to your configured MCP clients')
  .argument('<name>', 'Tool name or slug to install')
  .option('-y, --yes', 'Skip confirmation prompts')
  .option('--no-scan', 'Skip security scan before install')
  .action(installCommand);

program
  .command('uninstall')
  .description('Remove an MCP tool from all configured clients')
  .argument('<name>', 'Tool name or slug to uninstall')
  .option('-y, --yes', 'Skip confirmation prompts')
  .action(uninstallCommand);

program
  .command('list')
  .description('List all installed MCP tools across configured clients')
  .action(listCommand);

program
  .command('info')
  .description('Show detailed info about an MCP tool')
  .argument('<name>', 'Tool name or slug')
  .option('--json', 'Output as JSON')
  .action(infoCommand);

program
  .command('scan')
  .description('Security scan an MCP tool or server configuration')
  .argument('[target]', 'Tool slug, file path, or MCP server URL')
  .option('-o, --output <format>', 'Output format: text, json, sarif', 'text')
  .option('--fail-on <severity>', 'Exit non-zero if issues at this severity', 'high')
  .action(scanCommand);

program.parse(process.argv);
