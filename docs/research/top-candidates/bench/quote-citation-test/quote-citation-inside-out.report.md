# Quote & Paraphrase Citation Accuracy Experiment (Inside-Out Permuted Order)

## 1. Executive Summary

This isolated benchmark tests whether the LLM in **Raw Mode** can reliably cite its evidence when given the freedom to use **direct verbatim quotes** or **natural paraphrasing**, instead of rigid pointer IDs (like `work_1` or `c1`).

- **Order Mode**: `inside-out` (30 raw candidates, ~21,000 prompt tokens)
- **Permutation Details**: Middle candidates 9-15 and 16-22 moved to outer edges; candidates 1-8 and 23-30 placed in the middle.

### Benchmark Accuracy ($N = 24$ Citations)

| Citation Verification Category | Count | Percentage | Layman Interpretation |
|---|:---:|:---:|---|
| **Exact Verbatim Quote** | **23** | **95.8%** | Real sentence found word-for-word in the candidate's resume |
| **Accurate Paraphrase** | **1** | **4.2%** | Factual summary accurately describing real work from the CV |
| **Minor Distortion / Misquote** | **0** | **0.0%** | Real project, but numbers or exact role details were altered |
| **Hallucination / Fake Claim** | **0** | **0.0%** | Claim or quote cannot be found on the candidate's resume |
| **Combined Factual Accuracy** | **24** | **100.0%** | Overall rate of factually grounded citations |

---

## 2. Discovered Axes & Supporting Citations

### Published Research Depth (`domain_and_architecture`)
- **Rationale**: For an applied AI/ML engineering role, demonstrated research execution is a stronger differentiator than generic ML coursework. Publication, funded research, or technically rigorous research programs indicate the ability to investigate ambiguous problems and communicate results.
- **Strong Criteria**: Published or accepted peer-reviewed work, multiple substantive lab projects, or research involving novel methods and formal evaluation.
- **Moderate Criteria**: A supervised research internship, literature-based project, or technically relevant research contribution without a publication or clearly documented novel result.
- **Prevalence**: 6/30 candidates
- **Citations Audited**:
  - **[cand_01_muhammad_khizer_tariq] Muhammad Khizer Tariq** (`direct_quote` -> **exact_quote_match**)
    - *Citation Text*: "Published a Conference paper related to my Final year project on "Routing through Satellite Imagery""
    - *Context Stated*: Projects: Presented a Conference Paper at FIT 2024
    - *Verification Result*: Exact word-for-word quote found in candidate resume.
    - *Matched CV Text*: "Published a Conference paper related to my Final year project on "Routing through Satellite Imagery"..."
  - **[cand_25_muhammad_abdullah] Muhammad Abdullah** (`direct_quote` -> **exact_quote_match**)
    - *Citation Text*: "Published at COLING 2025."
    - *Context Stated*: Projects: FUSIONRAG: Enhancing Regulatory Document Analysis
    - *Verification Result*: Exact word-for-word quote found in candidate resume.
    - *Matched CV Text*: "Published at COLING 2025...."
  - **[cand_27_muhammad_taha_mukhtar] Muhammad Taha Mukhtar** (`direct_quote` -> **exact_quote_match**)
    - *Citation Text*: "Worked on a €80,000 DAAD-funded project in collaboration with RPTU & DFKI, where I interned in Germany."
    - *Context Stated*: Projects: Slum-i, Research Project
    - *Verification Result*: Exact word-for-word quote found in candidate resume.
    - *Matched CV Text*: "Worked on a €80,000 DAAD-funded project in collaboration with RPTU & DFKI, where I interned in Germany...."
  - **[cand_20_ali_awais_safdar] Ali Awais Safdar** (`direct_quote` -> **exact_quote_match**)
    - *Citation Text*: "Authored a research paper focusing on integrating machine learning techniques with Ant Colony Optimization (ACO) to improve vehicle routing under time-window constraints."
    - *Context Stated*: Projects: Enhancing Vehicle Routing with Time Windows
    - *Verification Result*: Exact word-for-word quote found in candidate resume.
    - *Matched CV Text*: "Authored a research paper focusing on integrating machine learning techniques with Ant Colony Optimization (ACO) to improve vehicle routing under time-window constraints...."

