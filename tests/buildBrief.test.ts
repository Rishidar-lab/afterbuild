// Slice 5 — brief + quiz builder tests. See devpost/spec.md > Components >
// lib/analyze/buildBrief.ts and devpost/IMPLEMENTATION_PLAN.md > Slice 5.
//
// Covers: the change map is a faithful summary of the ParsedDiff; the
// learning path contains only concepts actually present in the inventory,
// in the intended order; the quiz is ALWAYS exactly 5 questions with every
// ref resolving to a real line in the diff; and the <5-concepts fallback
// path (0 concepts, then exactly 1) is explicitly exercised end to end
// through the real parseDiff -> detectConcepts -> buildBrief pipeline.

import { describe, expect, it } from 'vitest';

import { buildBrief } from '../src/lib/analyze/buildBrief.js';
import { detectConcepts } from '../src/lib/analyze/detectConcepts.js';
import { parseDiff } from '../src/lib/diff/parseDiff.js';
import { sampleDiff } from '../src/samples/sample.diff.js';
import type { ParsedDiff } from '../src/lib/types.js';

/** Every "file:line" that is a real line (added OR context — both carry a
 * genuine new-file line number) anywhere in `parsed`. A quiz `ref` (unlike a
 * Concept citation, which is always an ADDED line — see
 * tests/detectConcepts.test.ts) is allowed to land on a context line for the
 * grounded-fallback case, so the check here is deliberately the broader
 * "real line in the diff", matching prd.md's own checklist wording. */
function realLinesOf(parsed: ParsedDiff): Set<string> {
  const lines = new Set<string>();
  for (const file of parsed.files) {
    for (const hunk of file.hunks) {
      for (const line of hunk.lines) {
        if (line.newLineNo !== undefined) {
          lines.add(`${file.path}:${line.newLineNo}`);
        }
      }
    }
  }
  return lines;
}

describe('buildBrief — change map', () => {
  const parsed = parseDiff(sampleDiff);
  const brief = buildBrief(parsed, detectConcepts(parsed));

  it('summarizes each file with matching path/language/added/removed/functions', () => {
    expect(brief.changeMap.files).toEqual([
      {
        path: 'src/api/authRoutes.ts',
        language: 'typescript',
        added: 15,
        removed: 0,
        functions: [],
      },
      {
        path: 'scripts/notify.py',
        language: 'python',
        added: 14,
        removed: 0,
        functions: ['send_alert'],
      },
    ]);
  });

  it('totals files/added/removed correctly', () => {
    expect(brief.changeMap.totalFiles).toBe(2);
    expect(brief.changeMap.totalAdded).toBe(29);
    expect(brief.changeMap.totalRemoved).toBe(0);
  });
});

describe('buildBrief — learning path (sample: 7 concepts)', () => {
  const parsed = parseDiff(sampleDiff);
  const concepts = detectConcepts(parsed);
  const brief = buildBrief(parsed, concepts);

  it('contains exactly the concept ids that are in the inventory — nothing more, nothing fewer', () => {
    const pathIds = new Set(brief.learningPath.map((item) => item.conceptId));
    const conceptIds = new Set(concepts.map((c) => c.id));
    expect(pathIds).toEqual(conceptIds);
    expect(brief.learningPath).toHaveLength(concepts.length);
  });

  it('orders foundational concepts (imports/env) before syntax/error-handling ones', () => {
    const ids = brief.learningPath.map((item) => item.conceptId);
    expect(ids).toEqual([
      'new-dependency',
      'env-var',
      'async-await',
      'api-route',
      'auth-token',
      'regex',
      'error-handling',
    ]);
  });

  it('every learning-path item carries a non-empty label and why', () => {
    for (const item of brief.learningPath) {
      expect(item.label.length).toBeGreaterThan(0);
      expect(item.why.length).toBeGreaterThan(0);
    }
  });
});

