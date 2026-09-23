---
doc: implementation-plan
status: draft
---
<!-- Vertical slices. Every slice must leave the project runnable. This is the build order
     5-build will follow; it is NOT executed in the planning-gate run. -->

# Afterbuild — Implementation Plan

Build order is vertical: each slice ends with the app running and something more working.
Recommended build model: **Sonnet 5, high effort** (bulk implementation, tests, UI). The
hardest correctness risk (multi-hunk line numbers) is front-loaded into Slice 3's tests.

## Slice 1 — App boots
- `npm create vite@latest` (vanilla-ts) into this folder; wire `index.html` with the input
  and (empty) report containers; `styles.css` with the base look-and-feel tokens.
- **Done when:** `npm run dev` serves a page with the heading, textarea, and disabled
  **Analyze** button. `npm run build` succeeds.
- **Runnable:** yes.

## Slice 2 — Input accepted
- `ui/app.ts`: enable/disable Analyze on input; **Load sample diff** (from
  `samples/sample.diff.ts`); **Load .diff file** via file picker; **Clear**.
- **Done when:** clicking Load sample fills the textarea and enables Analyze; Clear empties it.
- **Runnable:** yes.

## Slice 3 — Parser (correctness-critical) + tests first
- `lib/types.ts`; `lib/detectLanguage.ts`; `lib/diff/parseDiff.ts`.
- **Write `tests/parseDiff.test.ts` FIRST** against the bundled sample and a hand-checked
  multi-hunk case; assert exact new-file line numbers (the one genuine uncertainty from
  `spec.md > Decisions and Open Issues`).
- **Done when:** parser tests pass; `parseDiff(sample)` yields correct files/hunks/line
  numbers.
- **Runnable:** yes (parser unused by UI yet, but `npm test` green).

## Slice 4 — Concept detection with citations + tests
- `lib/analyze/rules.ts` (initial JS/TS + Python set) and `lib/analyze/detectConcepts.ts`.
- `tests/detectConcepts.test.ts`: each rule matches its positive case and abstains otherwise;
  **every emitted concept has a resolving citation**; no concept without a matched line.
- **Done when:** detection tests pass on the sample (several concepts, all cited).
- **Runnable:** yes.

## Slice 5 — Brief + quiz builder + core transformation wired end to end
- `lib/analyze/buildBrief.ts` (change map, inventory, learning path, exactly-5 quiz with
  grounded fallback) + `tests/buildBrief.test.ts` (always 5 questions; each references a real
  line; fallback path covered).
- `ui/render.ts` + `ui/app.ts`: Analyze runs `parseDiff → detectConcepts → buildBrief →
  render`. First real output on screen.
- **Done when:** pressing Analyze on the sample renders all four sections.
- **Runnable:** yes — this is the first end-to-end useful slice.

## Slice 6 — Result visualized coherently + traceability
- Rendered diff panel with `data-file`/`data-line` anchors; concept-click → highlight the
  hunk; quiz Show-answer reveals with `file:line`; apply the full look-and-feel.
- **Done when:** clicking a concept visibly highlights its source hunk; the page reads like a
  clean report.
- **Runnable:** yes — the demo's wow beat now works.

## Slice 7 — Failure & edge states
- Unparseable input message; thin-diff honest inventory + fallback quiz; large/binary/minified
  skip-with-note; empty/first-use hint. Add tests for unparseable + thin paths.
- **Done when:** each state from `prd.md > States and Boundaries` behaves as specified; no
  crashes.
- **Runnable:** yes.

## Slice 8 — Demo polish + submission material prep
- Tune the bundled sample so the demo triggers a satisfying concept spread; spacing/contrast
  polish; `prefers-reduced-motion`; final `README` run instructions; confirm `npm test`,
  `npm run build`, `npm run preview` all green.
- Prepare (not publish) submission scaffolding: repo hygiene pass (no secrets, no personal
  context, `learner-profile.md` gitignored), and a demo checklist. **The learner records the
  video and writes the Devpost description/answers themselves** (`6-ship`).
- **Done when:** the 120-second storyboard can be performed start to finish on a clean run.
- **Runnable:** yes — submission-ready PoC.

## Definition of done (whole PoC)
Setup works · Load sample → Analyze → four-section brief · every concept + quiz item cites a
real line · concept-click highlights its hunk · unparseable/thin/large states handled · all
unit tests pass · `npm run build` succeeds · README accurate · no secrets/personal data in
the repo · demo performable in ≤3 min.
