# Interaction Record — Index 81

**Originating Role**: `assistant`
**Referenced User Query Index**: `80`

---

## User Query
````
ok the core thing now is "skills_demonstrated". How would we define it? yeah wasting a prompt exclusively on this thing SINCE THE POINT IS TRANSPARENCY. your focus should not be "what we would show the recruiter" but telling me the concept we are using for it
````
---

## Claude Response (Raw Markdown)

The concept, not the display: **`skills_demonstrated` is not "any skill co-occurring inside a work-history entry." It's a skill tied to the candidate by an action clause where the candidate is the implied grammatical subject.** Proximity to a job entry is not the same as evidence of doing the thing — that distinction is the entire concept, and it has to be enforced syntactically, or the field collapses into being just as gameable as `skills_declared` with extra steps.

**Concrete rule for the extractor: classify every skill mention inside a work-history entry into one of three syntactic classes, not two.**

1. **Action-attributed** — a verb where the candidate personally did something with the skill: *built, developed, architected, implemented, deployed, migrated, optimized, led, designed.* This is the only tier that should carry strong evidentiary weight.

2. **Peripheral-action** — a verb present, but weak/passive, indicating exposure without ownership: *worked with, familiar with, assisted with, exposure to, contributed to.* This is exactly the "worked with Kubernetes during migration" case from earlier in this conversation — it's not absence, but it's also not the same evidence strength as "migrated our infrastructure to Kubernetes."

3. **Context-listed** — the skill appears in a "Tech stack:" / "Tools:" line attached to the role, with no verb tying it to the candidate's own action at all. This is the trap case: a bullet like "Stack: React, Node, Docker, Kubernetes, Python, Redis" under a job entry looks like it belongs in `skills_demonstrated` because it's dated and role-attached, but structurally it's just a list — the same weak evidence type as `skills_declared`, wearing a date range for cover. If this collapses into the same tier as class 1, the field stops doing what it exists to do.

**Why this needs to be a stored subtype, not a filter that throws classes 2 and 3 away:** you established the six evidence states two messages ago — Confirmed, Inferred, Contradicted, Not stated, Ambiguous, Unparseable. This syntactic classification is what *feeds* that state, not a separate system. Class 1 → Confirmed. Classes 2 and 3 → Ambiguous, but they're different *kinds* of ambiguous (one has partial ownership, one has none), so keep the subtype attached to the evidence span even after the state is assigned — a recruiter clicking into "why is this Ambiguous" needs to see *which* kind, or you've hidden a distinction you already know matters.

**The actual definition, stated once, cleanly:** a skill enters `skills_demonstrated` if and only if it appears inside a dated work-history entry *and* is the object of a verb whose grammatical subject is the candidate. Its evidentiary strength is a function of whether that verb denotes ownership (class 1) or mere proximity/exposure (class 2), or whether no verb links it to the candidate at all (class 3, effectively demoted to declared-strength evidence despite being date-attached).
