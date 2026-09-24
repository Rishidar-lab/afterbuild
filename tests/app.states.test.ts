// @vitest-environment jsdom
//
// Slice 7 — the "unparseable input" state from devpost/prd.md > States and
// Boundaries, tested against the REAL app.ts wiring (not a re-implemented
// stand-in): mounts a DOM shaped like index.html's relevant elements, then
// dynamically imports app.ts (which self-wires its listeners against
// `document` at import time, same as it does when Vite loads it from
// index.html), and drives it exactly the way a person would — type into the
// textarea, click Analyze.
//
// `vi.resetModules()` before each import gives every test its own fresh
// module instance bound to that test's freshly-mounted DOM, since app.ts's
// top-level `mustFind` calls capture element references once, at import
// time.

import { beforeEach, describe, expect, it, vi } from 'vitest';

function mountIndexDom(): void {
  document.body.innerHTML = `
    <main>
      <section class="input-zone">
        <textarea id="diff-input"></textarea>
        <div class="input-actions">
          <button id="analyze-btn" type="button" disabled>Analyze</button>
          <button id="load-sample-btn" type="button">Load sample diff</button>
          <button id="load-file-btn" type="button">Load .diff file</button>
          <button id="clear-btn" type="button">Clear</button>
          <input id="file-input" type="file" accept=".diff,.patch,.txt" hidden />
        </div>
      </section>
      <section id="report" class="report-zone" hidden></section>
      <details class="diff-panel">
        <summary>Rendered diff</summary>
        <div id="diff-view" class="diff-view"></div>
      </details>
    </main>
  `;
}

async function loadApp(): Promise<void> {
  vi.resetModules();
  await import('../src/ui/app.js');
}

describe('app.ts — unparseable-input state (prd.md > States and Boundaries)', () => {
  beforeEach(() => {
    mountIndexDom();
  });

  it('pressing Analyze on non-diff text shows the plain inline message, preserves the input, and never throws', async () => {
    await loadApp();
    const diffInput = document.getElementById('diff-input') as HTMLTextAreaElement;
    const analyzeBtn = document.getElementById('analyze-btn') as HTMLButtonElement;
    const report = document.getElementById('report') as HTMLElement;

    const prose = 'not a diff, just some prose.\nanother line.';
    diffInput.value = prose;
    diffInput.dispatchEvent(new Event('input'));
    expect(analyzeBtn.disabled).toBe(false);

    expect(() => analyzeBtn.dispatchEvent(new MouseEvent('click'))).not.toThrow();

    expect(report.hidden).toBe(false);
    const message = report.querySelector('.error-note');
    expect(message).not.toBeNull();
    expect(message!.textContent).toBe(
      "This doesn't look like a unified `git diff`. Try `git diff` output or Load sample diff.",
    );
    // No partial/garbage brief content alongside the message.
    expect(report.querySelectorAll('.brief-section')).toHaveLength(0);
    // Input is preserved, not cleared, per prd.md's "no crash, no partial garbage".
    expect(diffInput.value).toBe(prose);
  });

  it('Analyze stays disabled on empty input, so the unparseable path cannot even be reached from a blank textarea', async () => {
    await loadApp();
    const analyzeBtn = document.getElementById('analyze-btn') as HTMLButtonElement;
    expect(analyzeBtn.disabled).toBe(true);
  });

  it('a subsequent Load sample diff + Analyze after an unparseable attempt recovers cleanly (no throw, real brief renders)', async () => {
    await loadApp();
    const diffInput = document.getElementById('diff-input') as HTMLTextAreaElement;
    const analyzeBtn = document.getElementById('analyze-btn') as HTMLButtonElement;
    const loadSampleBtn = document.getElementById('load-sample-btn') as HTMLButtonElement;
    const report = document.getElementById('report') as HTMLElement;

    diffInput.value = 'nonsense';
    diffInput.dispatchEvent(new Event('input'));
    analyzeBtn.dispatchEvent(new MouseEvent('click'));
    expect(report.querySelector('.error-note')).not.toBeNull();

    loadSampleBtn.dispatchEvent(new MouseEvent('click'));
    expect(() => analyzeBtn.dispatchEvent(new MouseEvent('click'))).not.toThrow();

    expect(report.querySelector('.error-note')).toBeNull();
    expect(report.querySelectorAll('.brief-section').length).toBeGreaterThan(0);
  });
});
