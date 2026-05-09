import { readFileSync, writeFileSync } from 'node:fs';

const tools = JSON.parse(readFileSync('apps/registry-api/src/generated-seed.json', 'utf-8'));
const top100 = tools.filter(t => t.stars > 100).sort((a, b) => b.stars - a.stars).slice(0, 100);

let md = '## \u{1F3C6} Top 100 Tools\n\n';
md += 'The registry ships with **1,574 MCP tools** pre-scraped from GitHub and npm. Here are the top 100 by stars:\n\n';
md += '| # | Tool | Description | \u2B50 Stars | Package |\n|---|---|---|---|---|\n';

top100.forEach((t, i) => {
  const pkg = t.npmPackage ? '`' + t.npmPackage + '`' : (t.pyPackage ? '`' + t.pyPackage + '`' : '\u2014');
  let desc = t.shortDescription.replace(/\|/g, '\\|');
  if (desc.length > 100) {
    desc = desc.slice(0, 100).split(' ').slice(0, -1).join(' ') + '...';
  }
  const link = t.githubUrl || '#';
  md += '| ' + (i + 1) + ' | [' + t.name + '](' + link + ') | ' + desc + ' | ' + t.stars + ' | ' + pkg + ' |\n';
});

writeFileSync('scripts/top100-table.md', md);
console.log('Wrote ' + md.length + ' chars to scripts/top100-table.md');
