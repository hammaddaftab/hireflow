# Mechanism E: Emergent Axis Discovery Report (`raw-grad-ai-swe`)

## Run Configuration
- **Job**: AI / ML & Full-Stack Software Engineer (Graduate / Entry-Level) (`grad-ai-swe`)
- **Pool Source**: `raw` (Free-Text Quote & Paraphrase Citations — no structured pointers)
- **Candidate Order**: `canonical` (30 candidates)
- **Stage 0 Gatekeeper**: Not executed (pre-filtered or custom job spec)
- **Contenders in Prompt**: 30
- **Approximate Tokens**: Job Spec ~206t | Candidate Digests ~19957t | Full Prompt ~21264t
- **Provider Token Usage**: 17072 input / 3570 output (20642 total)
- **Latency**: 33112 ms

## Pool Summary
> The pool separates into a broad baseline of web-development and coursework profiles, a stronger group with substantial full-stack builds, and a small top tier combining research depth, measurable outcomes, and selective external exposure. The most differentiated candidates demonstrate both technically sophisticated AI systems and the ability to integrate them into usable, scalable products.

## Discovered Emergent Differentiating Axes (5)

### axis_1: Published Research Depth
- **Category**: `domain_and_architecture`
- **Estimated Pool Prevalence**: 8/30 candidates
- **Rationale**: This role explicitly prioritizes research depth across LLMs, RAG, computer vision, and predictive modeling. Candidates who have published, contributed to funded research, or used rigorous evaluation methods stand apart from applicants listing only coursework or generic AI projects.
- **One-by-One Scoring Rubric**:
  - **Strong**: Published or publication-bound research, or a substantial lab project, involving a novel method, advanced model/system design, and explicit evaluation or benchmark results.
  - **Moderate**: Meaningful research-intern or lab experience, literature-informed implementation, or an advanced AI project without publication or detailed evaluation evidence.
- **Supporting Pool Citations (Free-Text Quote Verified)**:
  - `[cand_25_muhammad_abdullah:direct_quote]` Context: `Projects: FUSIONRAG: Enhancing Regulatory Document Analysis`
    - *Cited Text*: "Published at COLING 2025. Developed FUSIONRAG, combining OpenAI embeddings, BM25, FAISS, and Rank-Fusion for improved regulatory information retrieval and answer generation."
  - `[cand_27_muhammad_taha_mukhtar:direct_quote]` Context: `Work: Deutsches Forschungszentrum für Künstliche Intelligenz`
    - *Cited Text*: "Engineered a semi-supervised model for detecting informal settlements using remote sensing. Applied techniques like FixMatch, domain adaptation between cities and pseudo-label refinement via SAM2."
  - `[cand_14_jatindar_kumar_mamnani:direct_quote]` Context: `Projects: A Video Based Multi-Task Learning Model for Autonomous Driving`
    - *Cited Text*: "Achieved 82.4% mIoU on the VIL-100 validation set for lane segmentation."

### axis_2: End-to-End System Complexity
- **Category**: `scale_and_impact`
- **Estimated Pool Prevalence**: 10/30 candidates
- **Rationale**: The position requires engineers who can move beyond models and build production-oriented web or mobile systems. Complex applications with real-time communication, authentication, persistence, integrations, and scalability evidence are more predictive of entry-level product engineering readiness than isolated frontend projects.
- **One-by-One Scoring Rubric**:
  - **Strong**: Built or materially contributed to a complete multi-component system involving real-time features or external integrations, authentication, persistent data, and evidence of concurrency, deployment, or operational scale.
  - **Moderate**: Completed a functional full-stack application with frontend, backend, database, and standard authentication or CRUD workflows, but limited evidence of scale or operational complexity.
- **Supporting Pool Citations (Free-Text Quote Verified)**:
  - `[cand_08_muhammad_rouhan_faisal:direct_quote]` Context: `Projects: Chat Application`
    - *Cited Text*: "Developed a real-time chat application using the MERN stack (MongoDB, Express, React, Node.js) to facilitate communication for up to 100 concurrent users."
  - `[cand_05_ali_murad:direct_quote]` Context: `Projects: Generic Builder`
    - *Cited Text*: "A React and React Flow-based workflow editor enabling users to create, edit, and visualize flows with customizable nodes, drag-and-drop editing, real-time updates, and state persistence."
  - `[cand_29_abdul_ahad_qureshi:direct_quote]` Context: `Work: Wilspun Technical Services`
    - *Cited Text*: "Developing a scalable management system targeted for 100+ daily users."

### axis_3: Measured Applied Outcomes
- **Category**: `spiky_excellence`
- **Estimated Pool Prevalence**: 7/30 candidates
- **Rationale**: The strongest applicants quantify model quality or user and operational impact rather than describing implementations only. Measured outcomes are especially valuable for this role because they indicate experimentation discipline and an ability to connect engineering work to product or system performance.
- **One-by-One Scoring Rubric**:
  - **Strong**: Reports a concrete, attributable outcome with a defined metric, dataset, baseline or usage context—for example model accuracy/F1/mIoU, measured efficiency improvement, or validated user impact.
  - **Moderate**: Includes at least one reported metric or performance claim, but with limited methodological context, unclear attribution, or primarily project-level validation.
