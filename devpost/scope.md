---
doc: scope
status: draft
---
<!-- status: draft until the learner reviews and approves ("looks good" counts), then flips
     to approved so 3-prd/5-build can proceed. -->

# Afterbuild

One line: paste the git diff your AI agent produced and get back a grounded "aftermath
brief" — what changed, the concepts it introduced (each traceable to the exact line), and a
5-question quiz generated from *your* real code.

## The Unique Kernel
**Grounded, traceable aftermath comprehension for AI-generated changes.** Afterbuild doesn't
"explain some code" in the abstract — it starts from the *diff the agent just wrote*, detects
the real concepts and technologies inside it deterministically, and generates a quiz whose
every question is tied to a specific hunk you can click and see. The anti-hallucination
guarantee — *no claim without a line to back it* — is the thing that, if deleted, would make
this just another AI code chat. That is the kernel.

## Who It's For
A developer — concretely, someone like Rishi — who just told an AI agent "add auth" or
"refactor the payment flow," watched it produce a working diff, and now has software they can
run but not explain. Today they either shrug and move on (accruing comprehension debt) or
hand-write a "what did this actually do?" note. Afterbuild does that note for them, and turns
it into a self-check.

## The Core Loop
They open Afterbuild, paste (or load) a diff, and press **Analyze**. In under a second they
see the Aftermath Brief: what changed, the concepts introduced, and a quiz. They click a
concept and the exact diff hunk lights up. They read, they self-test, they close it knowing
what their agent did. They come back every time an agent hands them a diff they don't fully
understand.

## Inspiration & Identity
A calm, confident **"report" aesthetic** — think a clean diagnostic readout, not a chat
bubble. Monospace for code, a readable sans for prose, generous whitespace, a restrained
palette with one accent for "traceable → here." It should feel like a tool that *knows* your
code, because it actually parsed it. References in spirit: the clarity of a good test
reporter and the scannability of a well-designed diff viewer. (No specific URLs required;
`3-prd` fills visual gaps in 1–2 questions.)

## Why This Matters to the Learner
In his words, after an agent builds something he still needs to understand "what changed,
what I personally need to learn, how to reproduce important pieces manually." He already
writes aftermath learning notes by hand. Afterbuild productizes his own habit — which is why
the demo is authentic and the motivation is real.

## What "Working" Looks Like
On a screen, in under a minute: load a sample diff → press Analyze → a coherent brief renders
with a real Change Map, a traceable Concept Inventory, and 5 answerable quiz questions →
clicking a concept highlights its source hunk. The **"oh, that's cool" beat**: the quiz is
provably about *this* diff, and the tool ran it all locally with no API key.

## The POC Boundary
In: one page; diff input (paste + sample, and a file load if cheap); a deterministic parser +
concept detector for a small set of common languages/constructs; the rendered brief with
traceability; a templated 5-question quiz with answers. That is everything needed to prove
the kernel and the loop.

## Later
Optional LLM enhancement of prose/quiz (off by default, behind a user-supplied key); more
languages and detectors; reading a whole local repo or a real `git diff` stream; export to
Markdown; a "rebuild challenge" mode.

## Explicitly Cut
- **Accounts / login** — the product idea is not identity; adds auth complexity for nothing.
- **A backend / database** — the analysis is pure functions; a server would only add a
  failure mode and kill the offline demo.
- **GitHub OAuth / live repo integration** — pasting a diff proves the kernel; OAuth is a
  time sink and a judging liability (setup friction).
- **Required LLM calls** — would force a judge to bring an API key and make the demo flaky.
- **Multi-language completeness** — a curated set of detectors demonstrates the idea at any
  scale; chasing every language would blow the session budget.
