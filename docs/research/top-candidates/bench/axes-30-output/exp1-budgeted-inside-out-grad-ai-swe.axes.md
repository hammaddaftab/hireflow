# Mechanism E: Emergent Axis Discovery Report (`exp1-budgeted-inside-out-grad-ai-swe`)

## Run Configuration
- **Job**: AI / ML & Full-Stack Software Engineer (Graduate / Entry-Level) (`grad-ai-swe`)
- **Pool Source**: `exp1`
- **Candidate Order**: `inside-out` (30 candidates)
- **Stage 0 Gatekeeper**: Not executed (pre-filtered or custom job spec)
- **Contenders in Prompt**: 30
- **Approximate Tokens**: Job Spec ~206t | Candidate Digests ~3989t | Full Prompt ~5296t
- **Provider Token Usage**: 6909 input / 2821 output (9730 total)
- **Latency**: 27397 ms


## Pool Summary
> The pool separates into a technically strong AI/research cluster with multimodal models, retrieval systems, publications, and selective international labs, and a product-engineering cluster with quantified user, engagement, and workflow outcomes. The clearest upper-echelon signals are measurable model quality, end-to-end retrieval/LLM construction, demonstrated product impact, selective research exposure, and externally validated technical output.

## Discovered Emergent Differentiating Axes (5)

### axis_1: Measured Multimodal Model Engineering
- **Category**: `scale_and_impact`
- **Estimated Pool Prevalence**: 8/30 candidates
- **Rationale**: This distinguishes candidates who moved beyond baseline ML coursework into active construction and measurement of meaningful computer-vision, NLP, or multimodal systems. Quantified performance and technically nontrivial architectures are concentrated among the strongest AI-oriented candidates in this pool.
- **One-by-One Scoring Rubric**:
  - **Strong**: Active ownership [action] of at least two substantial applied AI systems, or one technically advanced training/engineering effort, with explicit evaluation such as approximately 80%+ accuracy/F1, 80%+ mIoU, or a comparable benchmark; evidence should include named architectures, datasets, GPUs, or fine-tuning methods rather than only a model name.
  - **Moderate**: Active ownership [action] of one applied ML system with a named model family, dataset, or implementation mechanism but no quantified evaluation, or one quantified but relatively standard classifier/detector at project or internship scope. Peripheral participation or an unbacked tool listing does not qualify as moderate by itself.
- **Supporting Pool Citations ($O(1)$ Hydrated)**:
  - `[cand_14_jatindar_kumar_mamnani:s4]` Digest: `[s4:action] Project: built autonomous-driving multitask model | 82.4% mIoU`
    - *Verbatim Quote*: "A Video Based Multi-Task Learning Model for Autonomous Driving Developed a cutting-edge multitask learning model for real-time autonomous driving. Engineered to perform semantic segmentation, lane detection, and object detection on edge devices with high Achieved 82.4% mIoU on the VIL-100 validation set for lane segmentation."
  - `[cand_27_muhammad_taha_mukhtar:c1]` Digest: `[c1:action] FixMatch, SAM2, H100 GPUs, A100 GPUs, remote sensing -> engineered settlement detection model`
    - *Verbatim Quote*: "Engineered a semi-supervised model for detecting informal settlements using remote sensing. Applied techniques like FixMatch, domain adaptation between cies and pseudo-label reﬁnement via SAM2. Leveraged Germany's largest deep learning infrastructure with H100/A100 GPUs for advanced AI research."
  - `[cand_30_wahaj_ahmad_butt:s1]` Digest: `[s1:action] Project: ResNet50, BERT -> designed VQA real-world image model`
    - *Verbatim Quote*: "Visual Question Answering for Real-World Images Designed a VQA model combining convolutional neural networks (ResNet50) for image feature extraction and transformer-based language models (BERT) for question encoding. Evaluated on the processed DAQUAR dataset, analyzing performance using accuracy and semantic similarity"
  - `[cand_30_wahaj_ahmad_butt:s4]` Digest: `[s4:action] Project: FER2013Plus, ResNet50 -> built Emotion-Based Music Recognition system | 82.7% accuracy`
    - *Verbatim Quote*: "Emotion-Based Music Recognition System Created a music recommendation system leveraging artiﬁcial intelligence to provide accurate music suggestions based on the user's emotional state, detected via a camera. Utilized the FER2013Plus dataset for emotion recognition and ResNet50 as the base CNN model, achieving an 82.7% accuracy."
  - `[cand_06_hasib_aslam:c1]` Digest: `[c1:action] developed Cat and Dog Classifier | 98% accuracy`
    - *Verbatim Quote*: "learned basics of Machine Learning Deep Learning developed a Cat and Dog Classifier with 98% accuracy"

