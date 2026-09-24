// @vitest-environment jsdom
//
// Slice 6 — the click-a-citation-to-highlight-its-diff-line wow beat. Runs
// the full pipeline (parseDiff -> detectConcepts -> buildBrief -> render) on
// the bundled sample, wires the DOM the way index.html/app.ts actually do
// (a `#report` zone and a `<details class="diff-panel">` wrapping
// `#diff-view`, both under one root), fires a real click on the first
// citation badge, and asserts the matching diff line receives the highlight
// class and the (initially collapsed) diff panel opens. See
// devpost/IMPLEMENTATION_PLAN.md > Slice 6.

import { describe, expect, it } from 'vitest';

import { buildBrief } from '../src/lib/analyze/buildBrief.js';
import { detectConcepts } from '../src/lib/analyze/detectConcepts.js';
import { parseDiff } from '../src/lib/diff/parseDiff.js';
import { sampleDiff } from '../src/samples/sample.diff.js';
import { renderBrief, renderDiffView, wireHighlighting } from '../src/ui/render.js';

function setUpDom(): { report: HTMLElement; diffView: HTMLElement; panel: HTMLDetailsElement } {
  document.body.innerHTML = `
    <main>
      <section id="report"></section>
      <details class="diff-panel">
        <summary>Rendered diff</summary>
        <div id="diff-view"></div>
      </details>
    </main>
  `;
  return {
    report: document.getElementById('report')!,
    diffView: document.getElementById('diff-view')!,
    panel: document.querySelector('details.diff-panel')!,
  };
}

describe('wireHighlighting — clicking a citation badge highlights its source diff line', () => {
  const parsed = parseDiff(sampleDiff);
  const concepts = detectConcepts(parsed);
  const brief = buildBrief(parsed, concepts);

  it('applies the highlight class to the exact diff line named by the clicked badge, and opens a collapsed panel', () => {
    const { report, diffView, panel } = setUpDom();
    renderBrief(report, brief);
    renderDiffView(diffView, parsed);
    wireHighlighting(document);

    expect(panel.open).toBe(false);

    const badge = report.querySelector<HTMLElement>('.citation-badge[data-file][data-line]');
    expect(badge).not.toBeNull();
    const file = badge!.getAttribute('data-file')!;
    const line = badge!.getAttribute('data-line')!;

    badge!.dispatchEvent(new MouseEvent('click', { bubbles: true }));

    expect(panel.open).toBe(true);

    const target = [...diffView.querySelectorAll<HTMLElement>('[data-file][data-line]')].find(
      (candidate) => candidate.dataset.file === file && candidate.dataset.line === line,
    );
    expect(target).not.toBeUndefined();
    expect(target!.classList.contains('concept-highlight')).toBe(true);

    // Nothing else in the diff view is highlighted.
    const highlighted = diffView.querySelectorAll('.concept-highlight');
    expect(highlighted.length).toBe(1);
    expect(highlighted[0]).toBe(target);
  });

  it('moves the highlight when a second, different badge is activated (keyboard: Enter)', () => {
    const { report, diffView } = setUpDom();
    renderBrief(report, brief);
    renderDiffView(diffView, parsed);
    wireHighlighting(document);

    const badges = report.querySelectorAll<HTMLElement>('.citation-badge[data-file][data-line]');
    expect(badges.length).toBeGreaterThan(1);

    badges[0]!.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    expect(diffView.querySelectorAll('.concept-highlight')).toHaveLength(1);

    // Find a second badge that names a different file:line than the first.
    const firstKey = `${badges[0]!.getAttribute('data-file')}:${badges[0]!.getAttribute('data-line')}`;
    const secondBadge = [...badges].find(
      (b) => `${b.getAttribute('data-file')}:${b.getAttribute('data-line')}` !== firstKey,
    );
    expect(secondBadge).toBeDefined();

    secondBadge!.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'Enter', bubbles: true, cancelable: true }),
    );

    // Exactly one line highlighted at a time, and it is the second badge's line.
    const stillHighlighted = diffView.querySelectorAll('.concept-highlight');
    expect(stillHighlighted).toHaveLength(1);
    expect(stillHighlighted[0]!.getAttribute('data-file')).toBe(secondBadge!.getAttribute('data-file'));
    expect(stillHighlighted[0]!.getAttribute('data-line')).toBe(secondBadge!.getAttribute('data-line'));
  });

  it('a citation badge is keyboard-reachable and announces its role', () => {
    const { report } = setUpDom();
    renderBrief(report, brief);
    const badge = report.querySelector('.citation-badge')!;
    expect(badge.getAttribute('role')).toBe('button');
    expect(badge.getAttribute('tabindex')).toBe('0');
  });

  it('clicking outside any citation badge does nothing (no throw, no highlight)', () => {
    const { report, diffView } = setUpDom();
    renderBrief(report, brief);
    renderDiffView(diffView, parsed);
    wireHighlighting(document);

    expect(() => report.dispatchEvent(new MouseEvent('click', { bubbles: true }))).not.toThrow();
    expect(diffView.querySelectorAll('.concept-highlight')).toHaveLength(0);
  });
});
