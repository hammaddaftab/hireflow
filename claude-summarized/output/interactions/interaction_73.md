# Interaction Record — Index 73

**Originating Role**: `assistant`
**Referenced User Query Index**: `72`

---

## User Query
````
currently we have set up the requiremnts to be filled. What are the ways to handle "failures" or fallbacks which would most probably be the actual case. We can not have a requirement matched vs not matched group. There is no point in introdcuing match level with low medium and high that would still be the same like other ats. Our feature is the recuruiter can go though all the cvs with no black box. We can introduce a missing group, and i can count a couple others but is this it? a fixed interface letting you define how many groups you need for each requiremtns (this will be fed into the focus mode)
````
---

## Claude Response (Raw Markdown)

Direct answer: no, that's not the same as low/medium/high — but the "configurable groups" idea is the wrong move, and here's the precise reason why, not just a preference.

**Why Strong/Weak/Unclear (or whatever we call it) isn't a match-level score:** a match-level score answers "how good is this candidate," which implies a judgment ATS already make and hide. What you actually need is different: **what is the state of the evidence**, not how good the candidate is. That's an epistemic-status question, not a quality-rating question. Renaming it fixes the framing — call it evidence status, not match level, and it stops reading like every other ATS because it's answering a different question entirely.

**The actual fixed states — this is close to exhaustive, and it splits into two categories you shouldn't merge:**

*Content-level (what the resume text actually says):*
1. **Confirmed** — explicitly stated ("5 years Python")
2. **Inferred** — computed from other stated facts, not stated directly (years derived from job date ranges)
3. **Contradicted** — resume conflicts with itself (two different date ranges for the same job) or conflicts with the requirement outright
4. **Not stated** — the resume never mentions it; absence, not evidence of absence
5. **Ambiguous** — text exists but is genuinely vague ("familiar with Kubernetes")

*System-level (the pipeline failed, not the candidate):*
6. **Unparseable** — bad scan, corrupt file, OCR failure — this is a document problem, not a qualification problem, and must be shown differently or a recruiter will wrongly read "no data" as "bad candidate"

That's the list. Missing/Confirmed/Inferred/Contradicted/Ambiguous + one system-failure state. Five content states plus one infrastructure state is the actual ceiling — you won't find a sixth content-level state that isn't a subtype of these.

**On "configurable groups per requirement, fed into focus mode" — don't build this, and here's the actual reason, not a time-constraint excuse:**

The six states above are **universal across every requirement type.** "Years of Python" and "salary expectation" and "relocation willingness" all have the exact same possible epistemic states — confirmed, inferred, contradicted, missing, ambiguous, unparseable. There is no requirement-specific variation in *what kind of uncertainty* can exist. So letting a recruiter define custom groups per requirement isn't flexibility, it's solving a problem that doesn't exist — the failure taxonomy doesn't vary by requirement, only the requirement's *content* does.

Two direct costs if you build it anyway: (1) it contradicts your own closed-interface pitch — the moment a recruiter has to *configure* a taxonomy before using the tool, you've reintroduced the setup-overhead problem you're positioning against; (2) focus mode has to render a different UI shape per requirement instead of one reusable component, which is real added engineering for a feature that produces no functional benefit.

**What should actually be configurable per requirement — already established, don't add more:** just the hard/soft blocking flag from two messages ago. That's the one axis that legitimately varies per requirement. The evidence-status taxonomy stays fixed. One reusable state model, one reusable focus-mode component, zero setup screen.
