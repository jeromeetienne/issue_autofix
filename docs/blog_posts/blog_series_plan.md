# Blog Series Plan — issue_autofix

A three-part series about the `issue_autofix` project.

**Goal:** Showcase AI-design skill — position the author as someone who *designs*
agentic systems, not someone who merely prompts an LLM.

**Format:** No code. 1500–2000 words each. Punchy, second-person, talk to the reader.

---

## The throughline

> *Anyone can prompt an LLM to "fix this bug." The skill is designing the system
> around it so the output is trustworthy enough to use unsupervised.*

Each post advances that thesis: the promise, the engineering, the trust.

---

## Post 1 — "Wake up to your easy bugs already fixed"

**Audience:** developers / the reader as user.
**Job:** make them feel the value, and quietly reveal there's serious design underneath.

- **Hook:** Every backlog has a graveyard of small, real, well-scoped bugs nobody
  has the evening to fix. What if they fixed themselves overnight — and you just
  reviewed the results with coffee?
- **The everyday loop:** label an issue `autofix` → go home → a session works the
  queue overnight → morning, one PR per issue, ready to read.
- **The twist that makes it usable:** it *never merges and never closes*. You stay
  the reviewer. This isn't "AI replaces you," it's "AI does the boring first draft
  and hands you the diff."
- **Why that restraint is the whole point** — a tease toward posts 2 and 3.
- **Takeaway:** autonomy you'd actually trust comes from what the agent *refuses* to do.

## Post 2 — "The engineering behind an agent you can leave running overnight"

**Job:** the AI-design flex. This is where the craft shows.

- **Frame:** a one-shot "fix it" agent is a demo. A system that runs unattended
  against a real repo is engineering. Here's the gap, and how it was closed.
- **Flex 1 — Isolated, *runnable* worktrees:** every fix is built and tested in its
  own git worktree, provisioned to actually run (dependencies installed, local config
  like `.env` copied in), verified runnable before any result is trusted. "Tested"
  means *actually executed*, not "looks plausible." The main checkout is never
  touched — you keep working while it runs.
- **Flex 2 — Conflict-free by construction:** fixes run in parallel, so they could
  collide. Before anything is trusted, each diff is checked against every *other* open
  autofix PR; if it would touch a shared file, it's deferred. Result: N PRs that are
  all independently mergeable, in any order. A correctness *guarantee* designed into
  the pipeline, not hoped for.
- **The lesson:** designing for AI is mostly designing the *guardrails and the
  environment* — isolation, provisioning, verification — so the probabilistic core
  lands inside a deterministic frame.
- **Takeaway:** the intelligence is rented; the trust is engineered.

## Post 3 — "Never merge: designing an autonomous agent you can actually trust"

**Job:** the thought-piece. The "so what." Trust as a design discipline.

- **Hook:** The scariest sentence in AI tooling is "and then it commits to main."
  The most important design decision here was a refusal.
- **Trust is built from boundaries, not promises:** the agent gates on the project's
  *real* checks (it opens a PR only if they pass), it stops at the PR, the human is
  the merge gate. Every autonomous action is reversible and reviewed.
- **The deeper idea:** you don't earn trust in an agent by making it smarter — you
  earn it by making the *blast radius* small and the *human checkpoint*
  non-negotiable. Confidence comes from constraint.
- **Where this points:** the near future of agentic dev isn't "no humans," it's
  humans reviewing instead of typing — and the design job is drawing that line well.
- **Takeaway:** the measure of a good autonomous system is how cleanly it hands
  control *back*.

---

## Series title ideas

- *The Overnight Engineer*
- *Agents You Can Leave Running*
- *Rented Intelligence, Engineered Trust*

## Design notes

- **Post 1 sells, posts 2–3 prove** — but even post 1 plants the design thesis so
  the reader knows the author is an architect, not a prompt-jockey.
- **"Never merges" appears in all three** — it's the signature idea, used as a
  recurring motif: a tease in post 1, a guarantee in post 2, the philosophy in post 3.
- The validator and check-detection are dropped from the *main* flex of post 2
  (anchored on worktrees + conflict-free); they get a sentence each as supporting
  evidence, not headline acts.
