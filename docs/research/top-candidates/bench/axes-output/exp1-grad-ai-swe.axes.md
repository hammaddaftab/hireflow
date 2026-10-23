# Mechanism E: Emergent Axis Discovery Report (`exp1-grad-ai-swe`)

## Run Configuration
- **Job**: AI / ML & Full-Stack Software Engineer (Graduate / Entry-Level) (`grad-ai-swe`)
- **Pool Source**: `exp1`
- **Stage 0 Gatekeeper**: Not executed (pre-filtered or custom job spec)
- **Contenders in Prompt**: 10
- **Approximate Tokens**: Job Spec ~206t | Candidate Digests ~1197t | Full Prompt ~2504t
- **Provider Token Usage**: 3353 input / 2353 output (5706 total)
- **Latency**: 21754 ms


## Pool Summary
> The pool separates into a small research-oriented cluster, a stronger applied-AI/CV cluster, and a broader group with hands-on full-stack product builds. The clearest upper-tail signals are publication-level research output, end-to-end AI artifacts with measurable results, real-time or multi-component product engineering, and international or named-lab exposure.

## Discovered Emergent Differentiating Axes (4)

### axis_1: Publication-Level Research Depth
- **Category**: `spiky_excellence`
- **Estimated Pool Prevalence**: 3/10 candidates show strong or moderate evidence
- **Rationale**: For an applied AI/ML entry role, demonstrated research output is materially stronger than merely listing machine-learning coursework or participating in a research setting. This axis separates the candidate with peer-reviewed publications from candidates whose research exposure is primarily assistantship or study-based.
- **One-by-One Scoring Rubric**:
  - **Strong**: Strong requires active authorship of at least one research publication or equivalent formally disseminated technical research artifact, with the candidate clearly owning the research contribution; two publications in the pool represent the upper benchmark.
  - **Moderate**: Moderate requires active research work such as processing an experimental dataset, developing a research model, or serving in a research-assistant role, but without verified publication authorship or a clearly reported research result.
- **Supporting Pool Citations ($O(1)$ Hydrated)**:
  - `[cand_01_muhammad_khizer_tariq:s1]` Digest: `[s1:action] Publication: FIT 2024 -> published Routing through Satellite Imagery paper`
    - *Verbatim Quote*: "Presented a Conference Paper at FIT 2024 Published a Conference paper related to my Final year project on "Routing through Satellite Imagery", the paper presents a novel ML based technique for solving the vehicle routing problem the paper is published at"
  - `[cand_01_muhammad_khizer_tariq:s2]` Digest: `[s2:action] Publication: IJCA -> published Grouped Matrix Clocks paper`
    - *Verbatim Quote*: "Published a Journal Paper in IJCA Published a Journal in International Journal for Computing Applications regarding Grouped Matrix Clocks for clock synchronization in Distributed Systems the paper can be accessed at: https://www.ijcaonline.org/"
  - `[cand_06_hasib_aslam:c2]` Digest: `[c2:action] EEG -> processed authentication datasets`
    - *Verbatim Quote*: "Identify relevant public EEG data sets that are collected with diﬀerent types of stimuli and tasks. Determine the relevance and usefulness of the activities for EEG authentication. Use basic digital processing techniques to obtain noise free data sets to be used for the authentication study."
  - `[cand_09_hafiz_ahmed_hassan_chohan:work_2]` Digest: `work_2: Research Assistant @ PakThai Lab NUST (2024-2025, 0.9y FT)`

### axis_2: Measured Applied AI Builds
- **Category**: `scale_and_impact`
- **Estimated Pool Prevalence**: 5/10 candidates show strong or moderate evidence
- **Rationale**: The role emphasizes production-oriented AI, computer vision, and predictive systems, so active construction of working AI artifacts with explicit evaluation or recognition performance is more differentiating than generic ML exposure. The pool contains a small set of candidates with concrete classifiers, OCR, ANPR, or recommendation systems.
- **One-by-One Scoring Rubric**:
  - **Strong**: Strong requires active ownership of an end-to-end applied AI or computer-vision system with a concrete performance or operational result, such as a classifier reporting 98% accuracy or a functioning OCR/ANPR recognition pipeline; the work must describe what the candidate built rather than only the tool or model used.
  - **Moderate**: Moderate requires active ownership of an applied ML, recommendation, OCR, image-processing, or data-processing artifact without a quantified performance result, or active dataset/model work that is technically relevant but narrower than a complete evaluated system.
- **Supporting Pool Citations ($O(1)$ Hydrated)**:
  - `[cand_06_hasib_aslam:c1]` Digest: `[c1:action] developed Cat and Dog Classifier | 98% accuracy`
    - *Verbatim Quote*: "learned basics of Machine Learning Deep Learning developed a Cat and Dog Classifier with 98% accuracy"
  - `[cand_09_hafiz_ahmed_hassan_chohan:s2]` Digest: `[s2:action] Project: OCR -> built Convert to EBooks conversion system`
    - *Verbatim Quote*: "Convert to EBooks Created a system to convert physical book images or PDFs into fully formatted eBooks using deep learning and OCR technologies. Trained a deep neural network for segmentation, accurately extracting text from diverse fonts and layouts."
  - `[cand_09_hafiz_ahmed_hassan_chohan:s3]` Digest: `[s3:action] Project: OpenCV, easy-ocr -> built ANPR license plate recognizer`
    - *Verbatim Quote*: "ANPR– Automatic Number Plate Recognition System Developed a real-time ANPR system using computer vision and deep learning, accurately detecting and recognizing vehicle license plates. Built a robust image processing pipeline using OpenCV and integrated it with easy-ocr for character"
  - `[cand_03_abdullah_aleem:s2]` Digest: `[s2:action] Project: collaborative filtering, Flask -> built Otaku Guide recommendation engine`
    - *Verbatim Quote*: "Otaku Guide Integrated collaborative and content-based ﬁltering algorithms to recommend anime based on user history. Developed custom user-based recommendation algorithms to enhance personalized recommendations. Built a REST API in Flask to handle data processing and recommendations, enabling efficient communica"
  - `[cand_06_hasib_aslam:c2]` Digest: `[c2:action] EEG -> processed authentication datasets`
    - *Verbatim Quote*: "Identify relevant public EEG data sets that are collected with diﬀerent types of stimuli and tasks. Determine the relevance and usefulness of the activities for EEG authentication. Use basic digital processing techniques to obtain noise free data sets to be used for the authentication study."

