import type { ScanSeverity, ScanCategory } from './types.js';

export interface DetectionPattern {
  id: string;
  name: string;
  pattern: RegExp;
  severity: ScanSeverity;
  category: ScanCategory;
  description: string;
  recommendation: string;
}

const PATTERNS_LIST: DetectionPattern[] = [
  // Prompt Injection
  {
    id: 'PI-001', name: 'Instruction Override',
    pattern: /ignore\s+(all\s+)?previous\s+instructions/i,
    severity: 'critical', category: 'prompt-injection',
    description: 'Attempts to override or ignore prior agent instructions.',
    recommendation: 'Remove instruction override directives. Use positive framing instead.'
  },
  {
    id: 'PI-002', name: 'Disregard Directive',
    pattern: /disregard\s+(all\s+)?previous/i,
    severity: 'critical', category: 'prompt-injection',
    description: 'Tells the agent to disregard its previous context.',
    recommendation: 'Do not include disregard directives. Agents should follow their system prompt.'
  },
  {
    id: 'PI-003', name: 'Role Manipulation',
    pattern: /you\s+are\s+(not\s+)?(required|obligated|bound)\s+to/i,
    severity: 'high', category: 'prompt-injection',
    description: 'Attempt to manipulate the agent into claiming it is not bound by rules.',
    recommendation: 'Remove role manipulation language. Let the agent maintain its role.'
  },
  {
    id: 'PI-004', name: 'System Prompt Reference',
    pattern: /system\s+(prompt|instruction|message)(\s+|:)/i,
    severity: 'high', category: 'prompt-injection',
    description: 'References or attempts to reveal system prompt.',
    recommendation: 'Tools should not reference or request system prompts.'
  },
  {
    id: 'PI-005', name: 'Memory Manipulation',
    pattern: /forget\s+(above|all|everything|previous)/i,
    severity: 'high', category: 'prompt-injection',
    description: 'Attempts to wipe agent memory or context.',
    recommendation: 'Remove memory manipulation directives.'
  },
  {
    id: 'PI-006', name: 'Explicit Override',
    pattern: /you\s+(must|should|will)\s+(now\s+)?(ignore|forget|disregard)/i,
    severity: 'critical', category: 'prompt-injection',
    description: 'Direct instruction overriding the agent\'s core directives.',
    recommendation: 'Remove explicit override commands immediately.'
  },

  // Data Exfiltration
  {
    id: 'DE-001', name: 'Prompt Extraction',
    pattern: /reveal\s+(your|the)\s+(system|prompt|instructions)/i,
    severity: 'critical', category: 'data-exfiltration',
    description: 'Attempts to extract the agent\'s system prompt.',
    recommendation: 'Block system prompt extraction requests.'
  },
  {
    id: 'DE-002', name: 'Credential Harvesting',
    pattern: /(api[_-]?key|secret|token|password|credential)\s*[:=]\s*["'][^"']+["']/i,
    severity: 'critical', category: 'data-exfiltration',
    description: 'Hardcoded credentials or API tokens in tool configuration.',
    recommendation: 'Replace hardcoded credentials with environment variables.'
  },
  {
    id: 'DE-003', name: 'External Data Send',
    pattern: /(exfiltrate|exfil|send\s+(to|via)|post\s+to|upload\s+to)\s+(https?:\/\/[^\s]+)/i,
    severity: 'critical', category: 'data-exfiltration',
    description: 'Tool may send data to external servers.',
    recommendation: 'Audit external data transmission. Ensure user consent.'
  },

  // Tool Poisoning
  {
    id: 'TP-001', name: 'Unsafe Command Execution',
    pattern: /execute\s+(shell|command|bash|terminal)/i,
    severity: 'high', category: 'tool-poisoning',
    description: 'Tool description permits arbitrary shell execution.',
    recommendation: 'Restrict shell command execution with allowlisted commands.'
  },
  {
    id: 'TP-002', name: 'Dynamic Code Execution',
    pattern: /(eval|exec)\s*\(/i,
    severity: 'high', category: 'tool-poisoning',
    description: 'Dynamic code execution detected.',
    recommendation: 'Avoid eval/exec. Use safer alternatives like Function constructor or pre-compiled code.'
  },
  {
    id: 'TP-003', name: 'Piped Remote Execution',
    pattern: /(curl|wget|fetch)\s+.*\|\s*(bash|sh|zsh)/i,
    severity: 'critical', category: 'tool-poisoning',
    description: 'Piping network downloads to shell executors.',
    recommendation: 'Do not pipe remote content directly to shell interpreters.'
  },

  // Supply Chain
  {
    id: 'SC-001', name: 'Remote Code Fetch',
    pattern: /(https?:\/\/[^\s]*)\s*[-–—]\s*(download|install|run|execute)/i,
    severity: 'high', category: 'supply-chain',
    description: 'Tool downloads and executes code without verification.',
    recommendation: 'Add integrity checks (checksums, signatures) for downloaded code.'
  },
  {
    id: 'SC-002', name: 'Suspicious Package Reference',
    pattern: /(npm\s+install|pip\s+install|go\s+get)\s+(--unsafe-perm|--ignore-scripts)/i,
    severity: 'medium', category: 'supply-chain',
    description: 'Package install with disabled security checks.',
    recommendation: 'Do not disable security checks during package installation.'
  },

  // Misconfiguration
  {
    id: 'MC-001', name: 'Broad Filesystem Access',
    pattern: /filesystem|read\s+(all|any)\s+file|write\s+(to\s+)?any/i,
    severity: 'medium', category: 'misconfiguration',
    description: 'Tool may have overly broad filesystem access.',
    recommendation: 'Restrict filesystem access to specific directories.'
  },
  {
    id: 'MC-002', name: 'Network Access Without Restriction',
    pattern: /(allow|permit)\s+(all|any)\s+network/i,
    severity: 'medium', category: 'misconfiguration',
    description: 'Tool permits unrestricted network access.',
    recommendation: 'Restrict outbound network access to specific endpoints.'
  },
];

export function getPatterns(): DetectionPattern[] {
  return PATTERNS_LIST;
}

export function getPatternsByCategory(category: ScanCategory): DetectionPattern[] {
  return PATTERNS_LIST.filter(p => p.category === category);
}

export function getPatternsBySeverity(severity: ScanSeverity): DetectionPattern[] {
  return PATTERNS_LIST.filter(p => p.severity === severity);
}
