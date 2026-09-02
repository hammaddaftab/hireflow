# Interaction Record — Index 77

**Originating Role**: `assistant`
**Referenced User Query Index**: `76`

---

## User Query
````
but the whole point of our application was to let them make groups based on whatever prompt they type, give reasoning for non qualifying ones and reasoning for others two so they can just swif through them. This requries every new query to contain all the cvs to be sent to the llm?
````
---

## Claude Response (Raw Markdown)

Good catch — you found a real gap in what I said, and the fix clarifies the architecture rather than breaking it.

**Correction to my last message:** free-text arbitrary queries *do* need an LLM call every time — that's unavoidable, and it's literally the feature you're building. What I got wrong was implying you could dodge the LLM call entirely for anything semantic. You can't, for open-ended prompts. What you *can* avoid is re-sending the raw, unstructured resume.

**What actually gets sent at query time is the Layer 1 output, not the original CV.**

A raw resume is maybe 800–1500 tokens of unstructured text. The cached structured profile from extraction (skills, dated work history, evidence spans) is maybe 150–400 tokens — the model doesn't need to re-read and re-interpret the whole document, it needs the facts you already pulled out of it once. So when the recruiter types "group by who seems entrepreneurial," you send: the free-text prompt + each candidate's compact structured profile (not their full resume) → get back status + reasoning per candidate, grounded in the evidence spans you already extracted and verified. That's a 3–5x reduction in payload per query, and it's real, not marginal.

**Second lever, separate from payload size — batch candidates, don't call per-candidate.**
Don't run one LLM call per candidate per query (700 calls for 700 CVs). Batch N candidates' structured profiles into one call, chunked to fit context (e.g., 50–100 candidates per call depending on profile size), and prompt the model to return status + reasoning for every candidate in the batch, qualifying and non-qualifying both — this maps directly onto the "no black box, swipe through with reasoning" requirement, since the reasoning comes back for free as part of that same call.

**So the real cost model, precisely:** one query against 700 candidates costs roughly 7–14 batched calls (not 700 individual ones), each call carrying compact profiles, not raw text. That's the efficient version of what you're describing — the LLM call count didn't go to zero, but it went from *(candidates × queries × raw-resume-size)* to *(batches × queries × compact-profile-size)*.

**One thing this surfaces that you should flag now, not discover later — pricing.** The $1/1000 CVs model was scoped to one-time extraction (Layer 1). Free-text grouping is a repeatable **query-time** cost — a recruiter could run 15 different group-by prompts against the same 700 candidates in one session. That's 15× the query-layer cost on top of one extraction cost, and it isn't covered by "$1 per 1000 CVs processed" as currently worded. Needs its own line — either a small per-query fee, or a bundled quota (e.g., "first 10 queries free per job, then $X") — before you put a number in front of judges, same category of error as the interactive-agent pricing gap from earlier.
