/**
 * Report formatter for model-showdown results.
 */

import type { ShowdownResult, StrategyResult } from './types.js';

export type ReportFormat = 'markdown' | 'json' | 'text';

export function generateReport(
  result: ShowdownResult,
  format: ReportFormat = 'markdown',
): string {
  switch (format) {
    case 'json':
      return JSON.stringify(result, null, 2);
    case 'text':
      return formatText(result);
    case 'markdown':
      return formatMarkdown(result);
  }
}

function strategyIcon(r: StrategyResult): string {
  return r.decision === 'approved' ? 'PASS' : 'FAIL';
}

function formatText(r: ShowdownResult): string {
  const lines: string[] = [
    `Model Showdown: ${r.evaluation.task}`,
    `Recommended: ${r.evaluation.recommendedModel}`,
    `Expert: ${r.evaluation.expertRole} (confidence: ${(r.evaluation.expertConfidence * 100).toFixed(0)}%)`,
    `Strategy Agreement: ${(r.strategyAgreement * 100).toFixed(0)}%`,
    '',
    'Strategy Results:',
  ];

  for (const s of r.strategyResults) {
    lines.push(`  ${strategyIcon(s)} ${s.strategy}: ${s.decision} (${s.approvalPercentage}%, ${s.durationMs}ms)`);
  }

  if (r.evaluation.alternatives.length > 0) {
    lines.push('', 'Alternatives:');
    for (const a of r.evaluation.alternatives) {
      lines.push(`  - ${a.model} (score: ${a.score})`);
    }
  }

  if (r.errors.length > 0) {
    lines.push('', 'Errors:');
    for (const e of r.errors) {
      lines.push(`  - ${e}`);
    }
  }

  return lines.join('\n');
}

function formatMarkdown(r: ShowdownResult): string {
  const lines: string[] = [
    `# Model Showdown: ${r.evaluation.task}`,
    '',
    '## Model Recommendation',
    '',
    `| Metric | Value |`,
    `| --- | --- |`,
    `| Recommended Model | ${r.evaluation.recommendedModel} |`,
    `| Expert Role | ${r.evaluation.expertRole} |`,
    `| Expert Confidence | ${(r.evaluation.expertConfidence * 100).toFixed(0)}% |`,
    `| Strategy Agreement | ${(r.strategyAgreement * 100).toFixed(0)}% |`,
  ];

  if (r.evaluation.alternatives.length > 0) {
    lines.push('', '## Alternatives', '');
    for (const a of r.evaluation.alternatives) {
      lines.push(`- **${a.model}** — score: ${a.score}`);
    }
  }

  lines.push('', '## Voting Strategy Comparison', '', '| Strategy | Decision | Approval | Duration |', '| --- | --- | --- | --- |');
  for (const s of r.strategyResults) {
    lines.push(`| ${s.strategy} | ${s.decision} | ${s.approvalPercentage}% | ${s.durationMs}ms |`);
  }

  if (r.evaluation.expertOutput) {
    lines.push('', '## Expert Analysis', '', r.evaluation.expertOutput);
  }

  if (r.errors.length > 0) {
    lines.push('', '## Errors', '');
    for (const e of r.errors) {
      lines.push(`- ${e}`);
    }
  }

  return lines.join('\n');
}
