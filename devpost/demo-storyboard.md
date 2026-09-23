---
doc: demo-storyboard
status: draft
---
<!-- The required demo video is 1–3 minutes; this storyboard targets ~120s. The product is
     designed backward from this: if the wow beat can't land by ~0:75, the product is too big.
     Per 6-ship, the learner writes the actual video narration/submission copy; this is a
     planning skeleton, not a script to be read verbatim. -->

# Afterbuild — 120-Second Demo Storyboard

**Recording setup:** local dev server (`npm run dev`), browser at ~125% zoom, single clean
window, the bundled **sample diff** used for a repeatable take. No API key, no network — shown
deliberately. Offline is a feature; consider disabling network before recording to prove it.

## 0:00–0:15 — The problem
- **On screen:** the empty Afterbuild page; the one-line description visible.
- **Point made:** "An AI agent just wrote a big diff for you. It runs — but do you actually
  understand what it did?" The comprehension gap, stated in one breath.
- **Goal:** a viewer who has vibe-coded nods within 10 seconds.

## 0:15–0:35 — The input
- **On screen:** click **Load sample diff** → a realistic multi-file TS/Python diff fills the
  textarea. Briefly scroll it so the viewer sees it's real code, not a toy.
- **Point made:** "Here's the change — the kind of thing an agent hands you." No setup, no
  login, nothing to configure.

## 0:35–0:75 — The core transformation (the heart)
- **On screen:** press **Analyze**. The Aftermath Brief renders instantly.
  - **What Changed** — files, +/− counts, functions touched.
  - **Concept Inventory** — the grounded list: new dependency, async/await, an API route, a
    regex, an auth-token line…
- **Point made:** "It read the diff and pulled out exactly what's in it — the concepts and
  technologies the agent introduced." Emphasize *fast* and *local*.

## 0:75–1:45 — The distinctive result / wow moment
- **On screen (the beat):** click a concept in the inventory → the **exact diff hunk
  highlights** in the rendered panel. Do this for two concepts. Then scroll to the **Quiz** and
  hit **Show answer** on two questions, each citing a `file:line`.
- **Point made:** "Every claim points at a real line — no hallucination — and the quiz is
  provably about *your* code, not generic trivia. That's the difference between a chatbot and
  a tool that actually parsed your change." This is the memorable frame.

## 1:45–2:00 — Impact / close
- **On screen:** paste a *different* small diff, Analyze once more to show it generalizes,
  land on the fresh brief.
- **Point made:** "Afterbuild turns 'the agent built it, I'll figure it out later' into a
  60-second, checkable understanding — offline, with no API key. Close the comprehension gap
  every time your agent hands you a diff."

## Demo guardrails
- If the wow (click-concept → hunk highlight, grounded quiz) isn't obvious by ~0:75, the
  brief is too cluttered — cut sections, not the traceability.
- Never show a real private repo or any secret; the bundled sample only.
- Keep total length within the form's stated limit (target ~2:00, hard-cap 3:00).
