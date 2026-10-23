# Mechanism E: Emergent Axis Discovery Report (`exp1-budgeted-grad-ai-swe`)

## Run Configuration
- **Job**: AI / ML & Full-Stack Software Engineer (Graduate / Entry-Level) (`grad-ai-swe`)
- **Pool Source**: `exp1`
- **Stage 0 Gatekeeper**: Not executed (pre-filtered or custom job spec)
- **Contenders in Prompt**: 10
- **Approximate Tokens**: Job Spec ~206t | Candidate Digests ~1197t | Full Prompt ~2504t
- **Provider Token Usage**: 3353 input / 1802 output (5155 total)
- **Latency**: 17842 ms


## Pool Summary
> The contender pool separates into a few clear standout clusters: publication-oriented research, hands-on computer-vision/AI implementation, and end-to-end product builders with real-time or quantified usage. International/selective research exposure is rarer, while most candidates show only project-level full-stack or research evidence without measured production impact.

## Discovered Emergent Differentiating Axes (4)

### axis_1: Publication-Backed Research Depth
- **Category**: `spiky_excellence`
- **Estimated Pool Prevalence**: 3/10 candidates show strong or moderate evidence
- **Rationale**: For an entry-level Applied AI role, demonstrated research output is a stronger differentiator than merely listing machine-learning skills or coursework. The pool contains a small publication cluster and a broader group with research-assistant or research-intern exposure but no scholarly output.
- **One-by-One Scoring Rubric**:
  - **Strong**: At least two completed peer-reviewed or formally published technical research outputs with active authorship ownership [action], preferably involving AI, computer vision, optimization, or systems methods; this matches the highest research signal observed in the pool.
  - **Moderate**: Active research-assistant or research-intern ownership of a technical investigation, dataset, or model without publication evidence, or one completed publication/project with research framing. Passive lab participation or a generic AI project alone does not qualify as strong.
- **Supporting Pool Citations ($O(1)$ Hydrated)**:
  - `[cand_01_muhammad_khizer_tariq:s1]` Digest: `[s1:action] Publication: FIT 2024 -> published Routing through Satellite Imagery paper`
    - *Verbatim Quote*: "Presented a Conference Paper at FIT 2024 Published a Conference paper related to my Final year project on "Routing through Satellite Imagery", the paper presents a novel ML based technique for solving the vehicle routing problem the paper is published at"
  - `[cand_01_muhammad_khizer_tariq:s2]` Digest: `[s2:action] Publication: IJCA -> published Grouped Matrix Clocks paper`
    - *Verbatim Quote*: "Published a Journal Paper in IJCA Published a Journal in International Journal for Computing Applications regarding Grouped Matrix Clocks for clock synchronization in Distributed Systems the paper can be accessed at: https://www.ijcaonline.org/"
  - `[cand_06_hasib_aslam:c2]` Digest: `[c2:action] EEG -> processed authentication datasets`
    - *Verbatim Quote*: "Identify relevant public EEG data sets that are collected with diﬀerent types of stimuli and tasks. Determine the relevance and usefulness of the activities for EEG authentication. Use basic digital processing techniques to obtain noise free data sets to be used for the authentication study."
  - `[cand_09_hafiz_ahmed_hassan_chohan:work_2]` Digest: `work_2: Research Assistant @ PakThai Lab NUST (2024-2025, 0.9y FT)`
  - `[cand_10_muhammad_aleem_siddique_khan:work_1]` Digest: `work_1: Research Intern @ NUST (2024-2024, 0.6y internship)`

### axis_2: Quantified AI/CV System Ownership
- **Category**: `scale_and_impact`
- **Estimated Pool Prevalence**: 3/10 candidates show strong or moderate evidence
- **Rationale**: The job emphasizes production AI/ML, yet most candidates provide only unquantified project descriptions. The upper pool is distinguished by personally building a model or vision system with an explicit accuracy, recognition, or processing outcome.
- **One-by-One Scoring Rubric**:
  - **Strong**: Personally built and implemented an AI, machine-learning, or computer-vision system [action] with a concrete performance or operational metric, such as the 98% classifier accuracy observed in this pool, or an implemented OCR/ANPR pipeline with a clearly defined recognition/conversion outcome.
  - **Moderate**: Active ownership [action] of a nontrivial AI/CV model or pipeline—such as classification, OCR, ANPR, EEG processing, or recommendation—without a quantified result, or a quantified ML exercise that lacks evidence of an end-to-end system. Peripheral contribution, coursework, or a tool listing is insufficient for strong.
- **Supporting Pool Citations ($O(1)$ Hydrated)**:
  - `[cand_06_hasib_aslam:c1]` Digest: `[c1:action] developed Cat and Dog Classifier | 98% accuracy`
    - *Verbatim Quote*: "learned basics of Machine Learning Deep Learning developed a Cat and Dog Classifier with 98% accuracy"
  - `[cand_06_hasib_aslam:c2]` Digest: `[c2:action] EEG -> processed authentication datasets`
    - *Verbatim Quote*: "Identify relevant public EEG data sets that are collected with diﬀerent types of stimuli and tasks. Determine the relevance and usefulness of the activities for EEG authentication. Use basic digital processing techniques to obtain noise free data sets to be used for the authentication study."
  - `[cand_09_hafiz_ahmed_hassan_chohan:s2]` Digest: `[s2:action] Project: OCR -> built Convert to EBooks conversion system`
    - *Verbatim Quote*: "Convert to EBooks Created a system to convert physical book images or PDFs into fully formatted eBooks using deep learning and OCR technologies. Trained a deep neural network for segmentation, accurately extracting text from diverse fonts and layouts."
  - `[cand_09_hafiz_ahmed_hassan_chohan:s3]` Digest: `[s3:action] Project: OpenCV, easy-ocr -> built ANPR license plate recognizer`
    - *Verbatim Quote*: "ANPR– Automatic Number Plate Recognition System Developed a real-time ANPR system using computer vision and deep learning, accurately detecting and recognizing vehicle license plates. Built a robust image processing pipeline using OpenCV and integrated it with easy-ocr for character"
  - `[cand_03_abdullah_aleem:s2]` Digest: `[s2:action] Project: collaborative filtering, Flask -> built Otaku Guide recommendation engine`
    - *Verbatim Quote*: "Otaku Guide Integrated collaborative and content-based ﬁltering algorithms to recommend anime based on user history. Developed custom user-based recommendation algorithms to enhance personalized recommendations. Built a REST API in Flask to handle data processing and recommendations, enabling efficient communica"

