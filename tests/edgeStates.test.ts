// @vitest-environment jsdom
//
// Slice 7 — failure & edge states from devpost/prd.md > States and
// Boundaries not already covered by the existing suites:
//  - Thin diff (valid diff, 0-few concepts): end-to-end through
//    renderBrief, asserting the honest "no notable constructs" wording and
//    the exactly-5 grounded fallback quiz actually render.
//  - Large file: a file whose added-line count exceeds
//    parseDiff.MAX_DETECT_LINES gets concept detection skipped and a
//    "detection skipped (file too large)" change-map note, while a normal
//    file in the SAME diff is still fully analyzed.
//  - Binary file: a `Binary files ... differ` section and a
//    `GIT binary patch` section are both recognized as a binary FileDiff
//    (0 added/removed, no hunks), listed in the change map with a
//    "binary — detection skipped" note, never crashing detection/render.
//
// (Unparseable input is covered end-to-end through app.ts itself in
// tests/app.states.test.ts.)

import { describe, expect, it } from 'vitest';

import { buildBrief } from '../src/lib/analyze/buildBrief.js';
import { detectConcepts } from '../src/lib/analyze/detectConcepts.js';
import { MAX_DETECT_LINES, parseDiff } from '../src/lib/diff/parseDiff.js';
import { renderBrief, renderDiffView } from '../src/ui/render.js';

describe('edge state — thin diff (0 concepts) renders the honest fallback path end-to-end', () => {
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

  const report = document.createElement('section');
  renderBrief(report, brief);

  it('sanity: zero concepts detected (a .txt file matches no rule language)', () => {
    expect(concepts).toHaveLength(0);
  });

  it('renders the What Changed section with the one changed file', () => {
    const section = report.querySelector('section[aria-label="What Changed"]');
    expect(section?.textContent).toContain('notes.txt');
    expect(section?.textContent).toContain('1 file changed');
  });

  it('renders the honest "no notable constructs" Concept Inventory note, never inventing an item', () => {
    const section = report.querySelector('section[aria-label="Concept Inventory"]');
    expect(section?.querySelectorAll('.concept-entry')).toHaveLength(0);
    expect(section?.querySelector('.empty-note')?.textContent).toBe(
      'No notable constructs detected in added lines.',
    );
  });

  it('renders an empty What to Understand section rather than a fabricated learning path', () => {
    const section = report.querySelector('section[aria-label="What to Understand"]');
    expect(section?.querySelectorAll('.learning-path-entry')).toHaveLength(0);
    expect(section?.querySelector('.empty-note')).not.toBeNull();
  });

  it('still renders exactly 5 grounded fallback quiz questions with working Show-answer reveals', () => {
    const section = report.querySelector('section[aria-label="Quiz"]');
    const entries = section?.querySelectorAll('.quiz-entry') ?? [];
    expect(entries).toHaveLength(5);
    for (const entry of entries) {
      const badge = entry.querySelector('.quiz-source .citation-badge');
      expect(badge?.textContent).toMatch(/^notes\.txt:\d+$/);
    }
  });
});

describe('edge state — large file: detection skipped for it, other files in the same diff unaffected', () => {
  // One file with more added lines than MAX_DETECT_LINES (content that
  // WOULD trip several rules if detection ran on it), plus one small,
  // ordinary file that should be detected normally.
  const bigLines = Array.from(
    { length: MAX_DETECT_LINES + 1 },
    (_, i) => `+console.log('line ${i}'); // async await fs.readFileSync(x)`,
  );
  const diffText = [
    'diff --git a/src/big.ts b/src/big.ts',
    'index 1111111..2222222 100644',
    '--- a/src/big.ts',
    '+++ b/src/big.ts',
    `@@ -0,0 +1,${bigLines.length} @@`,
    ...bigLines,
    'diff --git a/src/small.ts b/src/small.ts',
    'index 3333333..4444444 100644',
    '--- a/src/small.ts',
    '+++ b/src/small.ts',
    '@@ -1,1 +1,2 @@',
    ' const x = 1;',
    '+async function delay() {}',
    '',
  ].join('\n');

  const parsed = parseDiff(diffText);

  it('flags the oversized file as detectionSkipped: "too-large", but still parses its hunks fully', () => {
    const big = parsed.files.find((f) => f.path === 'src/big.ts')!;
    expect(big.detectionSkipped).toBe('too-large');
    expect(big.added).toBe(MAX_DETECT_LINES + 1);
    expect(big.hunks[0]!.lines).toHaveLength(MAX_DETECT_LINES + 1);
  });

  it('leaves the small, ordinary file undetected-by-flag (detection ran normally)', () => {
    const small = parsed.files.find((f) => f.path === 'src/small.ts')!;
    expect(small.detectionSkipped).toBeUndefined();
  });

  const concepts = detectConcepts(parsed);

  it('detects concepts in the small file, but none whose citation lands in the oversized file', () => {
    const ids = concepts.map((c) => c.id);
    expect(ids).toContain('async-await');
    for (const concept of concepts) {
      for (const citation of concept.citations) {
        expect(citation.file).not.toBe('src/big.ts');
      }
    }
  });

  it('the change map shows a "too large" note for the big file and no note for the small file', () => {
    const brief = buildBrief(parsed, concepts);
    const report = document.createElement('section');
    renderBrief(report, brief);

    const entries = [...report.querySelectorAll('.change-map-entry')];
    const bigEntry = entries.find((e) => e.textContent?.includes('src/big.ts'))!;
    const smallEntry = entries.find((e) => e.textContent?.includes('src/small.ts'))!;

    expect(bigEntry.querySelector('.change-note')?.textContent).toBe('Detection skipped (file too large).');
    expect(smallEntry.querySelector('.change-note')).toBeNull();
  });
});

