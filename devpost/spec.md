---
doc: spec
status: approved
---
<!-- status: draft until the learner reviews and approves. -->

# Afterbuild — Technical Spec

## How This Works, In Plain Language
Afterbuild is a single web page that does all of its work in your browser. There is no
server and no account. You paste a **git diff** — the text that shows what lines an agent
added or removed. A small piece of code called a **parser** reads that text and turns it into
a tidy list: which files changed, and which lines were added or removed in each. A second
piece, the **concept detector**, looks only at the *added* lines and matches them against a
set of plain rules — "this line imports a new package," "this line uses `await`," "this adds
a React hook," "this looks like a SQL query." Every time a rule matches, it records the exact
file and line, so nothing is ever claimed without a place you can point to. From that grounded
list, a **brief builder** assembles the four sections you see and writes 5 quiz questions from
templates keyed to what was detected. Because it is all rules and templates running locally,
it works with no API key and no internet — which is exactly what a judge needs to try it. An
optional AI step that rewrites the wording more fluently is *deferred* and off by default.

The shape is deliberately small: parse → detect (with citations) → render. Anything more
elaborate (a backend, a database, live repo access) would add failure modes without proving
the idea.

## The Core Journey Through the System
Traces `prd.md > The Core Journey` through the pieces.

1. User pastes diff text into the `<textarea>` (or clicks **Load sample diff**, which reads a
   bundled string). → `ui/app.ts` holds it in a plain variable.
2. User presses **Analyze**. → `ui/app.ts` calls `parseDiff(text)`.
3. `parseDiff` returns a `ParsedDiff` (files → hunks → lines with line numbers). → passed to
   `detectConcepts(parsedDiff)`.
4. `detectConcepts` runs the rule set over added lines → returns `Concept[]`, each with
   `citations: {file, line}[]`.
5. `buildBrief(parsedDiff, concepts)` produces a `Brief` (change map, inventory, learning
   path, `QuizQuestion[]`). → returned to `ui/app.ts`.
6. `ui/render.ts` renders the `Brief` into the report zone and renders the diff into the
   collapsible panel with `data-file`/`data-line` anchors.
7. Clicking a concept calls a handler that finds the anchor and applies the highlight class.
   → user reads and self-tests. No persistence; reload resets.

## Stack
- **Language:** TypeScript 5.x — https://www.typescriptlang.org/ . Rationale: the learner's
  primary language; static types make the parser and detector safer and self-documenting.
- **Build/dev server:** Vite 5.x — https://vitejs.dev/ . Rationale: instant dev server for a
  clean demo, near-zero config, and `vite build` emits a static bundle that can be opened or
  optionally hosted later. Accepted tradeoff: one build tool dependency, which is standard.
- **UI:** **Vanilla TypeScript + DOM** (no framework). Rationale: one page, one interaction —
  a framework would add dependency weight and hide the logic. Keeps the analysis engine
  framework-agnostic and trivially testable. Tradeoff: a little manual DOM code.
- **Tests:** Vitest 1.x/2.x — https://vitest.dev/ . Rationale: pairs natively with Vite;
  fast unit tests over the pure parser/detector functions are the project's main "it works"
  evidence.
- **Styling:** hand-written CSS with a system-font stack (no web-font network dependency).
- **Runtime:** Node.js 22 (present: v22.22.0) for dev/build; the app itself runs in the
  browser.
- **Unverified — check early in the build:** exact current minor versions of Vite/Vitest and
  peer requirements. Pin whatever `npm create vite@latest` resolves and record it; nothing
  here depends on a specific minor.

## Where It Runs and How Someone Tries It
- **Runtime:** the browser. No API keys required for the core. No backend process.
- **Dev/demo:** `npm install` then `npm run dev` → open the printed `http://localhost:5173`.
  Record the demo against this local dev server with the bundled sample diff.
