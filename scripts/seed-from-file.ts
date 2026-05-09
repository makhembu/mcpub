import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));

const REGISTRY_URL = process.env.REGISTRY_URL || 'http://localhost:8787';

async function main() {
  const jsonPath = resolve(__dirname, '../apps/registry-api/src/generated-seed.json');
  const tools = JSON.parse(readFileSync(jsonPath, 'utf-8'));

  console.error(`Loading ${tools.length} tools from generated seed...`);
  console.error(`Registry URL: ${REGISTRY_URL}`);

  // Send in batches to avoid large request bodies
  const batchSize = 200;
  let total = 0;

  for (let i = 0; i < tools.length; i += batchSize) {
    const batch = tools.slice(i, i + batchSize);
    const url = `${REGISTRY_URL}/api/seed`;

    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': 'dev-seed-key',
      },
      body: JSON.stringify({ tools: batch, force: i === 0 }),
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

  console.log(JSON.stringify({ total, status: 'ok' }));
}

main().catch(err => { console.error(err); process.exit(1); });
