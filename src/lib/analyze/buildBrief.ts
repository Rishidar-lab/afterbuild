// The brief + quiz builder. Assembles the four-section `Brief` from a
// `ParsedDiff` and the `Concept[]` already detected from it. See
// devpost/spec.md > Components > lib/analyze/buildBrief.ts and
// devpost/prd.md > What Changed / What to Understand / Quiz.
//
// HARD RULES (mirrors detectConcepts.ts's grounding discipline):
//  - The learning path only ever contains concept ids that are already in
//    the `concepts` array handed in — it never invents one.
//  - The quiz is always exactly 5 questions. Each comes from a per-concept
//    template (grounded in that concept's own citation) or, once concepts
//    run out, a fallback template grounded in a real line of an actually
//    changed file. No fallback ever pretends to be a detected concept.

import type {
  Brief,
  ChangeMap,
  ChangeMapEntry,
  Citation,
  Concept,
  FileDiff,
  LearningPathItem,
  ParsedDiff,
  QuizQuestion,
} from '../types.js';

/**
 * A suggested "learn these, in this order" order for the fixed concept id
 * set in rules.ts: foundational shape-of-the-code concepts first (what was
 * added, what it depends on), then control flow, then the
 * routes/auth/data-access surface, then easy-to-get-subtly-wrong syntax,
 * then I/O and error handling last (since those typically wrap everything
 * else). Any concept id detectConcepts ever returns that isn't listed here
 * (future rule additions) is still included — just appended after the
 * known ones rather than dropped.
 */
const CONCEPT_LEARNING_ORDER: readonly string[] = [
  'new-dependency',
  'env-var',
  'class-added',
  'interface-added',
  'async-await',
  'promise',
  'react-hook',
  'api-route',
  'auth-token',
  'sql',
  'regex',
  'file-io',
  'error-handling',
];

/** Orders a `Concept[]` by `CONCEPT_LEARNING_ORDER`, unknown ids last, stable otherwise. */
function orderConcepts(concepts: Concept[]): Concept[] {
  const remaining = new Map(concepts.map((c) => [c.id, c] as const));
  const ordered: Concept[] = [];
  for (const id of CONCEPT_LEARNING_ORDER) {
    const concept = remaining.get(id);
    if (concept) {
      ordered.push(concept);
      remaining.delete(id);
    }
  }
  ordered.push(...remaining.values());
  return ordered;
}

function buildChangeMap(parsed: ParsedDiff): ChangeMap {
  const files: ChangeMapEntry[] = parsed.files.map((f) => ({
    path: f.path,
    language: f.language,
    added: f.added,
    removed: f.removed,
    functions: f.functions,
  }));
  return {
    files,
    totalFiles: files.length,
    totalAdded: files.reduce((sum, f) => sum + f.added, 0),
    totalRemoved: files.reduce((sum, f) => sum + f.removed, 0),
  };
}

function buildLearningPath(concepts: Concept[]): LearningPathItem[] {
  return orderConcepts(concepts).map((c) => ({
    conceptId: c.id,
    label: c.label,
    why: c.why,
  }));
}

type QuizTemplate = (ref: Citation) => { prompt: string; answer: string };

