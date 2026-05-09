const REGISTRY_URL = process.env.REGISTRY_URL || 'https://mcpub-registry.shelflix.workers.dev';
const DELAY_MS = parseInt(process.env.SCAN_DELAY || '100', 10);
const CONCURRENCY = parseInt(process.env.SCAN_CONCURRENCY || '5', 10);
const args = process.argv.slice(2);
const LIMIT_INDEX = args.indexOf('--limit');
const LIMIT = LIMIT_INDEX >= 0 ? parseInt(args[LIMIT_INDEX + 1], 10) : Infinity;
const isDryRun = args.includes('--dry-run');

interface ScanStats {
  total: number;
  passed: number;
  warned: number;
  failed: number;
  errors: number;
  scores: number[];
}

async function fetchSlugs(): Promise<string[]> {
  const res = await fetch(`${REGISTRY_URL}/api/slugs`);
  if (!res.ok) throw new Error(`GET /api/slugs returned ${res.status}`);
  return res.json() as Promise<string[]>;
}

async function scanTool(slug: string): Promise<{ score: number; severity: string } | null> {
  try {
    const res = await fetch(`${REGISTRY_URL}/api/scan?slug=${encodeURIComponent(slug)}`);
    if (!res.ok) {
      console.error(`  ${slug}: HTTP ${res.status}`);
      return null;
    }
    const data = await res.json() as { score: number; severity: string };
    return data;
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error(`  ${slug}: ${msg}`);
    return null;
  }
}

async function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function main() {
  console.error(`Registry URL: ${REGISTRY_URL}`);
  console.error(`Delay: ${DELAY_MS}ms, Concurrency: ${CONCURRENCY}${isDryRun ? ' (DRY RUN)' : ''}\n`);

  const allSlugs = await fetchSlugs();
  const slugsToScan = allSlugs.slice(0, LIMIT);
  const stats: ScanStats = { total: 0, passed: 0, warned: 0, failed: 0, errors: 0, scores: [] };

  console.error(`Found ${allSlugs.length} tools, scanning ${slugsToScan.length}...\n`);

  if (isDryRun) {
    console.log(JSON.stringify({ slugs: slugsToScan, total: slugsToScan.length, status: 'dry-run' }));
    return;
  }

  for (let i = 0; i < slugsToScan.length; i += CONCURRENCY) {
    const batch = slugsToScan.slice(i, i + CONCURRENCY);
    const results = await Promise.all(batch.map(slug => scanTool(slug)));

    for (let j = 0; j < batch.length; j++) {
      const slug = batch[j];
      const result = results[j];
      stats.total++;

      if (result === null) {
        stats.errors++;
        console.error(`  [${stats.total}/${slugsToScan.length}] ${slug}: ERROR`);
      } else {
        stats.scores.push(result.score);
        if (result.severity === 'low' || result.severity === 'info') {
          stats.passed++;
        } else if (result.severity === 'medium') {
          stats.warned++;
        } else {
          stats.failed++;
        }

        const icon = result.severity === 'low' || result.severity === 'info' ? '✅'
          : result.severity === 'medium' ? '⚠️'
          : result.severity === 'high' ? '🔶' : '🔴';
        console.error(`  [${stats.total}/${slugsToScan.length}] ${slug}: ${result.score}/100 (${result.severity}) ${icon}`);
      }
    }

    if (i + CONCURRENCY < slugsToScan.length) {
      await delay(DELAY_MS);
    }
  }

  const avgScore = stats.scores.length > 0
    ? (stats.scores.reduce((a, b) => a + b, 0) / stats.scores.length).toFixed(1)
    : 'N/A';

  console.log(JSON.stringify({
    total: stats.total,
    passed: stats.passed,
    warned: stats.warned,
    failed: stats.failed,
    errors: stats.errors,
    avgScore,
    minScore: stats.scores.length > 0 ? Math.min(...stats.scores) : null,
    maxScore: stats.scores.length > 0 ? Math.max(...stats.scores) : null,
    status: 'ok',
  }));
}

main().catch(err => { console.error(err); process.exit(1); });
