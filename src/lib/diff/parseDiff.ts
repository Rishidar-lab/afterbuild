// Unified-diff parser. Turns raw `git diff` text into a ParsedDiff: files →
// hunks → lines, with exact new-file line numbers on every 'add'/'ctx'
// line. See devpost/spec.md > Components > lib/diff/parseDiff.ts and
// devpost/spec.md > Decisions and Open Issues — this is the one place the
// parser is easy to get subtly wrong; citations in later slices depend on
// it, hence tests/parseDiff.test.ts was written first.
//
// Slice 7 (prd.md > States and Boundaries > Large/binary/minified) adds two
// more things this parser is responsible for flagging on the `FileDiff` it
// produces (see types.ts > FileDiff.detectionSkipped): recognizing a binary
// file's diff section (`Binary files a/... and b/... differ`, or a
// `GIT binary patch` block) instead of silently dropping that file, and
// capping concept detection for a file whose added-line count exceeds
// `MAX_DETECT_LINES` — the file is still fully parsed and its diff still
// renders; only detectConcepts skips it (see detectConcepts.ts).

import { detectLanguage } from '../detectLanguage.js';
import type { DiffLine, FileDiff, Hunk, ParsedDiff } from '../types.js';

const FILE_HEADER_RE = /^diff --git /;
// Fallback path source for a binary section with no ---/+++ or "Binary
// files" line to read a path from (the `GIT binary patch` form) — the
// `diff --git a/<old> b/<new>` header line itself always carries both.
const FILE_HEADER_PATHS_RE = /^diff --git a\/(.+) b\/(.+)$/;
const OLD_PATH_RE = /^--- (?:a\/(.+)|\/dev\/null)\s*$/;
const NEW_PATH_RE = /^\+\+\+ (?:b\/(.+)|\/dev\/null)\s*$/;
const HUNK_HEADER_RE = /^@@ -(\d+)(?:,(\d+))? \+(\d+)(?:,(\d+))? @@/;
const BINARY_DIFFER_RE = /^Binary files (?:a\/(.+)|\/dev\/null) and (?:b\/(.+)|\/dev\/null) differ\s*$/;
const GIT_BINARY_PATCH_RE = /^GIT binary patch\s*$/;

/**
 * Per-file cap on ADDED lines for concept detection (not for parsing/
 * rendering — a file over this cap is still parsed in full and its diff
 * still renders in the panel). Proportionate PoC value: large enough that
 * the bundled sample and any realistic hand-diff are unaffected, small
 * enough to build a test fixture that exceeds it without an unwieldy file.
 */
export const MAX_DETECT_LINES = 400;

