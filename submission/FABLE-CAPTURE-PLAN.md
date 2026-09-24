# AFTERBUILD — Capture plan (genuine footage only)

Planning pass: 2026-09-24. Source of truth for every on-screen fact below: the bundled
sample run through the real pipeline (`parseDiff` → `detectConcepts` → `buildBrief`) at
commit `e87c39b`, plus the UI labels in `index.html` / `src/ui/render.ts`. Nothing here is
invented; if the live app shows something different, **record what the app shows** and
note the difference. Never change product code to match this plan.

Target final length: **~128 s** (125 s product + optional 3 s end card). Hard cap 180 s.

---

## 0. What the app actually shows (verified)

After **Load sample diff → Analyze**, the report has four `h2` sections, in this order:
**What Changed · Concept Inventory · What to Understand · Quiz**, followed by a collapsed
`<details>` panel titled **Rendered diff** (below the Quiz). Clicking any citation badge
opens that panel, smooth-scrolls to the line, and highlights it for **2.0 seconds**
(`HIGHLIGHT_DURATION_MS = 2000`). The panel stays open and stays scrolled after the fade.

**What Changed** summary line: `2 files changed, +29 / -0 lines.`
- `src/api/authRoutes.ts` (typescript) +15/-0
- `scripts/notify.py` (python) +14/-0 · Functions: send_alert

**Concept Inventory** (7 rows, each = label, one "why" sentence, then `Seen in:` badges):

| # | Label | Badges (`file:line`) |
|---|-------|----------------------|
| 1 | New dependency/import | `src/api/authRoutes.ts:2`, `scripts/notify.py:1` |
| 2 | Environment variable | `src/api/authRoutes.ts:5`, `scripts/notify.py:6` |
| 3 | Auth token/credential | `src/api/authRoutes.ts:5`, `:15`, `:18`, `:21`, `:24` |
| 4 | Regular expression | `src/api/authRoutes.ts:15` |
| 5 | Async/await | `src/api/authRoutes.ts:17`, `src/api/authRoutes.ts:24` |
| 6 | API route/handler | `src/api/authRoutes.ts:17` |
| 7 | Error handling | `scripts/notify.py:9`, `scripts/notify.py:12` |

Lines the wow clips land on (rendered diff shows `+` prefix, no line-number gutter):
- `src/api/authRoutes.ts:17` → `+router.post('/login', async (req, res) => {`
- `src/api/authRoutes.ts:24` → `+  const payload = await jwt.verify(match[1], JWT_SECRET);`
- `src/api/authRoutes.ts:5`  → `+const JWT_SECRET = process.env.JWT_SECRET;`

**What to Understand**: ordered list of 7 — New dependency/import, Environment variable,
Async/await, API route/handler, Auth token/credential, Regular expression, Error handling.

**Quiz**: 5 questions, each with a **Show answer** disclosure that reveals the answer plus
`Source: <badge>`. Question 3 reads: *"At src/api/authRoutes.ts:17, the code uses
async/await. What can happen here that can't happen in fully synchronous code?"*

Buttons in the input zone: **Analyze** (disabled until there is input) · **Load sample diff**
· **Load .diff file** · **Clear**. First-use hint under them: *"New here? Click Load sample
diff, then Analyze. Everything runs in your browser — no API key, no account, nothing
leaves this page."*

---

## 1. Pre-flight (do once, ~10 min)

This host (CYPHERDOME) is a tty session with no screen recorder. **Record on the desktop
machine you actually use.**

1. **Recorder**: OBS Studio (or any recorder). Canvas + output **1920×1080**, **60 fps**
   (30 acceptable), MKV or MP4, **no webcam, no system audio**. Narration is recorded
   separately (see §3), so the screen clips are silent.
2. **Browser**: Chromium/Chrome or Firefox, a clean profile or guest window, maximized,
   bookmarks bar hidden, no extensions visible, no personal tabs. Page zoom **125%**.
3. **URL**: `https://rishidar-lab.github.io/afterbuild/` (preferred; proves the deploy) or
   `http://localhost:5173` after `npm run dev`. A visible URL bar is fine and honest.
4. **Cursor**: default OS cursor, medium size. Move in slow straight lines. One click per
   action, never double-click, never drag-select.
5. **Verify the product before recording**: Load sample diff → Analyze. Confirm the
   summary line `2 files changed, +29 / -0 lines.` and the 7 concepts in §0. Click the
   `src/api/authRoutes.ts:17` badge next to **Async/await** once and confirm the Rendered
   diff panel opens and the `router.post('/login', async …` line flashes. Then **reload**.
6. **Reset recipe** (use between clips, any time state is unclear):
   `F5` → page is empty, panel collapsed → **Load sample diff** → **Analyze** → scroll to
   the clip's START STATE.
7. **File naming**: `submission/raw/clipNN-takeK.mkv` (e.g. `clip04-take2.mkv`). Or record
   one continuous take as `submission/raw/take-full.mkv`; `assemble-video.sh` cuts clips
   from any file by in/out time, so both ways work.
