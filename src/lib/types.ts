// The data model. Mirrors devpost/spec.md > Data Model exactly for the
// core diff/concept/quiz/brief shapes; ChangeMap and LearningPathItem give
// concrete shape to the two fields spec.md left descriptive
// ("changeMap", "learningPath") to satisfy prd.md > What Changed (Change
// Map) and prd.md > What to Understand (learning path).
//
// Everything here is plain, in-memory, and immutable by convention —
// nothing persists (spec.md > Data Model > Lifecycle).

import type { Language } from './detectLanguage.js';

export type DiffLineKind = 'add' | 'del' | 'ctx';

export interface DiffLine {
  kind: DiffLineKind;
  text: string;
  /** Line number in the NEW file. Present for 'add' and 'ctx', absent for 'del'. */
  newLineNo?: number;
}

export interface Hunk {
  /** The raw `@@ -a,b +c,d @@ ...` header line. */
  header: string;
  lines: DiffLine[];
}

export interface FileDiff {
  /** Path in the new tree (or the old tree's path for a deleted file). */
  path: string;
  language: Language;
  added: number;
  removed: number;
  hunks: Hunk[];
  /** Names of functions/methods added or modified, where detectable. */
  functions: string[];
  /**
   * Set by `parseDiff` when concept detection should not run over this
   * file's added lines: `'binary'` for a recognized binary-file diff
   * section (no hunks to detect anything in), or `'too-large'` when the
   * file's added-line count exceeds `parseDiff.MAX_DETECT_LINES` (hunks are
   * still parsed and still rendered in the diff panel — only detection is
   * skipped). Undefined means detection ran normally. See
   * devpost/prd.md > States and Boundaries (Large/binary/minified).
   */
  detectionSkipped?: 'binary' | 'too-large';
}

export interface ParsedDiff {
  files: FileDiff[];
}

export interface Citation {
  file: string;
  line: number;
}

export interface Concept {
  id: string;
  label: string;
  /** One-sentence, plain-English "why it matters here." */
  why: string;
  /** Every concept must carry at least one citation — enforced by convention at emission time. */
  citations: Citation[];
}

export interface QuizQuestion {
  prompt: string;
  answer: string;
  ref: Citation;
}

export interface ChangeMapEntry {
  path: string;
  language: Language;
  added: number;
  removed: number;
  functions: string[];
  /** Mirrors `FileDiff.detectionSkipped` — carried into the change map so
   * the UI can show a "detection skipped" note per file. */
  detectionSkipped?: 'binary' | 'too-large';
}

export interface ChangeMap {
  files: ChangeMapEntry[];
  totalFiles: number;
  totalAdded: number;
  totalRemoved: number;
}

export interface LearningPathItem {
  conceptId: string;
  label: string;
  why: string;
}

export interface Brief {
  changeMap: ChangeMap;
  concepts: Concept[];
  learningPath: LearningPathItem[];
  quiz: QuizQuestion[];
}