### axis_3: Real-Time Product Systems
- **Category**: `domain_and_architecture`
- **Estimated Pool Prevalence**: 6/10 candidates show strong or moderate evidence
- **Rationale**: Applied AI engineers in this role must integrate models into usable software, making architectural complexity and product execution an important separator from isolated notebooks or simple websites. Real-time communication, workflow systems, multi-component web stacks, and explicit concurrency are the strongest system-building signals in this pool.
- **One-by-One Scoring Rubric**:
  - **Strong**: Strong requires active ownership of a multi-component full-stack system with real-time or workflow-oriented architecture, anchored by evidence such as WebSockets or a workflow editor and preferably an explicit operating benchmark such as 100 concurrent users; the candidate must have built the system, not merely supported it.
  - **Moderate**: Moderate requires active ownership of a functioning full-stack or mobile product using multiple application layers or integrations, such as a React/Node/Mongo application, booking platform, dashboard, or API-connected app, but without demonstrated real-time complexity or quantified operating scale.
- **Supporting Pool Citations ($O(1)$ Hydrated)**:
  - `[cand_08_muhammad_rouhan_faisal:s3]` Digest: `[s3:action] Project: MongoDB, Express, Node.js -> built Chat Application real-time messenger | 100 concurrent users`
    - *Verbatim Quote*: "Chat Application Developed a real-time chat application using the MERN stack (MongoDB, Express, React, Node.js) to facilitate communication for up to 100 concurrent users. Implemented functionalities for 100 users to engage in seamless direct messaging and group chats, fostering"
  - `[cand_03_abdullah_aleem:s1]` Digest: `[s1:action] Project: WebSockets, Express.js, MongoDB -> built HomeDoc real-time service platform`
    - *Verbatim Quote*: "HomeDoc Implemented WebSockets to enable real-time communication between users and paramedics. Developed a RESTful API using Express.js for user and paramedic registration and service booking. Integrated MongoDB for data persistence, ensuring secure and scalable user data management."
  - `[cand_05_ali_murad:s1]` Digest: `[s1:action] Project: React, React Flow -> built Generic Builder workflow editor`
    - *Verbatim Quote*: "Generic Builder A React and React Flow-based workﬂow editor enabling users to create, edit, and visualize ﬂows with customizable nodes, drag-and-drop editing, real-time updates, and state persistence. Features include zooming, panning, and smooth user interactions, showcasing expertise in React, state"
  - `[cand_06_hasib_aslam:s1]` Digest: `[s1:action] Project: Express.js, React.js, Next.js -> built Hotel Booking Management Website`
    - *Verbatim Quote*: "Hotel Booking and Management Website A online platform where you can book the apartments in hotels and also put your own to be rented out. It is developed using Express js , React js along with next js. MYSQL is used as database to developed this app."
  - `[cand_06_hasib_aslam:s4]` Digest: `[s4:action] Project: MERN, Meta Graph API -> built Facebook Page Media Controller`
    - *Verbatim Quote*: "Facebook Page Media Controller A MERN stack website that allows user to register and then upload the content to the facebook page. It supports both images and videos upload to the facebook page remotely from the website . It uses Graph Api from meta to access pages using page page access token."

### axis_4: Selective Lab Or International Exposure
- **Category**: `pedigree_and_environment`
- **Estimated Pool Prevalence**: 4/10 candidates show strong or moderate evidence
- **Rationale**: The specification explicitly values selective labs and international experience, and this pool contains a distinct subset with university research-lab appointments or overseas academic research exposure. This axis measures the quality and selectivity of the environment itself, independently of whether the candidate produced a publication or shipped a product.
- **One-by-One Scoring Rubric**:
  - **Strong**: Strong requires verified participation in an international university research placement or a named university research lab, such as Lakehead University research, HPC/Machine Vision labs, or PakThai/Signal and Machine Learning Lab appointments.
  - **Moderate**: Moderate requires a verified academic distinction or research-oriented university placement without the stronger international or named-lab signal, such as a semester exchange passed with distinction or a generic university research internship.
- **Supporting Pool Citations ($O(1)$ Hydrated)**:
  - `[cand_06_hasib_aslam:work_2]` Digest: `work_2: Research Intern @ Lakehead University, Canada (2024-2024, 0.3y internship)`
  - `[cand_06_hasib_aslam:header]` Digest: `[cand_06_hasib_aslam] 0y FT (2 internships) | Semester Exchange Program @ Linnaeus University (Passed With Distinction) | Islamabad`
  - `[cand_01_muhammad_khizer_tariq:work_1]` Digest: `work_1: Researcher @ High Performance Computing Lab SEECS (2024-2024, 1y FT)`
  - `[cand_01_muhammad_khizer_tariq:work_2]` Digest: `work_2: Researcher @ Machine Vision and Intelligent Systems Lab SEECS (2024-2025, 0.5y FT)`
  - `[cand_09_hafiz_ahmed_hassan_chohan:work_2]` Digest: `work_2: Research Assistant @ PakThai Lab NUST (2024-2025, 0.9y FT)`
