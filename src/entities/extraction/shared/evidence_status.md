# Shared: Evidence Status Taxonomy

## Status
Stable

## Purpose
The fixed set of states any extracted or matched field can be in. Every
aspect file references these by name instead of redefining its own states.
This is the enforcement point for "descriptive, not terminal" — no field
is ever just true/false, it carries its evidentiary status.

## The six states

### Content-level (what the resume text says)
1. `confirmed` — explicitly stated in the document
2. `inferred` — computed from other stated facts, not stated directly
   (e.g. years-of-skill derived from dated work-history entries)
3. `contradicted` — resume conflicts with itself, or with a stated
   requirement
4. `not_stated` — never mentioned. Absence, not evidence of absence.
   NEVER silently omitted or guessed — always an explicit value.
5. `ambiguous` — text exists but is genuinely vague or weak
   (peripheral-action / context-listed skill mentions land here — see
   candidate/skills_demonstrated.md)

### System-level (the pipeline failed, not the candidate)
6. `unparseable` — bad scan, corrupt file, OCR failure. Must be shown
   distinctly from the content states or a recruiter will misread
   "no data" as "bad candidate."

## Hard rule
No field is ever stored as a bare value without one of these six states
attached. No composite/weighted score is ever derived from these states —
they are read individually, not summed. (See: killed formulas, `S(c) =
Σw_i·f_i(c)`, `confidence: 0.61` — do not reintroduce this pattern here.)

## Every evidence-bearing field also carries
- `evidence_span`: the literal quoted text supporting the status
