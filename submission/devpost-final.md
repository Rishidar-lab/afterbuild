# AFTERBUILD

## Tagline

AFTERBUILD turns the code you just shipped with an AI agent into a traceable learning path — so you keep the speed of coding agents without losing sight of what you actually built.

## Inspiration

I built AFTERBUILD because this problem is basically my own workflow.

I use AI coding agents heavily because they let me move much faster than I could by manually writing every line from scratch. I can take an idea, reason through it with an agent, build it, test it, break it, fix it, and sometimes reach a working product in a surprisingly short amount of time.

But I kept noticing a gap.

The software could be finished before I had fully understood every concept, architectural decision, library, pattern, or piece of code that appeared along the way. I don't think the answer is to stop using AI and deliberately become slower. For me, that would throw away one of the most useful things these tools give us.

At the same time, I don't want working software to become a black box that I simply accept because an agent says it works.

My preferred workflow is: finish the real problem first, verify that it actually works, and then come back and learn deeply from what was built. I wanted the learning to become an aftermath of creation rather than a prerequisite that prevents me from creating anything ambitious.

I do not learn best by stopping every five minutes to study a concept before I am allowed to continue building. I learn better when I have a concrete system in front of me, I know why it exists, and I can connect the theory back to something I just created.

Generic AI explanations did not completely solve that for me either. An AI can explain almost anything in convincing language, but I wanted something more grounded: show me what actually changed in my code, tell me which concepts appeared because of those changes, and point me back to the exact lines that justify the explanation.

That became AFTERBUILD.

Instead of separating "building" and "learning" into two unrelated activities, it lets the project I just shipped become the syllabus for what I need to understand next.

So the idea is not to replace learning with AI.

It is almost the opposite.

I want to keep the speed of building with AI while creating a way to recover the understanding afterward. For me, AFTERBUILD is a bridge between "the agent helped me ship this" and "I genuinely understand what I shipped."

## What it does

AFTERBUILD is mainly for people like me who use AI coding agents to build faster, but still care about actually understanding the software afterward. That could be a student, a self-taught developer, an indie builder, or even someone experienced who is working in an unfamiliar part of the stack.

AFTERBUILD takes the actual Git diff from a coding session and turns it into something I can learn from instead of just something I have to trust.

**real Git diff → change map → detected concepts → exact changed-line evidence → learning path → grounded quiz**

I paste or upload the diff, and it first breaks down what really changed: which files were touched, what was added or removed, what languages are involved, and where the important changes are.

Then it looks at the changed code itself and detects the programming concepts that appear in those changes. The important part for me is that it doesn't just say, "this looks like async programming" or "this uses React state." It points me back to the exact file and changed lines that caused it to make that conclusion.

From there, it builds a learning path around the concepts that actually appeared in my work. So instead of giving me a generic course on TypeScript, React, Python, or whatever language I'm using, it tells me what I should understand because those ideas are present in this specific diff.

Then it gives me a small quiz based on the same evidence so I can check whether I actually understood what was built rather than just reading an explanation and assuming I understood it.

The whole thing runs deterministically and locally in the browser. The same diff produces the same analysis. It doesn't need an API key, it doesn't upload the diff to an AI service, and it doesn't depend on another model generating an answer.

The main difference for me is that AFTERBUILD is not trying to be another AI that gives me a convincing explanation of my code. It starts with the diff itself as the source of truth.

I don't see AFTERBUILD as a replacement for ChatGPT or Claude. I would still use them for deeper questions, reasoning, discussion and exploration.

I see AFTERBUILD as the grounding layer before that conversation.

## How I built it

I had to treat the diff parser as a correctness problem first. We built tests around multi-hunk diffs, new and deleted files, zero-count ranges, context lines, line-number jumps, and other edge cases before trusting the concept detector on top of it.

Then the concept system had another constraint: it should not confidently report a concept unless it can attach real evidence from the parsed diff. The quiz and learning path also needed to inherit those same references instead of drifting into generic explanations.

That was probably the most important engineering decision in the whole project for me: the explanation layer is allowed to be useful only after the evidence layer is correct.

Right now I deliberately kept the detector curated and evidence-first because I would rather recognize fewer concepts correctly than produce a huge list that only sounds intelligent.

## Challenges I ran into

The hardest technical part for me was making the traceability trustworthy.

The whole point of AFTERBUILD is that if it tells me, "this concept appears in your code," I should be able to click it and see the exact changed line that supports that conclusion. That sounds simple until you actually deal with a real Git unified diff.