### Production System Complexity (`scale_and_impact`)
- **Rationale**: The role combines AI with product engineering, so candidates must be able to connect models and APIs to usable, stateful products. Complex full-stack systems with authentication, realtime communication, multiple clients, or deployment are more predictive than isolated demos.
- **Strong Criteria**: Built and integrated a complete product across frontend, backend, data, authentication, realtime or external APIs, with evidence of deployment, scalability, or multiple user surfaces.
- **Moderate Criteria**: Delivered a functional web or mobile application with a conventional frontend/backend stack, but limited evidence of production concerns or system complexity.
- **Prevalence**: 9/30 candidates
- **Citations Audited**:
  - **[cand_05_ali_murad] Ali Murad** (`direct_quote` -> **exact_quote_match**)
    - *Citation Text*: "A React and React Flow-based workflow editor enabling users to create, edit, and visualize flows with customizable nodes, drag-and-drop editing, real-time updates, and state persistence."
    - *Context Stated*: Projects: Generic Builder
    - *Verification Result*: Minor punctuation or whitespace difference, but essentially verbatim quote.
    - *Matched CV Text*: "- A React and React Flow-based workﬂow editor enabling users to create, edit, and visualize ﬂows with customizable nodes, drag-and-drop editing, real-time updates, and state persistence...."
  - **[cand_08_muhammad_rouhan_faisal] Muhammad Rouhan Faisal** (`direct_quote` -> **exact_quote_match**)
    - *Citation Text*: "Developed a real-time chat application using the MERN stack (MongoDB, Express, React, Node.js) to facilitate communication for up to 100 concurrent users."
    - *Context Stated*: Projects: Chat Application
    - *Verification Result*: Exact word-for-word quote found in candidate resume.
    - *Matched CV Text*: "Developed a real-time chat application using the MERN stack (MongoDB, Express, React, Node.js) to facilitate communication for up to 100 concurrent users...."
  - **[cand_28_umama_zainab] Umama Zainab** (`direct_quote` -> **exact_quote_match**)
    - *Citation Text*: "The app includes complete backend functionality using Node.js and MongoDB, along with a responsive UI built in React Native. It integrates features like user authentication, property listings, booking management, and real-time notifications."
    - *Context Stated*: Projects: Mobile App Using React Native - FindMyStay
    - *Verification Result*: Minor punctuation or whitespace difference, but essentially verbatim quote.
    - *Matched CV Text*: "- The app includes complete backend functionality using Node.js and MongoDB, along with a responsive UI built in React Native...."
  - **[cand_29_abdul_ahad_qureshi] Abdul Ahad Qureshi** (`direct_quote` -> **exact_quote_match**)
    - *Citation Text*: "Developing a scalable management system targeted for 100+ daily users."
    - *Context Stated*: Work: Wilspun Technical Services
    - *Verification Result*: Exact word-for-word quote found in candidate resume.
    - *Matched CV Text*: "Developing a scalable management system targeted for 100+ daily users...."
  - **[cand_13_muhammad_uzair_khan] Muhammad Uzair Khan** (`direct_quote` -> **exact_quote_match**)
    - *Citation Text*: "I contributed to enhancing the platform by adding new vendor categories to both the web-based user portal (built with Next.js) and the vendor app (React Native)."
    - *Context Stated*: Work: Shadiyana
    - *Verification Result*: Exact word-for-word quote found in candidate resume.
    - *Matched CV Text*: "I contributed to enhancing the platform by adding new vendor categories to both the web-based user portal (built with Next.js) and the vendor app (React Native)...."

