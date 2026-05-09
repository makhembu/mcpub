import type { ScanResult } from '@mcpub/shared';
import { Scanner } from '@mcpub/security';
import { getRegistryUrl } from './registry.js';

/**
 * Scan a tool via the registry API.
 * Falls back to local scanning if the registry is unreachable.
 */
export async function scanTool(slug: string): Promise<ScanResult> {
  const registryUrl = await getRegistryUrl();

  try {
    const res = await fetch(`${registryUrl}/api/scan/${encodeURIComponent(slug)}`);
    if (res.ok) {
      return await res.json() as ScanResult;
    }
  } catch {
    // Registry unreachable, fall back to local scanner
  }

  return localScan(slug);
}

function localScan(slug: string): ScanResult {
  const scanner = new Scanner();
  return scanner.scan(slug);
}
