/**
 * Tests for the report formatter.
 */

import { describe, it, expect } from 'vitest';
import { generateReport } from './reporter.js';
import type { ShowdownResult } from './types.js';

const SAMPLE_RESULT: ShowdownResult = {
  evaluation: {
    task: 'Compare TypeScript testing frameworks',
    recommendedModel: 'codex-5.3',
    reasoning: 'Best for code tasks',
    alternatives: [
      { model: 'claude-opus', score: 85 },
      { model: 'claude-sonnet', score: 84 },
    ],
    expertRole: 'code_expert',
    expertOutput: 'Vitest is recommended for TypeScript projects.',
    expertConfidence: 0.88,
  },
  strategyResults: [
    { strategy: 'simple_majority', decision: 'approved', approvalPercentage: 83.3, voteCounts: { approve: 5, reject: 1, abstain: 0, error: 0 }, durationMs: 12500 },
    { strategy: 'supermajority', decision: 'approved', approvalPercentage: 83.3, voteCounts: { approve: 5, reject: 1, abstain: 0, error: 0 }, durationMs: 13000 },
    { strategy: 'unanimous', decision: 'rejected', approvalPercentage: 83.3, voteCounts: { approve: 5, reject: 1, abstain: 0, error: 0 }, durationMs: 13100 },
  ],
  strategyAgreement: 0.67,
  errors: [],
};

const ERROR_RESULT: ShowdownResult = {
  evaluation: {
    task: 'Failing task',
    recommendedModel: 'claude-opus',
    reasoning: 'Default',
    alternatives: [],
    expertRole: 'code_expert',
    expertOutput: '',
    expertConfidence: 0,
  },
  strategyResults: [],
  strategyAgreement: 0,
  errors: ['unanimous vote failed: timeout'],
};

describe('generateReport', () => {
  describe('markdown format', () => {
    it('includes title and summary table', () => {
      const report = generateReport(SAMPLE_RESULT, 'markdown');
      expect(report).toContain('# Model Showdown: Compare TypeScript testing frameworks');
      expect(report).toContain('| Recommended Model | codex-5.3 |');
      expect(report).toContain('| Expert Confidence | 88% |');
      expect(report).toContain('| Strategy Agreement | 67% |');
    });

    it('includes voting strategy comparison table', () => {
      const report = generateReport(SAMPLE_RESULT, 'markdown');
      expect(report).toContain('## Voting Strategy Comparison');
      expect(report).toContain('| simple_majority | approved |');
      expect(report).toContain('| unanimous | rejected |');
    });

    it('includes alternatives', () => {
      const report = generateReport(SAMPLE_RESULT, 'markdown');
      expect(report).toContain('## Alternatives');
      expect(report).toContain('**claude-opus**');
    });

    it('includes expert analysis', () => {
      const report = generateReport(SAMPLE_RESULT, 'markdown');
      expect(report).toContain('## Expert Analysis');
      expect(report).toContain('Vitest');
    });

    it('includes errors', () => {
      const report = generateReport(ERROR_RESULT, 'markdown');
      expect(report).toContain('## Errors');
      expect(report).toContain('vote failed: timeout');
    });

    it('defaults to markdown', () => {
      const report = generateReport(SAMPLE_RESULT);
      expect(report).toContain('# Model Showdown');
    });
  });

  describe('json format', () => {
    it('produces valid JSON', () => {
      const report = generateReport(SAMPLE_RESULT, 'json');
      const parsed = JSON.parse(report) as ShowdownResult;
      expect(parsed.evaluation.recommendedModel).toBe('codex-5.3');
      expect(parsed.strategyResults).toHaveLength(3);
    });
  });

  describe('text format', () => {
    it('includes key metrics', () => {
      const report = generateReport(SAMPLE_RESULT, 'text');
      expect(report).toContain('Recommended: codex-5.3');
      expect(report).toContain('Expert: code_expert');
      expect(report).toContain('Strategy Agreement: 67%');
    });

    it('lists strategy results with icons', () => {
      const report = generateReport(SAMPLE_RESULT, 'text');
      expect(report).toContain('PASS simple_majority');
      expect(report).toContain('FAIL unanimous');
    });

    it('shows errors', () => {
      const report = generateReport(ERROR_RESULT, 'text');
      expect(report).toContain('Errors:');
      expect(report).toContain('vote failed: timeout');
    });
  });
});