- **Build (optional):** `npm run build` → static files in `dist/`; `npm run preview` to serve
  them. Deployment is **optional** and does **not** replace the required demo video + public
  repo. If later hosted, a static host (e.g. Cloudflare Pages / GitHub Pages) works with zero
  server, but that is a `6-ship` decision, not a build requirement.
- **Submission needs both** a 1–3 min demo video and a public GitHub repo; a local recording
  is sufficient.

## Look and Feel
From `prd.md > Look and Feel` and `scope.md > Inspiration & Identity`, in build terms:
- System-font sans for prose (`-apple-system, Segoe UI, Roboto, ...`), a monospace stack for
  code/citations. No web fonts (offline-safe).
- Neutral background, one accent CSS custom property (`--accent`) used only for the
  active-concept highlight and the "→ here" affordance.
- Added/removed diff lines: low-saturation green/red backgrounds via CSS classes.
- Single subtle highlight transition on concept-click; respect `prefers-reduced-motion`.
- The stack imposes no styling limits; all of the above is plain CSS.

## Components
### `lib/diff/parseDiff.ts` — unified-diff parser
Turns raw diff text into `ParsedDiff`. Handles `diff --git` / `+++`/`---` headers and
`@@ -a,b +c,d @@` hunk headers, tracking real new-file line numbers for added lines.
PRD ref: `prd.md > Diff input`, `prd.md > What Changed (Change Map)`.

### `lib/analyze/detectConcepts.ts` — concept detector (the kernel)
Runs an ordered rule set over **added** lines only; returns deduplicated `Concept[]` with
`citations`. Rules are small, named, and individually testable. No rule may emit a concept
without a citation.
PRD ref: `prd.md > Concept Inventory (the kernel)`.

### `lib/analyze/rules.ts` — the rule set
Declarative array of `{ id, label, why, languages, test(line) }`. Initial set covers
JS/TS + Python constructs (see Data Model → concept ids). Adding a language = adding rules,
not touching the engine.
PRD ref: `prd.md > Concept Inventory`, `prd.md > Open Questions` (language set).

### `lib/analyze/buildBrief.ts` — brief + quiz builder
Assembles the `Brief`: change map (from `ParsedDiff`), inventory (from `Concept[]`), ordered
learning path, and exactly 5 `QuizQuestion`s from per-concept templates with grounded
fallback when concepts < 5.
PRD ref: `prd.md > What to Understand (learning path)`, `prd.md > Quiz`.

### `lib/detectLanguage.ts` — extension → language
Small pure map used by the parser/detector and change map.
PRD ref: `prd.md > What Changed (Change Map)`.

### `ui/app.ts` — controller
Wires DOM events (Analyze/Load sample/Load file/Clear), calls the pipeline, hands the `Brief`
to the renderer, manages empty/error state.
PRD ref: `prd.md > The Core Journey`, `prd.md > States and Boundaries`.

### `ui/render.ts` — view
Pure-ish rendering of a `Brief` into the report zone and the diff into the panel with
`data-file`/`data-line` anchors; the concept-click highlight handler.
PRD ref: all four `prd.md > Features and Behavior` sections.

### `samples/sample.diff.ts` — bundled demo diff
A realistic multi-file TS/Python diff exported as a string, chosen to trigger several
detectors for a strong demo.
PRD ref: `prd.md > States and Boundaries` (first-use/sample).

## Data Model
Plain in-memory TypeScript types; nothing persists.
- `ParsedDiff = { files: FileDiff[] }`
- `FileDiff = { path, language, added, removed, hunks: Hunk[], functions: string[] }`
- `Hunk = { header, lines: DiffLine[] }`
- `DiffLine = { kind: 'add'|'del'|'ctx', text, newLineNo?: number }`
- `Concept = { id, label, why, citations: { file: string; line: number }[] }`
- `QuizQuestion = { prompt, answer, ref: { file: string; line: number } }`
- `Brief = { changeMap, concepts: Concept[], learningPath, quiz: QuizQuestion[] }`
- **Concept ids (initial):** `new-dependency`, `async-await`, `promise`, `react-hook`,
  `api-route`, `sql`, `regex`, `env-var`, `auth-token`, `file-io`, `class-added`,
  `interface-added`, `error-handling`. Each maps to a `why` string and quiz template.
