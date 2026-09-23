# Competition Log — Afterbuild / Build With AI: Basics

A dated record of how and when the project was built during the submission period. Times are
UTC unless noted. Kept so there is evidence the project was created new during the window.

| When (UTC) | Event | Detail |
|---|---|---|
| 2026-09-24 | Devpost registration | Learner joined Build With AI: Basics on Devpost (owner action). |
| 2026-09-24 | Project folder created | `/home/parzival/competitions/build-with-ai-basics`, empty (`ls -la` = only `.`/`..`). |
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

## Checkpoints still ahead (not yet done)
- [x] Learner reviews/approves scope, PRD, spec — approved 2026-09-24 (`status: approved`).
- [ ] `5-build` slices 1–8 implemented (Sonnet 5, high) — **Slice 1/8 done (1f6e8d4)**; test runs recorded here from Slice 3 on.
- [ ] Core journey verified on a clean run; unit tests green.
- [ ] Public GitHub repository created (owner-authorized; secret + personal-context scan first).
- [ ] 1–3 min demo video recorded (owner) and hosted (YouTube/Vimeo, public).
- [ ] Devpost description + form fields written by the owner; exit survey completed.
- [ ] Submission on Devpost (owner) before 2026-10-26 17:00 EDT.

## Provenance notes
- Skill Pack version/ref: recorded in `skills-lock.json` (per-skill `computedHash` +
  `source: challengepost/learn-ai-basics`).
- AI coding assistance used as permitted by contest rules (agents explicitly allowed).
- No prior-project source reused; see `COMPETITION_ORIGIN.md`.
