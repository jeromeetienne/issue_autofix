# The engineering behind an agent you can leave running overnight

A one-shot "fix this bug" agent is a party trick. You paste an issue, a model writes a
patch, it looks right, everyone claps. I've built that. You've probably built that. It
takes an afternoon, and it falls apart the moment you try to *trust* it.

A system you can label twenty issues against and then go home is a different animal
entirely. The model in the middle is the same. Almost everything around it is the hard
part, and almost none of it is "AI." It's engineering — the unglamorous, defensive,
make-the-machine-prove-it kind. This post is about that gap, and the two pieces of
engineering I'm proudest of for closing it.

Here's the thing I want you to take away before we even start: when people say
"designing an AI system," they usually mean prompting. The real work is designing the
*environment the model runs in* so that a probabilistic core produces a deterministic
guarantee. The intelligence is rented. The trust is built. Let me show you two places
where it gets built.

## The problem with "it looks right"

Start with the failure mode, because the whole design is a reaction to it.

A language model will hand you a patch that looks completely correct and is quietly,
confidently wrong. It'll fix the bug and break a caller three files away. It'll write
a change that depends on a function signature that existed two refactors ago. It'll
produce something that type-checks in its head and explodes the instant it actually
runs. This isn't a knock on the models — it's their nature. They generate plausible
text. Plausible is not the same as correct, and the gap between them is precisely where
your main branch gets hurt.

So the first design question isn't "how do I get a better patch." It's "how do I refuse
to believe any patch until it has proven itself." And you can't prove a fix by reading
it. You prove it by *running* it.

## Flex one: isolated, runnable sandboxes

Here's the rule the system lives by: a fix is never trusted until it has actually
executed against your project's real checks. Not "looks plausible." Not "type-checks by
inspection." *Ran.* And to run a fix honestly, you need somewhere real to run it — which
turns out to be most of the engineering.

Every single fix gets its own isolated copy of your repository. A throwaway, parallel
checkout, branched cleanly off your main line, that exists only for the lifetime of that
one fix. The model does its work there, in a sandbox that belongs to nobody and nothing.

Two things fall out of that choice, and both matter more than they look.

**Your real checkout is never touched.** This is the difference between a tool you run
and a tool you schedule. Because every fix happens in its own separate copy, the session
can grind through the queue all night while you're asleep — or while you're wide awake,
coding in your actual checkout on a branch of your own, completely undisturbed. The
agent and you are never reaching for the same files. There's no "please don't touch the
repo while it runs." It is, structurally, somewhere else.

**Each fix is sealed off from every other fix.** When the model fixes issue #12, it
sees a clean copy of your project — not a copy already mutated by its attempt at issue
#11. Every fix starts from the same honest baseline. No fix can lean on, or be poisoned
by, another one's half-finished work. That isolation is what makes the next piece of
engineering — running them in parallel without chaos — even possible.

But an isolated copy is useless if it can't actually *run* your project, and this is the
part most people underestimate. A fresh checkout isn't a working project. It's a working
project with the engine taken out. No dependencies installed. None of the local
configuration — the `.env` file, the local settings — that your code quietly assumes is
there. Run your test suite in a naked checkout and it doesn't tell you the fix is wrong;
it tells you nothing, because it can't even start.

So each sandbox is *provisioned* before it's trusted to judge anything. Dependencies are
installed from your project's own manifests. The local configuration your project needs
to actually start gets carried in. The sandbox is brought to life as a genuinely runnable
instance of your project — and then, before the model's fix is believed, the system
confirms the thing can actually run. Only after the environment is real does "the checks
pass" mean anything at all. A green check in a broken environment is worse than no check;
it's a lie that looks like proof.

This is what I mean by designing the environment instead of the prompt. The cleverness
isn't in asking the model nicely for a correct patch. It's in constructing a world where
an incorrect patch has nowhere to hide — where "it looks right" gets replaced by "it
demonstrably ran and passed," because the place it ran was real.

## Flex two: conflict-free by construction

Now make it fast, and watch a much subtler problem appear.

You labeled twenty issues. You don't want them fixed one after another, all night, in a
single slow line. You want them worked in parallel — many isolated sandboxes, many fixes
in flight at once. The isolation from the first half makes that safe to *do*: no two
fixes can corrupt each other's working copy, because each has its own.

But parallelism creates a new hazard, and it's a nasty one because it doesn't show up
until later. Two fixes, worked independently and both perfectly correct on their own, can
touch the same file. Each was built against a clean baseline that didn't include the
other. Individually, both are right. Together, they collide. You wake up to twenty pull
requests, merge the first, and the second won't apply. Merge a different first, and a
*different* second breaks. Now your morning isn't review — it's a rebasing puzzle you
didn't ask for, and the time the agent saved you overnight you're paying back by hand
before lunch.

The lazy answer is "let the human sort out the conflicts." That answer quietly destroys
the entire value of the tool, because the promise was that you wake up and *review*, not
that you wake up and *merge-resolve*.

So the system makes a stronger guarantee, and it makes it *by construction* rather than
by hope. Before a fix is allowed to become a pull request, its diff is checked against
every other open autofix pull request. If it would touch a file that another open fix
already touches, it is not allowed to proceed as-is — it's deferred and set aside rather
than shipped into a collision. The pull requests that *do* open are, by definition,
disjoint. They share no files. And things that share no files cannot conflict.

The result is a property you can actually lean on: every pull request the session
produces is independently mergeable, in any order, in any combination. Merge three this
morning and the other five on Friday. Merge them alphabetically, or by mood, or one a
day for a week. It does not matter, because none of them overlaps another. The
guarantee doesn't depend on you merging them in the right sequence, or quickly, or at
all. It's not a recommendation. It's a structural fact about the set.

I want to be precise about why this is the part I'm proud of, because "check for
conflicts" sounds mundane. The pride isn't in detecting conflicts. It's in *choosing to
defer instead of detecting after the fact.* Most systems would let everything through
and surface the conflicts to you as a problem to solve. This one treats a potential
conflict as a reason not to ship that fix tonight at all — it trades a little throughput
for a guarantee that everything it *does* hand you is clean. That's a design decision
about where to put the cost: on the machine's completeness, not on your morning. Throwing
away a little work the machine did is cheap. An hour of your attention untangling
branches is not.

## The lesson hiding in both halves

Step back and the two pieces rhyme.

The sandboxes are about not trusting a fix until reality has confirmed it. The
conflict-checking is about not trusting a *set* of fixes until their independence has
been confirmed. Both are the same instinct pointed at different scales: assume the
probabilistic core will sometimes be wrong, and build a deterministic frame that catches
it before it ever reaches you.

That's the actual craft of designing with AI right now, and it's almost entirely
invisible in the demos. The demo is the patch. The engineering is everything that
decides whether to *believe* the patch — the real environment it has to run in, the
disjointness it has to satisfy, the proof it has to produce before anyone calls it done.
You are not building a smarter model. You can't; you rent that. You're building the
courtroom the model's output has to survive, and the quality of your system is the
quality of that courtroom.

There's one more boundary in this design, and it's the most important of the three —
the one that decides what the machine is allowed to do even when every check is green.
It never merges. That's not a missing feature, it's a philosophy, and it's the subject
of the last post.