describe('edge state — binary file ("Binary files ... differ" form)', () => {
  const diffText = [
    'diff --git a/assets/logo.png b/assets/logo.png',
    'index 1111111..2222222 100644',
    'Binary files a/assets/logo.png and b/assets/logo.png differ',
    'diff --git a/src/util.ts b/src/util.ts',
    'index 3333333..4444444 100644',
    '--- a/src/util.ts',
    '+++ b/src/util.ts',
    '@@ -1,1 +1,2 @@',
    ' const x = 1;',
    '+async function delay() {}',
    '',
  ].join('\n');

  const parsed = parseDiff(diffText);

  it('represents the binary file as a flagged FileDiff (0 added/removed, no hunks) instead of dropping it', () => {
    expect(parsed.files).toHaveLength(2);
    const binary = parsed.files.find((f) => f.path === 'assets/logo.png');
    expect(binary).toBeDefined();
    expect(binary).toMatchObject({
      path: 'assets/logo.png',
      added: 0,
      removed: 0,
      hunks: [],
      functions: [],
      detectionSkipped: 'binary',
    });
  });

  it('never crashes concept detection, and still detects concepts in the real file', () => {
    const concepts = detectConcepts(parsed);
    expect(() => detectConcepts(parsed)).not.toThrow();
    expect(concepts.map((c) => c.id)).toContain('async-await');
    for (const concept of concepts) {
      for (const citation of concept.citations) {
        expect(citation.file).not.toBe('assets/logo.png');
      }
    }
  });

  it('the change map lists the binary file with a "binary — detection skipped" note', () => {
    const brief = buildBrief(parsed, detectConcepts(parsed));
    const report = document.createElement('section');
    renderBrief(report, brief);

    const entries = [...report.querySelectorAll('.change-map-entry')];
    const binaryEntry = entries.find((e) => e.textContent?.includes('assets/logo.png'))!;
    expect(binaryEntry.querySelector('.change-note')?.textContent).toBe('Binary — detection skipped.');
  });

  it('the rendered diff panel shows a "not rendered" note for the binary file, and never throws', () => {
    const diffView = document.createElement('div');
    expect(() => renderDiffView(diffView, parsed)).not.toThrow();
    const fileBlocks = [...diffView.querySelectorAll('.diff-file')];
    const binaryBlock = fileBlocks.find((b) => b.textContent?.includes('assets/logo.png'))!;
    expect(binaryBlock.querySelector('.empty-note')?.textContent).toContain('Binary file');
  });
});

describe('edge state — binary file ("GIT binary patch" form, path only available on the diff --git line)', () => {
  const diffText = [
    'diff --git a/assets/logo.png b/assets/logo.png',
    'index 1111111..2222222 100644',
    'GIT binary patch',
    'literal 128',
    'zcmZ|abcdEXAMPLEBASE85DATAxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
    '',
    'literal 0',
    'Hc$@<O00001',
    'diff --git a/src/util.ts b/src/util.ts',
    'index 3333333..4444444 100644',
    '--- a/src/util.ts',
    '+++ b/src/util.ts',
    '@@ -1,1 +1,2 @@',
    ' const x = 1;',
    '+async function delay() {}',
    '',
  ].join('\n');

  const parsed = parseDiff(diffText);

  it('recovers the path from the diff --git line and flags the file binary', () => {
    expect(parsed.files).toHaveLength(2);
    const binary = parsed.files.find((f) => f.path === 'assets/logo.png');
    expect(binary).toMatchObject({ added: 0, removed: 0, hunks: [], detectionSkipped: 'binary' });
  });

  it('does not swallow or corrupt the next file in the diff', () => {
    const util = parsed.files.find((f) => f.path === 'src/util.ts')!;
    expect(util.detectionSkipped).toBeUndefined();
    expect(detectConcepts(parsed).map((c) => c.id)).toContain('async-await');
  });
});
