import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const GITHUB_TOKEN = process.env.GITHUB_TOKEN || '';

interface Submission {
  slug: string;
  name: string;
  githubUrl: string;
  npmPackage?: string;
  pyPackage?: string;
  description: string;
  categories: string[];
}

const VALID_CATEGORIES = new Set([
  'ai', 'developer-tools', 'database', 'browser-automation', 'communication',
  'cloud', 'infrastructure', 'monitoring', 'security', 'utilities', 'productivity',
  'search', 'web', 'storage', 'framework', 'testing', 'documentation', 'devops',
  'backend', 'finance', 'design', 'social-media', 'learning',
]);

interface ValidationResult {
  slug: string;
  valid: boolean;
  errors: string[];
  warnings: string[];
  comment: string;
}

function validate(submission: Submission, filePath: string): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!submission.slug || !/^[a-z0-9-]+$/.test(submission.slug)) {
    errors.push('slug must be non-empty and match [a-z0-9-]+');
  }

  if (!submission.name || submission.name.length < 2) {
    errors.push('name must be at least 2 characters');
  }

  if (!submission.githubUrl || !submission.githubUrl.startsWith('https://github.com/')) {
    errors.push('githubUrl must be a valid GitHub URL (https://github.com/...)');
  }

  if (!submission.description || submission.description.length < 20) {
    errors.push('description must be at least 20 characters');
  }

  if (!submission.categories || submission.categories.length === 0) {
    errors.push('At least one category is required');
  } else {
    for (const cat of submission.categories) {
      if (!VALID_CATEGORIES.has(cat)) {
        warnings.push(`Unknown category "${cat}". Valid: ${[...VALID_CATEGORIES].join(', ')}`);
      }
    }
  }

  if (!submission.npmPackage && !submission.pyPackage) {
    warnings.push('No npmPackage or pyPackage set. At least one package registry is recommended for automatic install.');
  }

  if (submission.npmPackage && !submission.githubUrl.includes('/')) {
    errors.push('Invalid npmPackage reference');
  }

  const valid = errors.length === 0;

  let comment: string;
  if (valid && warnings.length === 0) {
    comment = `## ✅ Submission Valid\n\n**${submission.name}** (\`${submission.slug}\`) passed all validation checks.\n\nYour MCP server will be available in the registry after review.`;
  } else if (valid) {
    comment = `## ⚠️ Submission Valid with Warnings\n\n**${submission.name}** (\`${submission.slug}\`) passed validation but has warnings:\n\n${warnings.map(w => `- ${w}`).join('\n')}\n\nThese don't block your submission but should be considered.`;
  } else {
    comment = `## ❌ Submission Invalid\n\n**${submission.name}** (\`${submission.slug}\`) has errors:\n\n${errors.map(e => `- ${e}`).join('\n')}\n\nPlease fix and push again.`;
  }

  return { slug: submission.slug, valid, errors, warnings, comment };
}

function main() {
  const registryDir = resolve(__dirname, '../registry/tools');
  const changedFiles = process.env.GITHUB_CHANGED_FILES
    ? process.env.GITHUB_CHANGED_FILES.split(',')
    : existsSync(registryDir)
      ? [registryDir]
      : [];

  const files: string[] = [];

  if (changedFiles.length === 1 && changedFiles[0] === registryDir) {
    // Read all YAML files in the directory
    const { readdirSync } = require('node:fs');
    try {
      for (const f of readdirSync(registryDir)) {
        if (f.endsWith('.yaml') || f.endsWith('.yml')) {
          files.push(resolve(registryDir, f));
        }
      }
    } catch { /* ignore */ }
  } else {
    for (const f of changedFiles) {
      const absPath = resolve(f);
      if (existsSync(absPath)) files.push(absPath);
    }
  }

  if (files.length === 0) {
    // Check for new files in registry/tools relative to base branch
    const { execSync } = require('node:child_process');
    try {
      const diff = execSync('git diff --name-only --diff-filter=A origin/main...HEAD', { encoding: 'utf8' });
      for (const line of diff.split('\n').map(s => s.trim()).filter(Boolean)) {
        if (line.startsWith('registry/tools/') && (line.endsWith('.yaml') || line.endsWith('.yml'))) {
          const absPath = resolve(__dirname, '..', line);
          if (existsSync(absPath)) files.push(absPath);
        }
      }
    } catch { /* not in git context, fall through */ }
  }

  if (files.length === 0) {
    writeFileSync('validation-result.json', JSON.stringify({
      valid: true,
      comment: 'No new tool submissions found to validate.',
    }, null, 2));
    console.log('No submissions to validate.');
    return;
  }

  const results: ValidationResult[] = [];

  for (const file of files) {
    try {
      const content = readFileSync(file, 'utf-8');
      // Simple YAML-like parser for the limited schema
      const submission = parseSimpleYaml(content);
      const result = validate(submission as Submission, file);
      results.push(result);
      console.log(`${result.valid ? '✅' : '❌'} ${file}: ${result.errors.length} errors, ${result.warnings.length} warnings`);
    } catch (err) {
      results.push({
        slug: file.split(/[/\\]/).pop() || 'unknown',
        valid: false,
        errors: [`Failed to parse: ${err instanceof Error ? err.message : 'Unknown error'}`],
        warnings: [],
        comment: `## ❌ Parse Error\n\nFailed to parse \`${file}\`: ${err instanceof Error ? err.message : 'Unknown error'}`,
      });
      console.error(`❌ ${file}: Parse error`);
    }
  }

  const overallValid = results.every(r => r.valid);
  const combinedComment = results.map(r => r.comment).join('\n\n---\n\n');

  writeFileSync('validation-result.json', JSON.stringify({
    valid: overallValid,
    results,
    comment: `# Tool Submission Validation\n\n${results.length} file(s) checked.\n\n${combinedComment}`,
  }, null, 2));
}

function parseSimpleYaml(content: string): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  let currentKey = '';
  let currentValue = '';
  let inMultiline = false;

  for (const line of content.split('\n')) {
    if (inMultiline) {
      if (line.trim() === '' || line.startsWith('  ')) {
        currentValue += ' ' + line.trim();
      } else {
        result[currentKey] = currentValue.trim();
        inMultiline = false;
        currentKey = '';
        currentValue = '';
      }
      continue;
    }

    const trimmed = line.trim();
    if (trimmed === '' || trimmed.startsWith('#')) continue;

    if (trimmed.startsWith('- ')) {
      // Array item
      if (!result[currentKey] || !Array.isArray(result[currentKey])) {
        result[currentKey] = [];
      }
      (result[currentKey] as string[]).push(trimmed.slice(2).trim());
      continue;
    }

    const colonIndex = trimmed.indexOf(':');
    if (colonIndex === -1) continue;

    const key = trimmed.slice(0, colonIndex).trim();
    let value = trimmed.slice(colonIndex + 1).trim();

    if (value === '>' || value === '|') {
      inMultiline = true;
      currentKey = key;
      currentValue = '';
      continue;
    }

    if (value === '') continue;

    // Remove quotes
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }

    currentKey = key;
    result[key] = value;
  }

  if (inMultiline && currentValue) {
    result[currentKey] = currentValue.trim();
  }

  // Parse categories if it was collected as a string
  if (result.categories && typeof result.categories === 'string') {
    result.categories = (result.categories as string).split(',').map(s => s.trim());
  }

  return result;
}

main();
