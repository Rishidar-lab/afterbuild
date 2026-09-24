# Afterbuild — Devpost submission copy

> Owner-authored via the `6-ship` interview. Every substantive section below is Rishi's own
> answer, edited for grammar/clarity only (no facts added). Paste each section into the
> matching Devpost field. Factual fields (Built with, links) are verified against the repo.

## Project name
Afterbuild

## Tagline
Afterbuild turns the code you just shipped with an AI agent into a traceable learning path — so you keep the speed of coding agents without losing sight of what you actually built.

## Inspiration / Why I built it
I built Afterbuild because the problem is basically my own workflow. I use AI coding agents heavily — they let me take an idea, reason it through, build it, test it, break it, fix it, and reach a working product far faster than writing every line by hand. But I kept hitting a gap: the software was often finished before I'd fully understood every concept, architectural decision, and library that appeared along the way.

I don't think the answer is to stop using AI and deliberately go slower — that throws away one of the most useful things these tools give us. But I also don't want working software to become a black box I accept just because an agent says it works. My preferred workflow is to finish the real problem first, verify it actually works, and *then* come back and learn deeply from what was built — learning as the aftermath of creation, not a prerequisite that stops me from building anything ambitious.

Generic AI explanations didn't quite solve this either. An AI can explain almost anything convincingly, but I wanted something grounded: show me what actually changed, which concepts appeared because of those changes, and the exact lines that justify the explanation. That became Afterbuild — a bridge between "the agent helped me ship this" and "I genuinely understand what I shipped."

## Who it's for
Afterbuild is mainly for people like me: developers who use AI coding agents to build faster but still care about actually understanding the software afterward. The moment they need it is right after a coding session where the agent has created or changed a lot of code — the project works, the tests may even be passing — and they look at the diff and realize, "I know what I asked for, but I don't fully understand everything that was introduced to make it work."

That could be a student, a self-taught developer, an indie builder, or an experienced developer working in an unfamiliar part of the stack. The common thread isn't that they know nothing — it's that the speed of the agent has temporarily run ahead of their own understanding. I don't want Afterbuild to shame anyone for using AI or tell them to stop. I want it to meet them exactly at that point: the build is done, the code exists, and now they want to catch up with what was actually created. The person I picture wants both things at once: the speed of AI-assisted development and the confidence of genuinely understanding the code they're shipping.

## Why it solves a real problem for me
I use coding agents a lot because I care about getting the full system working first: I think in terms of the complete outcome — what the product should do, how the pieces connect, what needs testing, what has to be finished before I can call it real. The problem is that an agent can move through implementation much faster than I can absorb every detail while it's happening. I might understand the architecture, the goal, and the reason for a change, but still end a long session with dozens of files changed, unfamiliar library usage, patterns I've only partly seen, and details I haven't studied deeply. So the project can be real, tested, and working while my understanding of some parts is still catching up.

I don't want to fix that by giving up coding agents and slowing everything down — and I don't want to become someone who can only operate a project by asking an AI what its own code means. What I want is a workflow where I use the agent for speed, finish the hard task, verify the result, and then systematically recover the knowledge afterward. That's exactly where Afterbuild fits: at the end of a session I take the real Git diff and ask what actually changed, which concepts I just used, where they are in the code, which to understand first, whether the explanation is grounded in the real changes, and whether I can test that I understood it. Instead of separating "building" and "learning" into two unrelated activities, Afterbuild lets the project I just shipped become the syllabus for what I need to understand next.

## What it does
Afterbuild takes the actual Git diff from a coding session and turns it into something I can learn from, instead of just something I have to trust.

I paste or upload the diff, and it first breaks down what really changed: which files were touched, what was added or removed, which languages are involved, and where the important changes are. Then it looks at the changed code itself and detects the programming concepts that appear. The important part for me is that it doesn't just say "this looks like async programming" or "this uses React state" — it points me back to the exact file and changed lines that led it to that conclusion.

From there it builds a learning path around the concepts that actually appeared in my work. So instead of a generic course on TypeScript, React, or Python, it tells me what I should understand *because those ideas are present in this specific diff*. Then it gives me a small quiz based on the same evidence, so I can check whether I actually understood what was built rather than reading an explanation and assuming I did.

The whole thing runs deterministically and locally in the browser. It needs no API key, it doesn't upload the diff to an AI service, and it doesn't depend on another model generating an answer. In simple terms: Afterbuild is a bridge between a completed AI-assisted coding session and the understanding I still need afterward — show me what changed, show me the concepts inside those changes, prove where they came from, teach me what matters, and test whether I understood it.

## What makes it different
The main difference is that Afterbuild isn't trying to be another AI that gives me a convincing explanation of my code. I use ChatGPT, Claude, and coding agents constantly — they're extremely useful — but if I paste a diff into a chatbot and ask "what should I learn from this?", I'm still getting a generated interpretation. It might be a very good one, but I still have to trust that the explanation actually corresponds to the code I changed.

