# Mechanism E: Emergent Axis Discovery Report (`exp1-budgeted-grad-ai-swe`)

## Run Configuration
- **Job**: AI / ML & Full-Stack Software Engineer (Graduate / Entry-Level) (`grad-ai-swe`)
- **Pool Source**: `exp1`
- **Candidate Order**: `canonical` (30 candidates)
- **Stage 0 Gatekeeper**: Not executed (pre-filtered or custom job spec)
- **Contenders in Prompt**: 30
- **Approximate Tokens**: Job Spec ~206t | Candidate Digests ~3989t | Full Prompt ~5296t
- **Provider Token Usage**: 6909 input / 2732 output (9641 total)
- **Latency**: 28117 ms


## Pool Summary
> The contender pool clusters into three standout profiles: research-oriented AI builders with publications, advanced computer-vision or multimodal systems, and product-oriented engineers with measurable user or business outcomes. A smaller but meaningful group demonstrates retrieval-augmented generation, real-time architecture, international lab exposure, or open-source traction beyond ordinary coursework projects.

## Discovered Emergent Differentiating Axes (5)

### axis_1: Research-Grade AI Evidence
- **Category**: `spiky_excellence`
- **Estimated Pool Prevalence**: 7/30 candidates show strong or moderate evidence
- **Rationale**: Research outputs, externally funded work, and reproducible model evaluation distinguish candidates who can contribute to production AI beyond assembling standard demos. This axis separates genuine research depth from merely listing ML tools or completing an undifferentiated ML project.
- **One-by-One Scoring Rubric**:
  - **Strong**: Active ownership [action] of at least one peer-reviewed publication, externally funded research project, or research-grade AI system with a reported metric, novel method, or substantial experimental contribution; evidence should resemble the pool’s published work, funded segmentation research, or quantified model-building.
  - **Moderate**: Active ownership [action] of a substantive AI research or advanced model project without publication or external validation, or a clearly documented research internship contribution with a concrete dataset, model, or evaluation; peripheral participation in a research project is only moderate at most.
- **Supporting Pool Citations ($O(1)$ Hydrated)**:
  - `[cand_01_muhammad_khizer_tariq:s1]` Digest: `[s1:action] Publication: FIT 2024 -> published Routing through Satellite Imagery paper`
    - *Verbatim Quote*: "Presented a Conference Paper at FIT 2024 Published a Conference paper related to my Final year project on "Routing through Satellite Imagery", the paper presents a novel ML based technique for solving the vehicle routing problem the paper is published at"
  - `[cand_01_muhammad_khizer_tariq:s2]` Digest: `[s2:action] Publication: IJCA -> published Grouped Matrix Clocks paper`
    - *Verbatim Quote*: "Published a Journal Paper in IJCA Published a Journal in International Journal for Computing Applications regarding Grouped Matrix Clocks for clock synchronization in Distributed Systems the paper can be accessed at: https://www.ijcaonline.org/"
  - `[cand_20_ali_awais_safdar:s1]` Digest: `[s1:action] Project: Ant Colony Optimization -> authored vehicle routing research paper`
    - *Verbatim Quote*: "Enhancing Vehicle Routing with Time Windows: A Machine Learning-Driven Ant Colony Optimization Authored a research paper focusing on integrating machine learning techniques with Ant Colony Optimization (ACO) to improve vehicle routing under time-window constraints."
  - `[cand_27_muhammad_taha_mukhtar:s1]` Digest: `[s1:action] Project: DAAD, RPTU, DFKI -> advanced Slum-i settlement segmentation | €80k DAAD funding`
    - *Verbatim Quote*: "Slum-i, Research Project Worked on a €80,000 DAAD-funded project in collaboration with RPTU & DFKI, where I interned in Germany. Aligned with 3 UN SDGs, focusing on improving living conditions for slum dwellers in Pakistan. Upcoming publication in a top remote sensing journal, using SSL for segmenting informal settlements."
  - `[cand_27_muhammad_taha_mukhtar:s2]` Digest: `[s2:action] Open-Source: Gemini API -> created lang-source localization CLI | 500+ downloads, 5 stars`
    - *Verbatim Quote*: "lang-source, Open Source Project Created a CLI utility using the Gemini API to automate localisation workﬂows, supporting 12 languages and reducing manual eﬀort in creating JSON/YAML language files. Published as an npm package with 500+ downloads and has 5 Stars on GitHub."

### axis_2: Multimodal Model-Building Depth
- **Category**: `domain_and_architecture`
- **Estimated Pool Prevalence**: 9/30 candidates show strong or moderate evidence
- **Rationale**: The role spans LLMs, retrieval, computer vision, and predictive modeling, while the pool contains a selective set of candidates who built nontrivial systems across modalities rather than single-model classroom exercises. The differentiator is hands-on architecture and evaluation of complex AI systems, not baseline Python or ML exposure.
- **One-by-One Scoring Rubric**:
  - **Strong**: Active ownership [action] of a complex multimodal or advanced vision/NLP system using multiple model families, modalities, or stages, with a concrete evaluation result such as 82%+ accuracy/mIoU, OCR or ANPR performance, VQA, segmentation, or a comparable measured outcome.
  - **Moderate**: Active ownership [action] of one substantial computer-vision, NLP, recommendation, or predictive-modeling system using a nontrivial architecture such as CNNs, Transformers, BERT, CLIP, LSTM, or YOLO, but without multiple modalities, staged architecture, or a quantified evaluation; a simple classifier with a metric is moderate.
