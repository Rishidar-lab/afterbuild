# RECORD-NOW — AFTERBUILD demo video

One clean continuous take of the **live site**, about **2:00** (target 110–130 s, must be under 3:00).
What to say and when: [`video-script.md`](video-script.md) — all lines are your own interview words.

> `FABLE-*.md` + `assemble-video.sh` in this folder describe a separate clip-by-clip assembly
> workflow. This file is the one-take plan. Use one or the other, not a mix.

## Pre-recording checklist

- [ ] Use the **live GitHub Pages build**: https://rishidar-lab.github.io/afterbuild/ (not localhost).
- [ ] **Verify the sample immediately before recording:** Load sample diff → Analyze → you see
      What Changed · Concept Inventory · What to Understand · Quiz, 7 concepts, 5 questions;
      the **Async/await** badge reads `src/api/authRoutes.ts:17` and clicking it outlines the
      `router.post('/login', async …)` line. Then press **Clear** and reload.
- [ ] Browser **notifications off** (OS "Do not disturb" on).
- [ ] **Other tabs and private content closed** — one window, one tab.
- [ ] **No terminal visible.**
- [ ] **No email visible** (no mail client, no inbox tab, no account avatar menus open).
- [ ] **Browser zoom chosen for readability** — try 125%; the citation text and the outlined diff
      line must be readable in the recording, not just on your screen.
- [ ] **Cursor visible** in the recorder settings (and move it deliberately, not in circles).
- [ ] **Microphone checked** — record 5 seconds, play it back, check level and background noise.
- [ ] **No copyrighted music.** Voice only (or silence).
- [ ] **One clean continuous take preferred.** If a take goes wrong, restart the whole take.
- [ ] **Citation readable for several seconds:** the line outline lasts ~2 s, so after clicking a
      badge, hold still and click the same badge again while you speak.
- [ ] **Total under 3 minutes** — check the file length before uploading.

## The take

| Time | Screen | Say (from `video-script.md`) |
|---|---|---|
| 0:00–0:12 | Empty page, hint visible | Shot 1 — the problem |
| 0:12–0:27 | **Load sample diff**, scroll the diff | Shot 2 — what it does, runs locally |
| 0:27–0:45 | **Analyze**, What Changed → Concept Inventory | Shot 3 — change map, concepts |
| 0:45–1:18 | Click **Async/await** badge → hold → re-click; click **Auth token/credential** badge → hold | Shot 4 — **the wow moment** |
| 1:18–1:40 | **What to Understand** | Shot 5 — learning path |
| 1:40–1:54 | **Quiz** → **Show answer** | Shot 6 — grounded quiz |
| 1:54–2:05 | Hold, then stop | Shot 7 — closing line |

## After recording

1. Watch it once end to end: is every citation readable, is anything private on screen?
2. Upload to **YouTube or Vimeo** as **Public** (or Unlisted), then open the link in a private
   window with no login to confirm it plays.
3. Give me the URL — I'll put it into `devpost-final.md` (Links → Video) and check it plays.

## Never

- Don't show real private repositories, tokens, or personal information — the bundled sample only.
- Don't fake or stage footage. The demo must be the real app working.
