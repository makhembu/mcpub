import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));

const REGISTRY_URL = process.env.REGISTRY_URL || 'http://localhost:8787';
const isDelta = process.argv.includes('--delta');
const isDryRun = process.argv.includes('--dry-run');

async function fetchExistingSlugs(): Promise<Set<string>> {
  try {
    const res = await fetch(`${REGISTRY_URL}/api/slugs`);
    if (!res.ok) throw new Error(`GET /api/slugs returned ${res.status}`);
    const data = await res.json() as string[];
    return new Set(data);
  } catch (err) {
    console.error(`Failed to fetch existing slugs: ${err instanceof Error ? err.message : 'Unknown error'}`);
    return new Set();
  }
}

async function main() {
  const jsonPath = resolve(__dirname, '../apps/registry-api/src/generated-seed.json');
  const tools = JSON.parse(readFileSync(jsonPath, 'utf-8'));

  let toolsToSeed = tools;

  if (isDelta) {
    const existing = await fetchExistingSlugs();
    toolsToSeed = tools.filter((t: any) => !existing.has(t.slug));
    if (isDryRun) {
      console.log(JSON.stringify({ delta: toolsToSeed.length, existing: existing.size, status: 'dry-run' }));
      return;
    }
  }

  console.error(`Loading ${toolsToSeed.length} tools from generated seed...`);
  if (isDelta) console.error(`(${tools.length - toolsToSeed.length} already present, skipping)`);
  console.error(`Registry URL: ${REGISTRY_URL}`);

  // Send in batches to avoid large request bodies
  const batchSize = 200;
  let total = 0;

  for (let i = 0; i < toolsToSeed.length; i += batchSize) {
    const batch = toolsToSeed.slice(i, i + batchSize);
    const url = `${REGISTRY_URL}/api/seed`;

    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': 'dev-seed-key',
      },
      body: JSON.stringify({ tools: batch, force: false }),
    });

    if (!res.ok) {
      const text = await res.text();
      console.error(`  Batch ${i / batchSize + 1} failed: ${res.status} ${text}`);
      process.exit(1);
    }

    const data = await res.json();
    total += data.count || 0;
    console.error(`  Batch ${i / batchSize + 1}: inserted ${data.count} tools`);
  }

  console.log(JSON.stringify({ total, status: 'ok', delta: isDelta }));
}

main().catch(err => { console.error(err); process.exit(1); });