Afterbuild approaches it from the opposite direction: it starts with the diff itself as the source of truth. If it says a concept appeared, I can click that concept and see the exact file and changed line that caused it to be detected. The explanation is connected to evidence instead of being a detached paragraph of generated prose — and that traceability is the part I care about most. The flow is basically **real diff → detected concept → exact code evidence → learning path → quiz**. So if it detects async/await, a React hook, error handling, or another supported concept, I don't just get told it exists — I can immediately ask "where, exactly?" and Afterbuild shows me.

It's also deterministic: the same diff produces the same analysis. No API key, nothing sent to another model, the core analysis runs entirely in the browser. I don't see it as a replacement for ChatGPT or Claude — I'd still use those for deeper questions and exploration. I see Afterbuild as the grounding layer *before* that conversation. It isn't another model explaining my code from the outside — it turns the code changes themselves into a traceable learning catalogue.

## How I built it (and how I used the Skill Pack)
The Skill Pack and Claude Code changed how I built Afterbuild mainly by giving me a more disciplined way to use AI, instead of throwing prompts at a coding agent and hoping the result was good.

I use coding agents heavily, so Claude Code doing a large part of the implementation isn't something I want to hide — that's part of the point of this project. The competition explicitly allows coding agents, and I wanted to use that fully while keeping the important decisions and verification under my control. The Skill Pack structured the process before any coding: define the problem, compare ideas, narrow the scope, write the PRD and technical spec, plan the demo, and decide what I deliberately would *not* build. That probably kept Afterbuild from becoming a much larger, less finished project.

Claude Code then acted as the implementation agent — I gave it the product direction, constraints, and acceptance criteria, and it wrote, tested, debugged, and refined the code far faster than I could have by hand. But I didn't want the workflow to become "Claude wrote code, therefore it's done." I kept deciding what the product should be, which ideas to reject, what the privacy boundary was, what counted as acceptable evidence, where the implementation needed more testing, whether the public deployment actually worked, and whether the final experience made sense to a user. That mattered most with the diff parser and traceability: I required the implementation to *prove* that concepts and quiz references resolved to real changed lines — including hard multi-hunk and new/deleted-file cases — rather than accepting code that merely looked reasonable.

So I'd describe it as AI-assisted engineering, not a claim that I typed every line. The agent gave me implementation speed; the Skill Pack gave that speed a process; my role was to define what should exist, constrain it, review it, accept or reject decisions, verify it actually worked, and understand what was being submitted. In a way, that's also why Afterbuild exists: using an agent this heavily showed me exactly how quickly implementation can move ahead of a person's understanding — so instead of pretending that gap doesn't exist, I built something to help close it afterward.

## Challenges I ran into
The hardest technical part was making the traceability trustworthy. The whole point of Afterbuild is that if it tells me "this concept appears in your code," I should be able to click it and see the exact changed line that supports that. That sounds simple until you deal with a real Git unified diff.

A diff isn't just a list of added lines. It can contain multiple files, multiple hunks in the same file, context lines, deletions, new files, deleted files, skipped line ranges, and headers like `@@ -12,4 +18,7 @@` where the old and new line numbers move independently. So the risky part wasn't detecting words like `await` or a React hook — it was making sure that when Afterbuild says something came from `src/file.ts:47`, line 47 really is the correct line in the *new* version of that file. If that mapping is wrong, the main idea of the product breaks: it becomes another system giving a confident explanation with no reliable evidence behind it.

So I treated the diff parser as a correctness problem first. I built tests around multi-hunk diffs, new and deleted files, zero-count ranges, context lines, and line-number jumps before trusting the concept detector on top of it. The detector then had its own constraint: it must not report a concept unless it can attach real evidence from the parsed diff, and the quiz and learning path had to inherit those same references instead of drifting into generic explanations. That was probably my most important engineering decision: the explanation layer is allowed to be useful only after the evidence layer is correct. By the final review I could adversarially trace detected concepts and quiz references back to real changed lines — including awkward multi-hunk and new-file cases — without finding a false citation.

There was also a gap between "it works locally" and "it actually works when I publish it." Afterbuild is a Vite app, and locally everything looked fine — but preparing it for GitHub Pages, I had to deal with the site being served from a subpath instead of the local root. A build can succeed while the deployed page still has broken asset paths, which would have been a terrible failure for a demo. So I corrected the base-path behavior, rebuilt, deployed, and verified the live page itself — including assets loading — not just the build command. And in the final review, looking at it as a first-time viewer, the first action wasn't obvious enough, so I added a first-use hint pointing to loading the sample and analyzing it. Both problems were the same mistake in different forms: assuming that because it worked for me, the final user experience was automatically correct.

## Accomplishments that I'm proud of
The part I'm proudest of is that Afterbuild doesn't ask the user to trust it blindly. It would have been much easier to build something that reads a diff and produces a polished explanation — but that wouldn't have solved my actual problem, because I already have powerful models that can explain code to me. What I wanted was a system where, if it says a concept exists in my changes, I can immediately ask "where exactly did you get that from?" and it can point me to the real file and the real changed line.

