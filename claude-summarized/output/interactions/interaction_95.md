# Interaction Record — Index 95

**Originating Role**: `assistant`
**Referenced User Query Index**: `94`

---

## User Query
````
now the question becomes, how would we show it? when they are doing next next next. A thoughtful response focusing on the utility and minizming the recruiter's time
````
---

## Claude Response (Raw Markdown)

The "next next next" flow is a review queue, and the answer is **two-layer disclosure per card: a 2-second glance layer, and an on-demand evidence layer** — because the two things you're optimizing for (speed, and no black box) pull in opposite directions unless you separate them structurally.

**Layer 1 — default card, what's visible with zero clicks:**
A single compact strip, one icon per **blocking** requirement only (from `job/requirements.md`), each colored/shaped by evidence status — confirmed / ambiguous / contradicted / not_stated. No text, no scores, no evidence quotes shown yet. This is the entire fast-path: if every blocking requirement reads confirmed, the recruiter decides "keep" and hits next in under 2 seconds, exactly the way they'd fast-skim a resume they already know is fine. Preferred/soft requirements do NOT appear at this layer — they're not decision-relevant for the fast path, only for tie-breaking, which is a slower operation.

**Layer 2 — one interaction away, not force-displayed:**
Click or hover any icon in the strip → expands to the evidence_span and reasoning for that one requirement, using the exact fields already defined in `matching/query_evaluation.md`. This is where the "no black box" promise actually gets paid — but only spent when the recruiter needs it, not on every candidate by default. Forcing evidence text onto the default view for every requirement on every card is what would kill your speed goal; this is the exact tradeoff the two-layer split resolves.

**Secondary badges, same card, lower visual weight than the blocking strip:**
Small counts, not full detail: `orphan skills: 2`, `logistics not_stated: 3`. These map directly to `skills_declared.md`'s orphan relation and `logistics.md`'s not_stated rule — they're not verdicts, they're **the follow-up-question checklist** for the recruiter, surfaced as a number so it's noticed but doesn't compete with the blocking strip for attention.

**Queue ordering — this is the actual time-minimization lever, not the card layout:**
Sort so all-blocking-confirmed candidates are contiguous and fast-clearable as a batch, rather than interleaved with ambiguous/contradicted ones. Switching between "quick keep" and "needs a read" repeatedly is what actually burns recruiter time — batching same-judgment-type candidates together reduces context-switching cost, independent of how fast any single card is to read.

**Interaction model, since this is a rapid queue, not a document viewer:** keyboard-first — arrow key or space advances to next, a single key expands the currently-focused strip icon, a single key flags for follow-up (ties into orphan/not_stated badges). Mouse-driven click-to-expand should still work, but the primary path through 700 candidates has to not require a mouse round-trip per card or the "swipe through fast" premise breaks in practice.