8. **Handles**: start recording ~3 s before the first action and stop ~3 s after the last
   frame you need. Record every clip at least twice; keep the cleanest take.
9. Optional, only if the recorder captures the OS tray: turn Wi-Fi off after the page has
   loaded (localhost or already-loaded live page) so the offline claim is visible.

---

## 2. Clips (record in this order; 9 product clips)

Timeline positions are where the clip lands in the final cut. "Keep" is the portion the
edit uses; record longer.

### CLIP 01 — HOOK  (final 00:00–00:11)
- **START STATE**: fresh page (after `F5`). Header + tagline, empty textarea, Analyze
  disabled, first-use hint visible. Cursor resting in the empty area right of the buttons.
- **ACTION**: nothing for 4 s. Then move the cursor slowly (~3 s) to rest just below the
  textarea. Nothing else. No clicks.
- **EXPECTED REAL RESULT**: the real empty Afterbuild page, unchanged.
- **RECORD**: 16 s. **Keep**: 11 s.
- **CROP/ZOOM**: full frame, no zoom.
- **NARRATION**: S1.

### CLIP 02 — LOAD SAMPLE DIFF  (final 00:11–00:27)
- **START STATE**: same as CLIP 01 (empty page). Cursor near **Load sample diff**.
- **ACTION**: at ~3 s click **Load sample diff**. Wait 1 s. Move the cursor into the
  textarea and scroll it with the wheel, one notch every ~1.5 s for ~6 s, so the
  `diff --git a/src/api/authRoutes.ts` header goes by and `diff --git a/scripts/notify.py`
  comes into view. Stop. Hold 2 s.
- **EXPECTED REAL RESULT**: textarea fills with the bundled two-file diff; **Analyze**
  becomes enabled.
- **RECORD**: 22 s. **Keep**: 16 s (from ~1 s before the click).
- **CROP/ZOOM**: full frame; edit may punch in ~115% on the textarea during the scroll.
- **NARRATION**: S2. Caption `REAL GIT DIFF`.

### CLIP 03 — ANALYZE / READOUT  (final 00:27–00:43)
- **START STATE**: sample loaded, page scrolled to top, cursor 2 cm from **Analyze**.
- **ACTION**: at ~3 s click **Analyze**. Hands off for 4 s. Then scroll down slowly
  (wheel, one notch per ~1.5 s) until the **Concept Inventory** heading sits in the top
  third with all 7 rows visible. Hold 4 s, cursor parked at the right margin.
- **EXPECTED REAL RESULT**: report appears. **What Changed** shows
  `2 files changed, +29 / -0 lines.` with the two files; **Concept Inventory** shows the
  7 rows with `Seen in:` badges.
- **RECORD**: 22 s. **Keep**: 16 s.
- **CROP/ZOOM**: full frame for the click and What Changed; punch in ~115% on Concept
  Inventory for the hold.
- **NARRATION**: S3. Caption `LOCAL + DETERMINISTIC`.

### CLIP 04 — WOW A: CONCEPT → EXACT LINE  (final 00:43–00:56)  ← PRIMARY WOW
- **START STATE**: after the reset recipe, scrolled so **Concept Inventory** fills the
  screen and the **Async/await** row is near vertical centre. Rendered diff panel
  **collapsed** (true after a fresh Analyze). Cursor parked at the right margin, level
  with the Async/await row.
- **ACTION**: move the cursor in one slow straight line (~2 s) onto the badge
  `src/api/authRoutes.ts:17` beside **Async/await**. Hover still for 1 s (hover style
  shows). Click **once**. Take your hand off the mouse. Optional: ~2.5 s after the click
  press **Enter** once (the badge keeps keyboard focus; Enter re-runs the highlight for
  another 2 s). Stay still until the recorder has 7 s after the click.
- **EXPECTED REAL RESULT**: the page smooth-scrolls down, **Rendered diff** opens, and the
  line `+router.post('/login', async (req, res) => {` under `src/api/authRoutes.ts` gets
  the highlight for 2 s, then fades while the panel stays open and in place.
- **RECORD**: 16 s. **Keep**: from 1 s before the click through 7 s after (≈ 13 s incl. hold).
- **CROP/ZOOM**: Beat A: punch in ~130% centred on the Async/await row so label + badges
  are large. Beat B: punch in ~130% centred on the highlighted line, with the
  `src/api/authRoutes.ts` file-path bar visible above it if the framing allows. The edit
  freezes a highlighted frame to extend the readable evidence to ~6 s (a hold on a real
  frame, not a synthetic one).
- **NARRATION**: S4 parts 1–2. Captions `CONCEPT → EXACT EVIDENCE` then
  `TRACEABLE TO THE REAL DIFF`.

### CLIP 05 — WOW B: SECOND CONCEPT  (final 00:56–01:08)
- **START STATE**: exactly the end of CLIP 04 (panel open, highlight faded). May be
  recorded continuously with CLIP 04.
