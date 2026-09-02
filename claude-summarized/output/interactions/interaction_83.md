# Interaction Record — Index 83

**Originating Role**: `assistant`
**Referenced User Query Index**: `82`

---

## User Query
````
a bit more on this, what i wanted to express was: how can we achieve utility out of skills_declared, powerfull enough we can actually use for decision making. How the skills_declared by designed such that it isnot bare parsing but intelligiently crafted propertey we output? yeah we were close with the 3 types you mentioned but a bit more on that? its going into the "what recruiters actually look for" space vs "how the candidates get away with lying" territory
````
---

## Claude Response (Raw Markdown)

The concept: **`skills_declared` has zero standalone value. Its only utility is as a comparison operand against `skills_demonstrated` — the signal lives in the delta between the two lists, not in either list alone.** A recruiter doesn't actually care "does this person claim Python" — they care "does what this person claims line up with what they've actually done," because the gap between claim and evidence is precisely what a resume-lying candidate produces and a honest candidate doesn't. You already have both lists; the missing piece is computing the relationship between them as a first-class property, not just storing them side by side.

**Four derived relations, each mapping onto a specific thing recruiters actually distrust in practice:**

1. **Corroborated** — declared skill also appears in `skills_demonstrated`, at any evidence tier. This is the strong case: claim backed by dated, role-attached usage. Recruiters read this as "real."

2. **Orphan** — declared, but never appears anywhere in work history or projects. This is the single most decision-relevant category you can surface, because it's exactly what an experienced recruiter is trained to spot by eye and exactly what a candidate padding a resume produces — a skill that exists only in the summary list with zero narrative backing anywhere else in the document. Orphan skills aren't evidence of lying (someone might genuinely have used a tool briefly and just never wrote a bullet about it) — they're evidence of *unconfirmed claim*, which is precisely the category that should route to a follow-up question rather than a silent accept or reject. This is where your descriptive-not-terminal principle earns its keep: don't drop orphans, don't accept them either — surface them as "claimed, unconfirmed."

3. **Stale** — declared, and demonstrated somewhere, but only in old entries, with more recent roles showing a different stack. Someone who declares "Python" but whose last three roles were all Java, with Python only appearing in a job from 6 years ago, is a materially different case from someone actively using it now — same underlying mechanism as the domain-specific-years problem from earlier (total time ≠ current relevance), just applied to skill freshness instead of skill duration. Recruiters weight recent, active use far higher than old, one-off use; right now your schema has no way to express that difference at all.

4. **Density anomaly** — the ratio of declared-skill-count to work-history-entry-count (or to seniority level) sitting well outside what's typical for the role. This is the structural signature of keyword-stuffing — a real, sourced pattern from the survey data checked earlier (AI-assisted resumes tend toward exactly this: long, dense skill lists with thin narrative support). This isn't about any single skill, it's a shape-of-the-document signal, computed once per resume, not per skill.

**Why this framing is the actual "intelligently crafted" part, not the extraction itself:** the extraction (pulling `skills_declared` and `skills_demonstrated` out of text) is mechanical — an LLM call with good prompting gets you there. The *judgment* — deciding that orphan-vs-corroborated-vs-stale is the meaningful axis, not a raw list — is the part that turns a parser into a decision-support tool. This is also the honest, buildable version of "contradiction detection," which I flagged as scope creep two documents ago when it was pitched as an open-ended module — scoped down to exactly these three relational checks, it's cheap (pure set comparison + date comparison over data you already extracted, no extra LLM calls), and it's the actual differentiated output, not a vague feature name.