### axis_3: Real-Time Product Engineering Scale
- **Category**: `scale_and_impact`
- **Estimated Pool Prevalence**: 5/10 candidates show strong or moderate evidence
- **Rationale**: Full-stack capability is common in this pool, but real-time behavior and explicit usage scale provide a more selective signal for production product engineering. This axis distinguishes candidates who moved beyond CRUD-style applications into concurrent messaging, WebSocket services, or workflow systems.
- **One-by-One Scoring Rubric**:
  - **Strong**: Actively built [action] an end-to-end real-time or workflow product across frontend and backend layers, with explicit concurrency or operational scale such as approximately 100 concurrent users, WebSocket-based interaction, or an equivalent measurable system behavior.
  - **Moderate**: Actively built [action] a multi-layer web or mobile product using backend, database, and frontend components, including a real-time, workflow, booking, marketplace, or recommendation feature, but without explicit scale metrics or demonstrated production operation.
- **Supporting Pool Citations ($O(1)$ Hydrated)**:
  - `[cand_08_muhammad_rouhan_faisal:s3]` Digest: `[s3:action] Project: MongoDB, Express, Node.js -> built Chat Application real-time messenger | 100 concurrent users`
    - *Verbatim Quote*: "Chat Application Developed a real-time chat application using the MERN stack (MongoDB, Express, React, Node.js) to facilitate communication for up to 100 concurrent users. Implemented functionalities for 100 users to engage in seamless direct messaging and group chats, fostering"
  - `[cand_03_abdullah_aleem:s1]` Digest: `[s1:action] Project: WebSockets, Express.js, MongoDB -> built HomeDoc real-time service platform`
    - *Verbatim Quote*: "HomeDoc Implemented WebSockets to enable real-time communication between users and paramedics. Developed a RESTful API using Express.js for user and paramedic registration and service booking. Integrated MongoDB for data persistence, ensuring secure and scalable user data management."
  - `[cand_05_ali_murad:s1]` Digest: `[s1:action] Project: React, React Flow -> built Generic Builder workflow editor`
    - *Verbatim Quote*: "Generic Builder A React and React Flow-based workﬂow editor enabling users to create, edit, and visualize ﬂows with customizable nodes, drag-and-drop editing, real-time updates, and state persistence. Features include zooming, panning, and smooth user interactions, showcasing expertise in React, state"
  - `[cand_06_hasib_aslam:s1]` Digest: `[s1:action] Project: Express.js, React.js, Next.js -> built Hotel Booking Management Website`
    - *Verbatim Quote*: "Hotel Booking and Management Website A online platform where you can book the apartments in hotels and also put your own to be rented out. It is developed using Express js , React js along with next js. MYSQL is used as database to developed this app."
  - `[cand_03_abdullah_aleem:c1]` Digest: `[c1:action] Flutter, Firebase, Firestore -> developed client mobile application`
    - *Verbatim Quote*: "Intern Software Developer Independently designed and developed a mobile application for a client using Flutter, seamlessly integrating Firebase for backend functionality and Firestore for efficient database management, ensuring a streamlined user experience."

### axis_4: International Research Environment
- **Category**: `pedigree_and_environment`
- **Estimated Pool Prevalence**: 4/10 candidates show strong or moderate evidence
- **Rationale**: The role explicitly values selective labs and international experience, and this pool contains a rare international academic/research signal distinct from ordinary internships or local project work. It indicates exposure to different research standards and engineering environments, but should not substitute for proof of technical ownership.
- **One-by-One Scoring Rubric**:
  - **Strong**: Verified participation in an international university, exchange, or research-lab environment with distinction or active technical contribution [action], such as an overseas research internship plus distinguished exchange performance; the candidate must show more than attendance or a passive affiliation.
  - **Moderate**: Verified active placement in a selective university research lab or technical lab, or international academic exposure without both a distinguished outcome and substantial technical ownership. Local lab affiliation alone is moderate only when paired with a concrete research role or output.
- **Supporting Pool Citations ($O(1)$ Hydrated)**:
  - `[cand_06_hasib_aslam:header]` Digest: `[cand_06_hasib_aslam] 0y FT (2 internships) | Semester Exchange Program @ Linnaeus University (Passed With Distinction) | Islamabad`
  - `[cand_06_hasib_aslam:work_2]` Digest: `work_2: Research Intern @ Lakehead University, Canada (2024-2024, 0.3y internship)`
  - `[cand_01_muhammad_khizer_tariq:work_1]` Digest: `work_1: Researcher @ High Performance Computing Lab SEECS (2024-2024, 1y FT)`
  - `[cand_01_muhammad_khizer_tariq:work_2]` Digest: `work_2: Researcher @ Machine Vision and Intelligent Systems Lab SEECS (2024-2025, 0.5y FT)`
  - `[cand_09_hafiz_ahmed_hassan_chohan:work_2]` Digest: `work_2: Research Assistant @ PakThai Lab NUST (2024-2025, 0.9y FT)`