- **Supporting Pool Citations ($O(1)$ Hydrated)**:
  - `[cand_14_jatindar_kumar_mamnani:s3]` Digest: `[s3:action] Project: CNNs, LSTMs, Transformers -> built VQA medical advisor system`
    - *Verbatim Quote*: "VQA-Based-Medical-Advisor Developed a medical visual question-answering system using CNNs for image features and LSTMs/ Transformers for text queries. Implemented multimodal fusion to combine image and text features."
  - `[cand_14_jatindar_kumar_mamnani:s4]` Digest: `[s4:action] Project: built autonomous-driving multitask model | 82.4% mIoU`
    - *Verbatim Quote*: "A Video Based Multi-Task Learning Model for Autonomous Driving Developed a cutting-edge multitask learning model for real-time autonomous driving. Engineered to perform semantic segmentation, lane detection, and object detection on edge devices with high Achieved 82.4% mIoU on the VIL-100 validation set for lane segmentation."
  - `[cand_20_ali_awais_safdar:s3]` Digest: `[s3:action] Project: VGG-19, BERT -> built PATHVQA medical VQA system`
    - *Verbatim Quote*: "PATHVQA-VGG19-BERT-ATTENTION Developed a medical Visual Question Answering (VQA) system utilizing VGG-19 for image feature extraction and BERT for textual question processing. Incorporated attention mechanisms to enhance contextual understanding, facilitating accurate responses to"
  - `[cand_30_wahaj_ahmad_butt:s1]` Digest: `[s1:action] Project: ResNet50, BERT -> designed VQA real-world image model`
    - *Verbatim Quote*: "Visual Question Answering for Real-World Images Designed a VQA model combining convolutional neural networks (ResNet50) for image feature extraction and transformer-based language models (BERT) for question encoding. Evaluated on the processed DAQUAR dataset, analyzing performance using accuracy and semantic similarity"
  - `[cand_30_wahaj_ahmad_butt:s4]` Digest: `[s4:action] Project: FER2013Plus, ResNet50 -> built Emotion-Based Music Recognition system | 82.7% accuracy`
    - *Verbatim Quote*: "Emotion-Based Music Recognition System Created a music recommendation system leveraging artiﬁcial intelligence to provide accurate music suggestions based on the user's emotional state, detected via a camera. Utilized the FER2013Plus dataset for emotion recognition and ResNet50 as the base CNN model, achieving an 82.7% accuracy."

### axis_3: RAG Retrieval Architecture
- **Category**: `domain_and_architecture`
- **Estimated Pool Prevalence**: 4/30 candidates show strong or moderate evidence
- **Rationale**: RAG is explicitly preferred for this role, but only a few candidates show exposure to the full retrieval mechanism rather than generic chatbot or LLM API usage. The key separation is active construction of hybrid retrieval and indexing pipelines with technically meaningful components and validation.
- **One-by-One Scoring Rubric**:
  - **Strong**: Active ownership [action] of an end-to-end RAG or semantic retrieval system combining at least two concrete mechanisms such as embeddings, BM25, FAISS, vector search, reranking, or domain-specific document retrieval, ideally with publication, evaluation, or a deployed workflow.
  - **Moderate**: Active ownership [action] of an LLM-powered assistant, semantic search, or document QA system using a single retrieval or model component, or peripheral contribution [peripheral] to a technically specified RAG pipeline such as embeddings/BM25/FAISS; generic ChatGPT API integration without retrieval is only moderate at most.
- **Supporting Pool Citations ($O(1)$ Hydrated)**:
  - `[cand_25_muhammad_abdullah:s2]` Digest: `[s2:action] Publication: BM25, FAISS, OpenAI embeddings -> developed FUSIONRAG regulatory retrieval | COLING 2025`
    - *Verbatim Quote*: "FUSIONRAG: Enhancing Regulatory Document Analysis Published at COLING 2025. Developed FUSIONRAG, combining OpenAI embeddings, BM25, FAISS, and Rank-Fusion for improved regulatory information retrieval and answer generation."
  - `[cand_08_muhammad_rouhan_faisal:s4]` Digest: `[s4:peripheral] Project: OpenAI embeddings, BM25, FAISS -> contributed FusionRAG regulatory retrieval`
    - *Verbatim Quote*: "Research on FusionRAG – NUST Alpha at RIRAG 2025 Contributed to the development of FusionRAG, a Retrieval-Augmented Generation (RAG) system designed to enhance regulatory document retrieval and question answering. Integrated OpenAI embeddings, BM25, FAISS, and a custom rank fusion strategy to combine lexical and semantic retrieval for improved accuracy and"
  - `[cand_14_jatindar_kumar_mamnani:s1]` Digest: `[s1:action] Project: FastAPI -> built Prompt-No-Code Website Assistant chatbot`
    - *Verbatim Quote*: "Prompt-No-Code Website Assistant Developed an AI-powered no-code chatbot assistant that extracts contextual insights from website URLs for Engineered an LLM-driven chatbot system using FastAPI, enabling real-time, context-aware user interactions."
  - `[cand_29_abdul_ahad_qureshi:s3]` Digest: `[s3:action] Project: Next.js -> integrated ChatGPT API solution`
    - *Verbatim Quote*: "ChatGPT API | Next.js, GPT API Seamless integration of GPT API with Next.js 13"