- **Supporting Pool Citations (Free-Text Quote Verified)**:
  - `[cand_19_abdullah_khan:direct_quote]` Context: `Work: Communication Systems and Network Lab`
    - *Cited Text*: "Developed a machine learning model using Polynomial Regression to predict battery life cycles for UAVs in disaster management applications, improving predictive accuracy by 23% as measured by a custom dataset from 29 flights."
  - `[cand_30_wahaj_ahmad_butt:direct_quote]` Context: `Projects: Emotion-Based Music Recognition System`
    - *Cited Text*: "Utilized the FER2013Plus dataset for emotion recognition and ResNet50 as the base CNN model, achieving an 82.7% accuracy."
  - `[cand_06_hasib_aslam:direct_quote]` Context: `Work: TUKL`
    - *Cited Text*: "Developed a Cat and Dog Classifier with 98% accuracy worked on Document AI."

### axis_4: Selective External Exposure
- **Category**: `pedigree_and_environment`
- **Estimated Pool Prevalence**: 5/30 candidates
- **Rationale**: The pool contains many university projects, but only a smaller subset has worked in selective international labs, major research programs, or globally visible open-source settings. Such environments provide stronger evidence of collaboration, engineering standards, and ability to contribute beyond a classroom context.
- **One-by-One Scoring Rubric**:
  - **Strong**: Substantive contribution in a selective international lab, funded research program, Google Summer of Code, major open-source project, or internationally supervised research setting, with a concrete technical deliverable.
  - **Moderate**: Short international exchange, overseas internship, or external lab affiliation with some technical participation but limited evidence of ownership or deliverables.
- **Supporting Pool Citations (Free-Text Quote Verified)**:
  - `[cand_27_muhammad_taha_mukhtar:direct_quote]` Context: `Work: Google Summer of Code -- CVAT.ai`
    - *Cited Text*: "Improved the CVAT platform by adding a user-configurable shortcut system, enhancing annotation efficiency. Tested new shortcut features with Cypress, achieving 100% test coverage. Contributed to integrating Meta’s SAM into CVAT.ai’s codebase beyond the program’s scope."
  - `[cand_24_abdullah_saim:direct_quote]` Context: `Work: NUSTIAN USA International Summer Research Internship Program`
    - *Cited Text*: "Collaborated with Prof. Zubair Shafique from UC Davis on the project “A Graph-based ML Approach to Detecting JavaScript-based Online Tracking.”"
  - `[cand_20_ali_awais_safdar:paraphrase]` Context: `Work & Internship Experience`
    - *Cited Text*: "Held research or engineering experiences at Nanyang Technological University in Singapore, HPC Lab-SEECS, Radar Research Lab, Vision Architech, CarbonTeq, and a remote U.S. organization."
  - `[cand_06_hasib_aslam:direct_quote]` Context: `Education`
    - *Cited Text*: "Semester Exchange Program Linnaeus University, Passed With Distinction (2023)."

### axis_5: AI-to-Product Bridge
- **Category**: `domain_and_architecture`
- **Estimated Pool Prevalence**: 8/30 candidates
- **Rationale**: This role is unusually broad: the engineer must build AI/ML capabilities and deliver full-stack products around them. Candidates who connect retrieval, multimodal models, or predictive systems to APIs and usable applications are more differentiated than candidates who demonstrate only web development or only offline modeling.
- **One-by-One Scoring Rubric**:
  - **Strong**: Built an AI capability and exposed it through a usable application, API, or product workflow, with evidence of integration across model, backend, and frontend or user-facing behavior.
  - **Moderate**: Demonstrates either a substantive AI model/project or a full-stack application with limited evidence that the two were integrated end to end.
- **Supporting Pool Citations (Free-Text Quote Verified)**:
  - `[cand_08_muhammad_rouhan_faisal:direct_quote]` Context: `Projects: Research on FusionRAG – NUST Alpha at RIRAG 2025`
    - *Cited Text*: "Contributed to the development of FusionRAG, a Retrieval-Augmented Generation (RAG) system designed to enhance regulatory document retrieval and question answering. Integrated OpenAI embeddings, BM25, FAISS, and a custom rank fusion strategy."
  - `[cand_14_jatindar_kumar_mamnani:direct_quote]` Context: `Projects: Prompt-No-Code Website Assistant`
    - *Cited Text*: "Developed an AI-powered no-code chatbot assistant that extracts contextual insights from website URLs for automated responses. Engineered an LLM-driven chatbot system using FastAPI, enabling real-time, context-aware user interactions."
  - `[cand_20_ali_awais_safdar:direct_quote]` Context: `Projects: PATHVQA-VGG19-BERT-ATTENTION`
    - *Cited Text*: "Developed a medical Visual Question Answering (VQA) system utilizing VGG-19 for image feature extraction and BERT for textual question processing. Created an interactive web interface."
  - `[cand_16_mehar_ali_ahmed:direct_quote]` Context: `Projects: LandUseAI Advisor`
    - *Cited Text*: "A Gemini-powered chatbot that delivers personalized land-use recommendations using a Retrieval-Augmented Generation (RAG) approach."

## Citation Verification Warnings (3)
- Axis 'Published Research Depth' free-text citation on 'cand_20_ali_awais_safdar' failed verification (hallucination: Direct quote not found in resume or numbers were altered.): "Authored a research paper focusing on integrating machine learning techniques with Ant Col..."
- Axis 'End-to-End System Complexity' free-text citation on 'cand_21_prithvi_raj' failed verification (minor_distortion: Model claimed this was a direct quote, but altered words or paraphrased.): "Built a Notion-inspired platform using Next.js, enabling real-time collaborative document ..."
- Axis 'Measured Applied Outcomes' free-text citation on 'cand_11_muhammad_ahad_sajjad' failed verification (hallucination: Direct quote not found in resume or numbers were altered.): "Designed and developed an embedded kiosk and mobile app for wellness monitoring using neur..."