A diff is not just a list of added lines. It can contain multiple files, multiple hunks inside the same file, context lines, deletions, new files, deleted files, skipped line ranges, and headers like `@@ -12,4 +18,7 @@` where the old and new line numbers move independently.

So the risky part was not detecting words like `await` or a React hook. The risky part was making sure that when AFTERBUILD says something came from `src/file.ts:47`, line 47 is really the correct line in the new version of that file.

If that mapping is wrong, then the main idea of the product breaks. It would become another system that gives a confident explanation without reliable evidence behind it.

So the hardest part was not making AFTERBUILD say something intelligent. It was making sure that when it says something, I can ask, "prove where that came from," and the product can actually show me.

One thing that genuinely broke during the build was the difference between "it works locally" and "it actually works when I publish it."

AFTERBUILD is a Vite app, and locally everything looked fine. But when I prepared it for GitHub Pages, I had to deal with the fact that the site is served from the `/afterbuild/` path instead of behaving exactly like the local root. A build can technically succeed while the deployed page still has broken asset paths, which would have been a terrible failure for a competition demo.

So I had to correct the Vite base-path behavior rather than assuming that a successful local build meant the public version was safe. After that I rebuilt it, deployed it through GitHub Pages, and verified the live page itself — not just the build command — including the assets loading correctly.

There was also a product-level correction during the final judge review. I had built the analysis flow, but when I looked at it from the perspective of someone opening AFTERBUILD for the first time, the first action was not obvious enough. The product made sense to me because I had built it, but a judge should not need that context. So I added a clearer first-use hint that points the user toward loading the sample and analyzing it.

That was useful for me because both problems came from the same mistake in a different form: assuming that because I understood something or because it worked in my development environment, the final user experience was automatically correct.

So my process became: don't trust the local assumption. Build it, publish it, use the actual public version, look at it like a stranger, and then fix what reality proves is wrong.

## Accomplishments that I'm proud of

The part of AFTERBUILD I am proudest of is the fact that it does not ask the user to trust it blindly.

It would have been much easier to build something that reads a diff and produces a polished explanation. But that would not have solved the problem I actually had, because I already have powerful models that can explain code to me.

What I wanted was a system where, if it says a concept exists in my changes, I can immediately ask, "Where exactly did you get that from?" and the product can point me to the real file and the real changed line.

That traceability became the backbone of everything else.

The learning path is grounded in those detections.
The quiz is grounded in those same concepts.
The explanations are tied back to the actual diff.
And if there is not enough evidence, the system should admit that instead of inventing something useful-sounding.

I am especially proud that we tested that aggressively rather than just assuming it worked.

By the final review, I could trace detected concepts and quiz references back to real changed lines without finding a false citation in the cases we tested.

I am also proud that the product stayed small.

With AI coding agents, adding another feature is almost too easy. I could have turned AFTERBUILD into a repository platform, an AI tutor, a RAG system, an account-based SaaS product, or something much larger.

Instead, I kept coming back to one question:

"What is the one thing this product should prove?"

For me the answer became:

Take code I just built, show me what I need to understand, and prove where that knowledge came from.

That is the part I am proudest of because it feels both technically defensible and personally useful to me. It came directly from the way I actually work, not from trying to invent a hackathon feature that only sounds impressive.

## What I learned

What I learned from this build is that there is a huge difference between code that looks correct, code that runs, and code whose behavior I can actually explain and verify.

The clearest technical example was the Git diff parser. Before building AFTERBUILD, I understood a diff mostly as something I read visually: additions, deletions and changed files. Building around it forced me to understand that a unified diff is actually carrying two different coordinate systems at once — the old file and the new file — and that every hunk changes how those line numbers move.

Things like multiple hunks, deleted files, new files, context lines and zero-count ranges suddenly mattered because I wasn't just displaying the diff anymore. I was using it as evidence. If I got one line number wrong, a concept could point to evidence that did not really exist at that location.

That taught me why provenance is not a cosmetic feature. If a system makes a claim about code, being able to trace that claim back to its real source changes how much I can trust it.

I also learned that determinism can be a strength in an AI-heavy workflow. My first instinct with something like this could easily have been to send the code to another model and ask it to explain everything. Instead, AFTERBUILD showed me that a smaller deterministic system can sometimes be more appropriate. The same diff produces the same detections, the same evidence and the same learning structure, and I can inspect why it reached those results.

Another thing I learned was about scope.

AI coding agents make it incredibly easy to keep adding things because every new feature feels cheap. The Skill Pack forced me to decide what the actual product was and, just as importantly, what it was not.

That restraint probably taught me as much as the implementation itself.

