import type { ScanResult, ScanIssue } from '@mcpub/shared';
import { getPatterns } from './patterns.js';
import { Severity } from './types.js';

export class Scanner {
  private patterns = getPatterns();

  scan(content: string): ScanResult {
    const issues: ScanIssue[] = [];
    const matchedIds = new Set<string>();

    for (const pattern of this.patterns) {
      if (matchedIds.has(pattern.id)) continue;

      let match: RegExpExecArray | null;
      const regex = new RegExp(pattern.pattern.source, 'gi');

      while ((match = regex.exec(content)) !== null) {
        if (matchedIds.has(pattern.id)) break;
        matchedIds.add(pattern.id);

        issues.push({
          id: `mcpub-${pattern.id.toLowerCase()}-${issues.length}`,
          category: pattern.category,
          severity: pattern.severity,
          title: pattern.name,
          description: pattern.description,
          recommendation: pattern.recommendation,
          pattern: pattern.pattern.source,
        });
      }
    }

    const score = this.calculateScore(issues);
    const severity = this.calculateSeverity(score);

    const summary = issues.length === 0
      ? '✅ No security issues detected'
      : `⚠️  Found ${issues.length} security issue(s) (${issues.filter(i => i.severity === 'critical' || i.severity === 'high').length} critical/high)`;

    return { score, severity, issues, summary };
  }

  private calculateScore(issues: ScanIssue[]): number {
    const weights: Record<string, number> = {
      critical: 40,
      high: 25,
      medium: 15,
      low: 5,
      info: 0,
    };

    let deduction = 0;
    for (const issue of issues) {
      deduction += weights[issue.severity] || 0;
    }

    return Math.max(0, Math.min(100, 100 - deduction));
  }

  private calculateSeverity(score: number): ScanResult['severity'] {
    if (score < 30) return 'critical';
    if (score < 50) return 'high';
    if (score < 70) return 'medium';
    if (score < 85) return 'low';
    return 'info';
  }
}
