// Slice 2 — input accepted.
//
// Wires the input-zone controls: enable/disable Analyze based on textarea
// content, Load sample diff, Load .diff file (via FileReader), and Clear.
// No parsing/analysis/rendering yet — that arrives in Slice 3 onward per
// devpost/IMPLEMENTATION_PLAN.md.

import { sampleDiff } from '../samples/sample.diff.js';

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
// #report and #diff-view are queried once the pipeline exists to fill them
// (Slice 5 wires parseDiff → detectConcepts → buildBrief → render).

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
});

updateAnalyzeEnabled();
