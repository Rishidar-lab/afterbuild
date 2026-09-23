---
doc: prd
status: draft
---
<!-- status: draft until the learner reviews and approves. -->

# Afterbuild — Product Requirements

One line: a single-page web tool that turns a pasted git diff into a grounded "aftermath
brief" — change map, traceable concept inventory, and a 5-question quiz — for a developer who
just had an AI agent write code they don't fully understand.
Source: `scope.md > The Core Loop`, `scope.md > The Unique Kernel`.

## The Core Journey
Develops `scope.md > The Core Loop` and `scope.md > What "Working" Looks Like`.

1. The user lands on one page. A header states what Afterbuild does in a sentence; below it
   is a large diff input area with a **Load sample diff** control and an **Analyze** button.
2. They paste a unified git diff, or click **Load sample diff** to drop in a bundled example,
   or load a local `.diff`/`.patch` file.
3. They press **Analyze**. Analysis runs in-browser, synchronously, in well under a second
   for a normal diff.
4. The brief renders in place, in four clearly separated sections:
   **(a) What Changed**, **(b) Concept Inventory**, **(c) What to Understand**, **(d) Quiz**.
5. In the Concept Inventory, each concept shows a "seen in `file:line`" citation. Clicking a
   concept scrolls to / highlights the exact hunk in a rendered view of the diff.
6. The Quiz shows 5 questions; each has a **Show answer** reveal, and each answer names the
   file/line it came from.
7. Success: the user can read what their agent did and self-check it, then paste a new diff
   and repeat. No save, no login, no network.

## Screens and Layout
One screen, two logical zones that share the page:

- **Input zone** (top): heading + one-line description; a monospace `<textarea>` for the
  diff; buttons **Analyze**, **Load sample diff**, **Load .diff file**, **Clear**.
- **Report zone** (appears after Analyze, below the input): the four brief sections, plus a
  collapsible **Rendered diff** panel used for concept-to-hunk highlighting.

Movement between them is scroll only — it is one continuous page. No routing, no second page.

## Look and Feel
Carries `scope.md > Inspiration & Identity`. A calm diagnostic-readout aesthetic: readable
sans-serif for prose, monospace for code and citations, generous whitespace, a restrained
neutral palette with **one accent color** reserved for traceability (the "→ here" highlight
and active-concept state). Added lines green-tinted, removed lines red-tinted in the rendered
diff, at low saturation. Interface copy is plain and confident, never chatty. Must work
without any web fonts loaded (system font stack fallback). No dark-pattern motion; a single
subtle highlight animation on concept-click is enough.

## Features and Behavior

### Diff input
Implements the front of `scope.md > The Core Loop`.
- Accept a pasted unified diff of one or more files.
- **Load sample diff** injects a bundled, realistic multi-file sample (see States).
- **Load .diff file** reads a local `.diff`/`.patch` via a file picker (client-side only).
- **Analyze** is disabled until there is non-empty input.
- As a developer, I want to paste my agent's diff and get a brief, so that I understand what
  changed without reading every line myself.
  - [ ] Pasting a valid unified diff and pressing Analyze renders a non-empty brief.
  - [ ] Load sample diff populates the textarea and (optionally) auto-analyzes.
  - [ ] Analyze is disabled on empty input.

### What Changed (Change Map)
Implements `scope.md > What "Working" Looks Like` (the Change Map).
- Per file: path, detected language (from extension), lines added/removed, and the names of
  functions/methods added or modified where detectable.
- A one-line summary total (N files, +X/−Y lines).
- As a developer, I want a per-file change map, so that I can see the shape of the change at
  a glance.
  - [ ] Each changed file appears once with correct +/− counts matching the diff.
  - [ ] Files with detectable function changes list those function names.

### Concept Inventory (the kernel)
Implements `scope.md > The Unique Kernel`.
- A deduplicated list of concepts/technologies detected in the **added** lines: e.g. new
  dependency/import, async/await, Promise, React hook, new API route/handler, SQL, regex,
  environment variable use, auth-related token, file I/O, class/interface added.
- **Every concept cites at least one `file:line`** from the diff that triggered it.
- Clicking a concept highlights that hunk in the Rendered diff panel.
- As a developer, I want a grounded list of concepts my change introduced, so that I know
  what to learn — and can trust it, because each one points at real code.
  - [ ] Every listed concept has ≥1 citation resolving to a real added line in the diff.
  - [ ] No concept is listed that isn't supported by a matched line (no hallucinated items).
  - [ ] Clicking a concept visibly highlights its source hunk.

