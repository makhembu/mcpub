import chalk from 'chalk';
import { confirm, select, isCancel } from '@clack/prompts';
import type { MCPClientConfig } from '@mcpub/config';
import { detectMCPClients, removeToolFromConfig, listInstalledTools } from '@mcpub/config';

interface UninstallOptions {
  yes?: boolean;
}

export async function uninstallCommand(name: string, options: UninstallOptions) {
  const clients = detectMCPClients();
  const detected = clients.filter(c => c.detected);

  if (detected.length === 0) {
    console.log(chalk.yellow('No MCP clients detected on this machine.'));
    return;
  }

  const withTool: MCPClientConfig[] = [];
  for (const client of detected) {
    const tools = listInstalledTools(client);
    if (tools.some(t => t.slug === name)) {
      withTool.push(client);
    }
  }

  if (withTool.length === 0) {
    console.log(chalk.yellow(`"${name}" is not installed in any detected MCP client.`));
    return;
  }

  let targets: MCPClientConfig[];

  if (options.yes) {
    targets = withTool;
  } else if (withTool.length === 1) {
    const proceed = await confirm({
      message: `Remove "${name}" from ${chalk.bold(withTool[0].name)}?`,
      initialValue: true,
    });
    if (isCancel(proceed) || !proceed) {
      console.log(chalk.dim('Uninstall cancelled.'));
      process.exit(0);
    }
    targets = withTool;
  } else {
    console.log(chalk.bold(`"${name}" is installed in multiple clients:`));
    withTool.forEach((c, i) => {
      console.log(`  [${i + 1}] ${chalk.bold(c.name)} (${chalk.dim(c.configPath)})`);
    });
    console.log(`  [a] All of the above`);

    const answer = await select({
      message: `Remove "${name}" from which client?`,
      options: [
        ...withTool.map((c, i) => ({ value: String(i + 1), label: c.name })),
        { value: 'a', label: 'All of the above' },
      ],
    });

    if (isCancel(answer)) {
      console.log(chalk.dim('Uninstall cancelled.'));
      process.exit(0);
    }

    if (answer === 'a') {
      targets = withTool;
    } else {
      const idx = parseInt(answer as string, 10) - 1;
      targets = [withTool[idx]];
    }
  }

  for (const client of targets) {
    const result = removeToolFromConfig(client, name);
    if (result.removed) {
      console.log(`  ${chalk.green('✔')} Removed ${chalk.bold(name)} from ${chalk.bold(client.name)}`);
    } else {
      console.log(`  ${chalk.dim(`→ ${chalk.bold(client.name)}: not found, skipping`)}`);
    }
  }

  console.log('');
  console.log(chalk.green('Done.'));
}
