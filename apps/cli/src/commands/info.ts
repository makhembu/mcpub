import chalk from 'chalk';
import type { MCPTool } from '@mcpub/shared';
import { getRegistryUrl } from '../lib/registry.js';

interface InfoOptions {
  json?: boolean;
}

export async function infoCommand(name: string, options: InfoOptions) {
  const registryUrl = await getRegistryUrl();

  try {
    const res = await fetch(`${registryUrl}/api/tools/${encodeURIComponent(name)}`);
    if (!res.ok) {
      console.error(chalk.red(`Tool "${name}" not found`));
      process.exit(1);
    }

    const tool = await res.json() as MCPTool;

    if (options.json) {
      console.log(JSON.stringify(tool, null, 2));
      return;
    }

    console.log('');
    console.log(`  ${chalk.bold(tool.name)}`);
    console.log(`  ${chalk.dim(tool.shortDescription)}`);
    console.log('');
    console.log(`  ${chalk.bold('Author:')}        ${tool.author}`);
    console.log(`  ${chalk.bold('Stars:')}         ⭐ ${tool.stars.toLocaleString()}`);
    console.log(`  ${chalk.bold('License:')}       ${tool.license || 'Unknown'}`);
    console.log(`  ${chalk.bold('Transports:')}    ${tool.transports.join(', ')}`);
    console.log(`  ${chalk.bold('Categories:')}    ${tool.categories.join(', ') || 'Uncategorized'}`);
    console.log(`  ${chalk.bold('Security:')}      ${tool.securityScore !== null ? `${tool.securityScore}/100` : 'Not scanned'}`);
    console.log('');

    console.log(`  ${chalk.bold('Compatibility:')}`);
    console.log(`    OpenAI SDK:    ${compatBadge(tool.compatibility.openai)}`);
    console.log(`    Anthropic:     ${compatBadge(tool.compatibility.anthropic)}`);
    console.log(`    LangChain:     ${compatBadge(tool.compatibility.langchain)}`);
    console.log(`    Cursor:        ${compatBadge(tool.compatibility.cursor)}`);
    console.log('');

    if (tool.installCommand) {
      console.log(`  ${chalk.bold('Install:')}       ${chalk.cyan(tool.installCommand)}`);
    }
    console.log(`  ${chalk.bold('Repository:')}    ${chalk.underline(tool.githubUrl)}`);
    if (tool.homeUrl) console.log(`  ${chalk.bold('Website:')}      ${chalk.underline(tool.homeUrl)}`);
    console.log('');
  } catch (err) {
    console.error(chalk.red(`Failed: ${err instanceof Error ? err.message : 'Unknown error'}`));
    process.exit(1);
  }
}

function compatBadge(level: string): string {
  switch (level) {
    case 'native': return chalk.green('✅ Native');
    case 'adapter': return chalk.yellow('⚠️  Adapter');
    case 'unknown': return chalk.dim('❓ Unknown');
    case 'none': return chalk.red('❌ None');
    default: return chalk.dim('—');
  }
}
