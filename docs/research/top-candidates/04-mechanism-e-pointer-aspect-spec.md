# Technical Specification: Mechanism E (Pointer-Backed Structured Aspect Digests)

## 1. Executive Summary

Mechanism E is the synthesis of our research progression:
- From **Mechanism C**, it adopts **structured profile extraction**, **`syntactic_tier` verification**, and **zero-cost deterministic serialization in TypeScript**.
- From **Mechanism D**, it adopts **two-stage in-context emergent axis discovery** and **non-work outlier spike capture**.
- It eliminates the failures of both: by serializing claims as compact **~10–12 token pointer tuples** instead of 30-token verbatim sentences or free-text prose, all 12–15 claims on a 2-page CV fit inside a **~150–200 token budget**—achieving **zero claim dropping at ingestion**, **zero claim dropping in TypeScript**, and **$O(1)$ hallucination-free quote hydration**.

---

## 2. Ingestion Schema Upgrades

Instead of introducing unbounded classification enums (Mechanism A) or a lossy prose capsule (Mechanism D), Mechanism E makes two targeted enhancements to the existing 7 structured aspects:

### 2.1 Generalizing Role Claims Beyond Technical Keywords
Inside `work_history`, claims are extracted into an enriched claims array that permits **either** a technical skill anchor **or** an architectural/leadership/domain scope anchor:

```typescript
export interface ExtractedRoleClaim {
  claim_id: string; // Deterministic ID, e.g., "c1", "c2"
  source_entry_ref: string; // Links to work_history entry_id
  syntactic_tier: "action_attributed" | "peripheral_action" | "context_listed";
  raw_nouns: string[]; // Pre-normalized strings, e.g., ["Go", "gRPC", "order-routing microservices"]
  canonical_skills: string[]; // Post-normalized against canonicalSkills.ts for $0 job matching
  compact_action: string; // 4-7 word factual predicate, e.g., "architected order-routing microservices"
  outcome_attached: string | null; // e.g., "18k rps, -44% p99 latency"
  evidence_span: string; // Full verbatim resume sentence stored in PostgreSQL JSONB
}
```

### 2.2 Adding Non-Work Outlier Spikes (`notable_signals`)
A lightweight top-level aspect that captures achievements outside standard employment:

```typescript
export interface ExtractedNotableSignal {
  signal_id: string; // e.g., "s1"
  category: "open_source" | "competition" | "project" | "academic_honor" | "publication";
  syntactic_tier: "action_attributed" | "peripheral_action";
  raw_nouns: string[]; // e.g., ["go-rate-limit", "distributed-systems"]
  compact_action: string; // e.g., "Maintained open-source rate limiter"
  outcome_attached: string | null; // e.g., "1.4k GitHub stars"
  evidence_span: string; // Verbatim resume substring
}
```

---

## 3. Deterministic Aspect Serialization in TypeScript

At query time, TypeScript deterministically formats each candidate into a ~150–200 token structured digest at **$0 compute cost**:

```text
[cand_01] 4.6y FT (2 roles, avg 2.3y) | BSc CS @ NUST (3.65) | Islamabad, PKR 380k, 30d notice
work_1: Sr Backend Eng @ Retailo (promoted from SWE, 2022-Pres, 2.8y FT)
  [c1:action] Go, gRPC, Kafka -> order-routing microservices | 18k rps, -44% p99
  [c2:action] Postgres, Redis -> multi-tenant inventory ledger | 45M rows, -52% query time
  [c3:action] Squad leadership & incident architecture -> led 6 engineers, owned checkout SLA | 99.99% uptime
work_2: Backend Eng @ Arbisoft (2020-2022, 1.8y FT)
  [c4:action] Python, Django, REST API -> B2B vendor settlement portal | PKR 120M/mo
  [c5:peripheral] Kubernetes, AWS -> deployment pipeline maintenance
spikes:
  [s1:action] Open-Source -> Maintainer of go-rate-limit | 1.4k GitHub stars
```

### Why This Architecture Succeeds
1. **Zero Pre-Normalization Loss**: Niche domain terms (`multi-tenant inventory ledger`, `B2B vendor settlement portal`) are retained because `raw_nouns` are serialized before canonical catalog filtering.
2. **Zero Claim Dropping**: Because each pointer tuple takes only ~10–12 tokens, all 12–15 claims fit in ~150–200 tokens. TypeScript does not need to guess which bullets to drop.
3. **Explicit Anti-Inflation Preservation**: The ranking LLM directly observes `[c1:action]` vs. `[c5:peripheral]`, preventing keyword stuffers from receiving unearned credit.
4. **Deterministic Trajectory Math**: Career tenure (`4.6y FT`), average stint length, internal promotion detection, and internship exclusions are calculated deterministically by code.

---

## 4. The Two-Stage In-Context Discovery Pipeline

```text
200 Resumes in Job Pool
  │
  ├─► Stage 0: Deterministic Gatekeeper ($0, TypeScript)
  │     Filter out hard `contradicted` dealbreakers
  │     (keep `confirmed`, `inferred`, `2nd Look`, and `not_stated` logistics)
  │     ──> ~40–80 Viable Contenders
  │
  ├─► Stage 1: In-Context Pool Discovery & Shortlisting (~8k–12k tokens, 1 LLM call)
  │     Input: Job Spec + All 40–80 Structured Aspect Digests
  │     Output:
  │       1. 3–5 Emergent Differentiating Axes discovered in THIS pool for THIS job
  │       2. Top 20 Shortlist citing candidate claim_ids (e.g., [cand_01:c1, c2])
  │
  └─► Stage 2: Deep Comparative Tournament & Evidentiary Grounding (~5k tokens, 1 LLM call)
        Input: Job Spec + Emergent Axes + Top 20 Candidates (with hydrated verbatim evidence spans)
        Output: Final Top 10 ranked with pool-relative comparative citations
```

### 4.1 Stage 1 Prompt Flow (Discovery + High Recall Shortlist)
- In a single prompt, the LLM receives the Job Spec and all 40–80 viable candidate digests.
- The LLM first emits the **Emergent Differentiating Axes** (e.g., high-throughput scale, payment domain depth, rapid internal promotion velocity).
- The LLM outputs the Top 20 candidates, anchoring each selection to specific claim IDs (`[cand_01:c1, c3]`).

### 4.2 Stage 2 Prompt Flow & $O(1)$ Verbatim Quote Hydration
- For the Top 20 candidates, TypeScript fetches the full verbatim `evidence_span` from PostgreSQL JSONB for the cited claims.
- The Stage 2 prompt compares the 20 finalists head-to-head across the discovered emergent axes to select and order the final Top 10.
- **Evidentiary UI Output**:
  - The UI displays the **Pool's Emergent Differentiators** as interactive badges at the top of the review page.
  - Each Top Candidate displays pool-relative comparative metrics backed by literal resume quotes fetched in $O(1)$ from JSONB:
    > *"1 of 3 candidates in pool with verified >10k rps Go scale: 'Architected order-routing microservices in Go and gRPC handling 18,000 req/sec, cutting p99 latency by 44%' (Retailo)"*
  - This costs **zero LLM output tokens** for quote transcription and carries **zero hallucination risk**.
