import chalk from 'chalk';
import Table from 'cli-table3';
import type { SearchResult } from '@mcpub/shared';
import { getRegistryUrl } from '../lib/registry.js';

interface SearchOptions {
  limit?: string;
  category?: string;
  json?: boolean;
}

export async function searchCommand(query: string | undefined, options: SearchOptions) {
  const registryUrl = await getRegistryUrl();
  const limit = parseInt(options.limit || '10', 10);
  const params = new URLSearchParams();
  if (query) params.set('q', query);
  if (limit) params.set('limit', String(limit));
  if (options.category) params.set('category', options.category);

  const url = `${registryUrl}/api/search?${params}`;

  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Registry returned ${res.status}`);
    const result = await res.json() as SearchResult;

    if (options.json) {
      console.log(JSON.stringify(result, null, 2));
      return;
    }

    if (result.tools.length === 0) {
      console.log(chalk.yellow(`No results found for "${query || ''}"`));
      return;
    }

    console.log(chalk.dim(`\n  Found ${result.total} tools in ${result.took}ms\n`));

    const table = new Table({
      head: [chalk.bold('Name'), chalk.bold('Description'), chalk.bold('Stars'), chalk.bold('Transport')],
      colWidths: [24, 50, 10, 16],
      style: { compact: true }
    });

    for (const tool of result.tools) {
      table.push([
        chalk.cyan(tool.slug),
        tool.shortDescription.slice(0, 47) + '…',
        tool.stars > 0 ? String(tool.stars) : '-',
        tool.transports.join(', ')
      ]);
    }

    console.log(table.toString());
    console.log(chalk.dim(`\n  Install: npx mcpub install <name>`));
  } catch (err) {
    console.error(chalk.red(`Search failed: ${err instanceof Error ? err.message : 'Unknown error'}`));
    process.exit(1);
  }
}
