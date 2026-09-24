# Competition Log — Afterbuild / Build With AI: Basics

A dated record of how and when the project was built during the submission period. Times are
UTC unless noted. Kept so there is evidence the project was created new during the window.

| When (UTC) | Event | Detail |
|---|---|---|
| 2026-09-24 | Devpost registration | Learner joined Build With AI: Basics on Devpost (owner action). |
| 2026-09-24 | Project folder created | New empty project folder `competitions/build-with-ai-basics` (`ls -la` = only `.`/`..`). |
| 2026-09-24 | Skill Pack installed | `npx skills add challengepost/learn-ai-basics --all -y` → 6 skills, exit 0. Ref recorded in `skills-lock.json` (source `challengepost/learn-ai-basics`, GitHub). |
| 2026-09-24 | Git initialized | Independent history; no source copied from any prior project. |
| 2026-09-24 | `1-start` | Learner profile written (`devpost/learner-profile.md`, gitignored). Fresh-folder check passed. |
| 2026-09-24 | `2-scope` (ideation) | 3 candidates evaluated (`devpost/idea-evaluation.md`); **Afterbuild** selected; `devpost/scope.md` drafted. |
| 2026-09-24 | `3-prd` | `devpost/prd.md` drafted. |
| 2026-09-24 | `4-spec` | `devpost/spec.md` drafted. |
| 2026-09-24 | Demo + build planning | `devpost/demo-storyboard.md`, `devpost/IMPLEMENTATION_PLAN.md` drafted. |
| 2026-09-24 | Planning gate committed | Commits 7e0c8d3, 9aaf899. Docs drafted pending learner review before `5-build`. |
| 2026-09-24 | Planning docs approved | Learner approved scope/PRD/spec → `status: approved`. Commit 9dd58c2. |
| 2026-09-24 | 5-build · Slice 1 (app boots) | Vite+TS+Vitest scaffold + static shell (header, diff textarea, disabled Analyze, base look-and-feel). Implemented by **Sonnet 5** (high effort). Build verified independently (`tsc --noEmit && vite build`, 67ms). Commit 1f6e8d4. Toolchain: vite@8.3.0, typescript@7.0.2, vitest@5.0.1. |
| 2026-09-24 | 5-build · Slice 2 (input handling) | Enable/disable Analyze, Load sample diff (`src/samples/sample.diff.ts`), .diff/.patch file load, Clear. Sonnet 5. Commit 3692b7b. |
| 2026-09-24 | 5-build · Slice 3 (diff parser) | Unified-diff parser + `types.ts`/`detectLanguage.ts`; tests-first for exact new-file line numbers across multiple hunks. 14 parser tests. Sonnet 5. Commit f148499. |
| 2026-09-24 | 5-build · Slice 4 (concept detection) | Rule-based grounded detector — every concept cites a real added line; no-hallucination enforced structurally. +25 tests. Sonnet 5 (engine survived a session interruption; kept + tested + committed). Commit becd77d. |
| 2026-09-24 | 5-build · Slice 5 (brief + quiz, end-to-end) | `buildBrief` (change map + concept inventory + learning path + exactly-5 quiz w/ grounded fallback, never fabricated) + `render.ts` + Analyze wired. jsdom integration test proves paste→brief renders. **64 tests total, build green — independently verified.** Sonnet 5. Commit 34429bd. |
| 2026-09-24 | 5-build · Slice 6 (traceability + polish) | Click a citation badge → opens diff panel, scrolls to & highlights the exact `data-file`/`data-line`; keyboard-accessible badges; look-and-feel polish; `prefers-reduced-motion` honored. +4 tests. Sonnet 5. Commit 1bba82f. |
| 2026-09-24 | 5-build · Slice 7 (edge states) | Binary-file + large-file (`MAX_DETECT_LINES=400`) detection-skip with honest notes; thin-diff + unparseable paths; `detectionSkipped` threaded parser→detector→render. +15 tests. Sonnet 5. Commit 4bdd5f3. |
| 2026-09-24 | 5-build · Slice 8 (demo polish + prep) | Final visual pass; accurate README run steps + honest status; `devpost/demo-checklist.md`; repo-hygiene scan (no secrets, learner-profile untracked); `npm test`/`build`/`preview` all green. **86 tests total, independently re-verified.** Sonnet 5. Commit 4d94e55. |
| 2026-09-24 | Public repo published | **https://github.com/Rishidar-lab/afterbuild** — PUBLIC, `main` pushed. Owner-authorized. Commit author/committer email masked to GitHub noreply first. Verified: reachable unauthenticated (HTTP 200), local == origin, and no secrets / `.env` / `dist` / `node_modules` / `learner-profile.md` on the remote. |
| 2026-09-24 | Final judge audit | Clean-clone reproducibility (`npm ci` 0 vulns → **86 tests** → build, all green); adversarial traceability trace across new-file/deleted/multi-hunk-jump/zero-count → **0 false citations**; **0** runtime network calls in `src`; determinism **5/5** identical briefs. First-use hint + `submission/` recording package added. |
| 2026-09-24 | Live demo deployed | GitHub Pages via Actions (Vite `base: './'`): **https://rishidar-lab.github.io/afterbuild/** — HTTP 200 unauthenticated, assets load. Optional extra (repo + video already satisfy the rules). |
| 2026-09-24 | 6-ship interview + submission copy | Owner authored all Devpost answers via the official `6-ship` interview (12 questions; grammar/clarity edits only, no facts added), tagline chosen by owner. Assembled to `submission/devpost-final.md`; video-narration package aligned. Claim check: every technical claim VERIFIED against the repo or is an OWNER_STATEMENT; React correctly excluded from "Built with" (app is vanilla TS/DOM). |
| 2026-09-24 | Submission copy re-assembled + video script | `submission/devpost-final.md` rebuilt in the requested section structure **from the owner's raw interview answers, verbatim** (151/151 prose sentences verified word-for-word; repetition removed by deleting whole sentences only; no agent wording). Claim audit PASS — one unsupported item ("React state" named as a detected concept) left out. `video-script.md` + `RECORD-NOW.md` rewritten: 7 shots, ~2:05, narration = owner's own sentences; live build re-verified (0 requests after Analyze, 7 concepts, 5 quiz questions, `authRoutes.ts:17` citation correct). Video still owner-gated. |