### Advanced AI Integration (`domain_and_architecture`)
- **Rationale**: The target role explicitly mentions LLMs, RAG, computer vision, and predictive modeling. Candidates stand out when they combine modern model architectures with retrieval, multimodal fusion, serving, or quantitative evaluation rather than merely listing frameworks.
- **Strong Criteria**: Implemented an advanced LLM/RAG, multimodal, or computer-vision pipeline and reported evaluation metrics, retrieval components, latency, or deployment-oriented constraints.
- **Moderate Criteria**: Built a working ML or deep-learning application using established models, but with limited architectural detail or evaluation evidence.
- **Prevalence**: 8/30 candidates
- **Citations Audited**:
  - **[cand_14_jatindar_kumar_mamnani] Jatindar Kumar Mamnani** (`direct_quote` -> **exact_quote_match**)
    - *Citation Text*: "Developed a medical visual question-answering system using CNNs for image features and LSTMs/Transformers for text queries. Implemented multimodal fusion to combine image and text features."
    - *Context Stated*: Projects: VQA-Based-Medical-Advisor
    - *Verification Result*: Minor punctuation or whitespace difference, but essentially verbatim quote.
    - *Matched CV Text*: "- Developed a medical visual question-answering system using CNNs for image features and LSTMs/Transformers for text queries...."
  - **[cand_25_muhammad_abdullah] Muhammad Abdullah** (`direct_quote` -> **exact_quote_match**)
    - *Citation Text*: "Developed FUSIONRAG, combining OpenAI embeddings, BM25, FAISS, and Rank-Fusion for improved regulatory information retrieval and answer generation."
    - *Context Stated*: Projects: FUSIONRAG: Enhancing Regulatory Document Analysis
    - *Verification Result*: Exact word-for-word quote found in candidate resume.
    - *Matched CV Text*: "Developed FUSIONRAG, combining OpenAI embeddings, BM25, FAISS, and Rank-Fusion for improved regulatory information retrieval and answer generation...."
  - **[cand_30_wahaj_ahmad_butt] Wahaj Ahmad Butt** (`direct_quote` -> **exact_quote_match**)
    - *Citation Text*: "Developed a system to identify fake reviews using advanced natural language processing models (BERT, RoBERTa, XLNet, GPT-2). Fine-tuned each model on a labeled dataset of real and fake reviews for classification purposes."
    - *Context Stated*: Projects: Fake Review Detector
    - *Verification Result*: Minor punctuation or whitespace difference, but essentially verbatim quote.
    - *Matched CV Text*: "- Developed a system to identify fake reviews using advanced natural language processing models (BERT, RoBERTa, XLNet, GPT-2)...."
  - **[cand_16_mehar_ali_ahmed] Mehar Ali Ahmed** (`direct_quote` -> **exact_quote_match**)
    - *Citation Text*: "RoBERTa fine-tuned with Low Rank Adaptation to detect change in writing style at paragraph level achieved an F1 Score of 0.80."
    - *Context Stated*: Projects: Writing Style Analysis Task
    - *Verification Result*: Minor punctuation or whitespace difference, but essentially verbatim quote.
    - *Matched CV Text*: "- RoBERTa ﬁne-tuned with Low Rank Adaptation to detect change in writing style at paragraph level achieved an F1 Score of 0.80...."
  - **[cand_27_muhammad_taha_mukhtar] Muhammad Taha Mukhtar** (`direct_quote` -> **exact_quote_match**)
    - *Citation Text*: "Engineered a semi-supervised model for detecting informal settlements using remote sensing. Applied techniques like FixMatch, domain adaptation between cities and pseudo-label refinement via SAM2."
    - *Context Stated*: Work: Deutsches Forschungszentrum für Künstliche Intelligenz
    - *Verification Result*: Minor punctuation or whitespace difference, but essentially verbatim quote.
    - *Matched CV Text*: "- Engineered a semi-supervised model for detecting informal settlements using remote sensing...."

### Selective External Environments (`pedigree_and_environment`)
- **Rationale**: Selective labs, international research placements, and collaborations with recognized universities expose entry-level engineers to stronger technical standards and diverse problem settings. This matters for a role seeking candidates who can operate beyond classroom assignments.
- **Strong Criteria**: Substantive technical work with a recognized international university, research center, funded lab, or selective global program, rather than merely attending an exchange.
- **Moderate Criteria**: A university lab internship, local research assistantship, exchange semester, or externally supervised project with some technical responsibility.
- **Prevalence**: 7/30 candidates
- **Citations Audited**:
  - **[cand_24_abdullah_saim] Abdullah Saim** (`direct_quote` -> **exact_quote_match**)
    - *Citation Text*: "Collaborated with Prof. Zubair Shafique from UC Davis on the project “A Graph-based ML Approach to Detecting JavaScript-based Online Tracking.”"
    - *Context Stated*: Work: NUSTIAN USA International Summer Research Internship Program
    - *Verification Result*: Minor punctuation or whitespace difference, but essentially verbatim quote.
    - *Matched CV Text*: "- Collaborated with Prof. Zubair Shaﬁque from UC Davis on the project “A Graph-based ML Approach to Detecting JavaScript-based Online Tracking.” Conducted in-depth research on cookies, analyzing their..."
  - **[cand_27_muhammad_taha_mukhtar] Muhammad Taha Mukhtar** (`direct_quote` -> **exact_quote_match**)
    - *Citation Text*: "Leveraged Germany's largest deep learning infrastructure with H100/A100 GPUs for advanced AI research."
    - *Context Stated*: Work: Deutsches Forschungszentrum für Künstliche Intelligenz
    - *Verification Result*: Exact word-for-word quote found in candidate resume.
    - *Matched CV Text*: "Leveraged Germany's largest deep learning infrastructure with H100/A100 GPUs for advanced AI research...."
  - **[cand_20_ali_awais_safdar] Ali Awais Safdar** (`paraphrase` -> **accurate_paraphrase**)
    - *Citation Text*: "Held technical roles or internships with Nanyang Technological University in Singapore, the HPC Lab at SEECS, Radar Research Lab at SINES, and multiple remote organizations."
    - *Context Stated*: Work & Internship Experience
    - *Verification Result*: Accurate paraphrase of real work experience or project, verified against CV.
    - *Matched CV Text*: "### Radar Research Lab, SINES..."
  - **[cand_06_hasib_aslam] Hasib Aslam** (`direct_quote` -> **exact_quote_match**)
    - *Citation Text*: "Semester Exchange Program Linnaeus University, Passed With Distinction (2023)."
    - *Context Stated*: Education
    - *Verification Result*: Minor punctuation or whitespace difference, but essentially verbatim quote.
    - *Matched CV Text*: "## Education - BS in Computer Science School of Electrical Engineering and Computer Science , 3.83 - FSc Pre Engineering Punjab College , 1085/1100 (2021) - Matric Haider Memorial School , 1045/1100 (..."
  - **[cand_22_mariam_babar_khan] Mariam Babar Khan** (`direct_quote` -> **exact_quote_match**)
    - *Citation Text*: "University of California, Davis — Machine Learning Intern"
    - *Context Stated*: Work & Internship Experience
    - *Verification Result*: Minor punctuation or whitespace difference, but essentially verbatim quote.
    - *Matched CV Text*: "### University of California, Davis..."

