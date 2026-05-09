import ora from 'ora';
import chalk from 'chalk';
import type { MCPTool } from '@mcpub/shared';
import { getRegistryUrl } from '../lib/registry.js';
import { scanTool } from '../lib/scan.js';

interface InstallOptions {
  yes?: boolean;
  scan?: boolean;
}

export async function installCommand(name: string, options: InstallOptions) {
  const registryUrl = await getRegistryUrl();
  const spinner = ora(`Looking up ${chalk.cyan(name)}...`).start();

  try {
    const res = await fetch(`${registryUrl}/api/tools/${encodeURIComponent(name)}`);
    if (!res.ok) {
      spinner.fail(`Tool "${name}" not found in registry`);
      console.log(`\nSearch the registry:  ${chalk.cyan(`npx mcpub search ${name}`)}`);
      process.exit(1);
    }

    const tool = await res.json() as MCPTool;
    spinner.succeed(`Found ${chalk.bold(tool.name)}`);

    console.log('');
    console.log(`  ${chalk.bold(tool.name)} — ${tool.shortDescription}`);
    console.log(`  ${chalk.dim('Author:')} ${tool.author}  ${chalk.dim('Stars:')} ⭐ ${tool.stars.toLocaleString()}`);
    console.log(`  ${chalk.dim('Transports:')} ${tool.transports.join(', ')}`);
    console.log('');

    if (options.scan !== false) {
      const scanSpinner = ora('Running security scan...').start();
      const scanResult = await scanTool(tool.slug);
      if (scanResult.score >= 70) {
        scanSpinner.succeed(`Security score: ${chalk.green(`${scanResult.score}/100`)}`);
      } else if (scanResult.score >= 40) {
        scanSpinner.warn(`Security score: ${chalk.yellow(`${scanResult.score}/100`)}`);
      } else {
        scanSpinner.fail(`Security score: ${chalk.red(`${scanResult.score}/100`)}`);
        console.log(chalk.red(`\n⚠️  ${scanResult.issues.length} issues found:`));
        for (const issue of scanResult.issues.slice(0, 3)) {
          console.log(`  • ${chalk.yellow(issue.title)}`);
        }
        process.exit(1);
      }
    }

    const installCmd = tool.installCommand || `npx ${tool.npmPackage || tool.slug}`;
    console.log(`\n  ${chalk.bold('Install command:')}`);
    console.log(`  ${chalk.cyan('$ ' + installCmd)}`);

    if (tool.npmPackage) {
      console.log(`\n  ${chalk.dim('Or add to your MCP config:')}`);
      console.log(`  ${chalk.dim('# Claude Desktop, Cursor, etc.')}`);
      console.log(`  "mcpServers": { "${tool.slug}": { "command": "npx", "args": ["-y", "${tool.npmPackage}"] } }`);
    }

    console.log('');
    console.log(`  ${chalk.dim(`Full details: ${chalk.underline(`${registryUrl}/tool/${tool.slug}`)}`)}`);
  } catch (err) {
    spinner.fail(`Failed to look up tool: ${err instanceof Error ? err.message : 'Unknown error'}`);
    process.exit(1);
  }
}
