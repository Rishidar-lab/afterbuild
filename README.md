# Afterbuild

**Paste a git diff → get an "aftermath brief": what your AI agent actually changed, the
concepts and technologies it introduced (each traceable to the exact line that triggered
it), and a 5-question quiz generated from *your* real changes.**

Afterbuild is a proof of concept built for the
[Build With AI: Basics](https://learn-ai-basics.devpost.com/) Devpost Learn hackathon.
It targets the "vibe-coding comprehension gap": after an AI agent builds or modifies a
codebase, you have code that runs but a shallow understanding of what changed and why.
Afterbuild turns a diff into a grounded, checkable learning artifact.

**Live demo:** https://rishidar-lab.github.io/afterbuild/ — click **Load sample diff → Analyze**, then click a citation badge to jump to the exact line. Runs entirely in your browser.

## Status

> **MVP implemented; passes 86 tests as of 2026-09-24; not yet deployed, no demo video
> recorded yet.** The core loop runs end to end in the local dev server and in the built
> `dist/` bundle: paste or load a diff, press Analyze, read the four-section Aftermath
> Brief, click a citation badge to scroll to and highlight the exact diff line it came from.
> `npm run build` completes with no type errors.

Run `npm test` yourself for the current, authoritative count — the number above is a
snapshot, not a promise it won't change as the suite grows.

## Run it

```bash
npm install
npm run dev       # local dev server — open the printed http://localhost:5173
npm test          # unit + jsdom integration tests (Vitest)
npm run build     # tsc --noEmit, then vite build -> dist/
npm run preview   # serve the dist/ build locally, to check the built bundle
```

No API key, no account, no network call — the entire analysis pipeline (parser, concept
detector, brief/quiz builder) runs in the browser. In the app: paste a unified `git diff`,
or click **Load sample diff** for a bundled example, or **Load .diff file** for a local
`.diff`/`.patch`; then press **Analyze**.

## Planning documents

The project follows the official Devpost Learn Skill Pack workflow. Planning artifacts live
in `devpost/`:

| Doc | Purpose |
|-----|---------|
| `devpost/idea-evaluation.md` | Three candidate ideas, decision matrix, selection rationale |
| `devpost/scope.md` | The heart of the idea and the proof-of-concept boundary |
| `devpost/prd.md` | Full product definition — every screen and behavior |
| `devpost/spec.md` | Technical blueprint — stack, components, data flow, file structure |
| `devpost/demo-storyboard.md` | The 120-second demo, designed before the build |
| `devpost/IMPLEMENTATION_PLAN.md` | Vertical build slices, each leaving the app runnable |

`devpost/learner-profile.md` holds personal learning context and is intentionally **not**
committed (see `.gitignore`).

## Design intent

- **Local-first and deterministic.** The core analysis (`src/lib/diff/parseDiff.ts`,
  `src/lib/analyze/*`) runs entirely in the browser with no API key and no network call —
  there is no `fetch`/`XMLHttpRequest`/`WebSocket` anywhere in `src/`, so a reviewer can try
  it fully offline.
- **No LLM step.** An optional, user-keyed LLM rewrite of the prose/quiz was considered in
  planning (`devpost/prd.md > Deferred From the PoC`) but was never built for this MVP —
  everything you see is rules and templates, not a model call.
- **Every claim is traceable.** Each detected concept and quiz question cites the exact
  `file:line` that produced it (enforced in the type system — see `src/lib/types.ts`), and
  clicking a citation badge scrolls to and highlights that exact line in the rendered diff
  panel.

## License

[MIT](LICENSE) © 2026 Rishidar D.