### Quantified Real-World Impact (`scale_and_impact`)
- **Rationale**: Because the position targets production AI and product engineering, measurable outcomes help separate candidates who merely built prototypes from those who improved a system, user behavior, model performance, or operational workflow.
- **Strong Criteria**: Reports a credible metric tied to deployment, users, data volume, model evaluation, efficiency, adoption, or business outcome, ideally across a nontrivial project.
- **Moderate Criteria**: Includes a basic model accuracy, usage target, or qualitative deployment statement, but lacks a clear baseline, context, or operational consequence.
- **Prevalence**: 10/30 candidates
- **Citations Audited**:
  - **[cand_27_muhammad_taha_mukhtar] Muhammad Taha Mukhtar** (`direct_quote` -> **exact_quote_match**)
    - *Citation Text*: "Published as an npm package with 500+ downloads and has 5 Stars on GitHub."
    - *Context Stated*: Projects: lang-source, Open Source Project
    - *Verification Result*: Exact word-for-word quote found in candidate resume.
    - *Matched CV Text*: "Published as an npm package with 500+ downloads and has 5 Stars on GitHub...."
  - **[cand_19_abdullah_khan] Abdullah Khan** (`direct_quote` -> **exact_quote_match**)
    - *Citation Text*: "Improving predictive accuracy by 23% as measured by a custom dataset from 29 flights."
    - *Context Stated*: Work: Communication Systems and Network Lab
    - *Verification Result*: Minor punctuation or whitespace difference, but essentially verbatim quote.
    - *Matched CV Text*: "- Developed a machine learning model using Polynomial Regression to predict battery life cycles for UAVs in disaster management applications, improving predictive accuracy by 23% as measured by a cust..."
  - **[cand_11_muhammad_ahad_sajjad] Muhammad Ahad Sajjad** (`direct_quote` -> **exact_quote_match**)
    - *Citation Text*: "Designed and developed an embedded kiosk and mobile app for wellness monitoring using neuro-symbolic AI, boosting user retention by 75%."
    - *Context Stated*: Work: Reviva
    - *Verification Result*: Exact word-for-word quote found in candidate resume.
    - *Matched CV Text*: "Designed and developed an embedded kiosk and mobile app for wellness monitoring using neuro-symbolic AI, boosting user retention by 75%...."
  - **[cand_30_wahaj_ahmad_butt] Wahaj Ahmad Butt** (`direct_quote` -> **exact_quote_match**)
    - *Citation Text*: "Utilized the FER2013Plus dataset for emotion recognition and ResNet50 as the base CNN model, achieving an 82.7% accuracy."
    - *Context Stated*: Projects: Emotion-Based Music Recognition System
    - *Verification Result*: Exact word-for-word quote found in candidate resume.
    - *Matched CV Text*: "Utilized the FER2013Plus dataset for emotion recognition and ResNet50 as the base CNN model, achieving an 82.7% accuracy...."
  - **[cand_14_jatindar_kumar_mamnani] Jatindar Kumar Mamnani** (`direct_quote` -> **exact_quote_match**)
    - *Citation Text*: "Achieved 82.4% mIoU on the VIL-100 validation set for lane segmentation."
    - *Context Stated*: Projects: A Video Based Multi-Task Learning Model for Autonomous Driving
    - *Verification Result*: Exact word-for-word quote found in candidate resume.
    - *Matched CV Text*: "Achieved 82.4% mIoU on the VIL-100 validation set for lane segmentation...."

---

## 3. Key Findings

1. **Factual Accuracy in inside-out order**: 100.0% of citations verified cleanly against source resumes.
2. **Hallucination & Contamination**: 0 out of 24 citations (0.0%) suffered from factual fabrication or candidate cross-contamination.