### axis_2: RAG, Search & LLM Systems
- **Category**: `domain_and_architecture`
- **Estimated Pool Prevalence**: 7/30 candidates
- **Rationale**: Production AI work for this role benefits from understanding retrieval pipelines, semantic indexing, and LLM-facing system composition rather than isolated model training. Only a small subset of this pool shows active ownership of multi-stage retrieval or search architectures with concrete components.
- **One-by-One Scoring Rubric**:
  - **Strong**: Active ownership [action] of an end-to-end retrieval or LLM system using at least two concrete mechanisms such as embeddings, BM25, FAISS/vector indexing, semantic search, reranking, or retrieval evaluation; strongest evidence includes a working search/RAG product, domain-specific retrieval, or publication-quality implementation.
  - **Moderate**: Active ownership [action] of a search engine, LLM application, chatbot, or question-answering system using one meaningful retrieval/model-integration mechanism, such as semantic search, ChatGPT API integration, transformer table answering, or a prompt assistant, without evidence of a full retrieval pipeline or evaluation.
- **Supporting Pool Citations ($O(1)$ Hydrated)**:
  - `[cand_25_muhammad_abdullah:s2]` Digest: `[s2:action] Publication: BM25, FAISS, OpenAI embeddings -> developed FUSIONRAG regulatory retrieval | COLING 2025`
    - *Verbatim Quote*: "FUSIONRAG: Enhancing Regulatory Document Analysis Published at COLING 2025. Developed FUSIONRAG, combining OpenAI embeddings, BM25, FAISS, and Rank-Fusion for improved regulatory information retrieval and answer generation."
  - `[cand_18_abdul_rehman:s1]` Digest: `[s1:action] Project: Apache Solr, CLIP, Flickr30k -> built semantic image search engine`
    - *Verbatim Quote*: "Semantic based image search engine using Solr Developed a semantic-based image search engine using Apache Solr to eﬃciently retrieve images based on Utilized the Flickr30k dataset and integrated the CLIP model for generating feature vectors of images."
  - `[cand_18_abdul_rehman:s2]` Digest: `[s2:action] Project: Bloom Filter, BERT, PageRank -> built Google-like web search engine`
    - *Verbatim Quote*: "Search engine like google Designed and implemented a web page search engine integrating multiple technologies for eﬃcient Employed a Crawler and Bloom Filter to collect and ﬁlter URLs, storing data for processing with BERT and PageRank algorithms."
  - `[cand_14_jatindar_kumar_mamnani:s2]` Digest: `[s2:action] Project: Transformers -> built SemEval table-answering system`
    - *Verbatim Quote*: "SemEval-Task-8-Table Answering Built a tabular QA system using transformer-based NLP for structured data retrieval. Implemented text-to-SQL conversion using pre-trained language models to generate structured queries."
  - `[cand_29_abdul_ahad_qureshi:s3]` Digest: `[s3:action] Project: Next.js -> integrated ChatGPT API solution`
    - *Verbatim Quote*: "ChatGPT API | Next.js, GPT API Seamless integration of GPT API with Next.js 13"

