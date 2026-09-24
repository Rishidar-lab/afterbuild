# AFTERBUILD — Edit plan

One direction, no alternatives: **hard cuts, static punch-ins, a few captions, no music.**
The product carries the video; the edit only makes it readable. Output 1920×1080, 30 fps,
H.264, AAC. Everything below is implemented by `submission/assemble-video.sh`; the tables
map 1:1 onto its `raw/cuts.tsv` and `raw/narration.tsv`.

## 1. Clip order and timeline

| Pos | Clip | Timeline | Dur | Trim (what to keep) | Framing | Hold |
|-----|------|----------|-----|---------------------|---------|------|
| 1 | 01 HOOK | 00:00–00:11 | 11 s | 11 s of the still page, cursor barely moving | full frame | none |
| 2 | 02 LOAD | 00:11–00:27 | 16 s | from 1 s before the **Load sample diff** click to the end of the textarea scroll | full; punch-in 115% on the textarea from +4 s to +14 s | none |
| 3 | 03 ANALYZE | 00:27–00:43 | 16 s | from 1 s before the **Analyze** click; end on Concept Inventory held | full for click + What Changed; punch-in 115% on Concept Inventory for the last 6 s | none |
| 4 | 04 WOW A | 00:43–00:56 | 13 s | Beat A: 1 s before the click to the click (≈ 4 s incl. cursor approach). Beat B: the scroll + highlight; **cut the clip at the frame where the highlight is fully on** | Beat A: punch-in 130% on the Async/await row. Beat B: punch-in 130% on the highlighted line | **freeze the last (highlighted) frame ≈ 5–6 s** so the evidence stays readable for ~7 s total |
| 5 | 05 WOW B | 00:56–01:08 | 12 s | scroll-up + approach (≈ 4 s) → click → highlight; cut at the fully-on highlight | same two punch-ins | freeze ≈ 4–5 s |
| 6 | 06 WOW C | 01:08–01:16 | 8 s | slow scroll through the rendered diff into `scripts/notify.py` | full frame | none |
| 7 | 07 PATH | 01:16–01:38 | 22 s | 3 s still, slow scroll through items 1–7, 3 s still | full or steady 115% | none |
| 8 | 08 QUIZ | 01:38–01:53 | 15 s | 2 s still → **Show answer** click → answer + `Source:` badge held | punch-in 125% on question 3 after the click | none (real hold) |
| 9 | 09 CLOSE | 01:53–02:05 | 12 s | still brief, then very slow scroll | full frame | none |
| 10 | END CARD (optional) | 02:05–02:08 | 3 s | generated plain card: "Afterbuild" + live URL | n/a | n/a |

Total: **125 s** without the card, **128 s** with it. Maximum allowed is 180 s.

The freeze in positions 4 and 5 is a hold on a genuine recorded frame (`tpad` clone of
the last frame). It is the only way to show the 2-second highlight for the 5–8 s a judge
needs, without touching product code. If the owner pressed Enter to re-trigger the
highlight during recording, a shorter freeze (or none) is fine.

## 2. Punch-ins (zoom)

- Static crops, cut in and cut out on hard cuts. No animated zoom, no ease curves.
- 130% = crop the source to 1477×831 and scale back to 1920×1080. 125% = 1536×864.
  115% = 1670×939. Centre the crop on the element named in §1; keep the crop fully
  inside the frame. Measure coordinates from a still: `assemble-video.sh frame <file> <t>`.
- Every wow crop must keep the badge text `src/api/authRoutes.ts:17` (Beat A) and the
  full highlighted line (Beat B) inside the frame with margin. If in doubt, crop less.

## 3. Captions (burned in, bottom-left, small, dark box, no animation)

| Caption | Clip | Shows (rel. to clip start) | Why |
|---------|------|----------------------------|-----|
| `REAL GIT DIFF` | 02 | +2.0 s → +7.0 s | while the textarea fills and scrolls |
| `LOCAL + DETERMINISTIC` | 03 | +2.0 s → +7.0 s | over What Changed |
| `CONCEPT → EXACT EVIDENCE` | 04 | +0.5 s → +4.5 s | during the cursor approach and click |
| `TRACEABLE TO THE REAL DIFF` | 04 | +6.0 s → +12.5 s | during the frozen highlighted frame |
| `PERSONAL LEARNING PATH` | 07 | +2.0 s → +7.0 s | over the ordered list |
| `GROUNDED QUIZ` | 08 | +2.0 s → +7.0 s | over the quiz before/at the click |

Six captions total; none cover the app's content area (bottom-left corner over page
margin). Font DejaVu Sans Bold 40 px, white on 55% black box. No title card at the start.

## 4. Audio

- Narration only. No music, no sound effects, no click sounds.
- Each segment WAV is placed at its timeline start (S1 0:00, S2 0:11, S3 0:27, S4 0:43,
  S5 1:16, S6 1:38, S7 1:53), mixed over silence, then loudness-normalised to
  −16 LUFS / −1.5 dBTP. Room tone gaps are left as silence; no crossfades needed because
  each segment starts and ends on silence.
- If a segment overruns its slot, the script warns; re-record that segment rather than
  shifting the cut.

## 5. Transitions

- Hard cuts everywhere, including between the two beats inside the wow clips.
- No dissolves, no wipes, no motion graphics, no glitch, no stock footage, no typing
  animation. The only "effect" is the frame hold in §1.

## 6. End card (optional)

3 s, background `#111111`, centred text: line 1 "Afterbuild", line 2
`rishidar-lab.github.io/afterbuild`. Silent. Enable with `END_CARD=1` when building.
Skip it if the final runtime would matter more than the URL on screen.

## 7. Acceptance check on the rendered file

1. Duration between 120 s and 135 s (script fails above 180 s).
2. At ~00:50 a single frame shows: `Rendered diff` panel open, `src/api/authRoutes.ts`
   path bar, and the highlighted `+router.post('/login', async (req, res) => {` line.
3. At ~00:45 a single frame shows the **Async/await** label with its
   `src/api/authRoutes.ts:17` badge under the cursor.
4. Narration audible and level throughout; no clipping.
5. Nothing on screen that was not recorded from the real app, except the six captions and
   the optional plain end card.
