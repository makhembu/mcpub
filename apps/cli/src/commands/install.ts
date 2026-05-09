import ora from 'ora';
import chalk from 'chalk';
import { confirm, select, isCancel } from '@clack/prompts';
import type { MCPTool, MCPClientConfig } from '@mcpub/shared';
import { detectMCPClients, addToolToConfig } from '@mcpub/shared';
import { getRegistryUrl } from '../lib/registry.js';
import { scanTool } from '../lib/scan.js';

interface InstallOptions {
  yes?: boolean;
  scan?: boolean;
}

function reloadHint(clientName: string): string {
  const hints: Record<string, string> = {
    'Claude Desktop': 'Restart Claude Desktop to apply',
    'Cursor': 'Restart Cursor or reload window (Cmd/Ctrl+Shift+P → Developer: Reload Window)',
    'Windsurf': 'Restart Windsurf to apply',
    'Continue': 'Restart Continue to apply',
    'VS Code': 'Reload VS Code window (Cmd/Ctrl+Shift+P → Developer: Reload Window)',
  };
  return hints[clientName] || `Restart ${clientName} to apply`;
}

export async function installCommand(name: string, options: InstallOptions) {
  const registryUrl = await getRegistryUrl();
  const spinner = ora(`Looking up ${chalk.cyan(name)}...`).start();

  let tool: MCPTool;
  try {
    const res = await fetch(`${registryUrl}/api/tools/${encodeURIComponent(name)}`);
    if (!res.ok) {
      spinner.fail(`Tool "${name}" not found in registry`);
      console.log(`\nSearch the registry:  ${chalk.cyan(`npx mcpub search ${name}`)}`);
      process.exit(1);
    }
    tool = await res.json() as MCPTool;
    spinner.succeed(`Found ${chalk.bold(tool.name)}`);
  } catch (err) {
    spinner.fail(`Failed to look up tool: ${err instanceof Error ? err.message : 'Unknown error'}`);
    process.exit(1);
  }

  console.log('');
  console.log(`  ${chalk.bold(tool.name)} — ${tool.shortDescription}`);
  console.log(`  ${chalk.dim('Author:')} ${tool.author}  ${chalk.dim('Stars:')} ⭐ ${tool.stars.toLocaleString()}`);
  if (tool.installConfig) {
    console.log(`  ${chalk.dim('Install:')} ${tool.installConfig.command} ${tool.installConfig.args.join(' ')}`);
  }
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

  if (!tool.installConfig) {
    const installCmd = tool.installCommand || `npx ${tool.npmPackage || tool.slug}`;
    console.log(`\n  ${chalk.bold('Install command:')}`);
    console.log(`  ${chalk.cyan('$ ' + installCmd)}`);
    console.log('');
    console.log(`  ${chalk.dim(`Full details: ${chalk.underline(`${registryUrl}/tool/${tool.slug}`)}`)}`);
    return;
  }

  const installEntry = {
    command: tool.installConfig.command,
    args: tool.installConfig.args,
    ...(tool.installConfig.env ? { env: tool.installConfig.env } : {}),
  };

  const clients = detectMCPClients();
  const detected = clients.filter(c => c.detected);

  if (detected.length === 0) {
    console.log(chalk.yellow('⚠ No MCP clients detected on this machine.'));
    console.log(`Supported clients: ${clients.map(c => c.name).join(', ')}`);
    console.log('');
    console.log(`Manual install command:`);
    console.log(`  ${chalk.cyan(`$ ${tool.installConfig.command} ${tool.installConfig.args.join(' ')}`)}`);
    return;
  }

  let selectedClients: MCPClientConfig[];

  if (options.yes || detected.length === 1) {
    selectedClients = detected;
  } else {
    console.log(chalk.bold('Found MCP clients:'));
    detected.forEach((c, i) => {
      const marker = c.detected ? chalk.green('●') : chalk.dim('○');
      console.log(`  [${i + 1}] ${marker} ${chalk.bold(c.name)} (${chalk.dim(c.configPath)})`);
    });
    console.log(`  [a] All of the above`);
    console.log('');

    const answer = await select({
      message: `Install ${chalk.cyan(tool.name)} to which client?`,
      options: [
        ...detected.map((c, i) => ({ value: String(i + 1), label: c.name })),
        { value: 'a', label: 'All of the above' },
      ],
    });

    if (isCancel(answer)) {
      console.log(chalk.dim('Install cancelled.'));
      process.exit(0);
    }

    if (answer === 'a') {
      selectedClients = detected;
    } else {
      const idx = parseInt(answer as string, 10) - 1;
      selectedClients = [detected[idx]];
    }
  }

  for (const client of selectedClients) {
    const result = addToolToConfig(client, tool.slug, installEntry);

    if (result.alreadyPresent) {
      if (options.yes) {
        addToolToConfig(client, tool.slug, installEntry);
      } else {
        const overwrite = await confirm({
          message: `${chalk.bold(client.name)} already has "${tool.slug}" installed. Overwrite?`,
          initialValue: false,
        });
        if (isCancel(overwrite) || !overwrite) {
          console.log(`  ${chalk.dim(`→ ${chalk.bold(client.name)}: skipped`)}`);
          continue;
        }
        addToolToConfig(client, tool.slug, installEntry);
      }
    }

    console.log(`  ${chalk.green('✔')} Added ${chalk.bold(tool.slug)} to ${chalk.bold(client.name)}`);
    console.log(`     Config: ${chalk.dim(client.configPath)}`);
    console.log('');
    console.log(`  ↻ ${reloadHint(client.name)}`);
  }

  if (tool.installConfig?.env && Object.keys(tool.installConfig.env).length > 0) {
    console.log('');
    console.log(chalk.yellow('⚠ This tool may require environment variables:'));
    for (const [key, desc] of Object.entries(tool.installConfig.env)) {
      console.log(`   ${chalk.bold(key)} — ${desc}`);
    }
  }

  console.log('');
  console.log(chalk.green('Done.'));
}
