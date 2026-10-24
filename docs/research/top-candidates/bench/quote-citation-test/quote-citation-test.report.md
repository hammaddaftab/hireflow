# Quote & Paraphrase Citation Accuracy Experiment (Isolated Test)

## 1. Executive Summary

This isolated benchmark tests whether the LLM in **Raw Mode** can reliably cite its evidence when given the freedom to use **direct verbatim quotes** or **natural paraphrasing**, instead of rigid pointer IDs (like `work_1` or `c1`).

All 30 raw candidate CVs (~21,000 prompt tokens) were fed into the model with instructions to back each discovered axis with exact quotes or accurate paraphrases.

### Overall Benchmark Accuracy ($N = 20$ Citations)

| Citation Verification Category | Count | Percentage | Layman Interpretation |
|---|:---:|:---:|---|
| **Exact Verbatim Quote** | **16** | **80.0%** | Real sentence found word-for-word in the candidate's resume |
| **Accurate Paraphrase** | **1** | **5.0%** | Factual summary accurately describing real work from the CV |
| **Minor Distortion / Misquote** | **1** | **5.0%** | Real project, but numbers or exact role details were altered |
| **Hallucination / Fake Claim** | **2** | **10.0%** | Claim or quote cannot be found on the candidate's resume |
| **Combined Factual Accuracy** | **17** | **85.0%** | Overall rate of factually grounded citations |

---

## 2. Discovered Axes & Supporting Citations

### Published Research Depth (`domain_and_architecture`)
- **Rationale**: This role explicitly prioritizes research depth across LLMs, RAG, computer vision, and predictive modeling. Candidates who have published, contributed to funded research, or used rigorous evaluation methods stand apart from applicants listing only coursework or generic AI projects.
- **Strong Criteria**: Published or publication-bound research, or a substantial lab project, involving a novel method, advanced model/system design, and explicit evaluation or benchmark results.
- **Moderate Criteria**: Meaningful research-intern or lab experience, literature-informed implementation, or an advanced AI project without publication or detailed evaluation evidence.
- **Prevalence**: 8/30 candidates
- **Citations Audited**:
  - **[cand_25_muhammad_abdullah] Muhammad Abdullah** (`direct_quote` -> **exact_quote_match**)
    - *Citation Text*: "Published at COLING 2025. Developed FUSIONRAG, combining OpenAI embeddings, BM25, FAISS, and Rank-Fusion for improved regulatory information retrieval and answer generation."
    - *Context Stated*: Projects: FUSIONRAG: Enhancing Regulatory Document Analysis
    - *Verification Result*: Minor punctuation or whitespace difference, but essentially verbatim quote.
    - *Matched CV Text*: "- Published at COLING 2025...."
  - **[cand_27_muhammad_taha_mukhtar] Muhammad Taha Mukhtar** (`direct_quote` -> **exact_quote_match**)
    - *Citation Text*: "Engineered a semi-supervised model for detecting informal settlements using remote sensing. Applied techniques like FixMatch, domain adaptation between cities and pseudo-label refinement via SAM2."
    - *Context Stated*: Work: Deutsches Forschungszentrum für Künstliche Intelligenz
    - *Verification Result*: Minor punctuation or whitespace difference, but essentially verbatim quote.
    - *Matched CV Text*: "- Engineered a semi-supervised model for detecting informal settlements using remote sensing...."
  - **[cand_14_jatindar_kumar_mamnani] Jatindar Kumar Mamnani** (`direct_quote` -> **exact_quote_match**)
    - *Citation Text*: "Achieved 82.4% mIoU on the VIL-100 validation set for lane segmentation."
    - *Context Stated*: Projects: A Video Based Multi-Task Learning Model for Autonomous Driving
    - *Verification Result*: Exact word-for-word quote found in candidate resume.
    - *Matched CV Text*: "Achieved 82.4% mIoU on the VIL-100 validation set for lane segmentation...."
  - **[cand_20_ali_awais_safdar] Ali Awais Safdar** (`direct_quote` -> **hallucination**)
    - *Citation Text*: "Authored a research paper focusing on integrating machine learning techniques with Ant Colony Optimization (ACO) to improve vehicle routing under time-window constraints. Presented the paper at the FIT 2024 Conference."
    - *Context Stated*: Projects: Enhancing Vehicle Routing with Time Windows
    - *Verification Result*: Direct quote not found in resume or numbers were altered.
    - *Matched CV Text*: "- Authored a research paper focusing on integrating machine learning techniques with Ant Colony Optimization (ACO) to improve vehicle routing under time-window constraints...."

