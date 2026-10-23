# Mechanism E: Emergent Axis Discovery Report (`raw-grad-ai-swe`)

## Run Configuration
- **Job**: AI / ML & Full-Stack Software Engineer (Graduate / Entry-Level) (`grad-ai-swe`)
- **Pool Source**: `raw`
- **Candidate Order**: `canonical` (30 candidates)
- **Stage 0 Gatekeeper**: Not executed (pre-filtered or custom job spec)
- **Contenders in Prompt**: 30
- **Approximate Tokens**: Job Spec ~206t | Candidate Digests ~19957t | Full Prompt ~21264t
- **Provider Token Usage**: 23930 input / 2636 output (26566 total)
- **Latency**: 22358 ms


## Pool Summary
> The pool is concentrated among NUST graduates with baseline software and ML exposure, but standout evidence clusters around research-intensive AI work, quantified model performance, selective international lab experience, and independently delivered products. The strongest differentiators are relatively sparse: only a small subset demonstrate publication-quality research, rigorous metrics, or externally validated engineering environments.

## Discovered Emergent Differentiating Axes (5)

### axis_1: Publication-Grade AI Research
- **Category**: `spiky_excellence`
- **Estimated Pool Prevalence**: 6/30 candidates show strong or moderate evidence
- **Rationale**: This role explicitly seeks research depth rather than coursework-level ML familiarity. Peer-reviewed publication, conference presentation, funded research, or a substantial research artifact separates candidates who have advanced an AI problem from those who have only implemented standard models.
- **One-by-One Scoring Rubric**:
  - **Strong**: Strong requires active ownership [action] of a research contribution that resulted in a peer-reviewed publication, conference presentation, funded research deliverable, or clearly documented novel method; the work must identify the problem, method, and evaluation rather than merely list an AI project.
  - **Moderate**: Moderate requires active research ownership [action] in a university or industry lab, such as designing experiments, training or evaluating models, or contributing to a research prototype, but without verified publication, presentation, novelty, or externally reviewed outcome.
- **Supporting Pool Citations ($O(1)$ Hydrated)**:
  - None

### axis_2: Quantified Model Performance
- **Category**: `scale_and_impact`
- **Estimated Pool Prevalence**: 8/30 candidates show strong or moderate evidence
- **Rationale**: Many contenders list ML or computer-vision projects, but only a subset report reproducible performance or measurable improvement. For an applied AI engineer, explicit metrics such as mIoU, accuracy, F1, latency, coverage, or error reduction provide stronger evidence of technical rigor than model and framework names alone.
- **One-by-One Scoring Rubric**:
  - **Strong**: Strong requires active ownership [action] of an ML system with a concrete evaluation benchmark at the level observed in this pool: approximately 80%+ accuracy, 0.80+ F1, 80%+ mIoU, a reported latency or throughput benchmark, or a quantified improvement of roughly 20%+ against a stated baseline or prior approach.
  - **Moderate**: Moderate requires active ownership [action] of model training and evaluation with at least one task-appropriate metric, dataset, or comparison, but performance is below the pool’s upper benchmark, lacks a baseline, or is not tied to a deployed or externally meaningful use case.
- **Supporting Pool Citations ($O(1)$ Hydrated)**:
  - `[cand_16_mehar_ali_ahmed:header]` Digest: `[cand_16_mehar_ali_ahmed] Mehar Ali Ahmed`

### axis_3: End-to-End AI System Design
- **Category**: `domain_and_architecture`
- **Estimated Pool Prevalence**: 9/30 candidates show strong or moderate evidence
- **Rationale**: The job combines LLM/RAG, computer vision, and product engineering, so the upper tier is distinguished by integrating models with retrieval, APIs, databases, real-time interfaces, or multimodal pipelines. This measures architectural complexity and integration ownership, not simple possession of a framework skill.
- **One-by-One Scoring Rubric**:
  - **Strong**: Strong requires active ownership [action] of an end-to-end AI application combining at least three meaningful layers—for example retrieval plus reranking plus generation, multimodal model fusion, model serving through an API, or an ML pipeline integrated with a user-facing product—and evidence of handling evaluation, data flow, or operational constraints.
  - **Moderate**: Moderate requires active ownership [action] of a working AI application with two integrated layers, such as a trained model exposed through an API, a chatbot connected to a web interface, or a vision model embedded in an application, without demonstrated retrieval quality, multimodal fusion, production constraints, or architectural depth.
- **Supporting Pool Citations ($O(1)$ Hydrated)**:
  - None

### axis_4: Selective External Research Environments
- **Category**: `pedigree_and_environment`
- **Estimated Pool Prevalence**: 7/30 candidates show strong or moderate evidence
- **Rationale**: The pool contains a small cluster with experience beyond the standard local internship pattern, including international universities, overseas research labs, Google Summer of Code, and high-compute research infrastructure. Such environments are relevant because they expose entry-level engineers to stronger review standards, larger research systems, or globally distributed collaboration.
- **One-by-One Scoring Rubric**:
  - **Strong**: Strong requires verified participation [action] in a selective international or externally competitive environment—such as Google Summer of Code, DFKI, UC Davis, NTU Singapore, or an equivalent recognized research program—with a substantive technical deliverable rather than attendance or a generic internship title.
  - **Moderate**: Moderate requires active research or engineering work in a university lab, funded project, international exchange, or recognized external organization, but without clear selectivity, named technical output, or evidence that the candidate owned a substantial deliverable.
- **Supporting Pool Citations ($O(1)$ Hydrated)**:
  - None

### axis_5: Independent Product Ownership
- **Category**: `career_trajectory_and_leadership`
- **Estimated Pool Prevalence**: 10/30 candidates show strong or moderate evidence
- **Rationale**: Because this is an applied AI and full-stack role, candidates should be able to turn ambiguous requirements into usable software, not only produce notebooks or coursework. The differentiator is repeated ownership of shipped products, user-facing workflows, deployment, or measurable adoption and business outcomes.
- **One-by-One Scoring Rubric**:
  - **Strong**: Strong requires active ownership [action] of at least one deployed or client-facing product spanning meaningful frontend and backend or mobile functionality, plus evidence of independently defining or delivering core workflows and either quantified adoption, user impact, operational scale, or a completed production deployment.
  - **Moderate**: Moderate requires active ownership [action] of a complete application or substantial feature set with a functional interface and backend, but only at project scale, with limited deployment, users, outcome measurement, or evidence of requirements ownership.
- **Supporting Pool Citations ($O(1)$ Hydrated)**:
  - None