- **Lifecycle:** created on Analyze, discarded on Clear/reload. No storage, no
  navigate-away/return behavior (there is nowhere to return to).

## File Structure
```
build-with-ai-basics/
├── index.html               # single page: input zone + report zone containers
├── src/
│   ├── ui/
│   │   ├── app.ts           # controller: events → pipeline → render
│   │   └── render.ts        # DOM rendering + concept highlight
│   ├── lib/
│   │   ├── diff/
│   │   │   └── parseDiff.ts
│   │   ├── analyze/
│   │   │   ├── detectConcepts.ts
│   │   │   ├── rules.ts
│   │   │   └── buildBrief.ts
│   │   ├── detectLanguage.ts
│   │   └── types.ts         # the data-model types above
│   ├── samples/
│   │   └── sample.diff.ts
│   └── styles.css
├── tests/
│   ├── parseDiff.test.ts
│   ├── detectConcepts.test.ts
│   └── buildBrief.test.ts
├── devpost/                 # planning docs (this workspace)
├── package.json
├── tsconfig.json
├── vite.config.ts
├── LICENSE
└── README.md
```

## External Services and Dependencies
- **None on the critical path.** No APIs, no database, no hosting required. The deterministic
  core makes zero network calls.
- **Optional (deferred, off by default):** an LLM provider to rewrite prose/quiz, called from
  the client using a **user-supplied** key entered in the UI — never bundled, never required,
  not part of the demo. Exact provider/endpoint to be specified only if/when that deferred
  feature is built.
- **Dev dependencies only:** `vite`, `typescript`, `vitest` (+ their transitive deps) from
  the public npm registry.

## Important Failure Modes
- **Unparseable input** → inline message ("This doesn't look like a unified `git diff`…"),
  input preserved, no crash. Implements `prd.md > States and Boundaries` (unparseable).
- **Thin diff (few/no concepts)** → Change Map + grounded fallback quiz render; inventory
  honestly says "no notable constructs detected in added lines." Never invent a concept.
- **Huge / binary / minified file** → skip deep detection for that file above a size cap,
  show file-level facts and a "detection skipped" note; keeps the UI responsive.

## What Was Simplified and Why
- **Paste-a-diff instead of live repo/OAuth** — proves the kernel with zero setup. The fuller
  version would need a local process or GitHub app and would add auth + a failure mode.
- **Rule-based detection instead of a full AST/LLM** — deterministic, offline, testable, and
  enough to demonstrate grounded comprehension. A full parser per language would be far more
  work and no more convincing for a PoC; LLM-only would be unciteable and flaky under judging.
  *(Rules and templates are the honest engine — clearly not a semantic understanding of the
  code, and the brief will not overclaim.)*
- **No persistence** — there is one loop; storage would add complexity with no demo value.

## Decisions and Open Issues
- **Chosen:** Vite + vanilla TS + Vitest, client-only, deterministic core. Tradeoff accepted:
  manual DOM code in exchange for minimal dependencies and maximum demo reliability.
- **Chosen:** traceability is enforced in the type system — a `Concept`/`QuizQuestion`
  without a citation/ref is invalid by construction.
- **One genuine uncertainty (to verify early in `5-build`):** *robustly tracking correct
  new-file line numbers across multiple `@@` hunks in the unified-diff parser.* This is the
  one place the parser is easy to get subtly wrong, and citations depend on it. Mitigation:
  write `parseDiff.test.ts` first against the bundled sample and a hand-checked multi-hunk
  case, asserting exact line numbers, before building detection on top.
- **Open (from `prd.md > Open Questions`, non-blocking):** initial language set — proposed
  JS/TS + Python; auto-analyze on Load sample vs. explicit Analyze — leaning auto for demo
  snappiness. Both decidable during the build.
