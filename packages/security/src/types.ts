export type ScanSeverity = 'critical' | 'high' | 'medium' | 'low' | 'info';
export type ScanCategory = 'prompt-injection' | 'data-exfiltration' | 'tool-poisoning' | 'supply-chain' | 'misconfiguration';

export const Severity = {
  CRITICAL: 'critical' as ScanSeverity,
  HIGH: 'high' as ScanSeverity,
  MEDIUM: 'medium' as ScanSeverity,
  LOW: 'low' as ScanSeverity,
  INFO: 'info' as ScanSeverity,
};
