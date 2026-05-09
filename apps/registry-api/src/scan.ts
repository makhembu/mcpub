import type { ScanResult } from '@mcpub/shared';

interface Env {
  DB: D1Database;
}

// Prompt injection detection patterns
const INJECTION_PATTERNS: { pattern: RegExp; title: string; severity: ScanResult['issues'][0]['severity']; category: ScanResult['issues'][0]['category']; recommendation: string }[] = [
  { pattern: /ignore\s+(all\s+)?previous\s+instructions/i, title: 'Instruction override attempt', severity: 'critical', category: 'prompt-injection', recommendation: 'Review the tool description for instruction override patterns' },
  { pattern: /disregard\s+(all\s+)?previous/i, title: 'Disregard directive detected', severity: 'critical', category: 'prompt-injection', recommendation: 'Tools should not instruct agents to disregard instructions' },
  { pattern: /you\s+are\s+(not\s+)?(required|obligated|bound)\s+to/i, title: 'Role manipulation detected', severity: 'high', category: 'prompt-injection', recommendation: 'Check for role bypass attempts in tool description' },
  { pattern: /system\s+(prompt|instruction|message)(\s+|:)/i, title: 'System prompt reference', severity: 'high', category: 'prompt-injection', recommendation: 'Tools should not reference system prompts' },
  { pattern: /reveal\s+(your|the)\s+(system|prompt|instructions)/i, title: 'Prompt extraction attempt', severity: 'critical', category: 'data-exfiltration', recommendation: 'This pattern indicates an attempt to extract system prompts' },
  { pattern: /forget\s+(above|all|everything|previous)/i, title: 'Agent memory manipulation', severity: 'high', category: 'prompt-injection', recommendation: 'Tools should not attempt to manipulate agent memory' },
  { pattern: /you\s+(must|should|will)\s+(now\s+)?(ignore|forget|disregard)/i, title: 'Direct instruction override', severity: 'critical', category: 'prompt-injection', recommendation: 'Critical severity — tool attempts to override agent instructions' },
  { pattern: /execute\s+(shell|command|bash|terminal)/i, title: 'Unsafe command execution', severity: 'high', category: 'tool-poisoning', recommendation: 'Verify the tool has proper input sanitization' },
  { pattern: /(eval|exec)\s*\(/i, title: 'Dynamic code execution', severity: 'high', category: 'tool-poisoning', recommendation: 'Dynamic code execution (eval/exec) is a security risk' },
  { pattern: /(curl|wget|fetch)\s+.*\|\s*(bash|sh|zsh)/i, title: 'Piped shell execution', severity: 'critical', category: 'tool-poisoning', recommendation: 'Piping network requests to shell is extremely dangerous' },
  { pattern: /(https?:\/\/[^\s]*)\s*[-–—]\s*(download|install|run|execute)/i, title: 'Remote code fetch pattern', severity: 'high', category: 'supply-chain', recommendation: 'Tool downloads and executes remote code without verification' },
  { pattern: /(api[_-]?key|secret|token|password|credential)\s*[:=]\s*["'][^"']+["']/i, title: 'Hardcoded credentials detected', severity: 'critical', category: 'data-exfiltration', recommendation: 'Hardcoded credentials in tool configuration are a security risk' },
  { pattern: /(exfiltrate|exfil|send\s+(to|via)|post\s+to|upload\s+to)\s+(https?:\/\/[^\s]+)/i, title: 'Data exfiltration pattern', severity: 'critical', category: 'data-exfiltration', recommendation: 'Tool may exfiltrate data to external servers' },
];

export async function handleScan(request: Request, env: Env, ctx: ExecutionContext, params: { slug: string }): Promise<Response> {
  const { slug } = params;

  // Fetch tool to get its description
  const row = await env.DB.prepare('SELECT * FROM tools WHERE slug = ?').bind(slug).first();

  if (!row) {
    return new Response(JSON.stringify({ error: `Tool "${slug}" not found` }), {
      status: 404,
      headers: { 'content-type': 'application/json' }
    });
  }

  const description = (row as any).description || '';
  const name = (row as any).name || '';
  const transports = JSON.parse((row as any).transports || '[]');
  const npmPackage = (row as any).npm_package;

  // Combined text to scan
  const scanTarget = `${name} ${description} ${transports.join(' ')} ${npmPackage || ''}`;

  const issues = [];
  const matchedPatterns = new Set<string>();

  for (const rule of INJECTION_PATTERNS) {
    if (matchedPatterns.has(rule.pattern.source)) continue;
    if (rule.pattern.test(scanTarget)) {
      matchedPatterns.add(rule.pattern.source);
      issues.push({
        id: `scanner-${issues.length}`,
        category: rule.category,
        severity: rule.severity,
        title: rule.title,
        description: `Detected in "${name}" description: ${rule.pattern.source.slice(0, 80)}`,
        recommendation: rule.recommendation,
        pattern: rule.pattern.source,
      });
    }
  }

  // Calculate score
  const severityWeights = { critical: 40, high: 25, medium: 15, low: 5, info: 0 };
  let deduction = 0;
  for (const issue of issues) {
    deduction += severityWeights[issue.severity];
  }

  const score = Math.max(0, Math.min(100, 100 - deduction));

  let severity: ScanResult['severity'] = 'low';
  if (score < 30) severity = 'critical';
  else if (score < 50) severity = 'high';
  else if (score < 70) severity = 'medium';

  const result: ScanResult = {
    score,
    severity,
    issues,
    summary: issues.length === 0
      ? `✅ ${name} passed all security checks`
      : `⚠️  Found ${issues.length} security issue(s) in ${name}`
  };

  // Cache scan result
  await env.DB.prepare(
    'INSERT OR REPLACE INTO scan_results (id, tool_slug, score, severity, issues, summary) VALUES (?, ?, ?, ?, ?, ?)'
  ).bind(`${slug}-${Date.now()}`, slug, score, severity, JSON.stringify(issues), result.summary).run();

  // Update tool security score
  await env.DB.prepare(
    'UPDATE tools SET security_score = ? WHERE slug = ?'
  ).bind(score, slug).run();

  return new Response(JSON.stringify(result), {
    headers: { 'content-type': 'application/json' }
  });
}