That traceability became the backbone of everything else. The learning path is grounded in those detections, the quiz is grounded in the same concepts, the explanations are tied back to the actual diff — and if there isn't enough evidence, the system admits it instead of inventing something useful-sounding. I'm especially proud that I tested this aggressively rather than assuming it worked: multi-hunk diffs, new files, deleted files, and awkward line-number ranges are exactly where a confident-looking system could quietly go wrong, and I could trace concepts and quiz references back to real changed lines without finding a false citation in the cases I tested.

I'm also proud the product stayed small. With AI coding agents, adding another feature is almost too easy — I could have turned Afterbuild into a repository platform, an AI tutor, a RAG system, or an account-based SaaS. Instead I kept returning to one question: "what is the one thing this product should prove?" The answer became: take code I just built, show me what I need to understand, and prove where that knowledge came from — technically defensible and personally useful, drawn from how I actually work rather than a feature that only sounds impressive.

## What I learned
I learned there's a huge difference between code that looks correct, code that runs, and code whose behavior I can actually explain and verify.

The clearest example was the Git diff parser. Before this, I understood a diff mostly as something I read visually. Building around it forced me to see that a unified diff carries two coordinate systems at once, the old file and the new file, and that every hunk changes how those line numbers move. Multiple hunks, deleted files, new files, context lines, and zero-count ranges suddenly mattered, because I wasn't just displaying the diff — I was using it as evidence. Get one line number wrong and a concept could point to evidence that doesn't really exist there. That taught me why provenance isn't a cosmetic feature: if a system makes a claim about code, being able to trace it back to its real source changes how much I can trust it.

I also learned that determinism can be a strength in an AI-heavy workflow. My first instinct could easily have been to send the code to another model and ask it to explain everything; instead, a smaller deterministic system turned out to be more appropriate — the same diff produces the same detections, evidence, and learning structure, and I can inspect *why* it reached them. And I learned about scope: agents make it easy to keep adding things because every feature feels cheap, and the Skill Pack forced me to decide what the product actually was, and what it wasn't. That restraint probably taught me as much as the implementation.

Finally, I learned something about my own way of working. I used to think there were two choices: slow down and manually understand everything before building, or use AI heavily and accept that some understanding comes later. This project made me realize the second option doesn't have to mean giving up understanding. I can separate the phases — use automation to move quickly, verify the result is real, then create a structured way to recover the knowledge afterward. The gap between AI-assisted speed and human understanding is real, but it doesn't have to be permanent. It can itself become something we design for.

## What's next
If I continued Afterbuild, I wouldn't immediately turn it into a bigger platform — I'd deepen the part that already makes it useful.

First, the concept detector. Right now I deliberately kept it curated and evidence-first: I'd rather recognize fewer concepts correctly than produce a long list that only sounds intelligent. The next step is more languages, frameworks, and patterns while keeping the same rule — if Afterbuild can't point back to real changed code as evidence, it shouldn't confidently teach that concept. I'd make the detector more modular, so support for Go, Rust, Java, backend frameworks, database changes, or more advanced TypeScript patterns could be added without turning the core parser into a mess.

Second, a longer-term learning view. Today Afterbuild answers "what should I learn from this diff?" What I eventually want to know is "what keeps appearing in the things I build?" If it analyzed several of my own diffs over time — locally — it could show me which concepts keep returning and where my real gaps are, turning the aftermath catalogue from a one-session report into a personal map of how my engineering knowledge is developing. I'd also make importing evidence easier — a safe way to pick a local commit or range and generate the same analysis directly, while preserving the local-first privacy model.

What I would *not* rush to add matters just as much: no accounts, cloud storage, social layer, big backend, or an LLM just because it's possible. If I added an optional model later, I'd want it sitting on top of the deterministic evidence rather than replacing it — the exact code citations should stay the source of truth. So my genuine next step isn't "make Afterbuild bigger." It's: recognize more code accurately, follow my learning across multiple builds, and make the evidence-to-understanding loop better without losing the simplicity and traceability that made me want to build it.

## Built with
TypeScript · Vite · Vitest · jsdom (tests) · HTML · CSS · vanilla DOM (no UI framework) · Git unified-diff parsing · GitHub Pages (hosting)

*(No runtime dependencies and no LLM/API at runtime — the analysis is deterministic and runs entirely in the browser.)*

## Skill Pack use (factual)
Built following the official Devpost Learn Skill Pack: `1-start` (learner profile) → `2-scope` / `3-prd` / `4-spec` (scope, PRD, and technical spec, all reviewed and approved) → an implementation plan of vertical build slices → `6-ship` (this submission). The Skill Pack structured the planning and process; it did not write the project itself. Implementation was done with Claude Code under my direction, with the decisions, testing, and verification kept under my control.

## Links
- **Repository:** https://github.com/Rishidar-lab/afterbuild
- **Live demo:** https://rishidar-lab.github.io/afterbuild/
- **Demo video:** _(add the public YouTube/Vimeo URL after recording — required before final submit)_