// One template per concept id in rules.ts > Data Model (concept ids). Each
// question is answerable purely from the cited line plus general knowledge
// of the construct — never from information not implied by the diff.
const CONCEPT_QUIZ_TEMPLATES: Readonly<Record<string, QuizTemplate>> = {
  'new-dependency': (ref) => ({
    prompt: `At ${ref.file}:${ref.line}, a new dependency/import was added. What should you check before trusting it?`,
    answer:
      "That the package is intentional and expected (declared in package.json/requirements), is actively maintained, and that adding it doesn't introduce an unreviewed supply-chain risk.",
  }),
  'async-await': (ref) => ({
    prompt: `At ${ref.file}:${ref.line}, the code uses async/await. What can happen here that can't happen in fully synchronous code?`,
    answer:
      'Execution can pause at the await and yield control back to the caller/event loop while the asynchronous operation completes, so other code can run in between.',
  }),
  promise: (ref) => ({
    prompt: `At ${ref.file}:${ref.line}, a Promise is used directly. What has to be handled for this to be safe?`,
    answer:
      'Both outcomes — resolution and rejection. An unhandled rejection can crash the process or silently swallow an error.',
  }),
  'react-hook': (ref) => ({
    prompt: `At ${ref.file}:${ref.line}, a React hook is called. What does this give the component that a plain function call would not?`,
    answer:
      'Component-local state or a lifecycle-tied effect that React tracks across re-renders.',
  }),
  'api-route': (ref) => ({
    prompt: `At ${ref.file}:${ref.line}, a new API route/handler is defined. What is now part of the app's surface as a result?`,
    answer:
      "A new HTTP endpoint external callers can reach — its input validation and access control now matter.",
  }),
  sql: (ref) => ({
    prompt: `At ${ref.file}:${ref.line}, a SQL statement appears directly in code. What's the main risk to check for?`,
    answer:
      'SQL injection, if any part of the query is built from unsanitized input — check that values are parameterized, not string-concatenated.',
  }),
  regex: (ref) => ({
    prompt: `At ${ref.file}:${ref.line}, a regular expression is defined. Why does this deserve a second look?`,
    answer:
      'Regexes are compact and easy to get subtly wrong (anchoring, greedy matching, catastrophic backtracking) — worth tracing by hand against real inputs.',
  }),
  'env-var': (ref) => ({
    prompt: `At ${ref.file}:${ref.line}, the code reads an environment variable. What has to be true wherever this code runs?`,
    answer:
      'That variable must be set correctly in every environment (dev, CI, production) or the code will misbehave or fail.',
  }),
  'auth-token': (ref) => ({
    prompt: `At ${ref.file}:${ref.line}, the code touches an auth token/credential. Why does this line deserve extra scrutiny?`,
    answer:
      'A mistake here is a security bug, not just a functional one — e.g. a token logged, mishandled, or verified incorrectly.',
  }),
  'file-io': (ref) => ({
    prompt: `At ${ref.file}:${ref.line}, the code reads or writes a file. What kind of bug commonly comes from this?`,
    answer: 'Path handling and permission bugs — a wrong/unvalidated path, or the file not existing or being writable.',
  }),
  'class-added': (ref) => ({
    prompt: `At ${ref.file}:${ref.line}, a new class is defined. What does this introduce into the codebase?`,
    answer:
      'A new type/unit of behavior — its constructor, state, and methods are now something the rest of the code can depend on.',
  }),
  'interface-added': (ref) => ({
    prompt: `At ${ref.file}:${ref.line}, a new interface/type is defined. What does this pin down?`,
    answer: 'The expected shape of some data — which fields must exist and what type each one is.',
  }),
  'error-handling': (ref) => ({
    prompt: `At ${ref.file}:${ref.line}, this line is part of explicit error handling. What should you check here?`,
    answer:
      'That failures are actually handled the way you expect — not silently swallowed, and not left to crash somewhere unexpected.',
  }),
};

/** The first real ADDED line in `file`, or — for a file with no added lines
 * (e.g. a deletion-only change) — its first real context line. Either way
 * this is a genuine `file:line` location inside the submitted diff, never a
 * fabricated one. Returns `undefined` only if the file has no lines with a
 * new-file line number at all (should not happen for a file that appears in
 * the diff at all, but handled rather than assumed). */
function representativeCitation(file: FileDiff): Citation | undefined {
  for (const hunk of file.hunks) {
    for (const line of hunk.lines) {
      if (line.kind === 'add' && line.newLineNo !== undefined) {
        return { file: file.path, line: line.newLineNo };
      }
    }
  }
  for (const hunk of file.hunks) {
    for (const line of hunk.lines) {
      if (line.kind === 'ctx' && line.newLineNo !== undefined) {
        return { file: file.path, line: line.newLineNo };
      }
    }
  }
  return undefined;
}