- **ACTION**: scroll **up** (wheel) to Concept Inventory (~2 s). Move the cursor to the
  **Auth token/credential** row and onto its **last** badge `src/api/authRoutes.ts:24`.
  Hover 1 s. Click once. Hands off. Stay still 6 s.
- **EXPECTED REAL RESULT**: scroll back to the Rendered diff; the line
  `+  const payload = await jwt.verify(match[1], JWT_SECRET);` highlights for 2 s.
- **RECORD**: 16 s. **Keep**: 12 s.
- **CROP/ZOOM**: same two-beat punch-in as CLIP 04; hold ~5 s on the highlighted line.
- **NARRATION**: S4 part 3.

### CLIP 06 — WOW C: THE EVIDENCE PANEL, WIDE  (final 01:08–01:16)
- **START STATE**: end of CLIP 05 (Rendered diff open on `src/api/authRoutes.ts`).
- **ACTION**: scroll **down** slowly (one notch per ~2 s) through the rendered diff until
  the `scripts/notify.py` block enters the frame. Stop. Cursor parked at the right margin.
- **EXPECTED REAL RESULT**: both files' rendered diffs with their `+` lines and
  `@@ … @@` hunk headers.
- **RECORD**: 12 s. **Keep**: 8 s.
- **CROP/ZOOM**: full frame.
- **NARRATION**: S4 part 4.

### CLIP 07 — LEARNING PATH  (final 01:16–01:38)
- **START STATE**: report rendered; scrolled so the **What to Understand** heading is at the
  top of the viewport. Cursor parked at the right margin.
- **ACTION**: hold 3 s. Scroll slowly (one notch every ~2 s) through the 7 items. End with
  item 7 (Error handling) visible. Hold 3 s.
- **EXPECTED REAL RESULT**: the ordered list 1–7 (§0) with a one-line "why" under each.
- **RECORD**: 28 s. **Keep**: 22 s.
- **CROP/ZOOM**: full frame or a steady ~115% punch-in.
- **NARRATION**: S5. Caption `PERSONAL LEARNING PATH`.

### CLIP 08 — GROUNDED QUIZ  (final 01:38–01:53)
- **START STATE**: scrolled so the **Quiz** heading is at the top; questions 1–5 visible.
- **ACTION**: hold 2 s. Move the cursor to **Show answer** under question 3
  (*"At src/api/authRoutes.ts:17, the code uses async/await…"*). Click once. Hands off.
  Hold 7 s.
- **EXPECTED REAL RESULT**: the answer expands ("Execution can pause at the await…") with
  `Source: src/api/authRoutes.ts:17` below it.
- **RECORD**: 20 s. **Keep**: 15 s.
- **CROP/ZOOM**: punch in ~125% on question 3 after the click so the prompt, the answer
  and the `Source:` badge are all readable.
- **NARRATION**: S6. Caption `GROUNDED QUIZ`.

### CLIP 09 — CLOSE  (final 01:53–02:05)
- **START STATE**: report rendered. Scroll to the top of the report so **What Changed** and
  the top of **Concept Inventory** are visible together. Cursor parked bottom-right.
- **ACTION**: hold still 6 s. Then scroll down very slowly for 6 s (one notch per ~2 s).
- **EXPECTED REAL RESULT**: the real brief, calm and readable.
- **RECORD**: 18 s. **Keep**: 12 s.
- **CROP/ZOOM**: full frame.
- **NARRATION**: S7 (the tagline).

(Optional CLIP 10 is a 3 s plain end card generated by `assemble-video.sh`: dark
background, "Afterbuild" and the live URL. It is not product footage and is clearly a card.)

---

## 3. Narration recording (separately, ~5 min)

Read `FABLE-FINAL-NARRATION.md`. Record **one WAV per segment**: `submission/raw/narr01.wav`
… `narr07.wav`, 48 kHz mono if selectable, quiet room, phone or headset mic is fine.
Two takes each; keep the calmer one. Each segment must fit its slot (durations in the
narration file). S4 has internal pause marks that line up with the two highlights.

---

## 4. Check before you stop

- 9 product clips (or one continuous take covering all 9 states) in `submission/raw/`.
- 7 narration WAVs in `submission/raw/`.
- No personal tabs, secrets, or notifications in any frame.
- The Async/await → `src/api/authRoutes.ts:17` highlight is clearly visible in CLIP 04.

Then: `submission/assemble-video.sh init` → fill `raw/cuts.tsv` in/out times →
`submission/assemble-video.sh check` → `submission/assemble-video.sh build`.

---

## 5. Tiny fallback (only if multi-clip recording fails)

One continuous take following `RECORD-NOW.md` order with live narration, ~2 minutes, no
captions, no zooms. Then `submission/assemble-video.sh singletake raw/take-full.mkv <in> <out>`
trims, scales to 1080p, normalises audio, and writes `submission/afterbuild-demo.mp4`.
Still genuine footage; still under 3:00.