## Status
- [x] Learner reviews/approves scope, PRD, spec — approved 2026-09-24 (`status: approved`).
- [x] `5-build` slices 1–8 implemented (Sonnet 5, high) — **all 8 done** (1f6e8d4→4d94e55); 86 tests green, build clean.
- [x] Core journey verified on a clean run — 86 unit + jsdom tests green, `npm run build` clean, `npm run preview` served OK (independently re-run 2026-09-24).
- [x] Repo-hygiene scan — no secrets/keys tracked; `devpost/learner-profile.md` not tracked; no absolute home paths in tracked files.
- [x] Final judge audit — clean-clone reproducible (86 tests + build green), traceability 0 false citations, 0 runtime network calls, determinism 5/5.
- [x] Optional live demo deployed — https://rishidar-lab.github.io/afterbuild/ (GitHub Pages, Actions).

## Remaining — OWNER-gated submission steps (not yet done)
- [x] Public GitHub repository created + pushed — https://github.com/Rishidar-lab/afterbuild (PUBLIC, `main`; author email masked to GitHub noreply). 2026-09-24.
- [ ] 1–3 min demo video recorded (owner) and hosted publicly (YouTube/Vimeo).
- [~] Devpost copy authored by the owner via the `6-ship` interview → `submission/devpost-final.md` (grammar/clarity edits only, no facts added). Owner still pastes it into the Devpost form and completes the exit survey.
- [ ] Submission on Devpost (owner) before 2026-10-26 17:00 EDT.

## Note for the official `6-ship` skill
This build followed a custom slice plan (`devpost/IMPLEMENTATION_PLAN.md`), not the interactive `5-build` skill, so there is no `devpost/checklist.md` or `devpost/app-map.html` (the skill's learning wrap-up). These are learning artifacts, **not** Devpost submission-form requirements. If the owner wants to run the official `6-ship` skill end-to-end, a short honest `checklist.md` + code-tour/app-map can be generated on request.

## Provenance notes
- Skill Pack version/ref: recorded in `skills-lock.json` (per-skill `computedHash` +
  `source: challengepost/learn-ai-basics`).
- AI coding assistance used as permitted by contest rules (agents explicitly allowed).
- No prior-project source reused; see `COMPETITION_ORIGIN.md`.
- 2026-09-24: before publishing, all commits' author/committer email was masked to a GitHub
  noreply address (a history rewrite). Commit SHAs referenced in the table above are
  pre-rewrite and no longer resolve; run `git log` for the current SHAs. Commit messages are
  unchanged, so each entry is still identifiable by its message.
