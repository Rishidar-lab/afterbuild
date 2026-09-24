---
doc: demo-checklist
status: draft
---
<!-- A recording checklist derived from devpost/demo-storyboard.md. This is a planning aid
     for the learner recording the demo — it does NOT write the Devpost submission
     description or video narration; the learner does that themselves (6-ship). -->

# Afterbuild — Demo Recording Checklist

## Before recording

- [ ] `npm install` then `npm run build` and `npm test` both succeed (no red output).
- [ ] Start the local dev server with `npm run dev` and open the printed
      `http://localhost:5173` — this is what gets recorded, per `spec.md > Where It Runs`.
- [ ] Consider disabling network on the recording machine (or just closing other tabs) to
      make "no network call" a visibly demonstrated fact, not just a claim.
- [ ] Browser window: one clean tab, no bookmarks bar clutter, no other extensions' popups.
      Zoom to ~125% so on-screen text reads clearly in the recording.
- [ ] Confirm the bundled sample diff still triggers a rich concept spread (spot-check: Load
      sample diff → Analyze → Concept Inventory shows several distinct concepts, not just
      one or two). If it doesn't, that's a build regression to fix before recording, not a
      demo problem to work around.
- [ ] Clear the textarea (Clear button) so the recording starts from the empty/first-use
      state, matching the storyboard's 0:00 beat.
- [ ] Have a second, different small diff ready to paste for the storyboard's closing beat
      (0:75-2:00) — anything short that parses cleanly and shows at least one concept.

## Beats to capture (from `demo-storyboard.md`, target ~120s, hard cap 3:00)

- [ ] **0:00-0:15 — The problem.** Empty page, tagline visible. State the comprehension gap
      in one breath.
- [ ] **0:15-0:35 — The input.** Click **Load sample diff**; briefly scroll the textarea so
      it visibly reads as a real multi-file diff, not a toy string.
- [ ] **0:35-0:75 — The core transformation.** Press **Analyze**. Let the brief render.
      Show **What Changed** (files, +/- counts, functions) and **Concept Inventory** (the
      grounded, cited list).
- [ ] **0:75-1:45 — The wow beat.** Click a citation badge in the Concept Inventory (or the
      quiz's Source badge) and show the diff panel open (if collapsed) and the exact line
      highlight. Do this for at least two different citations. Then open two quiz questions'
      **Show answer** reveals and point at their `file:line` source badges.
- [ ] **1:45-2:00 — Close.** Clear, paste the second prepared diff, Analyze once more to show
      it isn't hardcoded to the sample, land on the fresh brief.

## Guardrails

- [ ] Never show a real private repository, credentials, tokens, or any secret — the bundled
      sample diff (or another deliberately-prepared, secret-free diff) only.
- [ ] Do not narrate or caption anything as "production ready," "secure," "fully tested," or
      "deployed" — describe only what the recording actually shows (e.g. "N tests passing,"
      "runs locally with no network call").
- [ ] Keep the whole recording within the submission form's stated limit (target ~2:00, hard
      cap 3:00 per `demo-storyboard.md`).
- [ ] If the click-citation-to-highlight beat isn't clearly visible by ~0:75, trim a section
      of the brief rather than cutting the traceability beat — it's the differentiator.

## After recording

- [ ] Watch the recording back once before uploading: confirm the highlight is visible on
      screen (not too subtle at the recording's resolution/compression) and that no
      unintended window/tab/notification appears.
- [ ] The learner writes the actual Devpost submission description, category selection, and
      video narration/captions themselves — this checklist stops at "the recording is ready
      to upload."