I also learned something about my own way of working.

I used to think there were mainly two choices: either slow down and manually understand everything before building, or use AI heavily and accept that some understanding would come later.

This project made me realize that the second option does not have to mean giving up on understanding. I can deliberately separate the phases: use automation to move quickly, verify that the result is real, and then create a structured process to recover the knowledge afterward.

That is probably the biggest thing I learned from AFTERBUILD.

The gap between AI-assisted speed and human understanding is real, but it does not have to be permanent. It can itself become something we design for.

## What's next for AFTERBUILD

If I continued AFTERBUILD after the competition, I would not immediately turn it into a much bigger platform. I would first deepen the part that already makes it useful.

The first thing I would improve is the concept detector.

The next step would be to support more languages, frameworks and patterns while keeping the same rule: if AFTERBUILD cannot point back to real changed code as evidence, it should not confidently teach that concept.

I would probably make that detector architecture more modular so support for things like Go, Rust, Java, backend frameworks, database changes or more advanced TypeScript patterns could be added without turning the core parser into a mess.

The second thing I would genuinely want is a longer-term learning view.

At the moment AFTERBUILD answers, "What should I learn from this diff?"

What I eventually want to know is, "What keeps appearing in the things I build?"

If I analyzed several of my own diffs over time, AFTERBUILD could locally notice that I repeatedly encounter concepts like asynchronous code, React effects, API error handling, testing patterns or type systems. Instead of giving me the same lesson every time, it could show me which concepts I have seen before, which ones keep returning, and where my actual knowledge gaps seem to be.

That would turn the aftermath learning catalogue from a one-session report into something closer to a personal map of how my engineering knowledge is developing.

I would also like to make importing the evidence easier. Instead of always manually pasting a diff, I would eventually want a safe way to choose a local commit or commit range and generate the same analysis directly, while preserving the local-first privacy model.

What I would *not* rush to add is equally important to me.

I would not immediately add accounts, cloud storage, a social layer, a giant backend, or an LLM just because those features are possible. If I add an optional model later, I would want it to sit on top of the deterministic evidence rather than replace it. The exact code citations should remain the source of truth.

So my genuine next step is not "make AFTERBUILD bigger."

It is: recognize more of the code accurately, follow my learning across multiple builds, and make the evidence-to-understanding loop better without losing the simplicity and traceability that made me want to build it in the first place.

## Built With

- TypeScript
- Vite
- Vitest
- jsdom
- HTML
- CSS
- GitHub Actions
- GitHub Pages

## How I used the Devpost Learn Skill Pack and Claude Code

The Devpost Learn Skill Pack and Claude Code changed the way I built AFTERBUILD mainly by giving me a much more disciplined way to use AI instead of just throwing prompts at a coding agent and hoping the result was good.

I already use coding agents heavily, so Claude Code doing a large part of the implementation was not something I wanted to hide. That is actually part of the point of this project. The competition explicitly allows coding agents, and I wanted to use that capability fully while still keeping the important decisions and verification under my control.

The Skill Pack helped structure the process before coding started. Instead of jumping directly into implementation, it made me define the problem, compare ideas, narrow the scope, write the PRD and technical specification, think about the demo, and decide what I was deliberately not going to build. That probably prevented AFTERBUILD from becoming a much larger and less finished project.

Claude Code then acted as the implementation agent. I gave it the product direction, constraints and acceptance criteria, and it wrote, tested, debugged and refined the code much faster than I could have done manually in the same amount of time.

But I did not want the workflow to become "Claude wrote code, therefore the project is finished."

I kept making the decisions about what the product should be, which ideas to reject, what the privacy boundary should be, what counted as acceptable evidence, where the implementation needed more testing, whether the public deployment actually worked, and whether the final experience made sense from a user's perspective.

That became especially important with the diff parser and traceability system. I required the implementation to prove that concepts and quiz references actually resolved to real changed lines, including difficult multi-hunk and file edge cases, rather than simply accepting that the generated code looked reasonable.

The final judge review was similar. Claude could inspect and suggest improvements, but I was deciding whether the product actually represented the idea I wanted to submit.

So I would describe the relationship as AI-assisted engineering rather than pretending I manually wrote every line. The agent gave me enormous implementation speed. The Skill Pack gave that speed a process. My role was to define what should exist, constrain it, review it, reject or accept decisions, verify that it actually worked, and understand what was ultimately being submitted.

## Links

- Repository: https://github.com/Rishidar-lab/afterbuild
- Live demo: https://rishidar-lab.github.io/afterbuild/
- Video: WAITING_FOR_OWNER