describe('buildBrief — quiz (sample: >=5 concepts available)', () => {
  const parsed = parseDiff(sampleDiff);
  const concepts = detectConcepts(parsed);
  const brief = buildBrief(parsed, concepts);
  const realLines = realLinesOf(parsed);

  it('is exactly 5 questions', () => {
    expect(brief.quiz).toHaveLength(5);
  });

  it('every ref resolves to a real line in the diff', () => {
    for (const q of brief.quiz) {
      expect(realLines.has(`${q.ref.file}:${q.ref.line}`)).toBe(true);
    }
  });

  it('every question has a non-empty prompt and answer', () => {
    for (const q of brief.quiz) {
      expect(q.prompt.length).toBeGreaterThan(0);
      expect(q.answer.length).toBeGreaterThan(0);
    }
  });

  it('draws from real detected concepts (a ref matches that concept\'s own citation)', () => {
    const asyncConcept = concepts.find((c) => c.id === 'async-await')!;
    const asyncQuestion = brief.quiz.find((q) => q.prompt.includes('async/await'));
    expect(asyncQuestion).toBeDefined();
    expect(asyncConcept.citations).toEqual(expect.arrayContaining([asyncQuestion!.ref]));
  });
});

describe('buildBrief — fallback path: 0 detected concepts', () => {
  // A .txt file: detectLanguage yields 'other', and no rule in rules.ts
  // targets 'other' — so this is guaranteed to detect zero concepts no
  // matter what the added text says, without relying on the rule set's
  // exact patterns.
  const diffText = [
    'diff --git a/notes.txt b/notes.txt',
    'index 1111111..2222222 100644',
    '--- a/notes.txt',
    '+++ b/notes.txt',
    '@@ -1,1 +1,2 @@',
    '-old note',
    '+new note',
    '+a second line',
    '',
  ].join('\n');

  const parsed = parseDiff(diffText);
  const concepts = detectConcepts(parsed);
  const brief = buildBrief(parsed, concepts);
  const realLines = realLinesOf(parsed);

  it('sanity: detects zero concepts', () => {
    expect(concepts).toHaveLength(0);
  });

  it('learning path is empty — no concept is invented to fill it', () => {
    expect(brief.learningPath).toEqual([]);
  });

  it('quiz is still exactly 5 questions, all from grounded fallback templates', () => {
    expect(brief.quiz).toHaveLength(5);
  });

  it('every fallback ref resolves to a real line in the diff', () => {
    for (const q of brief.quiz) {
      expect(realLines.has(`${q.ref.file}:${q.ref.line}`)).toBe(true);
    }
  });

  it('every fallback question is grounded in the one changed file, never a fabricated concept', () => {
    for (const q of brief.quiz) {
      expect(q.ref.file).toBe('notes.txt');
      expect(q.prompt).toContain('notes.txt');
    }
  });
});

describe('buildBrief — fallback path: exactly 1 detected concept', () => {
  const diffText = [
    'diff --git a/util.ts b/util.ts',
    'index 1111111..2222222 100644',
    '--- a/util.ts',
    '+++ b/util.ts',
    '@@ -1,1 +1,2 @@',
    ' const x = 1;',
    '+async function delay() {}',
    '',
  ].join('\n');

  const parsed = parseDiff(diffText);
  const concepts = detectConcepts(parsed);
  const brief = buildBrief(parsed, concepts);
  const realLines = realLinesOf(parsed);

  it('sanity: detects exactly one concept (async-await)', () => {
    expect(concepts.map((c) => c.id)).toEqual(['async-await']);
  });

  it('learning path has exactly that one concept', () => {
    expect(brief.learningPath).toHaveLength(1);
    expect(brief.learningPath[0]?.conceptId).toBe('async-await');
  });

  it('quiz is exactly 5 questions: 1 concept-grounded + 4 fallback', () => {
    expect(brief.quiz).toHaveLength(5);
    expect(brief.quiz[0]?.ref).toEqual(concepts[0]!.citations[0]);
    for (const q of brief.quiz) {
      expect(realLines.has(`${q.ref.file}:${q.ref.line}`)).toBe(true);
    }
  });

  it('never fills a slot by inventing a second concept id', () => {
    // Only one template-backed question should mention async/await; the
    // rest must be the generic file-grounded fallback questions.
    const asyncMentions = brief.quiz.filter((q) => q.prompt.toLowerCase().includes('async'));
    expect(asyncMentions).toHaveLength(1);
  });
});

describe('buildBrief — degenerate case: no files at all', () => {
  it('does not throw on an empty ParsedDiff, and never fabricates a citation', () => {
    const parsed: ParsedDiff = { files: [] };
    const brief = buildBrief(parsed, []);
    expect(brief.learningPath).toEqual([]);
    expect(brief.changeMap.totalFiles).toBe(0);
    // No groundable line exists anywhere, so fewer than 5 (here: 0)
    // questions is the honest outcome — never a fabricated ref.
    expect(brief.quiz).toEqual([]);
  });
});