### End-to-End System Complexity (`scale_and_impact`)
- **Rationale**: The position requires engineers who can move beyond models and build production-oriented web or mobile systems. Complex applications with real-time communication, authentication, persistence, integrations, and scalability evidence are more predictive of entry-level product engineering readiness than isolated frontend projects.
- **Strong Criteria**: Built or materially contributed to a complete multi-component system involving real-time features or external integrations, authentication, persistent data, and evidence of concurrency, deployment, or operational scale.
- **Moderate Criteria**: Completed a functional full-stack application with frontend, backend, database, and standard authentication or CRUD workflows, but limited evidence of scale or operational complexity.
- **Prevalence**: 10/30 candidates
- **Citations Audited**:
  - **[cand_08_muhammad_rouhan_faisal] Muhammad Rouhan Faisal** (`direct_quote` -> **exact_quote_match**)
    - *Citation Text*: "Developed a real-time chat application using the MERN stack (MongoDB, Express, React, Node.js) to facilitate communication for up to 100 concurrent users."
    - *Context Stated*: Projects: Chat Application
    - *Verification Result*: Exact word-for-word quote found in candidate resume.
    - *Matched CV Text*: "Developed a real-time chat application using the MERN stack (MongoDB, Express, React, Node.js) to facilitate communication for up to 100 concurrent users...."
  - **[cand_05_ali_murad] Ali Murad** (`direct_quote` -> **exact_quote_match**)
    - *Citation Text*: "A React and React Flow-based workflow editor enabling users to create, edit, and visualize flows with customizable nodes, drag-and-drop editing, real-time updates, and state persistence."
    - *Context Stated*: Projects: Generic Builder
    - *Verification Result*: Minor punctuation or whitespace difference, but essentially verbatim quote.
    - *Matched CV Text*: "- A React and React Flow-based workﬂow editor enabling users to create, edit, and visualize ﬂows with customizable nodes, drag-and-drop editing, real-time updates, and state persistence...."
  - **[cand_29_abdul_ahad_qureshi] Abdul Ahad Qureshi** (`direct_quote` -> **exact_quote_match**)
    - *Citation Text*: "Developing a scalable management system targeted for 100+ daily users."
    - *Context Stated*: Work: Wilspun Technical Services
    - *Verification Result*: Exact word-for-word quote found in candidate resume.
    - *Matched CV Text*: "Developing a scalable management system targeted for 100+ daily users...."
  - **[cand_21_prithvi_raj] Prithvi Raj** (`direct_quote` -> **minor_distortion**)
    - *Citation Text*: "Built a Notion-inspired platform using Next.js, enabling real-time collaborative document editing... Supports infinite child documents, real-time dynamic icons, collapsible and expandable sidebar navigation, and mobile responsiveness."
    - *Context Stated*: Projects: Jotion - Notion Clone with Next.js
    - *Verification Result*: Model claimed this was a direct quote, but altered words or paraphrased.
    - *Matched CV Text*: "- Supports inﬁnite child documents, real-time dynamic icons, collapsible and expandable sidebar navigation, and mobile responsiveness for a seamless experience across de..."

### Measured Applied Outcomes (`spiky_excellence`)
- **Rationale**: The strongest applicants quantify model quality or user and operational impact rather than describing implementations only. Measured outcomes are especially valuable for this role because they indicate experimentation discipline and an ability to connect engineering work to product or system performance.
- **Strong Criteria**: Reports a concrete, attributable outcome with a defined metric, dataset, baseline or usage context—for example model accuracy/F1/mIoU, measured efficiency improvement, or validated user impact.
- **Moderate Criteria**: Includes at least one reported metric or performance claim, but with limited methodological context, unclear attribution, or primarily project-level validation.
- **Prevalence**: 7/30 candidates
- **Citations Audited**:
  - **[cand_19_abdullah_khan] Abdullah Khan** (`direct_quote` -> **exact_quote_match**)
    - *Citation Text*: "Developed a machine learning model using Polynomial Regression to predict battery life cycles for UAVs in disaster management applications, improving predictive accuracy by 23% as measured by a custom dataset from 29 flights."
    - *Context Stated*: Work: Communication Systems and Network Lab
    - *Verification Result*: Minor punctuation or whitespace difference, but essentially verbatim quote.
    - *Matched CV Text*: "- Developed a machine learning model using Polynomial Regression to predict battery life cycles for UAVs in disaster management applications, improving predictive accuracy by 23% as measured by a cust..."
  - **[cand_30_wahaj_ahmad_butt] Wahaj Ahmad Butt** (`direct_quote` -> **exact_quote_match**)
    - *Citation Text*: "Utilized the FER2013Plus dataset for emotion recognition and ResNet50 as the base CNN model, achieving an 82.7% accuracy."
    - *Context Stated*: Projects: Emotion-Based Music Recognition System
    - *Verification Result*: Exact word-for-word quote found in candidate resume.
    - *Matched CV Text*: "Utilized the FER2013Plus dataset for emotion recognition and ResNet50 as the base CNN model, achieving an 82.7% accuracy...."
  - **[cand_11_muhammad_ahad_sajjad] Muhammad Ahad Sajjad** (`direct_quote` -> **hallucination**)
    - *Citation Text*: "Designed and developed an embedded kiosk and mobile app for wellness monitoring using neuro-symbolic AI, boosting user retention by 75%. Conducted extensive user research, including surveys and interviews, leading to a 25% reduction in onboarding time."
    - *Context Stated*: Work: Reviva
    - *Verification Result*: Direct quote not found in resume or numbers were altered.
    - *Matched CV Text*: "- Designed and developed an embedded kiosk and mobile app for wellness monitoring using neuro-symbolic AI, boosting user retention by 75%...."
  - **[cand_06_hasib_aslam] Hasib Aslam** (`direct_quote` -> **exact_quote_match**)
    - *Citation Text*: "Developed a Cat and Dog Classifier with 98% accuracy worked on Document AI."
    - *Context Stated*: Work: TUKL
    - *Verification Result*: Minor punctuation or whitespace difference, but essentially verbatim quote.
    - *Matched CV Text*: "- learned basics of Machine Learning Deep Learning developed a Cat and Dog Classifier with 98% accuracy worked on Document AI..."

