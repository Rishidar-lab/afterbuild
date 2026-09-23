# Afterbuild

**Paste a git diff → get an "aftermath brief": what your AI agent actually changed, the
concepts and technologies it introduced (each traceable to the exact line that triggered
it), and a 5-question quiz generated from *your* real changes.**

Afterbuild is a proof of concept built for the
[Build With AI: Basics](https://learn-ai-basics.devpost.com/) Devpost Learn hackathon.
It targets the "vibe-coding comprehension gap": after an AI agent builds or modifies a
codebase, you have a working product but a shallow understanding of what changed and why.
Afterbuild turns a diff into a grounded, checkable learning artifact.

## Status

> **Planning gate complete — not yet implemented.** As of 2026-09-24 this repository
> contains the planning documents only (scope, PRD, spec, demo storyboard, implementation
> plan). No application code exists yet. Implementation begins in the next work session.

Nothing here is described as "working" or "tested" until code exists and tests pass; see
`devpost/` for the plan.

## Planning documents

The project follows the official Devpost Learn Skill Pack workflow. Planning artifacts live
in `devpost/`:

| Doc | Purpose |
|-----|---------|
| `devpost/idea-evaluation.md` | Three candidate ideas, decision matrix, selection rationale |
| `devpost/scope.md` | The heart of the idea and the proof-of-concept boundary |
| `devpost/prd.md` | Complete product definition — every screen and behavior |
| `devpost/spec.md` | Technical blueprint — stack, components, data flow, file structure |
| `devpost/demo-storyboard.md` | The 120-second demo, designed before the build |
| `devpost/IMPLEMENTATION_PLAN.md` | Vertical build slices, each leaving the app runnable |

`devpost/learner-profile.md` holds personal learning context and is intentionally **not**
committed (see `.gitignore`).

## Design intent (planned)

- **Local-first and deterministic by default.** The core analysis runs entirely in the
  browser with no API key and no network call, so a reviewer can try it offline.
- **Optional LLM enhancement** is off by default and clearly labeled; it never replaces the
  deterministic core and is not required for the demo.
- **Every claim is traceable.** Each detected concept cites the exact diff hunk that
  produced it — the anti-hallucination guarantee.

## License

[MIT](LICENSE) © 2026 Rishidar D.