### axis_4: Quantified Product Impact
- **Category**: `scale_and_impact`
- **Estimated Pool Prevalence**: 6/30 candidates show strong or moderate evidence
- **Rationale**: Most candidates describe projects without adoption, business, or operational outcomes, whereas a small group demonstrates that their software changed engagement, retention, onboarding, usage, or processing performance. This axis is especially relevant to an applied AI and product-engineering role where prototypes must produce measurable user value.
- **One-by-One Scoring Rubric**:
  - **Strong**: Active ownership [action] of a shipped product or feature with at least one quantified outcome comparable to the pool’s evidence: roughly 30%+ improvement in engagement/satisfaction/retention, 25%+ reduction in onboarding, bounce, or inquiry burden, 50+ active users, 100+ daily users, or a similarly explicit business/usage metric.
  - **Moderate**: Active ownership [action] of a usable application with explicit but smaller-scale adoption, performance, or operational measurement, such as around 100 concurrent users, a quantified model/product result without clear business impact, or a concrete workflow improvement lacking a strong before-and-after metric.
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

### axis_5: Real-Time Full-Stack Architecture
- **Category**: `domain_and_architecture`
- **Estimated Pool Prevalence**: 8/30 candidates show strong or moderate evidence
- **Rationale**: The full-stack portion of the role favors candidates who can integrate frontend, backend, persistence, authentication, and live communication rather than deliver isolated UI pages. Real-time messaging, WebSockets, WebRTC, and multi-layer application ownership form a selective architectural cluster in this pool.
- **One-by-One Scoring Rubric**:
  - **Strong**: Active ownership [action] of a multi-layer web or mobile application that integrates frontend and backend services, persistence/authentication, and real-time behavior through WebSockets, Socket.IO, WebRTC, or an equivalent mechanism, with explicit concurrency, usage, or production-scope evidence when available.
  - **Moderate**: Active ownership [action] of a complete frontend-backend application with database and API integration, or a real-time feature without demonstrated scale; isolated frontend work, a static website, or peripheral backend support is not strong and is moderate only when paired with meaningful application ownership.
- **Supporting Pool Citations ($O(1)$ Hydrated)**:
  - `[cand_03_abdullah_aleem:s1]` Digest: `[s1:action] Project: WebSockets, Express.js, MongoDB -> built HomeDoc real-time service platform`
    - *Verbatim Quote*: "HomeDoc Implemented WebSockets to enable real-time communication between users and paramedics. Developed a RESTful API using Express.js for user and paramedic registration and service booking. Integrated MongoDB for data persistence, ensuring secure and scalable user data management."
  - `[cand_08_muhammad_rouhan_faisal:s3]` Digest: `[s3:action] Project: MongoDB, Express, Node.js -> built Chat Application real-time messenger | 100 concurrent users`
    - *Verbatim Quote*: "Chat Application Developed a real-time chat application using the MERN stack (MongoDB, Express, React, Node.js) to facilitate communication for up to 100 concurrent users. Implemented functionalities for 100 users to engage in seamless direct messaging and group chats, fostering"
  - `[cand_25_muhammad_abdullah:s1]` Digest: `[s1:action] Project: Next.js, Socket.IO -> built Scototo communication platform`
    - *Verbatim Quote*: "Scototo Built a platform for seamless text, voice, and video communication for individuals and teams. Tools Used: Next.js, SQL, Socket.IO, Tailwind, Clerk."
  - `[cand_29_abdul_ahad_qureshi:s2]` Digest: `[s2:action] Project: Socket.io, JSON Web Token (JWT) -> built Real-time Chat Application`
    - *Verbatim Quote*: "Real-time Chat Application | ReactJS, Express.js, Nodejs, MongoDB, Socket.io Developed areal-time chat application using the Web Sockets. Authentication using JSON Web Token (JWT)."
  - `[cand_30_wahaj_ahmad_butt:s3]` Digest: `[s3:action] Project: Laravel, WebRTC, MySQL -> built Palingenesis chat video application`
    - *Verbatim Quote*: "Palingenesis Created a chat and video calling Laravel application using Web-RTC for connectivity. Made use of JWT web tokens for user authentication and stores data in a MySQL database. Also wrote extensive documentation, drawing up ERDs for the relation between various functionalities."