### Selective External Exposure (`pedigree_and_environment`)
- **Rationale**: The pool contains many university projects, but only a smaller subset has worked in selective international labs, major research programs, or globally visible open-source settings. Such environments provide stronger evidence of collaboration, engineering standards, and ability to contribute beyond a classroom context.
- **Strong Criteria**: Substantive contribution in a selective international lab, funded research program, Google Summer of Code, major open-source project, or internationally supervised research setting, with a concrete technical deliverable.
- **Moderate Criteria**: Short international exchange, overseas internship, or external lab affiliation with some technical participation but limited evidence of ownership or deliverables.
- **Prevalence**: 5/30 candidates
- **Citations Audited**:
  - **[cand_27_muhammad_taha_mukhtar] Muhammad Taha Mukhtar** (`direct_quote` -> **exact_quote_match**)
    - *Citation Text*: "Improved the CVAT platform by adding a user-configurable shortcut system, enhancing annotation efficiency. Tested new shortcut features with Cypress, achieving 100% test coverage. Contributed to integrating Meta’s SAM into CVAT.ai’s codebase beyond the program’s scope."
    - *Context Stated*: Work: Google Summer of Code -- CVAT.ai
    - *Verification Result*: Minor punctuation or whitespace difference, but essentially verbatim quote.
    - *Matched CV Text*: "- Tested new shortcut features with Cypress, achieving 100% test coverage...."
  - **[cand_24_abdullah_saim] Abdullah Saim** (`direct_quote` -> **exact_quote_match**)
    - *Citation Text*: "Collaborated with Prof. Zubair Shafique from UC Davis on the project “A Graph-based ML Approach to Detecting JavaScript-based Online Tracking.”"
    - *Context Stated*: Work: NUSTIAN USA International Summer Research Internship Program
    - *Verification Result*: Minor punctuation or whitespace difference, but essentially verbatim quote.
    - *Matched CV Text*: "- Collaborated with Prof. Zubair Shaﬁque from UC Davis on the project “A Graph-based ML Approach to Detecting JavaScript-based Online Tracking.” Conducted in-depth research on cookies, analyzing their..."
  - **[cand_20_ali_awais_safdar] Ali Awais Safdar** (`paraphrase` -> **accurate_paraphrase**)
    - *Citation Text*: "Held research or engineering experiences at Nanyang Technological University in Singapore, HPC Lab-SEECS, Radar Research Lab, Vision Architech, CarbonTeq, and a remote U.S. organization."
    - *Context Stated*: Work & Internship Experience
    - *Verification Result*: Accurate paraphrase of real work experience or project, verified against CV.
    - *Matched CV Text*: "### Vision Architech (Remote)..."
  - **[cand_06_hasib_aslam] Hasib Aslam** (`direct_quote` -> **exact_quote_match**)
    - *Citation Text*: "Semester Exchange Program Linnaeus University, Passed With Distinction (2023)."
    - *Context Stated*: Education
    - *Verification Result*: Minor punctuation or whitespace difference, but essentially verbatim quote.
    - *Matched CV Text*: "## Education - BS in Computer Science School of Electrical Engineering and Computer Science , 3.83 - FSc Pre Engineering Punjab College , 1085/1100 (2021) - Matric Haider Memorial School , 1045/1100 (..."

