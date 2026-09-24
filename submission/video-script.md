# AFTERBUILD — demo video script (target 110–130 s, hard cap under 3:00)

Every spoken line below is taken word-for-word from your own 6-ship interview answers
(answer numbers in brackets are for you, not for the viewer; one line drops its opening words,
marked where it happens). Nothing is written for you —
if a line feels wrong out loud, say it your way. Short chunks: glance, look up, say it.

Record on the **live site**: https://rishidar-lab.github.io/afterbuild/

Verified on the live build (2026-09-24): Load sample diff → Analyze gives 4 sections
(What Changed · Concept Inventory · What to Understand · Quiz), 7 concepts, 5 quiz questions,
0 network requests after Analyze. **Async/await** cites `src/api/authRoutes.ts:17`
(the `router.post('/login', async …)` line). **Auth token/credential** cites
`src/api/authRoutes.ts:5`. The line highlight lasts ~2 seconds — click the badge again to
re-trigger it while you talk.

---

## Shot 1 — the problem

**TARGET TIME:** 0:00–0:12

**SCREEN ACTION:** Live site, empty input, the first-use hint visible. Cursor still.

**WHAT I SAY:**
> I use AI coding agents heavily because they let me move much faster than I could by manually writing every line from scratch. [#64]
>
> But I kept noticing a gap. [#64]

---

## Shot 2 — load a real sample Git diff

**TARGET TIME:** 0:12–0:27

**SCREEN ACTION:** Click **Load sample diff**. Scroll the textarea slowly so the multi-file diff
(`src/api/authRoutes.ts` and a Python file) is visibly real code.

**WHAT I SAY:**
> AFTERBUILD takes the actual Git diff from a coding session and turns it into something I can learn from instead of just something I have to trust. [#66]
>
> The whole thing runs deterministically and locally in the browser. [#66]

---

## Shot 3 — Analyze → diagnostic readout

**TARGET TIME:** 0:27–0:45

**SCREEN ACTION:** Click **Analyze**. Pause on **What Changed** (files, language, +/- lines,
functions), then move down to **Concept Inventory**.

**WHAT I SAY:**
> It first breaks down what really changed: which files were touched, what was added or removed, what languages are involved, and where the important changes are. [#66 — opening words "I paste or upload the diff, and" dropped]
>
> Then it looks at the changed code itself and detects the programming concepts that appear in those changes. [#66]

---

## Shot 4 — PRIMARY WOW MOMENT: concept → exact source evidence

**TARGET TIME:** 0:45–1:18

**SCREEN ACTION:**
1. Click the citation badge next to **Async/await** (`src/api/authRoutes.ts:17`). The diff
   opens and the `router.post('/login', async …)` line is outlined. **Hold still ~3 s.**
   Click the same badge once more so the outline is visible while you speak.
2. Click the badge next to **Auth token/credential** (`src/api/authRoutes.ts:5`). **Hold ~3 s.**

**WHAT I SAY:**
> If AFTERBUILD says a concept appeared, I can click that concept and see the exact file and changed line that caused it to be detected. [#67]
>
> *(click · hold — let the line be read)*
>
> The explanation is therefore connected to evidence instead of existing as a detached paragraph of generated prose. [#67]
>
> *(second concept · hold)*
>
> That traceability is the part I care about most. [#67]

---

## Shot 5 — learning path

**TARGET TIME:** 1:18–1:40

**SCREEN ACTION:** Scroll to **What to Understand**. Let the ordered list sit on screen.

**WHAT I SAY:**
> From there, it builds a learning path around the concepts that actually appeared in my work. [#66]
>
> So instead of giving me a generic course on TypeScript, React, Python, or whatever language I'm using, it tells me what I should understand because those ideas are present in this specific diff. [#66]

---

## Shot 6 — grounded quiz

**TARGET TIME:** 1:40–1:54

**SCREEN ACTION:** Scroll to **Quiz**. On a question that starts "At src/api/authRoutes.ts:…",
click **Show answer**.

**WHAT I SAY:**
> Then it gives me a small quiz based on the same evidence so I can check whether I actually understood what was built rather than just reading an explanation and assuming I understood it. [#66]

---

## Shot 7 — closing line

**TARGET TIME:** 1:54–2:05

**SCREEN ACTION:** Scroll back up to the top of the brief (or hold on the quiz). Stop recording
after the line.

**WHAT I SAY:**
> For me, AFTERBUILD is a bridge between "the agent helped me ship this" and "I genuinely understand what I shipped." [#64]

---

**Spoken total: 264 words ≈ 106 s at a relaxed pace, plus ~12 s of silent holds in Shot 4
→ about 2:05 end to end.** If you run long, drop the second sentence of Shot 5 first.
