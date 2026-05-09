import chalk from 'chalk';
import { detectMCPClients, listInstalledTools } from '@mcpub/config';

export async function listCommand() {
  const clients = detectMCPClients();
  const detected = clients.filter(c => c.detected);

  if (detected.length === 0) {
    console.log(chalk.yellow('No MCP clients detected on this machine.'));
    return;
  }

  let total = 0;

  for (const client of detected) {
    const tools = listInstalledTools(client);

    if (tools.length === 0) {
      console.log(`  ${chalk.bold(client.name)}: ${chalk.dim('(no MCP tools installed)')}`);
      console.log(`    ${chalk.dim(client.configPath)}`);
      console.log('');
      continue;
    }

    console.log(`  ${chalk.bold(client.name)} (${tools.length} tools)`);
    console.log(`    ${chalk.dim(client.configPath)}`);

    for (const tool of tools) {
      const entry = tool.entry;
      const cmdStr = entry.command ? `${entry.command} ${(entry.args as string[] || []).join(' ')}` : '(unknown)';
      console.log(`    ${chalk.cyan('•')} ${chalk.bold(tool.slug)} — ${chalk.dim(cmdStr)}`);
    }

    total += tools.length;
    console.log('');
  }

  if (total === 0) {
    console.log(chalk.yellow('No MCP tools installed across any client.'));
    console.log(`  Use ${chalk.cyan('npx mcpub install <tool>')} to get started.`);
  } else {
    console.log(chalk.dim(`${total} tool${total !== 1 ? 's' : ''} installed across ${detected.length} client${detected.length !== 1 ? 's' : ''}.`));
  }
}
