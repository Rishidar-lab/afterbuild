// Slice 1 — app boots.
//
// This module only mounts the page: it queries the key DOM elements so the
// file type-checks and the script tag has something to load. No behavior
// (enable/disable, sample loading, file loading, parsing, rendering) is
// wired up yet — that arrives in Slice 2 onward per devpost/IMPLEMENTATION_PLAN.md.

const diffInput = document.querySelector<HTMLTextAreaElement>('#diff-input');
const analyzeBtn = document.querySelector<HTMLButtonElement>('#analyze-btn');
const loadSampleBtn = document.querySelector<HTMLButtonElement>('#load-sample-btn');
const loadFileBtn = document.querySelector<HTMLButtonElement>('#load-file-btn');
const clearBtn = document.querySelector<HTMLButtonElement>('#clear-btn');
const fileInput = document.querySelector<HTMLInputElement>('#file-input');
const report = document.querySelector<HTMLElement>('#report');
const diffView = document.querySelector<HTMLDivElement>('#diff-view');

if (
  !diffInput ||
  !analyzeBtn ||
  !loadSampleBtn ||
  !loadFileBtn ||
  !clearBtn ||
  !fileInput ||
  !report ||
  !diffView
) {
  throw new Error('Afterbuild: expected DOM elements are missing from index.html');
}