// Matches common JS/TS/Python named-function shapes among ADDED lines only.
// Deliberately conservative — "where detectable" (prd.md > What Changed),
// never a guess dressed up as certainty.
const FUNCTION_NAME_PATTERNS: RegExp[] = [
  /^\s*(?:export\s+)?(?:default\s+)?(?:async\s+)?function\s+([A-Za-z_$][\w$]*)\s*\(/,
  /^\s*(?:export\s+)?const\s+([A-Za-z_$][\w$]*)\s*=\s*(?:async\s*)?\(?[^=]*\)?\s*=>/,
  /^\s*def\s+([A-Za-z_]\w*)\s*\(/,
];

/**
 * Parses unified `git diff` text into a ParsedDiff. Defensive by design:
 * text with no recognizable `diff --git`/`---`/`+++` structure yields
 * `{ files: [] }` rather than throwing — full "this doesn't look like a
 * diff" UX messaging is a later slice, but the parser itself never crashes
 * the app (spec.md > Important Failure Modes).
 */
export function parseDiff(diffText: string): ParsedDiff {
  const rawLines = diffText.split('\n').map((line) => line.replace(/\r$/, ''));
  const files: FileDiff[] = [];

  let i = 0;
  while (i < rawLines.length) {
    const line = rawLines[i]!;
    if (!FILE_HEADER_RE.test(line)) {
      i++;
      continue;
    }

    // The `diff --git a/<old> b/<new>` line always carries both paths —
    // kept only as a last-resort fallback (the `GIT binary patch` form has
    // no other line that names the path at all).
    const headerPathsMatch = FILE_HEADER_PATHS_RE.exec(line);
    const headerOldPath = headerPathsMatch?.[1] ?? null;
    const headerNewPath = headerPathsMatch?.[2] ?? null;

    // Found a file boundary. Skip forward through extended-header lines
    // (index/mode/similarity/rename/etc.) to find --- and +++ (or a binary
    // marker, which takes the place of a ---/+++/@@ triplet entirely).
    i++;
    let oldPath: string | null = null;
    let newPath: string | null = null;
    let isBinary = false;
    while (i < rawLines.length && !FILE_HEADER_RE.test(rawLines[i]!)) {
      const headerLine = rawLines[i]!;
      const oldMatch = OLD_PATH_RE.exec(headerLine);
      const newMatch = NEW_PATH_RE.exec(headerLine);
      if (oldMatch) {
        oldPath = oldMatch[1] ?? null; // null means /dev/null (new file)
        i++;
        continue;
      }
      if (newMatch) {
        newPath = newMatch[1] ?? null; // null means /dev/null (deleted file)
        i++;
        break; // +++ is always immediately followed by the first @@ (or another file)
      }
      const binaryMatch = BINARY_DIFFER_RE.exec(headerLine);
      if (binaryMatch) {
        oldPath = binaryMatch[1] ?? oldPath;
        newPath = binaryMatch[2] ?? newPath;
        isBinary = true;
        i++;
        break;
      }
      if (GIT_BINARY_PATCH_RE.test(headerLine)) {
        isBinary = true;
        i++;
        break; // The base85-encoded patch body follows; skipped below.
      }
      if (HUNK_HEADER_RE.test(headerLine)) {
        // No ---/+++ pair found (unusual) — bail on this file's headers
        // and let the hunk loop below pick up from here.
        break;
      }
      i++;
    }

    if (isBinary) {
      // Nothing after the marker (a base85 patch body, or nothing at all
      // for "Binary files ... differ") is renderable diff content — skip
      // straight to the next file boundary.
      while (i < rawLines.length && !FILE_HEADER_RE.test(rawLines[i]!)) {
        i++;
      }
      const binaryPath = newPath ?? oldPath ?? headerNewPath ?? headerOldPath;
      if (binaryPath) {
        files.push({
          path: binaryPath,
          language: detectLanguage(binaryPath),
          added: 0,
          removed: 0,
          hunks: [],
          functions: [],
          detectionSkipped: 'binary',
        });
      }
      continue;
    }

    const path = newPath ?? oldPath;
    if (!path) {
      // Couldn't determine a path at all (an unrecognized header shape) —
      // skip past this file's hunks defensively.
      while (i < rawLines.length && !FILE_HEADER_RE.test(rawLines[i]!)) {
        i++;
      }
      continue;
    }

    const file: FileDiff = {
      path,
      language: detectLanguage(path),
      added: 0,
      removed: 0,
      hunks: [],
      functions: [],
    };

    // Parse all hunks belonging to this file.
    while (i < rawLines.length && HUNK_HEADER_RE.test(rawLines[i]!)) {
      const headerMatch = HUNK_HEADER_RE.exec(rawLines[i]!)!;
      const oldLen = headerMatch[2] !== undefined ? Number(headerMatch[2]) : 1;
      const newStart = Number(headerMatch[3]);
      const newLen = headerMatch[4] !== undefined ? Number(headerMatch[4]) : 1;
      const hunk: Hunk = { header: rawLines[i]!, lines: [] };
      i++;

      let oldCount = 0;
      let newCount = 0;
      while (i < rawLines.length && (oldCount < oldLen || newCount < newLen)) {
        const raw = rawLines[i]!;
        if (raw.startsWith('\\')) {
          // "\ No newline at end of file" — not a content line.
          i++;
          continue;
        }

        let kind: DiffLine['kind'];
        let text: string;
        if (raw.startsWith('+')) {
          kind = 'add';
          text = raw.slice(1);
        } else if (raw.startsWith('-')) {
          kind = 'del';
          text = raw.slice(1);
        } else if (raw.startsWith(' ')) {
          kind = 'ctx';
          text = raw.slice(1);
        } else if (raw === '') {
          // Editors/terminals commonly strip trailing whitespace, turning a
          // real unified diff's blank context line (a single space) into a
          // fully empty line. Within an open hunk's budget, an empty raw
          // line unambiguously means "context line representing a blank
          // source line" — there is no other valid meaning here — so we
          // treat it the same as a space-prefixed context line rather than
          // rejecting real-world input on a whitespace technicality.
          kind = 'ctx';
          text = '';
        } else {
          // Anything else here means we've run past this hunk's real
          // content (malformed input). Stop consuming so the outer loop
          // can reinterpret this line as the next header.
          break;
        }

        const diffLine: DiffLine = { kind, text };
        if (kind === 'add' || kind === 'ctx') {
          diffLine.newLineNo = newStart + newCount;
          newCount++;
          if (kind === 'add') {
            file.added++;
          }
        }
        if (kind === 'del' || kind === 'ctx') {
          oldCount++;
          if (kind === 'del') {
            file.removed++;
          }
        }
        hunk.lines.push(diffLine);
        i++;
      }

      file.hunks.push(hunk);
    }

    file.functions = extractFunctionNames(file.hunks);
    if (file.added > MAX_DETECT_LINES) {
      // Still fully parsed and still rendered — only detectConcepts (which
      // respects this flag) skips it. See prd.md > States and Boundaries.
      file.detectionSkipped = 'too-large';
    }
    files.push(file);
  }

  return { files };
}

/** Scans ADDED lines only for a conservative set of named-function shapes. */
function extractFunctionNames(hunks: Hunk[]): string[] {
  const names = new Set<string>();
  for (const hunk of hunks) {
    for (const line of hunk.lines) {
      if (line.kind !== 'add') {
        continue;
      }
      for (const pattern of FUNCTION_NAME_PATTERNS) {
        const match = pattern.exec(line.text);
        if (match?.[1]) {
          names.add(match[1]);
          break;
        }
      }
    }
  }
  return [...names];
}