### What to Understand (learning path)
Implements `scope.md > Why This Matters to the Learner`.
- The detected concepts ordered into a short "learn these, in this order" path, each with a
  one-sentence plain-English "why it matters here."
- As a developer, I want an ordered short list of what to understand, so that I have a
  concrete next step rather than a vague "go read the code."
  - [ ] The path lists only concepts that appear in the Concept Inventory.

### Quiz
Implements `scope.md > What "Working" Looks Like` (the quiz beat).
- Exactly 5 questions, generated deterministically from the detected concepts (templated per
  concept type), each with a hidden answer and a `file:line` reference.
- If fewer than 5 distinct concepts are detected, fall back to generic-but-grounded questions
  about the changed files (still citing real lines); never fabricate a concept to fill a slot.
- As a developer, I want a short quiz about my actual change, so that I can check whether I
  really understand it.
  - [ ] Exactly 5 questions render, each with a working Show answer reveal.
  - [ ] Each question references a real location in the submitted diff.

## States and Boundaries
- **First use / empty** — input area empty, Analyze disabled, a one-line hint and the
  **Load sample diff** button visible so the tool is never a blank wall.
- **Normal result** — the four sections render; Rendered diff panel available.
- **Unparseable input** — if the text isn't a recognizable unified diff, show a plain inline
  message ("This doesn't look like a unified `git diff`. Try `git diff` output or Load
  sample diff.") — no crash, no partial garbage.
- **Thin diff** — a valid diff with few/no detectable concepts still produces a Change Map and
  grounded fallback quiz; the Concept Inventory shows an honest "no notable constructs
  detected in added lines" rather than inventing items.
- **Large/binary/minified** — cap analysis at a sane size; for binary or minified files, show
  file-level facts only and say detection was skipped for that file.
- **Persistence** — none. Nothing is stored; reload clears everything. (Stated so it is not
  "forgotten" later.)

## Product Decisions
- **Deterministic-first, LLM-optional** — the core must work offline with no API key, so a
  judge can run it; LLM is a labeled, off-by-default enhancement (deferred from the PoC).
  Reason: reliability and demoability under judging.
- **Paste-a-diff, not connect-a-repo** — proves the kernel with zero setup and no OAuth.
- **One page, no backend** — the analysis is pure functions; a server would only add failure
  modes and break the offline demo.
- **Traceability is non-negotiable** — a concept with no citation is a bug, not a feature.
- **Bundled sample diff ships with the app** — guarantees a clean, repeatable demo path.

## What We're Building
Diff input (paste + sample + file load) → deterministic parser → concept detector with
citations → the four-section Aftermath Brief (Change Map, Concept Inventory, What to
Understand, 5-question Quiz) → concept-to-hunk highlighting in a rendered diff panel →
empty/error/thin/large states. All client-side, no key, no network.

## Deferred From the POC
- **Optional LLM enhancement** of explanations/quiz prose (behind a user-supplied key).
- **Reading a whole local repo** or a live `git diff` stream (needs a local process/server).
- **Export** of the brief to Markdown/PDF.
- **A "rebuild challenge"** mode (regenerate a piece from memory).
- **More languages/detectors** beyond the initial curated set.

## Possible Later Enhancements
Team/shared briefs; a browser-extension entry point from a PR page; difficulty levels on the
quiz; spaced-repetition of missed questions.

## Non-Goals
- **Not an IDE, code editor, or linter** — it explains a change; it doesn't edit code.
- **Not a security scanner** — it may *flag* that auth/secret-looking code was touched, but it
  does not claim to audit it.
- **Not a general chatbot** — no freeform chat surface; the value is the grounded brief.
- **Not accounts/collaboration/payments** — out of scope by design (`scope.md > Explicitly
  Cut`).

## Open Questions
- **Which languages ship in the first detector set?** Proposed: JavaScript/TypeScript first
  (the learner's primary stack and the most common agent output), plus Python. Resolve in
  `4-spec`; does not block spec.
- **Auto-analyze on Load sample, or require an Analyze press?** Leaning auto-analyze for a
  snappier demo. Minor; can decide in build. Can wait.
