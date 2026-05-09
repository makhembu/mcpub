const REGISTRY_URL = process.env.REGISTRY_URL || 'https://mcpub-registry.shelflix.workers.dev';
const isDryRun = process.argv.includes('--dry-run');

async function main() {
  console.error(`Populating embeddings at ${REGISTRY_URL}...${isDryRun ? ' (DRY RUN)' : ''}\n`);

  if (isDryRun) {
    const slugsRes = await fetch(`${REGISTRY_URL}/api/slugs`);
    const slugs: string[] = await slugsRes.json();
    console.log(JSON.stringify({ toolCount: slugs.length, status: 'dry-run' }));
    return;
  }

  const res = await fetch(`${REGISTRY_URL}/api/embed`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': 'dev-seed-key',
    },
  });

  if (!res.ok) {
    const text = await res.text();
    console.error(`Failed: ${res.status} ${text}`);
    process.exit(1);
  }

  const data = await res.json();
  console.log(JSON.stringify(data));
}

main().catch(err => { console.error(err); process.exit(1); });
