# AFTERBUILD — Final narration (~263 words, ~125 s of product + optional 3 s end card)

Read as one developer showing another developer something they built. Conversational,
unhurried. Every sentence is drawn from `devpost-final.md` or `video-script.md`; the only
product-specific names spoken (login route, jwt.verify) are what is literally on screen.
Record one WAV per segment: `raw/narr01.wav` … `raw/narr07.wav`. Pause marks `[…]` are
silence, not words.

---

00:00–00:11  (S1 · CLIP 01 · 27 words)
AI coding agents help me ship working code faster than I can absorb every implementation
detail. I have the diff. [pause] But do I actually understand what changed?

00:11–00:27  (S2 · CLIP 02 · 38 words)
This is Afterbuild. I'll load a sample diff, the kind of change an agent hands you.
[click] It's a real multi-file diff: a TypeScript auth route and a Python script.
No API key, no account, nothing leaves the page.

00:27–00:43  (S3 · CLIP 03 · 31 words)
I press Analyze. [click] It runs entirely in the browser, and it's deterministic.
I get an aftermath brief: what changed, per file, and a concept inventory, the patterns
and technologies this diff introduced.

00:43–01:16  (S4 · CLIPS 04–06 · 67 words · has three internal pauses)
Here's the part that matters. Every concept points at a real line. I click the citation
next to Async/await, [click at ~00:48] and it jumps to the exact changed line and
highlights it: the new login route.
[hold silent until ~00:56]
Same for the auth token check: [click at ~01:01] the jwt.verify line.
[hold silent until ~01:08]
The explanation is connected to evidence, not a detached paragraph of generated prose.
If it isn't in your diff, Afterbuild doesn't claim it.

01:16–01:38  (S5 · CLIP 07 · 40 words)
From those detections it builds a learning path: what to understand first, because these
ideas are present in this specific diff, not a generic course. The project I just shipped
becomes the syllabus for what I need to understand next.

01:38–01:53  (S6 · CLIP 08 · 28 words)
Then a short quiz, built from the same evidence. [click] Each question cites the line it
came from, so I can check that I actually understood what was built.

01:53–02:05  (S7 · CLIP 09 · 32 words)
Afterbuild turns the code you just shipped with an AI agent into a traceable learning
path, so you keep the speed of coding agents without losing sight of what you actually
built.

02:05–02:08  (optional end card, silent)

---

Slot lengths for recording: S1 11 s · S2 16 s · S3 16 s · S4 33 s · S5 22 s · S6 15 s · S7 12 s.
If a take runs long, re-take it rather than speeding up; the pacing in S4 is the point.