### AI-to-Product Bridge (`domain_and_architecture`)
- **Rationale**: This role is unusually broad: the engineer must build AI/ML capabilities and deliver full-stack products around them. Candidates who connect retrieval, multimodal models, or predictive systems to APIs and usable applications are more differentiated than candidates who demonstrate only web development or only offline modeling.
- **Strong Criteria**: Built an AI capability and exposed it through a usable application, API, or product workflow, with evidence of integration across model, backend, and frontend or user-facing behavior.
- **Moderate Criteria**: Demonstrates either a substantive AI model/project or a full-stack application with limited evidence that the two were integrated end to end.
- **Prevalence**: 8/30 candidates
- **Citations Audited**:
  - **[cand_08_muhammad_rouhan_faisal] Muhammad Rouhan Faisal** (`direct_quote` -> **exact_quote_match**)
    - *Citation Text*: "Contributed to the development of FusionRAG, a Retrieval-Augmented Generation (RAG) system designed to enhance regulatory document retrieval and question answering. Integrated OpenAI embeddings, BM25, FAISS, and a custom rank fusion strategy."
    - *Context Stated*: Projects: Research on FusionRAG – NUST Alpha at RIRAG 2025
    - *Verification Result*: Minor punctuation or whitespace difference, but essentially verbatim quote.
    - *Matched CV Text*: "- Contributed to the development of FusionRAG, a Retrieval-Augmented Generation (RAG) system designed to enhance regulatory document retrieval and question answering...."
  - **[cand_14_jatindar_kumar_mamnani] Jatindar Kumar Mamnani** (`direct_quote` -> **exact_quote_match**)
    - *Citation Text*: "Developed an AI-powered no-code chatbot assistant that extracts contextual insights from website URLs for automated responses. Engineered an LLM-driven chatbot system using FastAPI, enabling real-time, context-aware user interactions."
    - *Context Stated*: Projects: Prompt-No-Code Website Assistant
    - *Verification Result*: Minor punctuation or whitespace difference, but essentially verbatim quote.
    - *Matched CV Text*: "- Developed an AI-powered no-code chatbot assistant that extracts contextual insights from website URLs for automated responses...."
  - **[cand_20_ali_awais_safdar] Ali Awais Safdar** (`direct_quote` -> **exact_quote_match**)
    - *Citation Text*: "Developed a medical Visual Question Answering (VQA) system utilizing VGG-19 for image feature extraction and BERT for textual question processing. Created an interactive web interface."
    - *Context Stated*: Projects: PATHVQA-VGG19-BERT-ATTENTION
    - *Verification Result*: Minor punctuation or whitespace difference, but essentially verbatim quote.
    - *Matched CV Text*: "- Developed a medical Visual Question Answering (VQA) system utilizing VGG-19 for image feature extraction and BERT for textual question processing...."
  - **[cand_16_mehar_ali_ahmed] Mehar Ali Ahmed** (`direct_quote` -> **exact_quote_match**)
    - *Citation Text*: "A Gemini-powered chatbot that delivers personalized land-use recommendations using a Retrieval-Augmented Generation (RAG) approach."
    - *Context Stated*: Projects: LandUseAI Advisor
    - *Verification Result*: Minor punctuation or whitespace difference, but essentially verbatim quote.
    - *Matched CV Text*: "- A Gemini-powered chatbot that delivers personalized land-use recommendations using a Retrieval- Augmented Generation (RAG) approach...."

---

## 3. Key Findings: What Happens When AI Uses Quotes/Paraphrasing on Raw CVs?

1. **Massive Improvement Over Pointer IDs**:
   - In the prior raw test requiring ID tags, **95.9% of citations failed hydration** because the model hallucinated fake tags like `work_1`.
   - When allowed to quote or paraphrase, **85.0%** of the citations were factually verified against the candidate's actual document.

2. **The Trade-Off: Verbatim Quotes vs. Paraphrase Laundering**:
   - When the model attempts direct quotes, it frequently paraphrases slightly anyway (1 minor misquotes/distortions).
   - In an automated software UI, searching for a paraphrased quote in a raw document requires fuzzy text search, which is slower and less reliable than Mechanism E's $O(1)$ database pointers.

3. **Comparison Against Mechanism E**:
   - **Raw Mode with Quotes/Paraphrase**: ~85.0% accurate, requires ~22,000 prompt tokens per run, and requires complex fuzzy text search to find quotes.
   - **Mechanism E**: **100% accurate verbatim quote hydration**, uses only ~3,900 tokens (5.00x smaller), and resolves quotes instantly via deterministic database IDs.
