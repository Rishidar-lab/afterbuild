// @vitest-environment jsdom
//
// Slice 5 — the automated proof that paste -> brief works end to end. Runs
// the FULL pipeline (parseDiff -> detectConcepts -> buildBrief -> render)
// on the bundled sample and asserts the rendered `#report` really contains
// the change map, at least one concept WITH a visible citation, a learning
// path, and exactly 5 quiz questions. See devpost/IMPLEMENTATION_PLAN.md >
// Slice 5 and devpost/spec.md > Core Journey (steps 3-6).

import { describe, expect, it } from 'vitest';

import { buildBrief } from '../src/lib/analyze/buildBrief.js';
import { detectConcepts } from '../src/lib/analyze/detectConcepts.js';
import { parseDiff } from '../src/lib/diff/parseDiff.js';
import { sampleDiff } from '../src/samples/sample.diff.js';
import { renderBrief, renderDiffView } from '../src/ui/render.js';

describe('integration — full pipeline renders a real brief into the DOM', () => {
  const report = document.createElement('section');
  const diffView = document.createElement('div');

  const parsed = parseDiff(sampleDiff);
  const concepts = detectConcepts(parsed);
  const brief = buildBrief(parsed, concepts);
  renderBrief(report, brief);
  renderDiffView(diffView, parsed);

  it('sanity: the pipeline actually detected concepts on the sample (not testing an empty case)', () => {
    expect(concepts.length).toBeGreaterThan(0);
  });

  it('renders a non-empty What Changed section with the change map summary', () => {
    const section = report.querySelector('section[aria-label="What Changed"]');
    expect(section).not.toBeNull();
    expect(section?.textContent).toContain('2 files changed');
    // Both changed files are named in it.
    expect(section?.textContent).toContain('src/api/authRoutes.ts');
    expect(section?.textContent).toContain('scripts/notify.py');
  });

  it('renders the Concept Inventory with at least one concept carrying a visible file:line citation', () => {
    const section = report.querySelector('section[aria-label="Concept Inventory"]');
    expect(section).not.toBeNull();
    const entries = section!.querySelectorAll('.concept-entry');
    expect(entries.length).toBeGreaterThan(0);

    const citationBadges = section!.querySelectorAll('.citation-badge');
    expect(citationBadges.length).toBeGreaterThan(0);
    const firstBadge = citationBadges[0]!;
    // The badge is genuinely visible text, not just a data attribute — and
    // it names a real file from the diff.
    expect(firstBadge.textContent).toMatch(/^(src\/api\/authRoutes\.ts|scripts\/notify\.py):\d+$/);
    expect(firstBadge.getAttribute('data-file')).toBeTruthy();
    expect(firstBadge.getAttribute('data-line')).toBeTruthy();
  });

  it('renders a non-empty What to Understand (learning path) section', () => {
    const section = report.querySelector('section[aria-label="What to Understand"]');
    expect(section).not.toBeNull();
    const entries = section!.querySelectorAll('.learning-path-entry');
    expect(entries.length).toBe(brief.learningPath.length);
    expect(entries.length).toBeGreaterThan(0);
  });

  it('renders exactly 5 quiz questions, each with a working Show-answer reveal', () => {
    const section = report.querySelector('section[aria-label="Quiz"]');
    expect(section).not.toBeNull();
    const entries = section!.querySelectorAll('.quiz-entry');
    expect(entries.length).toBe(5);

    for (const entry of entries) {
      const details = entry.querySelector('details.quiz-answer');
      expect(details).not.toBeNull();
      expect(details!.querySelector('summary')?.textContent).toBe('Show answer');
      expect(details!.querySelector('.quiz-answer-text')?.textContent?.length).toBeGreaterThan(0);
      // Every quiz answer names the file:line it came from.
      const sourceBadge = details!.querySelector('.quiz-source .citation-badge');
      expect(sourceBadge).not.toBeNull();
      expect(sourceBadge!.textContent).toMatch(/:\d+$/);
    }
  });

  it('renders the diff view with data-file/data-line anchors on added lines', () => {
    const addedLineNodes = diffView.querySelectorAll('.diff-line.add[data-file][data-line]');
    expect(addedLineNodes.length).toBeGreaterThan(0);
    const first = addedLineNodes[0]!;
    expect(first.getAttribute('data-file')).toBeTruthy();
    expect(Number(first.getAttribute('data-line'))).toBeGreaterThan(0);

    // Context/removed lines are rendered too, but never carry a data-line
    // anchor (only ADDED lines do, per spec.md > Components > ui/render.ts).
    const nonAddAnchored = diffView.querySelectorAll(
      '.diff-line:not(.add)[data-file], .diff-line:not(.add)[data-line]',
    );
    expect(nonAddAnchored.length).toBe(0);
  });
});
