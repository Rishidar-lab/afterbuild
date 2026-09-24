# RECORD-NOW — Afterbuild demo video (do this in one take)

Target length: **105–130 seconds** (hard cap 3:00). English. Show the product actually working.

## Before you hit record
1. Terminal: `npm install` then `npm run dev`. Open the printed **http://localhost:5173**.
   (Or use the live demo once it's up — see README "Live demo".)
2. Browser: one clean window, ~125% zoom, no personal tabs/bookmarks visible.
3. Optional but strong: turn off Wi-Fi first, to *show* it works offline.
4. Have the page loaded with the input **empty** (press **Clear** if needed).

## The take (follow in order)
1. **(0–10s)** On the empty page, say the problem in your own words — e.g. "An AI agent
   just wrote me a diff. It runs. Do I actually understand what it did?"
2. **(10–25s)** Click **Load sample diff**. Scroll the textarea briefly so viewers see it's
   real multi-file code.
3. **(25–40s)** Click **Analyze**. The Aftermath Brief appears. Point at **What Changed**
   (files, +/- lines) and **Concept Inventory**.
4. **(40–75s) — THE WOW MOMENT.** Click a **citation badge** (e.g. next to `auth-token` or
   `api-route`). The diff panel opens and the **exact line highlights**. Do it for a second
   concept. Say: "Every claim points at a real line — nothing is made up."
5. **(75–100s)** Scroll to **What to Understand** (the learning path), then the **Quiz** —
   press **Show answer** on one question; note it cites a `file:line`.
6. **(100–115s)** Optionally paste a *different* small diff and Analyze once, to show it
   generalizes.
7. **(115–125s)** Close in your own words — suggested (echoes your tagline): "Afterbuild turns
   the code you just shipped with an AI agent into a traceable learning path — so you keep the
   speed of coding agents without losing sight of what you actually built."
8. Stop recording.

## After
- Upload to **YouTube or Vimeo**, set visibility **Public** (or Unlisted that anyone with
  the link can view — confirm it plays in a private browser window with no login).
- Keep it under 3:00.
- Put the URL in `submission/devpost-submission.md` and in the Devpost form.

## Never
- Don't show real private repos, secrets, tokens, or personal info — the bundled sample only.
- Don't fake footage. The demo must be the real app.