### axis_3: Quantified Product Engineering Impact
- **Category**: `scale_and_impact`
- **Estimated Pool Prevalence**: 8/30 candidates
- **Rationale**: The full-stack side of the role requires turning software into usable products, and several contenders demonstrate this through adoption, concurrency, retention, conversion, or operational outcomes. These measurable results separate product ownership from merely listing frameworks or completing undifferentiated applications.
- **One-by-One Scoring Rubric**:
  - **Strong**: Active ownership [action] of a product or production-facing system with at least one concrete scale or outcome signal at the upper end of this pool—approximately 100+ daily users, 100 concurrent users, or two quantified product outcomes such as retention, engagement, bounce, onboarding, or processing-time improvement.
  - **Moderate**: Active ownership [action] of a complete web, mobile, real-time, or workflow application with clear user-facing functionality, but without quantified adoption or business impact; quantified results below the strong thresholds or contribution to a larger system also qualify as moderate.
- **Supporting Pool Citations ($O(1)$ Hydrated)**:
  - `[cand_11_muhammad_ahad_sajjad:c1]` Digest: `[c1:action] built wellness monitoring kiosk and app | +75% retention, -25% onboarding`
    - *Verbatim Quote*: "Designed and developed an embedded kiosk and mobile app for wellness monitoring using neuro-symbolic AI, boosting user retention by 75%. Conducted extensive user research, including surveys and interviews, leading to a 25% reduction in onboarding time."
  - `[cand_11_muhammad_ahad_sajjad:c2]` Digest: `[c2:action] created HeroCV resume builder | +70% engagement`
    - *Verbatim Quote*: "Created HeroCV, an AI-powered resume builder, increasing user engagement by 70%."
  - `[cand_11_muhammad_ahad_sajjad:c3]` Digest: `[c3:action] designed AptScout apartment platform | +40% engagement, -70% bounce`
    - *Verbatim Quote*: "Designed AptScout, an apartment listing platform, improving user engagement by 40% and reducing bounce rates by 70%."
  - `[cand_29_abdul_ahad_qureshi:c2]` Digest: `[c2:action] Figma -> developed scalable management system | 100+ daily users`
    - *Verbatim Quote*: "Developing a scalable management system targeted for 100+ daily users. Collaborate with the project manager and stakeholders to create requirements documents and Figma designs."
  - `[cand_08_muhammad_rouhan_faisal:s3]` Digest: `[s3:action] Project: MongoDB, Express, Node.js -> built Chat Application real-time messenger | 100 concurrent users`
    - *Verbatim Quote*: "Chat Application Developed a real-time chat application using the MERN stack (MongoDB, Express, React, Node.js) to facilitate communication for up to 100 concurrent users. Implemented functionalities for 100 users to engage in seamless direct messaging and group chats, fostering"

### axis_4: Selective Research Environment Exposure
- **Category**: `pedigree_and_environment`
- **Estimated Pool Prevalence**: 7/30 candidates
- **Rationale**: The job explicitly values selective labs and international experience, and this pool contains a small cluster with exposure to DFKI, Lakehead, UC Davis, GSoC, and distinguished exchange programs. The differentiator is substantive technical ownership in those environments, not simply attendance or a generic internship title.
- **One-by-One Scoring Rubric**:
  - **Strong**: Verified work-history or header evidence of active technical work [action] in a selective international research environment, major open-source program, or distinguished exchange, with a concrete engineering or research contribution; examples include DFKI/Lakehead/UC Davis research, GSoC, or a distinction-backed international exchange.
  - **Moderate**: Verified research or engineering experience in a university lab, research internship, or comparable structured environment with an active technical contribution [action], but without clear international selectivity, major-program distinction, or evidence of advanced research scope.
