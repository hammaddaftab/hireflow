# Interaction Record — Index 85

**Originating Role**: `assistant`
**Referenced User Query Index**: `84`

---

## User Query
````
i did a typo in the earlier prompt, it was indeed skills_demostrated:

a bit more on this, what i wanted to express was: how can we achieve utility out of skills_demonstrated, powerfull enough we can actually use for decision making. How the skills_deemonstrated by designed such that it isnot bare parsing but intelligiently crafted propertey we output? yeah we were close with the 3 types you mentioned but a bit more on that? its going into the "what recruiters actually look for" space vs "how the candidates get away with lying" territory
````
---

## Claude Response (Raw Markdown)

Correction taken — this is about making `skills_demonstrated` itself smarter, not the declared-vs-demonstrated delta. Building on the three syntactic tiers already established (action-attributed / peripheral-action / context-listed), here's what makes a demonstrated entry actually decision-grade rather than just "verb was present."

**The tier classification alone is necessary but not sufficient — it only catches the crudest fabrication (skill-dumping with no verb).** A resume-writer, human or AI-assisted, can trivially clear tier 1 by writing "built a Python service" with zero real depth behind it. The syntactic check stops the laziest gaming; it doesn't stop the competent gaming. What separates genuine ownership from a well-formed but hollow sentence is a second, independent axis on top of the tier: **specificity of the claim itself**, checked structurally, not scored.

**Three concrete, extractable properties per demonstrated-skill entry, each binary/present-or-absent — no invented weights, per the anti-fake-precision rule already established:**

1. **Outcome attachment.** Does the sentence contain a stated, measurable or concrete result tied to the skill use — a number, a scale, a named consequence ("reduced deployment time 60%," "handled 10k requests/day," "migrated 40 services")? Store the literal outcome text if present, `none` if not. This is the single strongest recruiter-trusted signal, and it's also the hardest thing for generic resume-padding to fake convincingly — a vague verb is free to write, a specific, internally-plausible number attached to a specific system is not.

2. **Concrete-noun density in the clause.** Does the sentence name a specific artifact, system, or scope rather than staying at the level of the skill word alone — "payment microservice" vs. just "backend"; "team of 8" vs. just "a team"? This is a structural check (are there named nouns beyond the skill itself in the clause), not a semantic judgment call — keep it mechanical so it stays auditable and doesn't reintroduce a hidden LLM-opinion score.

3. **Cross-entry consistency, scoped tightly to one skill.** If the same skill appears in more than one work-history or project entry, do the descriptions cohere in scope (always backend infra work) or contradict (one entry frames it as primary expertise, another treats it as incidental)? This is the narrow, cheap version of "contradiction detection" — compare N mentions of *one* skill against each other, pure text comparison over data you've already extracted, not the open-ended scope-creep version I cut earlier. Store as `consistent` / `inconsistent` / `single-mention`, not a score.

**Why this is the actual "recruiter vs. liar" axis, stated plainly:** a genuinely competent candidate's real experience naturally produces outcome numbers, named artifacts, and consistent detail across mentions, because they're describing something that actually happened and has texture. A resume optimized to pass keyword/verb-tier screening — including the AI-generated resumes in the 72% stat verified earlier — clears tier 1 easily (the verb is cheap to add) but tends to stay generic past that, because specific, cross-referentially consistent detail is expensive to fabricate and easy to get subtly wrong if you try. You're not detecting lies directly — you're measuring the one dimension lying is structurally bad at, and letting the recruiter draw the conclusion, which keeps you inside the descriptive-not-terminal principle instead of accusing anyone of anything.

**What this does NOT become:** a composite "authenticity score" combining these three into one number. That's the exact failure mode from the fake `confidence: 0.61` and the undefined-weight formulas already killed twice in this conversation. Store the three properties separately, surface them separately, let the recruiter read the pattern — one candidate with `outcome: none` and `consistency: single-mention` across every skill tells its own story without you assigning it a number that pretends to know more than the evidence does.
