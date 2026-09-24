// Slice 2 — input accepted (enable/disable Analyze, Load sample diff, Load
// .diff file, Clear). Slice 5 wires Analyze itself: parseDiff ->
// detectConcepts -> buildBrief -> render, plus the plain inline message for
// unparseable input (full state polish — thin/large/binary — is Slice 7).
// Slice 6 wires the citation-to-diff-line highlight (see render.ts >
// wireHighlighting) once, here, on `document`.

import { buildBrief } from '../lib/analyze/buildBrief.js';
import { detectConcepts } from '../lib/analyze/detectConcepts.js';
import { parseDiff } from '../lib/diff/parseDiff.js';
import { sampleDiff } from '../samples/sample.diff.js';
import { renderBrief, renderDiffView, wireHighlighting } from './render.js';

/**
 * Query a required DOM element by selector, or throw. Returning the
 * non-null type here (instead of a top-level `if (!x) throw` guard) keeps
 * every binding genuinely non-null for TypeScript's checker, including
 * inside the closures below — a guard clause's narrowing does not persist
 * into nested function bodies.
 */
function mustFind<T extends Element>(selector: string): T {
  const el = document.querySelector<T>(selector);
  if (!el) {
    throw new Error(`Afterbuild: expected element "${selector}" is missing from index.html`);
  }
  return el;
}

const diffInput = mustFind<HTMLTextAreaElement>('#diff-input');
const analyzeBtn = mustFind<HTMLButtonElement>('#analyze-btn');
const loadSampleBtn = mustFind<HTMLButtonElement>('#load-sample-btn');
const loadFileBtn = mustFind<HTMLButtonElement>('#load-file-btn');
const clearBtn = mustFind<HTMLButtonElement>('#clear-btn');
const fileInput = mustFind<HTMLInputElement>('#file-input');
const reportEl = mustFind<HTMLElement>('#report');
const diffViewEl = mustFind<HTMLElement>('#diff-view');

/** Analyze is enabled only while the textarea holds non-empty (trimmed) text. */
function updateAnalyzeEnabled(): void {
  analyzeBtn.disabled = diffInput.value.trim().length === 0;
}

diffInput.addEventListener('input', updateAnalyzeEnabled);

loadSampleBtn.addEventListener('click', () => {
  diffInput.value = sampleDiff;
  updateAnalyzeEnabled();
});

loadFileBtn.addEventListener('click', () => {
  fileInput.click();
});

fileInput.addEventListener('change', () => {
  const file = fileInput.files?.[0];
  if (!file) {
    return;
  }
  const reader = new FileReader();
  reader.onload = () => {
    diffInput.value = typeof reader.result === 'string' ? reader.result : '';
    updateAnalyzeEnabled();
  };
  reader.readAsText(file);
  // Reset so selecting the same file again still fires a change event.
  fileInput.value = '';
});

clearBtn.addEventListener('click', () => {
  diffInput.value = '';
  updateAnalyzeEnabled();
  reportEl.hidden = true;
  reportEl.replaceChildren();
  diffViewEl.replaceChildren();
});

/** Shows a plain inline message in the report zone (no crash, input kept as-is). */
function showInlineMessage(text: string): void {
  const message = document.createElement('p');
  message.className = 'error-note';
  message.textContent = text;
  reportEl.replaceChildren(message);
  reportEl.hidden = false;
  diffViewEl.replaceChildren();
}

analyzeBtn.addEventListener('click', () => {
  const parsed = parseDiff(diffInput.value);
  if (parsed.files.length === 0) {
    showInlineMessage(
      "This doesn't look like a unified `git diff`. Try `git diff` output or Load sample diff.",
    );
    return;
  }

  const concepts = detectConcepts(parsed);
  const brief = buildBrief(parsed, concepts);
  renderBrief(reportEl, brief);
  renderDiffView(diffViewEl, parsed);
  reportEl.hidden = false;
});

updateAnalyzeEnabled();

// One delegated listener for the lifetime of the page (Slice 6) — covers
// every citation badge rendered by any past or future Analyze run, so it is
// wired once here rather than re-wired inside the Analyze handler above.
wireHighlighting(document);