type FallbackTemplate = (file: FileDiff) => { prompt: string; answer: string };

// Grounded-but-generic questions about a changed FILE (not a fabricated
// concept), used to fill quiz slots when fewer than 5 concepts were
// detected. Cycled across files/templates by buildFallbackQuestions.
const FALLBACK_TEMPLATES: readonly FallbackTemplate[] = [
  (file) => ({
    prompt: `${file.path} was changed in this diff. How many lines were added, and how many were removed?`,
    answer: `${file.added} added, ${file.removed} removed.`,
  }),
  (file) => ({
    prompt: `Based on its extension, what language is ${file.path} written in?`,
    answer: file.language === 'other' ? "The parser couldn't tell from the extension." : file.language,
  }),
  (file) => ({
    prompt:
      file.functions.length > 0
        ? `Which function(s) did the parser detect as added or modified in ${file.path}?`
        : `Did the parser detect a named function added or modified in ${file.path}?`,
    answer:
      file.functions.length > 0
        ? file.functions.join(', ')
        : "No function name matched the parser's conservative heuristics — that doesn't mean nothing changed, only that it didn't match a recognized function-declaration shape.",
  }),
  (file) => ({
    prompt: `What is the net line change (added minus removed) in ${file.path}?`,
    answer: `${file.added - file.removed >= 0 ? '+' : ''}${file.added - file.removed}`,
  }),
];

function buildFallbackQuestions(parsed: ParsedDiff, needed: number): QuizQuestion[] {
  const citable = parsed.files
    .map((file) => ({ file, citation: representativeCitation(file) }))
    .filter((entry): entry is { file: FileDiff; citation: Citation } => entry.citation !== undefined);

  const questions: QuizQuestion[] = [];
  if (citable.length === 0) {
    // Nothing groundable at all (e.g. an empty diff) — cannot honestly
    // produce a cited question, so we produce none rather than fabricate a
    // citation. buildQuiz's caller accepts a shorter list in this
    // degenerate case; it is documented as a known limitation, not silently
    // hidden.
    return questions;
  }

  for (let i = 0; i < needed; i++) {
    const { file, citation } = citable[i % citable.length]!;
    const template = FALLBACK_TEMPLATES[i % FALLBACK_TEMPLATES.length]!;
    const { prompt, answer } = template(file);
    questions.push({ prompt, answer, ref: citation });
  }
  return questions;
}

function buildQuiz(parsed: ParsedDiff, concepts: Concept[]): QuizQuestion[] {
  const questions: QuizQuestion[] = [];

  for (const concept of orderConcepts(concepts)) {
    if (questions.length >= 5) {
      break;
    }
    const citation = concept.citations[0];
    const template = CONCEPT_QUIZ_TEMPLATES[concept.id];
    // Every Concept detectConcepts ever produces already carries >=1
    // citation (its grounding invariant) and a known id, so this guard is
    // defensive rather than expected to trigger — but a slot is never
    // filled without both a real citation and a matching template.
    if (!citation || !template) {
      continue;
    }
    const { prompt, answer } = template(citation);
    questions.push({ prompt, answer, ref: citation });
  }

  if (questions.length < 5) {
    questions.push(...buildFallbackQuestions(parsed, 5 - questions.length));
  }

  return questions.slice(0, 5);
}

/**
 * Assembles the four-section `Brief` from a parsed diff and the concepts
 * already detected from it. Pure function: no I/O, no randomness, no clock.
 */
export function buildBrief(parsed: ParsedDiff, concepts: Concept[]): Brief {
  return {
    changeMap: buildChangeMap(parsed),
    concepts,
    learningPath: buildLearningPath(concepts),
    quiz: buildQuiz(parsed, concepts),
  };
}
