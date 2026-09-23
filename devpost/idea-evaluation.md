---
doc: idea-evaluation
status: informational
---
<!-- Not one of the required Skill Pack docs. Captures the Phase 6/7 ideation and the
     decision that produced scope.md. The scores below are a DESIGN AID for choosing what to
     build; they are NOT a prediction of judge scoring. -->

# Idea Evaluation — Build With AI: Basics

Three serious candidates were considered. At least one explores the seed (AFTERBUILD); the
other two solve genuinely different real problems. Each is small enough to finish in a
single concentrated build session. Judging criteria to optimize for: **design, potential
impact, innovation, presentation.**

---

## Candidate A — Afterbuild *(the seed, sharpened)*

- **Target user:** A developer who just used an AI agent to build or modify a codebase and
  now has working software they don't fully understand.
- **Real problem:** The "vibe-coding comprehension gap." The code runs; the mental model is
  missing. Existing tools explain code in the abstract; none start from *what the agent just
  changed* and turn it into something you can check yourself.
- **Input:** A unified git diff — pasted, uploaded as a `.diff`/`.patch` file, or a bundled
  sample.
- **Core transformation:** Deterministic, in-browser static analysis of the diff → a
  **Change Map** (files, functions, +/- lines touched) + a **Concept Inventory** (languages,
  new dependencies, and notable constructs — async, hooks, new routes, SQL, regex,
  auth-touching code) where **every detected concept cites the exact hunk/line that produced
  it**.
- **Output:** A single-page **Aftermath Brief**: what changed → concepts introduced (each
  traceable) → an ordered "what to understand" path → **5 quiz questions with answers,
  generated from the detected concepts**, each linked to its code location.
- **Wow moment:** Paste a real diff → a clean brief appears instantly with a quiz whose
  questions are *provably about your code* (click a concept → the exact diff hunk
  highlights). "The agent wrote this — here's the quiz on what it did."
- **Why AI is (optionally) useful:** The deterministic engine does the grounded extraction.
  An optional, off-by-default LLM pass only rewrites explanations/quiz phrasing in richer
  prose. **What is NOT AI:** the entire core — parsing, concept detection, traceability, and
  a templated brief + quiz — runs with zero API key and zero network.
- **End-to-end demo:** Fully demoable on a local dev server with a bundled sample diff.
- **Design / Impact / Innovation / Presentation potential:** High / High / High / High.
- **Implementation complexity:** Low–moderate (one page, pure functions, no backend).
- **External-API dependence:** None on the critical path (LLM is optional, flagged).
- **Expected failure modes:** Malformed/huge diffs; binary or minified files; a language the
  ruleset doesn't cover (degrade gracefully to file-level facts).
- **Time to MVP:** ~1 focused session. **Time to polish:** short.

## Candidate B — DependencyLens *(different problem, different user)*

- **Target user:** A developer deciding whether to add an npm package.
- **Real problem:** Dependency bloat and supply-chain risk — people `npm install` on vibes.
- **Input:** A package name (or a pasted `package.json`).
- **Core transformation:** Query the **public npm registry** (no key) → a plain-English risk
  card: last publish date, maintenance signal, install/transitive footprint, license,
  version spread, and named alternatives.
- **Output:** A "should you add this?" brief with green/amber/red signals.
- **Wow moment:** Type `left-pad` (or something heavy) → an instant risk verdict.
- **Why AI:** Mostly deterministic; LLM optional for the prose summary.
- **Design / Impact / Innovation / Presentation:** Good / Good / Moderate / Good.
- **Complexity:** Low. **External-API dependence:** npm registry (public, no key) — but
  needs network, weakening the offline-demo story.
- **Failure modes:** Registry rate limits/outage; sparse metadata.
- **Time to MVP:** ~1 session. **Polish:** short.
- **Verdict:** Solid and real, but leans on an external service and is closer to a data
  wrapper; the wow is moderate.

## Candidate C — TestFirst Coach *(different problem, different user)*

- **Target user:** A developer learning test-driven development.
- **Real problem:** People ship agent-written functions with no tests and don't know where
  to start.
- **Input:** A single function or small file pasted in.
- **Core transformation:** Parse the signature(s) → deterministically scaffold candidate
  test cases (empty, null, boundary, type-edge) as runnable stubs + explain why each matters.
- **Output:** A ready-to-run test file + rationale.
- **Wow moment:** Paste a function → a test file materializes.
- **Why AI:** LLM meaningfully improves case *quality*, so the deterministic-only mode is
  weaker; more API-dependent than A.
- **Design / Impact / Innovation / Presentation:** Good / Good / Moderate / Good.
- **Complexity:** Moderate (robust generation is deceptively hard).
- **Failure modes:** Correctly generating meaningful assertions without running the code.
- **Time to MVP:** ~1–1.5 sessions.
- **Verdict:** Useful, but the strong version depends on the LLM, hurting the offline-demo
  and reliability story.

---

## Decision Matrix (design aid — NOT predicted judge scores; 1–5, higher = better)

| Dimension        | A. Afterbuild | B. DependencyLens | C. TestFirst Coach |
|------------------|:---:|:---:|:---:|
| Design           | 5 | 4 | 4 |
| Potential impact | 5 | 4 | 4 |
| Innovation       | 5 | 3 | 3 |
| Presentation     | 5 | 4 | 4 |
| Finishability    | 5 | 5 | 3 |
| Demo clarity     | 5 | 4 | 4 |
| Reliability      | 5 | 3 | 3 |
| Cost             | 5 | 4 | 4 |
| Privacy          | 5 | 4 | 5 |
| Technical risk (5 = low risk) | 4 | 4 | 3 |
| **Total**        | **49** | **39** | **37** |

## Selection

- **SELECTED IDEA:** **Afterbuild.**
- **WHY:** It wins on every criterion that this competition rewards. It is genuinely
  distinctive (grounded, traceable *aftermath comprehension* for AI-generated code — not a
  chatbot, PDF summarizer, todo app, or RAG UI), it demos in one clean beat, it is
  local-first and offline (no judge API key), it is small enough to finish and polish in one
  session, and it maps directly onto the learner's real, repeated workflow — which makes the
  demo and the story authentic.
- **WHAT WE REJECTED:** DependencyLens and TestFirst Coach.
- **WHY:** DependencyLens depends on an external registry (weaker offline demo) and is closer
  to a data wrapper with a moderate wow. TestFirst Coach's strong version leans on the LLM,
  undercutting the deterministic-reliability and offline-demo advantages that make A safe to
  judge. Both are good; neither is *substantially stronger* than the seed, so — per the
  learner's instruction — the seed stands, sharpened.

**Selection principle applied:** win by finishing something distinctive, not by building the
largest system.
