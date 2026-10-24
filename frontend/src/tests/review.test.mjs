import { test, describe } from 'node:test';
import assert from 'node:assert/strict';

describe('BrandLens AI — Frontend Logic & Integration Contracts', () => {
  // Test 1: Validation Rules
  describe('Draft text validation', () => {
    function validateDraft(draft) {
      if (!draft || !draft.trim()) {
        throw new Error('Draft text must not be empty or whitespace only.');
      }
      if (draft.length > 20000) {
        throw new Error(`Draft exceeds the 20,000 character limit (${draft.length} characters).`);
      }
      return true;
    }

    test('accepts valid draft content', () => {
      const draft = 'Our customer service is available in 10 regions.';
      assert.equal(validateDraft(draft), true);
    });

    test('rejects empty or whitespace-only draft', () => {
      assert.throws(() => validateDraft(''), /empty or whitespace only/);
      assert.throws(() => validateDraft('   \n\t  '), /empty or whitespace only/);
    });

    test('rejects draft exceeding 20,000 characters', () => {
      const longDraft = 'a'.repeat(20001);
      assert.throws(() => validateDraft(longDraft), /limit/);
    });
  });

  // Test 2: Safe Text Replacement Logic
  describe('Safe excerpt replacement', () => {
    function safeReplaceExcerpt(draft, excerpt, suggestion) {
      if (!excerpt) return { success: false, reason: 'missing_excerpt', text: draft };
      const escaped = excerpt.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const matches = draft.match(new RegExp(escaped, 'g'));

      if (!matches || matches.length === 0) {
        return { success: false, reason: 'not_found', text: draft };
      }

      if (matches.length === 1) {
        return {
          success: true,
          mode: 'exact',
          text: draft.replace(excerpt, suggestion),
        };
      }

      // Multiple occurrences: replace first occurrence safely
      return {
        success: true,
        mode: 'first_of_multiple',
        count: matches.length,
        text: draft.replace(excerpt, suggestion),
      };
    }

    test('safely replaces single unambiguous match', () => {
      const initial = 'Our consumer service is available in 10 regions.';
      const result = safeReplaceExcerpt(initial, 'consumer', 'customer');
      assert.equal(result.success, true);
      assert.equal(result.mode, 'exact');
      assert.equal(result.text, 'Our customer service is available in 10 regions.');
    });

    test('handles multiple occurrences by replacing first and reporting count', () => {
      const initial = 'Every consumer knows this consumer service.';
      const result = safeReplaceExcerpt(initial, 'consumer', 'customer');
      assert.equal(result.success, true);
      assert.equal(result.mode, 'first_of_multiple');
      assert.equal(result.count, 2);
      assert.equal(result.text, 'Every customer knows this consumer service.');
    });

    test('reports not found when excerpt does not exist', () => {
      const initial = 'Already replaced content.';
      const result = safeReplaceExcerpt(initial, 'consumer', 'customer');
      assert.equal(result.success, false);
      assert.equal(result.reason, 'not_found');
      assert.equal(result.text, initial);
    });
  });

  // Test 3: Response Schema Validation
  describe('Backend ReviewResponse shape contract', () => {
    function validateReviewResponse(data) {
      if (typeof data !== 'object' || data === null) {
        throw new Error('Response is not an object');
      }
      if (!Array.isArray(data.findings)) {
        throw new Error('Response is missing findings array');
      }
      if (typeof data.review_summary !== 'string') {
        throw new Error('Response is missing review_summary string');
      }
      if (typeof data.needs_human_review !== 'boolean') {
        throw new Error('Response is missing needs_human_review boolean');
      }

      for (const finding of data.findings) {
        for (const reqField of ['id', 'category', 'severity', 'excerpt', 'explanation', 'suggestion']) {
          if (typeof finding[reqField] !== 'string' || !finding[reqField].trim()) {
            throw new Error(`Finding ${finding.id || 'unknown'} missing required field: ${reqField}`);
          }
        }
        if (!['Low', 'Medium', 'High'].includes(finding.severity)) {
          throw new Error(`Invalid severity: ${finding.severity}`);
        }
      }
      return true;
    }

    test('validates conformant backend response', () => {
      const validResponse = {
        findings: [
          {
            id: 'F-TERM-001',
            category: 'Terminology',
            severity: 'Low',
            excerpt: 'consumer',
            explanation: 'The supplied term list prefers "customer" instead of "consumer".',
            suggestion: 'customer',
            evidence_ids: ['TERM-01'],
            confidence: 'high',
          },
        ],
        review_summary: 'Terminology review completed. Human review is required.',
        needs_human_review: true,
      };

      assert.equal(validateReviewResponse(validResponse), true);
    });

    test('rejects malformed response missing findings array', () => {
      const malformed = {
        review_summary: 'Summary only',
        needs_human_review: true,
      };
      assert.throws(() => validateReviewResponse(malformed), /missing findings/);
    });

    test('rejects finding with invalid severity', () => {
      const invalid = {
        findings: [
          {
            id: 'F-001',
            category: 'Tone',
            severity: 'Critical', // Invalid severity
            excerpt: 'best',
            explanation: 'Exaggerated',
            suggestion: 'leading',
          },
        ],
        review_summary: 'Done',
        needs_human_review: true,
      };
      assert.throws(() => validateReviewResponse(invalid), /Invalid severity/);
    });
  });

  // Test 4: Category Filtering Logic
  describe('Finding category filtering', () => {
    const sampleFindings = [
      { id: 'F-TERM-001', category: 'Terminology', severity: 'Low' },
      { id: 'F-AI-001', category: 'Tone', severity: 'Medium' },
      { id: 'F-AI-002', category: 'Claims & Factual Consistency', severity: 'High' },
    ];

    function filterFindings(findings, category) {
      if (category === 'All') return findings;
      if (category === 'Terminology') {
        return findings.filter((f) => f.category.toLowerCase().includes('term'));
      }
      if (category === 'Tone') {
        return findings.filter((f) => f.category.toLowerCase().includes('tone') || f.category.toLowerCase().includes('voice'));
      }
      if (category === 'Claims & Facts') {
        return findings.filter((f) => f.category.toLowerCase().includes('claim') || f.category.toLowerCase().includes('fact'));
      }
      return findings.filter((f) => f.category === category);
    }

    test('filters correctly for all standard categories', () => {
      assert.equal(filterFindings(sampleFindings, 'All').length, 3);
      assert.equal(filterFindings(sampleFindings, 'Terminology').length, 1);
      assert.equal(filterFindings(sampleFindings, 'Tone').length, 1);
      assert.equal(filterFindings(sampleFindings, 'Claims & Facts').length, 1);
      assert.equal(filterFindings(sampleFindings, 'NonExistent').length, 0);
    });
  });
});