- **Supporting Pool Citations ($O(1)$ Hydrated)**:
  - `[cand_27_muhammad_taha_mukhtar:c1]` Digest: `[c1:action] FixMatch, SAM2, H100 GPUs, A100 GPUs, remote sensing -> engineered settlement detection model`
    - *Verbatim Quote*: "Engineered a semi-supervised model for detecting informal settlements using remote sensing. Applied techniques like FixMatch, domain adaptation between cies and pseudo-label reﬁnement via SAM2. Leveraged Germany's largest deep learning infrastructure with H100/A100 GPUs for advanced AI research."
  - `[cand_27_muhammad_taha_mukhtar:c2]` Digest: `[c2:action] Cypress -> improved CVAT shortcut system | 100% test coverage`
    - *Verbatim Quote*: "Improved the CVAT platform by adding a user-conﬁgurable shortcut system, enhancing annotation eﬃciency. Tested new shortcut features with Cypress, achieving 100% test coverage."
  - `[cand_06_hasib_aslam:c2]` Digest: `[c2:action] EEG -> processed authentication datasets`
    - *Verbatim Quote*: "Identify relevant public EEG data sets that are collected with diﬀerent types of stimuli and tasks. Determine the relevance and usefulness of the activities for EEG authentication. Use basic digital processing techniques to obtain noise free data sets to be used for the authentication study."
  - `[cand_06_hasib_aslam:header]` Digest: `[cand_06_hasib_aslam] 0y FT (2 internships) | Semester Exchange Program @ Linnaeus University (Passed With Distinction) | Islamabad`
  - `[cand_22_mariam_babar_khan:work_2]` Digest: `work_2: ML Intern @ University of California, Davis (2024-2024, 0.3y internship)`

### axis_5: Externally Validated Technical Output
- **Category**: `spiky_excellence`
- **Estimated Pool Prevalence**: 6/30 candidates
- **Rationale**: Publications, funded research, and open-source traction provide independent validation beyond classroom or internship claims and are unusually concentrated among the strongest research-oriented contenders. This axis measures the external artifact or recognition itself, while remaining distinct from the environment in which the work occurred.
- **One-by-One Scoring Rubric**:
  - **Strong**: Active ownership [action] of at least one externally validated technical artifact at a high bar, such as two peer-reviewed or conference publications, a funded research project, or an open-source contribution with demonstrated traction such as 500+ downloads; the artifact must identify the candidate's technical contribution.
  - **Moderate**: Active ownership [action] of one publication, conference paper, funded project, or released open-source artifact with some concrete external evidence, but below the strong level in count, selectivity, funding, or adoption. A course project, peripheral contribution, or tool listing alone does not qualify.
- **Supporting Pool Citations ($O(1)$ Hydrated)**:
  - `[cand_01_muhammad_khizer_tariq:s1]` Digest: `[s1:action] Publication: FIT 2024 -> published Routing through Satellite Imagery paper`
    - *Verbatim Quote*: "Presented a Conference Paper at FIT 2024 Published a Conference paper related to my Final year project on "Routing through Satellite Imagery", the paper presents a novel ML based technique for solving the vehicle routing problem the paper is published at"
  - `[cand_01_muhammad_khizer_tariq:s2]` Digest: `[s2:action] Publication: IJCA -> published Grouped Matrix Clocks paper`
    - *Verbatim Quote*: "Published a Journal Paper in IJCA Published a Journal in International Journal for Computing Applications regarding Grouped Matrix Clocks for clock synchronization in Distributed Systems the paper can be accessed at: https://www.ijcaonline.org/"
  - `[cand_27_muhammad_taha_mukhtar:s1]` Digest: `[s1:action] Project: DAAD, RPTU, DFKI -> advanced Slum-i settlement segmentation | €80k DAAD funding`
    - *Verbatim Quote*: "Slum-i, Research Project Worked on a €80,000 DAAD-funded project in collaboration with RPTU & DFKI, where I interned in Germany. Aligned with 3 UN SDGs, focusing on improving living conditions for slum dwellers in Pakistan. Upcoming publication in a top remote sensing journal, using SSL for segmenting informal settlements."
  - `[cand_27_muhammad_taha_mukhtar:s2]` Digest: `[s2:action] Open-Source: Gemini API -> created lang-source localization CLI | 500+ downloads, 5 stars`
    - *Verbatim Quote*: "lang-source, Open Source Project Created a CLI utility using the Gemini API to automate localisation workﬂows, supporting 12 languages and reducing manual eﬀort in creating JSON/YAML language files. Published as an npm package with 500+ downloads and has 5 Stars on GitHub."
  - `[cand_20_ali_awais_safdar:s2]` Digest: `[s2:action] Publication: FIT 2024 Conference -> presented vehicle routing research paper`
    - *Verbatim Quote*: "Presented the paper at the FIT 2024 Conference, showcasing innovative approaches to solving logistics and optimization challenges using AI"
