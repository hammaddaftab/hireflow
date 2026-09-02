# 3. Product Principles & Unit Economics

## Descriptive vs. Terminal Philosophy:

**Target Interaction**: Index `47`
### Systems assigning terminal tags ("Accepted" / "Rejected") induce a "black-box trust deficit," forcing recruiters to manually audit all resumes.

query: "this is where i have landed as of now, its just a marketing/sales document :) idk the real impact or something: # Problem Statement Existing recruitment tools are designed for company wide integration..."
link_to_sibling_file: [interaction_47.md](./interactions/interaction_47.md)

**Target Interaction**: Index `49`
### HireFlow preserves recruiter agency by summarizing candidate evidence across explicit axes without issuing automated rejections.

query: "ok you must remember this that you are approaching it from a real critique, probably a judge with a neutral tone avoiding "flattery" or consolation - this was just a side note. 1) you put your whole ..."
link_to_sibling_file: [interaction_49.md](./interactions/interaction_49.md)

## Scope Discipline (Hackathon Triage):

**Target Interaction**: Index `29`
### Cut: Plugin marketplaces, author monetization frameworks, complex event-sourced timeline mutation, and OCR/image parsing edge cases.

query: "Q: What can your team actually build well in the time you have? A: we can build anything Q: How much build time is actually left before submission? A: 3-5 days Q: Who is the demo actually for — who'..."
link_to_sibling_file: [interaction_29.md](./interactions/interaction_29.md)

**Target Interaction**: Index `57`
### Cut: Plugin marketplaces, author monetization frameworks, complex event-sourced timeline mutation, and OCR/image parsing edge cases.

query: "Gemini was able to point out issues really well, but could not give concrete solutions to how to benefit the consumers? Solutions at the application feature level, like the few i mentioned such as "fo..."
link_to_sibling_file: [interaction_57.md](./interactions/interaction_57.md)

# 4. Data Models, Extraction Schemas, and Processing Pipeline

## 1. Two-Layer Query & Execution Pipeline

**Target Interaction**: Index `75`
### Layer 1 Process: Resumes are parsed once into a standardized, job-agnostic JSON profile, decoupling document ingestion from downstream job queries.

query: "since i want to run queries against the cvs received, thats the whole point, whats the efficient way? i do'nt mean industry standard but not loose enough tha ti we send all the resumes again and again..."
link_to_sibling_file: [interaction_75.md](./interactions/interaction_75.md)

**Target Interaction**: Index `79`
### Layer 1 Process: Resumes are parsed once into a standardized, job-agnostic JSON profile, decoupling document ingestion from downstream job queries.

query: "i don't have enough recruiters atm to tell me what initial parsing schema is the best one, encompasses everything, concisely with the most information. So tell me what should be in that schema, think ..."
link_to_sibling_file: [interaction_79.md](./interactions/interaction_79.md)

**Target Interaction**: Index `77`
### Layer 1 Payload Compression: Raw resumes (~800–1,500 tokens) compress to compact structured profiles (~150–400 tokens), yielding a 3–5× payload reduction.

query: "but the whole point of our application was to let them make groups based on whatever prompt they type, give reasoning for non qualifying ones and reasoning for others two so they can just swif through..."
link_to_sibling_file: [interaction_77.md](./interactions/interaction_77.md)

## 2. Universal Evidence Status Taxonomy

**Target Interaction**: Index `73`
### Fixed Epistemic Taxonomy (_shared/evidence_status.md): Universal 6-state model rejecting custom groupings. Content states: confirmed, inferred, contradicted, not_stated, ambiguous. System state: unparseable.

query: "currently we have set up the requiremnts to be filled. What are the ways to handle "failures" or fallbacks which would most probably be the actual case. We can not have a requirement matched vs not ma..."
link_to_sibling_file: [interaction_73.md](./interactions/interaction_73.md)

## 4. Schema Specifications & Structural Rules

**Target Interaction**: Index `65`
### Job Schema (job/requirements.md): Requirements maintain a single configuration axis (blocking: true | false), defaulting to blocking via an explicit toggle control, with logistics dealbreakers marked blocking by default.

query: "fetch me the core properties of a job, which should be defined and accordingly matched with recived cvs"
link_to_sibling_file: [interaction_65.md](./interactions/interaction_65.md)

**Target Interaction**: Index `71`
### Job Schema (job/requirements.md): Requirements maintain a single configuration axis (blocking: true | false), defaulting to blocking via an explicit toggle control, with logistics dealbreakers marked blocking by default.

query: "i believe information is needed for thinking. SO you sould forever alternate between thinking, and then consuming. THe best i could come up right now to separate the "hard" vs "soft" group was to give..."
link_to_sibling_file: [interaction_71.md](./interactions/interaction_71.md)

## 5. Skill Taxonomy & Relational Delta Engine

**Target Interaction**: Index `81`
### skills_demonstrated Syntactic Classification: Enforces ownership via grammatical subject; categorized into Tier 1 (Action-Attributed → confirmed), Tier 2 (Peripheral-Action → ambiguous), and Tier 3 (Context-Listed → ambiguous).

query: "ok the core thing now is "skills_demonstrated". How would we define it? yeah wasting a prompt exclusively on this thing SINCE THE POINT IS TRANSPARENCY. your focus should not be "what we would show th..."
link_to_sibling_file: [interaction_81.md](./interactions/interaction_81.md)

**Target Interaction**: Index `85`
### Decision-Grade Properties & Adversarial Stopping Rule: Requires outcome attachment and concrete-noun density; build scope terminates at Tier 1 + Outcome Attachment, explicitly rejecting composite authenticity scores.

query: "i did a typo in the earlier prompt, it was indeed skills_demostrated: a bit more on this, what i wanted to express was: how can we achieve utility out of skills_demonstrated, powerfull enough we can ..."
link_to_sibling_file: [interaction_85.md](./interactions/interaction_85.md)

**Target Interaction**: Index `87`
### Decision-Grade Properties & Adversarial Stopping Rule: Requires outcome attachment and concrete-noun density; build scope terminates at Tier 1 + Outcome Attachment, explicitly rejecting composite authenticity scores.

query: "can i ask a very philosophical question. what is this phenomenon? we talked about extraction, then a prompt on how to avoid gaming which refined a property (skills demostrated) then i emphasized again..."
link_to_sibling_file: [interaction_87.md](./interactions/interaction_87.md)

**Target Interaction**: Index `83`
### skills_declared Relational Engine: Carries zero standalone evaluation value; utility exists solely in computing the delta against demonstrated history (corroborated, orphan, stale, density anomaly).

query: "a bit more on this, what i wanted to express was: how can we achieve utility out of skills_declared, powerfull enough we can actually use for decision making. How the skills_declared by designed such ..."
link_to_sibling_file: [interaction_83.md](./interactions/interaction_83.md)

# 5. User Interface

## this_heading_exists_for_consistency

**Target Interaction**: Index `95`
### How the UI will look like

query: "now the question becomes, how would we show it? when they are doing next next next. A thoughtful response focusing on the utility and minizming the recruiter's time"
link_to_sibling_file: [interaction_95.md](./interactions/interaction_95.md)
