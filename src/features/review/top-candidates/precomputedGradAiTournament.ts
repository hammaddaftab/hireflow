// Precomputed Mechanism E Top Candidates Tournament result for the 30-candidate NUST BSCS pool
// Sourced directly from docs/research/top-candidates/bench/ranking-30-output/mech-e-tournament-canonical.json

import type { TopCandidatesRankingResult } from "@/entities/extraction/matching/topCandidatesRanking";

export const PRECOMPUTED_GRAD_AI_TOURNAMENT: TopCandidatesRankingResult = {
  "top3_status": "contested",
  "summary": "Mechanism E tournament evaluated 30 viable BS CS contenders across 2 reshuffled 4-of-8 halving rounds (30 -> 16 -> 8 finalists), 4 cyclic Latin-Square full-CV rankings, and 10 bidirectional pairwise comparisons. Muhammad Abdullah (#1, 4-0 sweep, COLING 2025 FUSIONRAG) and Jatindar Kumar Mamnani (#2, 3-1, 82.4% mIoU autonomous driving vision) are confident; the #3 slot is contested between Muhammad Taha Mukhtar (GSoC CVAT.ai & KAUST/NTU research) and Ali Awais Safdar (FIT 2024 ACO routing & medical VQA) due to a bidirectional presentation-order split.",
  "emergent_pool_summary": "This 30-candidate BS CS graduate pool separates along 6 data-driven axes: Production AI/LLM/RAG Systems, Research Publications & Benchmarks, Full-Stack & Real-Time Product Ownership, Quantified Engineering Impact, Selective Lab & International Experience, and Cloud/Edge Deployment.",
  "top_candidates": [
    {
      "rank": 1,
      "candidate_id": "cand_25_muhammad_abdullah",
      "status": "confident",
      "pairwise_wins": 4,
      "pairwise_ties": 0,
      "pairwise_losses": 0,
      "latin_square_avg_rank": 1.5,
      "headline_rationale": "Undisputed #1 contender with a 4-0 pairwise sweep and 1.50 Latin-Square average. Combines a peer-reviewed COLING 2025 publication for an end-to-end hybrid RAG system (FUSIONRAG using OpenAI embeddings, BM25, FAISS, and Rank-Fusion [s2]) with full-stack real-time architecture ownership (Scototo Next.js/Socket.IO platform [s1] and Kisan Node.js/React app [s3]) and a 3.75 CGPA [header].",
      "contested_with": null,
      "supporting_claims": [
        {
          "candidate_id": "cand_25_muhammad_abdullah",
          "ref_id": "s2",
          "digest_line": "[s2:action] Publication: BM25, FAISS, OpenAI embeddings -> developed FUSIONRAG regulatory retrieval | COLING 2025",
          "evidence_span": "FUSIONRAG: Enhancing Regulatory Document Analysis Published at COLING 2025. Developed FUSIONRAG, combining OpenAI embeddings, BM25, FAISS, and Rank-Fusion for improved regulatory information retrieval and answer generation."
        },
        {
          "candidate_id": "cand_25_muhammad_abdullah",
          "ref_id": "s1",
          "digest_line": "[s1:action] Project: Next.js, Socket.IO -> built Scototo communication platform",
          "evidence_span": "Scototo Built a platform for seamless text, voice, and video communication for individuals and teams. Tools Used: Next.js, SQL, Socket.IO, Tailwind, Clerk."
        },
        {
          "candidate_id": "cand_25_muhammad_abdullah",
          "ref_id": "s3",
          "digest_line": "[s3:action] Project: Node.js, MongoDB -> built Kisan farmer support app",
          "evidence_span": "Kisan- Farmer Support App Developed an app connecting farmers with crop-speciﬁc data, disease detection, and recommendations to improve productivity. Tools Used: Node.js, React, MongoDB, Express."
        },
        {
          "candidate_id": "cand_25_muhammad_abdullah",
          "ref_id": "work_1",
          "digest_line": "work_1: Intern @ CHKK (2024-2025, 0.4y internship)",
          "evidence_span": "Preparing for AWS Certiﬁed Developer Associate. Strengthening DSA skills via Educative. Gaining hands-on Kubernetes experience."
        },
        {
          "candidate_id": "cand_25_muhammad_abdullah",
          "ref_id": "header",
          "digest_line": "[cand_25_muhammad_abdullah] 0y FT (2 internships) | BSc CS @ NUST (3.75) | Sargodha",
          "evidence_span": null
        }
      ]
    },
    {
      "rank": 2,
      "candidate_id": "cand_14_jatindar_kumar_mamnani",
      "status": "confident",
      "pairwise_wins": 3,
      "pairwise_ties": 0,
      "pairwise_losses": 1,
      "latin_square_avg_rank": 2.5,
      "headline_rationale": "Confident #2 contender with 3-1 pairwise record (falling only to Muhammad Abdullah). Demonstrates exceptional applied AI breadth across a real-time autonomous-driving multitask vision model achieving 82.4% mIoU on VIL-100 [s4], multimodal medical VQA (CNNs + LSTMs/Transformers [s3]), transformer text-to-SQL tabular QA [s2], and a FastAPI LLM chatbot [s1].",
      "contested_with": null,
      "supporting_claims": [
        {
          "candidate_id": "cand_14_jatindar_kumar_mamnani",
          "ref_id": "s3",
          "digest_line": "[s3:action] Project: CNNs, LSTMs, Transformers -> built VQA medical advisor system",
          "evidence_span": "VQA-Based-Medical-Advisor Developed a medical visual question-answering system using CNNs for image features and LSTMs/ Transformers for text queries. Implemented multimodal fusion to combine image and text features."
        },
        {
          "candidate_id": "cand_14_jatindar_kumar_mamnani",
          "ref_id": "s4",
          "digest_line": "[s4:action] Project: built autonomous-driving multitask model | 82.4% mIoU",
          "evidence_span": "A Video Based Multi-Task Learning Model for Autonomous Driving Developed a cutting-edge multitask learning model for real-time autonomous driving. Engineered to perform semantic segmentation, lane detection, and object detection on edge devices with high Achieved 82.4% mIoU on the VIL-100 validation set for lane segmentation."
        },
        {
          "candidate_id": "cand_14_jatindar_kumar_mamnani",
          "ref_id": "s2",
          "digest_line": "[s2:action] Project: Transformers -> built SemEval table-answering system",
          "evidence_span": "SemEval-Task-8-Table Answering Built a tabular QA system using transformer-based NLP for structured data retrieval. Implemented text-to-SQL conversion using pre-trained language models to generate structured queries."
        },
        {
          "candidate_id": "cand_14_jatindar_kumar_mamnani",
          "ref_id": "s1",
          "digest_line": "[s1:action] Project: FastAPI -> built Prompt-No-Code Website Assistant chatbot",
          "evidence_span": "Prompt-No-Code Website Assistant Developed an AI-powered no-code chatbot assistant that extracts contextual insights from website URLs for Engineered an LLM-driven chatbot system using FastAPI, enabling real-time, context-aware user interactions."
        },
        {
          "candidate_id": "cand_14_jatindar_kumar_mamnani",
          "ref_id": "work_1",
          "digest_line": "work_1: Computer Vision Researcher @ Vision Research and development company (2024-2024, 0.3y internship)",
          "evidence_span": "Conduct research on the applications of computer vision and data science in Autonomous cars. Design and implement ML models and algorithms. Assist in collecting and preprocessing relevant datasets. Contribute to the development and refinement of ML models and algorithms. Document findings, metho."
        },
        {
          "candidate_id": "cand_14_jatindar_kumar_mamnani",
          "ref_id": "c1",
          "digest_line": "[c1:action] maintained campus computer equipment | 200 printers",
          "evidence_span": "Communicate with managers to set up campus computers used on campus Maintain upkeep of computers, classroom equipment, and 200 printers across campus"
        },
        {
          "candidate_id": "cand_14_jatindar_kumar_mamnani",
          "ref_id": "header",
          "digest_line": "[cand_14_jatindar_kumar_mamnani] 0y FT (2 internships) | BSc CS @ NUST (2.93) | Mirpurkhas",
          "evidence_span": null
        }
      ]
    },
    {
      "rank": 3,
      "candidate_id": "cand_27_muhammad_taha_mukhtar",
      "status": "contested",
      "pairwise_wins": 1,
      "pairwise_ties": 1,
      "pairwise_losses": 2,
      "latin_square_avg_rank": 2,
      "headline_rationale": "Tied for #3 finalist slot with Ali Awais Safdar (2.00 Latin-Square average). Brings extraordinary international and open-source research pedigree: Google Summer of Code contributor at CVAT.ai (500+ downloads, 100% test coverage [c2]), semi-supervised remote-sensing segmentation (FixMatch, SAM2) on an EUR 80,000 funded DFKI/RPTU project [c1], plus KAUST [c5] and NTU Singapore [c3] research.",
      "contested_with": "Tied head-to-head with Ali Awais Safdar (verdict flipped when presentation order reversed). Taha leads on externally funded research scale (EUR 80,000 DFKI/RPTU grant [c1]), GSoC open-source adoption (500+ downloads [c2]), and international lab pedigree (KAUST & NTU).",
      "supporting_claims": [
        {
          "candidate_id": "cand_27_muhammad_taha_mukhtar",
          "ref_id": "s1",
          "digest_line": "[s1:action] Project: DAAD, RPTU, DFKI -> advanced Slum-i settlement segmentation | €80k DAAD funding",
          "evidence_span": "Slum-i, Research Project Worked on a €80,000 DAAD-funded project in collaboration with RPTU & DFKI, where I interned in Germany. Aligned with 3 UN SDGs, focusing on improving living conditions for slum dwellers in Pakistan. Upcoming publication in a top remote sensing journal, using SSL for segmenting informal settlements."
        },
        {
          "candidate_id": "cand_27_muhammad_taha_mukhtar",
          "ref_id": "c1",
          "digest_line": "[c1:action] FixMatch, SAM2, H100 GPUs, A100 GPUs, remote sensing -> engineered settlement detection model",
          "evidence_span": "Engineered a semi-supervised model for detecting informal settlements using remote sensing. Applied techniques like FixMatch, domain adaptation between cies and pseudo-label reﬁnement via SAM2. Leveraged Germany's largest deep learning infrastructure with H100/A100 GPUs for advanced AI research."
        },
        {
          "candidate_id": "cand_27_muhammad_taha_mukhtar",
          "ref_id": "work_1",
          "digest_line": "work_1: Research Intern @ Deutsches Forschungszentrum für Künstliche Intelligenz (2024-2024, 0.3y internship)",
          "evidence_span": "Engineered a semi-supervised model for detecting informal settlements using remote sensing. Applied techniques like FixMatch, domain adaptation between cies and pseudo-label reﬁnement via SAM2. Leveraged Germany's largest deep learning infrastructure with H100/A100 GPUs for advanced AI research."
        },
        {
          "candidate_id": "cand_27_muhammad_taha_mukhtar",
          "ref_id": "c2",
          "digest_line": "[c2:action] Cypress -> improved CVAT shortcut system | 100% test coverage",
          "evidence_span": "Improved the CVAT platform by adding a user-conﬁgurable shortcut system, enhancing annotation eﬃciency. Tested new shortcut features with Cypress, achieving 100% test coverage."
        },
        {
          "candidate_id": "cand_27_muhammad_taha_mukhtar",
          "ref_id": "s2",
          "digest_line": "[s2:action] Open-Source: Gemini API -> created lang-source localization CLI | 500+ downloads, 5 stars",
          "evidence_span": "lang-source, Open Source Project Created a CLI utility using the Gemini API to automate localisation workﬂows, supporting 12 languages and reducing manual eﬀort in creating JSON/YAML language files. Published as an npm package with 500+ downloads and has 5 Stars on GitHub."
        }
      ]
    },
    {
      "rank": 3,
      "candidate_id": "cand_20_ali_awais_safdar",
      "status": "contested",
      "pairwise_wins": 0,
      "pairwise_ties": 2,
      "pairwise_losses": 2,
      "latin_square_avg_rank": 4.5,
      "headline_rationale": "Tied for #3 finalist slot with Muhammad Taha Mukhtar. Combines an authored & FIT 2024 conference-presented research paper on ML-driven Ant Colony Optimization for vehicle routing [s1, s2] with a VGG-19 + BERT attention medical VQA system [s3], HMAC-SHA256/RSA blockchain ledger [s4], and 6 research/industry internships including NTU Singapore and HPC Lab SEECS.",
      "contested_with": "Tied head-to-head with Muhammad Taha Mukhtar (verdict flipped when presentation order reversed). Ali leads on completed conference publication output (FIT 2024 vehicle routing paper [s1, s2]) and multimodal medical VQA + systems architecture breadth [s3, s5].",
      "supporting_claims": [
        {
          "candidate_id": "cand_20_ali_awais_safdar",
          "ref_id": "s3",
          "digest_line": "[s3:action] Project: VGG-19, BERT -> built PATHVQA medical VQA system",
          "evidence_span": "PATHVQA-VGG19-BERT-ATTENTION Developed a medical Visual Question Answering (VQA) system utilizing VGG-19 for image feature extraction and BERT for textual question processing. Incorporated attention mechanisms to enhance contextual understanding, facilitating accurate responses to"
        },
        {
          "candidate_id": "cand_20_ali_awais_safdar",
          "ref_id": "s1",
          "digest_line": "[s1:action] Project: Ant Colony Optimization -> authored vehicle routing research paper",
          "evidence_span": "Enhancing Vehicle Routing with Time Windows: A Machine Learning-Driven Ant Colony Optimization Authored a research paper focusing on integrating machine learning techniques with Ant Colony Optimization (ACO) to improve vehicle routing under time-window constraints."
        },
        {
          "candidate_id": "cand_20_ali_awais_safdar",
          "ref_id": "s2",
          "digest_line": "[s2:action] Publication: FIT 2024 Conference -> presented vehicle routing research paper",
          "evidence_span": "Presented the paper at the FIT 2024 Conference, showcasing innovative approaches to solving logistics and optimization challenges using AI"
        },
        {
          "candidate_id": "cand_20_ali_awais_safdar",
          "ref_id": "work_1",
          "digest_line": "work_1: Not stated @ CarbonTeq (2024-2024, 0.2y FT)",
          "evidence_span": "Enhancing Vehicle Routing with Time Windows: A Machine Learning-Driven Ant Colony Optimization Approach: Authored a research paper focusing on integrating machine learning techniques with Ant Colony Optimization (ACO) to improve vehicle routing under time-window constraints. Presented the paper at the FIT 2024 Conference, showcasing innovative approaches to solving logistics and optimization challenges using AI PATHVQA-VGG19-BERT-ATTENTION: Developed a medical Visual Question Answering (VQA) system utilizing VGG-19 for image feature extraction and BERT for textual question processing. Incorporated attention mechanisms to enhance contextual understanding, facilitating accurate responses to complex medical queries. Created an interactive web int Secure Information Handling with Blockchain: Implemented secure data handling solutions using blockchain technology with cryptographic methods such as HMAC-SHA256 for hashing and RSA for encryption. Developed a decentralized ledger to ensure tamper-resistance and transaction verification in distributed environments. DNS Client Efficient Design: Engineered a sophisticated TypeScript-based DNS client with a modular, scalable architecture and robust error handling. Optimized performance using asynchronous processing and railway-oriented programming principles."
        },
        {
          "candidate_id": "cand_20_ali_awais_safdar",
          "ref_id": "s4",
          "digest_line": "[s4:action] Project: HMAC-SHA256, RSA -> built blockchain secure data ledger",
          "evidence_span": "Secure Information Handling with Blockchain Implemented secure data handling solutions using blockchain technology with cryptographic methods such as HMAC-SHA256 for hashing and RSA for encryption. Developed a decentralized ledger to ensure tamper-resistance and transaction verification in distributed"
        },
        {
          "candidate_id": "cand_20_ali_awais_safdar",
          "ref_id": "s5",
          "digest_line": "[s5:action] Project: TypeScript -> engineered DNS client architecture",
          "evidence_span": "DNS Client Efficient Design Engineered a sophisticated TypeScript-based DNS client with a modular, scalable architecture and robust error handling. Optimized performance using asynchronous processing and railway-oriented programming principles."
        }
      ]
    }
  ],
  "emergent_axes": [],
  "telemetry": {
    "stage0_viable_count": 30,
    "stage0_knocked_out": [],
    "stage2_rounds": [
      {
        "round_number": 1,
        "input_candidate_count": 30,
        "survivor_count": 16,
        "groups": [
          {
            "group_index": 0,
            "candidates": [
              "cand_16_mehar_ali_ahmed",
              "cand_11_muhammad_ahad_sajjad",
              "cand_03_abdullah_aleem",
              "cand_13_muhammad_uzair_khan",
              "cand_28_umama_zainab",
              "cand_02_umer_tariq",
              "cand_18_abdul_rehman",
              "cand_22_mariam_babar_khan"
            ],
            "evaluations": [
              {
                "candidate_id": "cand_16_mehar_ali_ahmed",
                "forward_rank": 1,
                "reverse_rank": 3,
                "avg_rank": 2,
                "survived": true,
                "outside_axes_standout": true,
                "supporting_refs": [
                  "s2",
                  "s1",
                  "c3",
                  "c1",
                  "c2",
                  "header"
                ],
                "rationale": "Mehar is the strongest overall AI contender, with active ownership of a RoBERTa low-rank-adaptation writing-style detector achieving 0.80 F1, plus a funded community project and quantified campaign impact. This combines the group’s clearest research-grade model evidence with demonstrated execution and measurable outcomes."
              },
              {
                "candidate_id": "cand_11_muhammad_ahad_sajjad",
                "forward_rank": 3,
                "reverse_rank": 1,
                "avg_rank": 2,
                "survived": true,
                "outside_axes_standout": false,
                "supporting_refs": [
                  "c1",
                  "c2",
                  "c3",
                  "c4",
                  "header"
                ],
                "rationale": "Ahad stands out for unusually strong quantified product impact across wellness, resume, apartment, ecommerce, and website products, including +75% retention, -25% onboarding, +70% engagement, and -70% bounce. However, the digest provides little direct evidence of ML model ownership, retrieval architecture, or detailed full-stack system design."
              },
              {
                "candidate_id": "cand_18_abdul_rehman",
                "forward_rank": 2,
                "reverse_rank": 2,
                "avg_rank": 2,
                "survived": true,
                "outside_axes_standout": false,
                "supporting_refs": [
                  "s1",
                  "s2",
                  "s3",
                  "work_1",
                  "header"
                ],
                "rationale": "Abdul Rehman has the strongest advanced retrieval and multimodal portfolio, actively building a CLIP/Solr semantic image search engine and a BERT, Bloom Filter, and PageRank web search engine. The systems are technically aligned with AI search and retrieval, though the digest lacks reported evaluation metrics or product adoption."
              },
              {
                "candidate_id": "cand_03_abdullah_aleem",
                "forward_rank": 4,
                "reverse_rank": 4,
                "avg_rank": 4,
                "survived": true,
                "outside_axes_standout": false,
                "supporting_refs": [
                  "s1",
                  "s2",
                  "s3",
                  "c1",
                  "header"
                ],
                "rationale": "Abdullah demonstrates broad hands-on application ownership, including a WebSocket/Express/MongoDB real-time service, a collaborative-filtering recommendation engine, a booking platform, and a Flutter/Firebase mobile application. His breadth is strong for full-stack engineering, but there are no reported model metrics, user outcomes, or research-grade AI results."
              },
              {
                "candidate_id": "cand_28_umama_zainab",
                "forward_rank": 5,
                "reverse_rank": 5,
                "avg_rank": 5,
                "survived": false,
                "outside_axes_standout": false,
                "supporting_refs": [
                  "s1",
                  "s2",
                  "s4",
                  "s3",
                  "work_1",
                  "work_2",
                  "work_4",
                  "header"
                ],
                "rationale": "Umama shows broad practical product development across React Native, Node.js, AWS, and web applications, alongside active ownership of a CNN/TensorFlow emotion detection model. The portfolio fits full-stack and entry-level AI needs, but lacks model evaluation, retrieval depth, real-time architecture, or quantified impact."
              },
              {
                "candidate_id": "cand_22_mariam_babar_khan",
                "forward_rank": 6,
                "reverse_rank": 6,
                "avg_rank": 6,
                "survived": false,
                "outside_axes_standout": false,
                "supporting_refs": [
                  "s3",
                  "s1",
                  "s4",
                  "s2",
                  "work_1",
                  "work_2",
                  "work_3",
                  "header"
                ],
                "rationale": "Mariam has a strong academic profile and some software development experience, including active ownership of a MySQL/PHP college management system. Her search-engine and visual IDE projects are explicitly peripheral, so they cannot be credited as direct research or retrieval ownership, leaving limited demonstrated AI depth."
              },
              {
                "candidate_id": "cand_13_muhammad_uzair_khan",
                "forward_rank": 7,
                "reverse_rank": 7,
                "avg_rank": 7,
                "survived": false,
                "outside_axes_standout": false,
                "supporting_refs": [
                  "c1",
                  "work_1",
                  "header"
                ],
                "rationale": "Uzair has active experience extending a production-facing portal across Express.js, Next.js, and React Native, which provides some full-stack exposure. The digest contains no evidence of AI/ML ownership, retrieval, measurable impact, or substantial architecture beyond adding vendor categories."
              },
              {
                "candidate_id": "cand_02_umer_tariq",
                "forward_rank": 8,
                "reverse_rank": 8,
                "avg_rank": 8,
                "survived": false,
                "outside_axes_standout": false,
                "supporting_refs": [
                  "header"
                ],
                "rationale": "Umer meets the stated degree baseline, but the digest provides no work, project, research, product, or technical ownership evidence to distinguish him on any emergent axis. He is therefore the weakest contender in this group based on available evidence."
              }
            ],
            "survivors": [
              "cand_16_mehar_ali_ahmed",
              "cand_11_muhammad_ahad_sajjad",
              "cand_18_abdul_rehman",
              "cand_03_abdullah_aleem"
            ]
          },
          {
            "group_index": 1,
            "candidates": [
              "cand_12_iqra_rasool",
              "cand_09_hafiz_ahmed_hassan_chohan",
              "cand_27_muhammad_taha_mukhtar",
              "cand_01_muhammad_khizer_tariq",
              "cand_23_muhammad_zaeem_khalid",
              "cand_21_prithvi_raj",
              "cand_08_muhammad_rouhan_faisal",
              "cand_04_mujtaba_shafqat"
            ],
            "evaluations": [
              {
                "candidate_id": "cand_27_muhammad_taha_mukhtar",
                "forward_rank": 1,
                "reverse_rank": 1,
                "avg_rank": 1,
                "survived": true,
                "outside_axes_standout": true,
                "supporting_refs": [
                  "c1",
                  "c2",
                  "s1",
                  "s2"
                ],
                "rationale": "The strongest candidate has active ownership of an advanced settlement-detection model using FixMatch, SAM2, remote-sensing data, and high-end GPU infrastructure, alongside the externally funded €80k Slum-i segmentation project. The 100% CVAT test coverage and 500+ download localization CLI add rare engineering and open-source traction beyond the core axes."
              },
              {
                "candidate_id": "cand_01_muhammad_khizer_tariq",
                "forward_rank": 2,
                "reverse_rank": 2,
                "avg_rank": 2,
                "survived": true,
                "outside_axes_standout": false,
                "supporting_refs": [
                  "s1",
                  "s2",
                  "c1"
                ],
                "rationale": "Two active peer-reviewed publications provide the clearest research-grade evidence in the group and strongly satisfy the research-depth axis. However, the digest provides limited evidence of hands-on product delivery, multimodal implementation, retrieval, or full-stack architecture beyond the publications."
              },
              {
                "candidate_id": "cand_08_muhammad_rouhan_faisal",
                "forward_rank": 4,
                "reverse_rank": 3,
                "avg_rank": 3.5,
                "survived": true,
                "outside_axes_standout": false,
                "supporting_refs": [
                  "s2",
                  "s3",
                  "s4",
                  "c1",
                  "c2"
                ],
                "rationale": "The 100-concurrent-user real-time chat application is the strongest quantified product and real-time full-stack evidence outside the top research candidates. The candidate also has exposure to a technically sophisticated FusionRAG stack, but that contribution is explicitly peripheral and cannot be treated as direct RAG ownership."
              },
              {
                "candidate_id": "cand_09_hafiz_ahmed_hassan_chohan",
                "forward_rank": 3,
                "reverse_rank": 4,
                "avg_rank": 3.5,
                "survived": true,
                "outside_axes_standout": false,
                "supporting_refs": [
                  "s1",
                  "s2",
                  "s3",
                  "header"
                ],
                "rationale": "The candidate demonstrates meaningful active AI project ownership across computer vision and document processing, including an ANPR recognizer, OCR-to-eBook system, and gesture-controlled application. This is strong applied multimodal evidence, though the digest lacks quantified evaluation, explicit research outputs, or detailed ownership from the listed lab roles."
              },
              {
                "candidate_id": "cand_23_muhammad_zaeem_khalid",
                "forward_rank": 6,
                "reverse_rank": 5,
                "avg_rank": 5.5,
                "survived": false,
                "outside_axes_standout": false,
                "supporting_refs": [
                  "c1",
                  "c3",
                  "s1",
                  "s2"
                ],
                "rationale": "This candidate has direct frontend and mobile engineering ownership with React, Next.js, and React Native, plus a flood-risk predictor and comment-visualization project. The profile is useful for product engineering, but backend ownership is explicitly peripheral and the AI systems lack technical depth or quantified outcomes."
              },
              {
                "candidate_id": "cand_12_iqra_rasool",
                "forward_rank": 5,
                "reverse_rank": 7,
                "avg_rank": 6,
                "survived": false,
                "outside_axes_standout": false,
                "supporting_refs": [
                  "s1",
                  "s2",
                  "s3",
                  "c1",
                  "c3"
                ],
                "rationale": "Active ownership of a YOLOv8/Dlib drowsiness detector supplies relevant computer-vision depth, complemented by a search engine, salary-management system, database work, and web-page development. The projects are relevant but lack reported metrics, research validation, adoption, or the architectural detail shown by higher-ranked candidates."
              },
              {
                "candidate_id": "cand_21_prithvi_raj",
                "forward_rank": 7,
                "reverse_rank": 6,
                "avg_rank": 6.5,
                "survived": false,
                "outside_axes_standout": false,
                "supporting_refs": [
                  "c1",
                  "s1",
                  "s2",
                  "s3",
                  "s4"
                ],
                "rationale": "The candidate shows broad software-building exposure through database tools, dashboards, blockchain applications, and a React/Node/MongoDB project. Nevertheless, there is no demonstrated AI/ML system, research evidence, retrieval work, or quantified product impact, making the fit weaker for this AI-focused role."
              },
              {
                "candidate_id": "cand_04_mujtaba_shafqat",
                "forward_rank": 8,
                "reverse_rank": 8,
                "avg_rank": 8,
                "survived": false,
                "outside_axes_standout": false,
                "supporting_refs": [
                  "c1",
                  "c2",
                  "header"
                ],
                "rationale": "The evidence is concentrated in graphic design, branding, and visual-content work, with no demonstrated ownership of Python, ML, AI systems, full-stack applications, or measurable engineering outcomes. This places the candidate substantially below the technically oriented contenders."
              }
            ],
            "survivors": [
              "cand_27_muhammad_taha_mukhtar",
              "cand_01_muhammad_khizer_tariq",
              "cand_08_muhammad_rouhan_faisal",
              "cand_09_hafiz_ahmed_hassan_chohan"
            ]
          },
          {
            "group_index": 2,
            "candidates": [
              "cand_06_hasib_aslam",
              "cand_25_muhammad_abdullah",
              "cand_17_ghulam_hussain_khan_sherwani",
              "cand_26_mohammad_irfan",
              "cand_10_muhammad_aleem_siddique_khan",
              "cand_20_ali_awais_safdar",
              "cand_15_abdul_basit"
            ],
            "evaluations": [
              {
                "candidate_id": "cand_25_muhammad_abdullah",
                "forward_rank": 1,
                "reverse_rank": 1,
                "avg_rank": 1,
                "survived": true,
                "outside_axes_standout": false,
                "supporting_refs": [
                  "s1",
                  "s2",
                  "s3"
                ],
                "rationale": "Strongest overall fit: actively developed FUSIONRAG using BM25, FAISS, and OpenAI embeddings, with the work published at COLING 2025, directly satisfying the strongest research and RAG criteria. Also built a Next.js/Socket.IO communication platform and a Node.js/MongoDB farmer-support application, demonstrating relevant full-stack breadth."
              },
              {
                "candidate_id": "cand_20_ali_awais_safdar",
                "forward_rank": 2,
                "reverse_rank": 2,
                "avg_rank": 2,
                "survived": true,
                "outside_axes_standout": false,
                "supporting_refs": [
                  "s1",
                  "s2",
                  "s3",
                  "s4",
                  "s5"
                ],
                "rationale": "Combines externally presented research through an authored vehicle-routing paper with a substantial VGG-19/BERT medical VQA system, giving strong evidence across research and advanced multimodal modeling. Blockchain security and DNS-client architecture further indicate systems breadth, although there is no demonstrated RAG or quantified product adoption."
              },
              {
                "candidate_id": "cand_06_hasib_aslam",
                "forward_rank": 3,
                "reverse_rank": 3,
                "avg_rank": 3,
                "survived": true,
                "outside_axes_standout": false,
                "supporting_refs": [
                  "c1",
                  "c2",
                  "s1",
                  "s2",
                  "s3",
                  "s4"
                ],
                "rationale": "Shows strong hands-on breadth, including a 98%-accuracy image classifier, EEG dataset processing during a Canadian research internship, and several actively built React/Next.js/MERN applications. The candidate lacks publication-level validation, RAG depth, and explicit usage or deployment metrics, keeping them below the top two."
              },
              {
                "candidate_id": "cand_17_ghulam_hussain_khan_sherwani",
                "forward_rank": 4,
                "reverse_rank": 4,
                "avg_rank": 4,
                "survived": true,
                "outside_axes_standout": false,
                "supporting_refs": [
                  "s1",
                  "s2",
                  "s3"
                ],
                "rationale": "Led a U-Net document-binarization project and built both a MERN e-commerce platform and a data-oriented cricket application, providing credible AI and full-stack ownership. However, the digest supplies no model evaluation, research validation, RAG experience, or product-impact metrics."
              },
              {
                "candidate_id": "cand_15_abdul_basit",
                "forward_rank": 5,
                "reverse_rank": 5,
                "avg_rank": 5,
                "survived": false,
                "outside_axes_standout": false,
                "supporting_refs": [
                  "work_1",
                  "work_2",
                  "s1",
                  "s2",
                  "s3"
                ],
                "rationale": "Built an orphanage-management backend, a job platform, and a Faster R-CNN traffic-light detection system, showing relevant application and computer-vision exposure. The research internship is not technically specified and the projects lack reported evaluation, scale, or measurable product outcomes."
              },
              {
                "candidate_id": "cand_10_muhammad_aleem_siddique_khan",
                "forward_rank": 7,
                "reverse_rank": 6,
                "avg_rank": 6.5,
                "survived": false,
                "outside_axes_standout": false,
                "supporting_refs": [
                  "c1",
                  "work_1"
                ],
                "rationale": "Has exposure to an AI-based URL-classification project, but the digest explicitly marks this as peripheral rather than direct ownership. With no active project ownership, publication, advanced architecture, full-stack system, or quantified outcome, this is the weakest evidence in the group."
              },
              {
                "candidate_id": "cand_26_mohammad_irfan",
                "forward_rank": 6,
                "reverse_rank": 7,
                "avg_rank": 6.5,
                "survived": false,
                "outside_axes_standout": false,
                "supporting_refs": [
                  "s1"
                ],
                "rationale": "The candidate actively conducted AI-adoption research, which gives some research alignment with the role. The digest provides no model, system, dataset, publication, implementation detail, full-stack build, or quantified result to demonstrate technical depth."
              }
            ],
            "survivors": [
              "cand_25_muhammad_abdullah",
              "cand_20_ali_awais_safdar",
              "cand_06_hasib_aslam",
              "cand_17_ghulam_hussain_khan_sherwani"
            ]
          },
          {
            "group_index": 3,
            "candidates": [
              "cand_07_haram_nasir",
              "cand_29_abdul_ahad_qureshi",
              "cand_05_ali_murad",
              "cand_30_wahaj_ahmad_butt",
              "cand_24_abdullah_saim",
              "cand_14_jatindar_kumar_mamnani",
              "cand_19_abdullah_khan"
            ],
            "evaluations": [
              {
                "candidate_id": "cand_14_jatindar_kumar_mamnani",
                "forward_rank": 1,
                "reverse_rank": 1,
                "avg_rank": 1,
                "survived": true,
                "outside_axes_standout": false,
                "supporting_refs": [
                  "s1",
                  "s2",
                  "s3",
                  "s4",
                  "header"
                ],
                "rationale": "Strongest overall AI fit, with active ownership of a prompt-based assistant, Transformer table answering, medical VQA using CNNs/LSTMs/Transformers, and an autonomous-driving multitask model reaching 82.4% mIoU. This is the deepest demonstrated multimodal model-building portfolio in the group, although the research-internship role itself has no detailed ownership evidence."
              },
              {
                "candidate_id": "cand_30_wahaj_ahmad_butt",
                "forward_rank": 2,
                "reverse_rank": 2,
                "avg_rank": 2,
                "survived": true,
                "outside_axes_standout": false,
                "supporting_refs": [
                  "s1",
                  "s2",
                  "s3",
                  "s4",
                  "work_1"
                ],
                "rationale": "Demonstrates substantial AI breadth through active VQA, BERT-family classification, and an emotion-recognition system with 82.7% accuracy, plus a Laravel/WebRTC/MySQL chat-video application. He narrowly trails Jatindar on breadth of advanced multimodal systems but has stronger explicit full-stack and real-time architecture evidence."
              },
              {
                "candidate_id": "cand_29_abdul_ahad_qureshi",
                "forward_rank": 3,
                "reverse_rank": 4,
                "avg_rank": 3.5,
                "survived": true,
                "outside_axes_standout": false,
                "supporting_refs": [
                  "c1",
                  "c2",
                  "s2",
                  "s3",
                  "work_1",
                  "work_3"
                ],
                "rationale": "Best product-engineering profile: actively built employee software for 50+ employees and a management system used by 100+ daily users, alongside a Socket.io/JWT real-time chat application. The ChatGPT integration adds relevant LLM exposure, but it lacks evidence of retrieval architecture or substantive AI model building."
              },
              {
                "candidate_id": "cand_19_abdullah_khan",
                "forward_rank": 6,
                "reverse_rank": 3,
                "avg_rank": 4.5,
                "survived": true,
                "outside_axes_standout": true,
                "supporting_refs": [
                  "c1",
                  "s1",
                  "work_2",
                  "header"
                ],
                "rationale": "The UAV battery-life project is a meaningful active predictive-modeling contribution with 23% improved accuracy across 29 flights, giving him credible applied ML evidence. However, the digest shows little full-stack, multimodal, RAG, or product-building depth beyond that focused project."
              },
              {
                "candidate_id": "cand_05_ali_murad",
                "forward_rank": 4,
                "reverse_rank": 6,
                "avg_rank": 5,
                "survived": false,
                "outside_axes_standout": false,
                "supporting_refs": [
                  "s1",
                  "s2",
                  "s3",
                  "s4",
                  "header"
                ],
                "rationale": "Shows repeated active ownership of practical full-stack products, including a React Flow workflow editor, MERN e-commerce platform, and consultant dashboard. The portfolio fits product engineering well, but there are no quantified adoption outcomes, real-time architecture details, or meaningful AI/ML accomplishments."
              },
              {
                "candidate_id": "cand_24_abdullah_saim",
                "forward_rank": 5,
                "reverse_rank": 5,
                "avg_rank": 5,
                "survived": false,
                "outside_axes_standout": false,
                "supporting_refs": [
                  "c1",
                  "s1",
                  "s2",
                  "s3",
                  "s4",
                  "header"
                ],
                "rationale": "Has active research-intern ownership of a cookie-classification model and several complete software projects, including MERN/React mapping functionality. The evidence is broader than the lower-ranked candidates but does not provide model metrics, advanced architectures, retrieval depth, or measurable product impact."
              },
              {
                "candidate_id": "cand_07_haram_nasir",
                "forward_rank": 7,
                "reverse_rank": 7,
                "avg_rank": 7,
                "survived": false,
                "outside_axes_standout": false,
                "supporting_refs": [
                  "c1",
                  "s1",
                  "work_1",
                  "header"
                ],
                "rationale": "Provides active Python-based scraping and browser automation experience and built the National Science Bee website. Compared with the rest of the group, there is no demonstrated AI/ML model, quantified result, retrieval system, or substantive full-stack architecture evidence."
              }
            ],
            "survivors": [
              "cand_14_jatindar_kumar_mamnani",
              "cand_30_wahaj_ahmad_butt",
              "cand_29_abdul_ahad_qureshi",
              "cand_19_abdullah_khan"
            ]
          }
        ]
      },
      {
        "round_number": 2,
        "input_candidate_count": 16,
        "survivor_count": 8,
        "groups": [
          {
            "group_index": 0,
            "candidates": [
              "cand_30_wahaj_ahmad_butt",
              "cand_01_muhammad_khizer_tariq",
              "cand_09_hafiz_ahmed_hassan_chohan",
              "cand_29_abdul_ahad_qureshi",
              "cand_11_muhammad_ahad_sajjad",
              "cand_14_jatindar_kumar_mamnani",
              "cand_06_hasib_aslam",
              "cand_25_muhammad_abdullah"
            ],
            "evaluations": [
              {
                "candidate_id": "cand_25_muhammad_abdullah",
                "forward_rank": 1,
                "reverse_rank": 1,
                "avg_rank": 1,
                "survived": true,
                "outside_axes_standout": false,
                "supporting_refs": [
                  "s2",
                  "s1",
                  "s3",
                  "header"
                ],
                "rationale": "The strongest overall fit combines a COLING 2025 publication on FUSIONRAG using BM25, FAISS, and OpenAI embeddings with active Socket.IO platform development. This directly covers research-grade AI, end-to-end retrieval architecture, and real-time product engineering."
              },
              {
                "candidate_id": "cand_14_jatindar_kumar_mamnani",
                "forward_rank": 2,
                "reverse_rank": 2,
                "avg_rank": 2,
                "survived": true,
                "outside_axes_standout": false,
                "supporting_refs": [
                  "s2",
                  "s3",
                  "s4",
                  "s1",
                  "work_1"
                ],
                "rationale": "Demonstrates unusually broad multimodal model-building through Transformers table answering, CNN/LSTM/Transformer medical VQA, and an autonomous-driving multitask model achieving 82.4% mIoU. The FastAPI chatbot adds relevant applied AI product exposure, though there is less evidence of shipped product impact."
              },
              {
                "candidate_id": "cand_30_wahaj_ahmad_butt",
                "forward_rank": 3,
                "reverse_rank": 3,
                "avg_rank": 3,
                "survived": true,
                "outside_axes_standout": false,
                "supporting_refs": [
                  "s1",
                  "s2",
                  "s3",
                  "s4",
                  "work_1"
                ],
                "rationale": "Shows strong hands-on multimodal breadth with a ResNet50/BERT VQA system, multiple Transformer-based classifiers, and a Laravel/WebRTC chat-video application. The emotion recognition system’s 82.7% accuracy is concrete validation, but the profile lacks publication or externally validated research evidence."
              },
              {
                "candidate_id": "cand_11_muhammad_ahad_sajjad",
                "forward_rank": 5,
                "reverse_rank": 4,
                "avg_rank": 4.5,
                "survived": true,
                "outside_axes_standout": false,
                "supporting_refs": [
                  "c1",
                  "c2",
                  "c3",
                  "c4",
                  "header"
                ],
                "rationale": "Has exceptional quantified product impact across multiple actively owned systems: +75% retention, -25% onboarding, +70% engagement, -70% bounce, and -40% inquiries. The main limitation is that the digest provides little direct AI/ML or advanced architecture evidence relative to the top candidates."
              },
              {
                "candidate_id": "cand_01_muhammad_khizer_tariq",
                "forward_rank": 4,
                "reverse_rank": 6,
                "avg_rank": 5,
                "survived": false,
                "outside_axes_standout": false,
                "supporting_refs": [
                  "s1",
                  "s2",
                  "c1",
                  "work_1",
                  "work_2"
                ],
                "rationale": "Two active publications, including Routing through Satellite Imagery and Grouped Matrix Clocks, provide the group’s clearest research record after the RAG publication candidate. However, the digest gives limited detail on implementation ownership, evaluation, or product/full-stack execution, and the continual-learning evidence is explicitly peripheral."
              },
              {
                "candidate_id": "cand_29_abdul_ahad_qureshi",
                "forward_rank": 6,
                "reverse_rank": 5,
                "avg_rank": 5.5,
                "survived": false,
                "outside_axes_standout": false,
                "supporting_refs": [
                  "c1",
                  "c2",
                  "s2",
                  "s3",
                  "s1"
                ],
                "rationale": "Offers strong product and full-stack evidence, including systems used by 50+ employees and 100+ daily users, plus an active Socket.io/JWT real-time chat application. The ChatGPT integration is not retrieval-based, and the React/Node/MongoDB hostel system is explicitly peripheral, limiting AI depth."
              },
              {
                "candidate_id": "cand_06_hasib_aslam",
                "forward_rank": 8,
                "reverse_rank": 7,
                "avg_rank": 7.5,
                "survived": false,
                "outside_axes_standout": false,
                "supporting_refs": [
                  "c1",
                  "c2",
                  "s1",
                  "s2",
                  "s3",
                  "s4"
                ],
                "rationale": "Shows broad software construction and international research exposure, including a 98% classifier and several MERN/React applications. However, the AI evidence is mostly a basic classifier and dataset processing, with no advanced multimodal, RAG, quantified product, or real-time architecture evidence."
              },
              {
                "candidate_id": "cand_09_hafiz_ahmed_hassan_chohan",
                "forward_rank": 7,
                "reverse_rank": 8,
                "avg_rank": 7.5,
                "survived": false,
                "outside_axes_standout": false,
                "supporting_refs": [
                  "s2",
                  "s3",
                  "work_2",
                  "work_4",
                  "work_1"
                ],
                "rationale": "Provides relevant applied computer-vision work through OCR ebook conversion and an OpenCV/easy-ocr ANPR recognizer, supported by research-assistant experience. It lacks reported metrics, advanced architecture detail, publication evidence, or demonstrated full-stack/product impact."
              }
            ],
            "survivors": [
              "cand_25_muhammad_abdullah",
              "cand_14_jatindar_kumar_mamnani",
              "cand_30_wahaj_ahmad_butt",
              "cand_11_muhammad_ahad_sajjad"
            ]
          },
          {
            "group_index": 1,
            "candidates": [
              "cand_19_abdullah_khan",
              "cand_27_muhammad_taha_mukhtar",
              "cand_03_abdullah_aleem",
              "cand_20_ali_awais_safdar",
              "cand_08_muhammad_rouhan_faisal",
              "cand_17_ghulam_hussain_khan_sherwani",
              "cand_18_abdul_rehman",
              "cand_16_mehar_ali_ahmed"
            ],
            "evaluations": [
              {
                "candidate_id": "cand_27_muhammad_taha_mukhtar",
                "forward_rank": 1,
                "reverse_rank": 1,
                "avg_rank": 1,
                "survived": true,
                "outside_axes_standout": true,
                "supporting_refs": [
                  "c1",
                  "c2",
                  "s1",
                  "s2"
                ],
                "rationale": "Strongest research-grade profile: actively engineered a FixMatch/SAM2 remote-sensing settlement detector and led the €80k-funded Slum-i segmentation work. GSoC contributions with 100% test coverage plus a 500+ download localization CLI add rare open-source and engineering traction beyond the core axes."
              },
              {
                "candidate_id": "cand_20_ali_awais_safdar",
                "forward_rank": 2,
                "reverse_rank": 2,
                "avg_rank": 2,
                "survived": true,
                "outside_axes_standout": false,
                "supporting_refs": [
                  "s1",
                  "s2",
                  "s3",
                  "s5",
                  "s4"
                ],
                "rationale": "Combines a presented FIT 2024 vehicle-routing research paper with active construction of a VGG-19/BERT medical VQA system, giving strong research and multimodal evidence. The profile lacks quantified evaluation or demonstrated product/full-stack adoption, keeping it just below Taha."
              },
              {
                "candidate_id": "cand_08_muhammad_rouhan_faisal",
                "forward_rank": 3,
                "reverse_rank": 4,
                "avg_rank": 3.5,
                "survived": true,
                "outside_axes_standout": false,
                "supporting_refs": [
                  "s2",
                  "s3",
                  "s4",
                  "c1",
                  "c2"
                ],
                "rationale": "Best applied product-engineering profile in the group: built a Node/Mongo/Express real-time messenger supporting 100 concurrent users and a Next.js product. FusionRAG includes embeddings, BM25, and FAISS, but the digest marks that contribution as peripheral, so it cannot receive full RAG ownership credit."
              },
              {
                "candidate_id": "cand_18_abdul_rehman",
                "forward_rank": 4,
                "reverse_rank": 3,
                "avg_rank": 3.5,
                "survived": true,
                "outside_axes_standout": false,
                "supporting_refs": [
                  "s1",
                  "s2",
                  "s3"
                ],
                "rationale": "Shows unusually broad active AI system building through CLIP/Solr semantic image search, a BERT/PageRank/Bloom-filter search engine, and an LSTM predictor. These are relevant and technically substantive, but no evaluation metrics, deployment scale, or explicit end-to-end product impact are provided."
              },
              {
                "candidate_id": "cand_03_abdullah_aleem",
                "forward_rank": 5,
                "reverse_rank": 6,
                "avg_rank": 5.5,
                "survived": false,
                "outside_axes_standout": false,
                "supporting_refs": [
                  "c1",
                  "s1",
                  "s2",
                  "s3"
                ],
                "rationale": "Strong full-stack breadth, including an actively built WebSocket/Express/MongoDB real-time service, a Firebase/Firestore mobile application, and a recommendation engine. Compared with the higher-ranked AI candidates, the ML evidence is less advanced and lacks reported model or business metrics."
              },
              {
                "candidate_id": "cand_16_mehar_ali_ahmed",
                "forward_rank": 6,
                "reverse_rank": 5,
                "avg_rank": 5.5,
                "survived": false,
                "outside_axes_standout": false,
                "supporting_refs": [
                  "c2",
                  "c3",
                  "s1",
                  "s2"
                ],
                "rationale": "Provides quantified evidence through a RoBERTa/LoRA writing-style detector achieving 0.80 F1 and marketing systems that increased sign-ups by 40% and visibility by 20%. However, the profile has limited demonstrated software architecture, retrieval, vision, or production AI ownership."
              },
              {
                "candidate_id": "cand_17_ghulam_hussain_khan_sherwani",
                "forward_rank": 7,
                "reverse_rank": 8,
                "avg_rank": 7.5,
                "survived": false,
                "outside_axes_standout": false,
                "supporting_refs": [
                  "s1",
                  "s2",
                  "s3"
                ],
                "rationale": "Demonstrates active construction of a MERN e-commerce platform, a cricket-statistics application, and a U-Net document project. The evidence is directionally relevant across full-stack and vision, but it provides no evaluation, scale, research validation, or quantified product outcome."
              },
              {
                "candidate_id": "cand_19_abdullah_khan",
                "forward_rank": 8,
                "reverse_rank": 7,
                "avg_rank": 7.5,
                "survived": false,
                "outside_axes_standout": false,
                "supporting_refs": [
                  "c1",
                  "s1",
                  "s2"
                ],
                "rationale": "The UAV battery-life model is a concrete predictive-ML contribution with a reported 23% accuracy improvement over 29 flights, and workshop leadership is a positive signal. Nevertheless, the candidate has limited evidence across advanced multimodal AI, RAG, full-stack architecture, or product impact relative to the rest of this group."
              }
            ],
            "survivors": [
              "cand_27_muhammad_taha_mukhtar",
              "cand_20_ali_awais_safdar",
              "cand_08_muhammad_rouhan_faisal",
              "cand_18_abdul_rehman"
            ]
          }
        ]
      }
    ],
    "stage3_finalist_ids": [
      "cand_25_muhammad_abdullah",
      "cand_14_jatindar_kumar_mamnani",
      "cand_30_wahaj_ahmad_butt",
      "cand_11_muhammad_ahad_sajjad",
      "cand_27_muhammad_taha_mukhtar",
      "cand_20_ali_awais_safdar",
      "cand_08_muhammad_rouhan_faisal",
      "cand_18_abdul_rehman"
    ],
    "stage3_latin_square_orderings": [
      {
        "permutation_index": 0,
        "candidate_order": [
          "cand_25_muhammad_abdullah",
          "cand_14_jatindar_kumar_mamnani",
          "cand_30_wahaj_ahmad_butt",
          "cand_11_muhammad_ahad_sajjad",
          "cand_27_muhammad_taha_mukhtar",
          "cand_20_ali_awais_safdar",
          "cand_08_muhammad_rouhan_faisal",
          "cand_18_abdul_rehman"
        ],
        "rankings": [
          {
            "candidate_id": "cand_25_muhammad_abdullah",
            "rank": 1,
            "comparative_notes": "Ranks first through the clearest combination of externally validated AI research, technically strong hybrid RAG architecture, and real-time full-stack development. FUSIONRAG was published at COLING 2025 and actively combined OpenAI embeddings, BM25, FAISS, and rank fusion, while Scototo adds Next.js and Socket.IO product architecture; this is more directly aligned to the role than the research-only or single-modality strengths below.",
            "supporting_refs": [
              "s1",
              "s2",
              "s3"
            ]
          },
          {
            "candidate_id": "cand_14_jatindar_kumar_mamnani",
            "rank": 3,
            "comparative_notes": "Ranks above those below on multimodal model-building depth, with active ownership of a CNN/LSTM/Transformer medical VQA system and an autonomous-driving multitask model achieving 82.4% mIoU. His SemEval transformer table-answering and FastAPI chatbot broaden the AI/application profile, but he lacks the publication, funded research, or product-scale evidence of the two candidates above.",
            "supporting_refs": [
              "s1",
              "s2",
              "s3",
              "s4"
            ]
          },
          {
            "candidate_id": "cand_30_wahaj_ahmad_butt",
            "rank": 4,
            "comparative_notes": "Ranks above the remaining finalists by combining multimodal VQA, multiple transformer-based NLP classifiers, and a complete Laravel/WebRTC/MySQL authenticated chat and video application. The 82.7% emotion-recognition result is strong, but the evidence is less research-validated and architecturally broad than cand_14's multitask vision work and does not show RAG or external research validation.",
            "supporting_refs": [
              "s1",
              "s2",
              "s3",
              "s4"
            ]
          },
          {
            "candidate_id": "cand_11_muhammad_ahad_sajjad",
            "rank": 8,
            "comparative_notes": "Ranks last because his strongest verified evidence is product and UX impact rather than hands-on AI/ML or software architecture: wellness monitoring improved retention by 75% and onboarding by 25%, while several platforms report engagement and bounce-rate gains. Despite excellent quantified outcomes, the record does not substantiate the required depth in Python/ML, RAG, computer vision, or full-stack systems compared with every finalist above.",
            "supporting_refs": [
              "c1",
              "c2",
              "c3",
              "c4"
            ]
          },
          {
            "candidate_id": "cand_27_muhammad_taha_mukhtar",
            "rank": 2,
            "comparative_notes": "Ranks above the remaining candidates because of unusually strong international research and open-source evidence: an €80,000 DAAD-funded settlement-segmentation project using FixMatch, SAM2, domain adaptation, and H100/A100 infrastructure, plus Google Summer of Code work with 100% test coverage. He trails cand_25 because the publication is still upcoming and there is less demonstrated end-to-end product or retrieval architecture.",
            "supporting_refs": [
              "c1",
              "c2",
              "s1",
              "s2"
            ]
          },
          {
            "candidate_id": "cand_20_ali_awais_safdar",
            "rank": 5,
            "comparative_notes": "Ranks above the lower group because he has an authored and conference-presented vehicle-routing research paper, a medical VQA system using VGG-19, BERT, and attention, and additional systems work in blockchain and DNS architecture. His evidence is research-oriented, but it lacks a reported AI evaluation, RAG, quantified product impact, or clearly demonstrated full-stack delivery at the level of the candidates above.",
            "supporting_refs": [
              "s1",
              "s2",
              "s3",
              "s4",
              "s5"
            ]
          },
          {
            "candidate_id": "cand_08_muhammad_rouhan_faisal",
            "rank": 6,
            "comparative_notes": "Ranks above cand_18 and cand_11 primarily through active full-stack ownership: a MERN real-time chat application specified for 100 concurrent users, alongside a Next.js commerce product. His FusionRAG contribution is explicitly peripheral and the procurement impact is only described as potential, so his AI evidence is materially weaker than the research and model-building profiles above.",
            "supporting_refs": [
              "s2",
              "s3",
              "s4"
            ]
          },
          {
            "candidate_id": "cand_18_abdul_rehman",
            "rank": 7,
            "comparative_notes": "Ranks above cand_11 for stronger direct technical ownership of AI/search systems, including CLIP-based semantic image search over Flickr30k and a crawler, Bloom Filter, BERT, PageRank, and Solr web search engine. However, the resume provides no quantified evaluation, external validation, product adoption, or substantial full-stack architecture, limiting separation from the stronger candidates.",
            "supporting_refs": [
              "s1",
              "s2",
              "s3"
            ]
          }
        ]
      },
      {
        "permutation_index": 1,
        "candidate_order": [
          "cand_30_wahaj_ahmad_butt",
          "cand_11_muhammad_ahad_sajjad",
          "cand_27_muhammad_taha_mukhtar",
          "cand_20_ali_awais_safdar",
          "cand_08_muhammad_rouhan_faisal",
          "cand_18_abdul_rehman",
          "cand_25_muhammad_abdullah",
          "cand_14_jatindar_kumar_mamnani"
        ],
        "rankings": [
          {
            "candidate_id": "cand_30_wahaj_ahmad_butt",
            "rank": 5,
            "comparative_notes": "Ranks above the lower group through active ownership of several substantial AI projects, including ResNet50-BERT VQA, multi-model fake-review detection, and an emotion-recognition system achieving 82.7% accuracy. Its Laravel/WebRTC/MySQL application demonstrates meaningful full-stack and real-time architecture, but it lacks publication, funded research, or clear product adoption metrics.",
            "supporting_refs": [
              "s1",
              "s2",
              "s3",
              "s4",
              "work_1"
            ]
          },
          {
            "candidate_id": "cand_11_muhammad_ahad_sajjad",
            "rank": 8,
            "comparative_notes": "Has the strongest quantified product-impact claims among the lower group, including 75% retention improvement, 25% onboarding reduction, and multiple engagement and bounce-rate gains. It ranks last for this AI/ML engineering role because the evidence is primarily UI/UX and product design, with no technically specified model architecture, retrieval system, publication, or full-stack implementation details.",
            "supporting_refs": [
              "c1",
              "c2",
              "c3",
              "c4",
              "work_1",
              "work_2",
              "work_3"
            ]
          },
          {
            "candidate_id": "cand_27_muhammad_taha_mukhtar",
            "rank": 2,
            "comparative_notes": "Ranks above the remaining candidates because it has the pool’s clearest externally funded, international research trajectory: active settlement-detection modeling using FixMatch, domain adaptation, pseudo-label refinement, and SAM2 on H100/A100 infrastructure, within an €80k DAAD project. GSoC/CVAT ownership and a released localization CLI add credible engineering and open-source evidence, although the research lacks a reported model metric or completed publication.",
            "supporting_refs": [
              "c1",
              "c2",
              "s1",
              "s2",
              "work_1"
            ]
          },
          {
            "candidate_id": "cand_20_ali_awais_safdar",
            "rank": 4,
            "comparative_notes": "Ranks above the remaining application-focused candidates because it has an authored and conference-presented vehicle-routing research paper plus a technically substantive VGG-19/BERT attention medical VQA system. Its research credential is strong, but the AI projects provide less quantified evaluation and its full-stack/product evidence is less developed than the candidates above.",
            "supporting_refs": [
              "s1",
              "s2",
              "s3",
              "s4",
              "s5"
            ]
          },
          {
            "candidate_id": "cand_08_muhammad_rouhan_faisal",
            "rank": 6,
            "comparative_notes": "Ranks above the final two because it demonstrates a complete MERN real-time messenger for up to 100 concurrent users and has direct exposure to a technically strong FusionRAG pipeline using embeddings, BM25, and FAISS. However, the RAG contribution is explicitly peripheral and the AI/model-building portfolio lacks an active, quantified research or vision result.",
            "supporting_refs": [
              "s3",
              "s4",
              "c1",
              "c2",
              "work_1"
            ]
          },
          {
            "candidate_id": "cand_18_abdul_rehman",
            "rank": 7,
            "comparative_notes": "Ranks above cand_11 for stronger active AI and information-retrieval construction: a CLIP/Flickr30k semantic image search engine, a crawler/Bloom Filter/BERT/PageRank search engine, and an LSTM predictor. These are technically relevant systems, but there is no reported metric, publication, product adoption, or demonstrated real-time full-stack scope.",
            "supporting_refs": [
              "s1",
              "s2",
              "s3",
              "work_1"
            ]
          },
          {
            "candidate_id": "cand_25_muhammad_abdullah",
            "rank": 1,
            "comparative_notes": "Ranks first because it combines publication-level RAG ownership—OpenAI embeddings, BM25, FAISS, and rank fusion—with a full-stack real-time communication platform and a multi-component farmer-support application. This is the best direct match to the role’s preferred retrieval architecture and product-engineering needs, with a strong 3.75 GPA supporting the trajectory.",
            "supporting_refs": [
              "s1",
              "s2",
              "s3",
              "work_1"
            ]
          },
          {
            "candidate_id": "cand_14_jatindar_kumar_mamnani",
            "rank": 3,
            "comparative_notes": "Ranks above those below on unusually broad active multimodal model-building: medical VQA combines CNNs with LSTMs/Transformers, while the autonomous-driving system combines segmentation, lane detection, and object detection and reports 82.4% mIoU. The candidate also built a FastAPI LLM assistant and table-QA system, but lacks the publication or funded-research validation separating the top two.",
            "supporting_refs": [
              "s1",
              "s2",
              "s3",
              "s4",
              "work_1"
            ]
          }
        ]
      },
      {
        "permutation_index": 2,
        "candidate_order": [
          "cand_27_muhammad_taha_mukhtar",
          "cand_20_ali_awais_safdar",
          "cand_08_muhammad_rouhan_faisal",
          "cand_18_abdul_rehman",
          "cand_25_muhammad_abdullah",
          "cand_14_jatindar_kumar_mamnani",
          "cand_30_wahaj_ahmad_butt",
          "cand_11_muhammad_ahad_sajjad"
        ],
        "rankings": [
          {
            "candidate_id": "cand_27_muhammad_taha_mukhtar",
            "rank": 3,
            "comparative_notes": "Ranks above cand_20 and those below through active research engineering on semi-supervised remote-sensing settlement detection with FixMatch, domain adaptation, pseudo-label refinement, SAM2, and H100/A100 infrastructure, within an €80,000-funded project. Its research trajectory is strong, but it lacks the verified publication and broader retrieval/full-stack architecture of the higher-ranked candidates.",
            "supporting_refs": [
              "c1",
              "s1",
              "s2"
            ]
          },
          {
            "candidate_id": "cand_20_ali_awais_safdar",
            "rank": 4,
            "comparative_notes": "Ranks above cand_30 and the application-focused candidates because it actively authored and presented a vehicle-routing research paper and built a VGG-19/BERT attention-based medical VQA system. However, the record gives no reported VQA metric, deployment scale, or end-to-end full-stack architecture, limiting separation from the candidates below.",
            "supporting_refs": [
              "s1",
              "s2",
              "s3",
              "s4"
            ]
          },
          {
            "candidate_id": "cand_08_muhammad_rouhan_faisal",
            "rank": 6,
            "comparative_notes": "Ranks above cand_18 and cand_11 through active ownership of a MERN real-time messenger supporting up to 100 concurrent users, alongside full-stack Next.js work. Its strongest RAG evidence is explicitly peripheral contribution to FusionRAG, and the procurement impact is also team-level/potential rather than individually verified.",
            "supporting_refs": [
              "s2",
              "s3",
              "s4"
            ]
          },
          {
            "candidate_id": "cand_18_abdul_rehman",
            "rank": 7,
            "comparative_notes": "Ranks above cand_11 because of active construction of technically substantive retrieval and ML systems: CLIP plus Apache Solr semantic image search, a crawler/Bloom Filter/BERT/PageRank search engine, and an LSTM predictor. These projects lack reported performance, publication, adoption, or strong product/full-stack impact evidence.",
            "supporting_refs": [
              "s1",
              "s2",
              "s3"
            ]
          },
          {
            "candidate_id": "cand_25_muhammad_abdullah",
            "rank": 1,
            "comparative_notes": "Ranks first for the strongest combined fit: active ownership of COLING 2025-published FUSIONRAG using embeddings, BM25, FAISS, and rank fusion, plus a real-time text/voice/video platform built with Next.js, SQL, Socket.IO, and Clerk. This combination exceeds the primarily research-only or project-only evidence of those below.",
            "supporting_refs": [
              "s1",
              "s2",
              "s3"
            ]
          },
          {
            "candidate_id": "cand_14_jatindar_kumar_mamnani",
            "rank": 2,
            "comparative_notes": "Ranks above the remaining candidates because of unusually deep active multimodal and computer-vision work, including CNN/LSTM/Transformer VQA and an autonomous-driving multitask model achieving 82.4% mIoU. The absence of a publication, quantified product adoption, or demonstrated RAG/full-stack system keeps this below cand_25.",
            "supporting_refs": [
              "s1",
              "s2",
              "s3",
              "s4"
            ]
          },
          {
            "candidate_id": "cand_30_wahaj_ahmad_butt",
            "rank": 5,
            "comparative_notes": "Ranks above cand_08 and cand_18 for the combination of active multimodal modeling, multiple advanced NLP classifiers, a WebRTC video-chat application with authentication and persistence, and an emotion-recognition model reaching 82.7% accuracy. It lacks the publication or research-funding evidence of the higher-ranked group.",
            "supporting_refs": [
              "s1",
              "s2",
              "s3",
              "s4"
            ]
          },
          {
            "candidate_id": "cand_11_muhammad_ahad_sajjad",
            "rank": 8,
            "comparative_notes": "Ranks last on this AI/ML engineering slate despite the strongest quantified product outcomes, including 75% retention improvement, 25% lower onboarding time, and multiple engagement gains. The evidence is primarily UI/UX and product delivery, with no comparable active ownership of a concrete model architecture, research-grade evaluation, RAG pipeline, or complex full-stack engineering system.",
            "supporting_refs": [
              "c1",
              "c2",
              "c3",
              "c4"
            ]
          }
        ]
      },
      {
        "permutation_index": 3,
        "candidate_order": [
          "cand_08_muhammad_rouhan_faisal",
          "cand_18_abdul_rehman",
          "cand_25_muhammad_abdullah",
          "cand_14_jatindar_kumar_mamnani",
          "cand_30_wahaj_ahmad_butt",
          "cand_11_muhammad_ahad_sajjad",
          "cand_27_muhammad_taha_mukhtar",
          "cand_20_ali_awais_safdar"
        ],
        "rankings": [
          {
            "candidate_id": "cand_08_muhammad_rouhan_faisal",
            "rank": 7,
            "comparative_notes": "Its real-time MERN chat application supports 100 concurrent users and provides solid full-stack evidence, while CaseCobra demonstrates active Next.js ownership. The RAG work is explicitly peripheral and the internship impact is mostly supportive, so it trails candidates with active research-grade model building or quantified AI results.",
            "supporting_refs": [
              "s2",
              "s3",
              "s4",
              "c1",
              "c2"
            ]
          },
          {
            "candidate_id": "cand_18_abdul_rehman",
            "rank": 6,
            "comparative_notes": "Ranks above the remaining candidates for active ownership of substantive retrieval and NLP systems, including CLIP-based semantic image search and a crawler/Bloom Filter/BERT/PageRank search engine, plus an LSTM predictor. These projects show architectural AI depth but lack the publication, strong reported metrics, or product-scale evidence of those ranked higher.",
            "supporting_refs": [
              "s1",
              "s2",
              "s3"
            ]
          },
          {
            "candidate_id": "cand_25_muhammad_abdullah",
            "rank": 3,
            "comparative_notes": "The COLING 2025 FUSIONRAG publication is the clearest externally validated retrieval achievement in the pool, with active ownership of embeddings, BM25, FAISS, and rank fusion. Scototo also adds meaningful real-time product architecture, though the record is less deep in quantified multimodal modeling than the two candidates above.",
            "supporting_refs": [
              "s1",
              "s2",
              "s3"
            ]
          },
          {
            "candidate_id": "cand_14_jatindar_kumar_mamnani",
            "rank": 2,
            "comparative_notes": "Ranks above the remaining candidates because of unusually deep active multimodal model ownership: medical VQA, transformer table answering, and autonomous-driving multitask learning with 82.4% mIoU. This breadth and quantified vision result outweigh the weaker academic record and lack of publication or externally funded project compared with the candidate above.",
            "supporting_refs": [
              "s1",
              "s2",
              "s3",
              "s4",
              "c1"
            ]
          },
          {
            "candidate_id": "cand_30_wahaj_ahmad_butt",
            "rank": 4,
            "comparative_notes": "Ranks above the remaining finalists through a strong combination of active multimodal modeling, an 82.7% emotion-recognition result, and a complete WebRTC application with authentication and persistence. Its projects are technically substantial, but it lacks the publication, funding, or external research validation demonstrated by the higher-ranked candidates.",
            "supporting_refs": [
              "s1",
              "s2",
              "s3",
              "s4"
            ]
          },
          {
            "candidate_id": "cand_11_muhammad_ahad_sajjad",
            "rank": 8,
            "comparative_notes": "The candidate has the strongest direct product-impact record at the lower end, with reported gains in retention, engagement, onboarding, bounce rate, satisfaction, and support burden across several shipped experiences. However, the evidence is primarily UI/UX and product design with limited concrete ML architecture, Python/model ownership, or systems detail, placing it below the technically deeper AI and engineering profiles.",
            "supporting_refs": [
              "c1",
              "c2",
              "c3",
              "c4"
            ]
          },
          {
            "candidate_id": "cand_27_muhammad_taha_mukhtar",
            "rank": 1,
            "comparative_notes": "Ranks first for the strongest combination of international research experience, externally funded AI work, advanced semi-supervised segmentation, and high-end compute exposure. The €80,000 DAAD-funded Slum-i project, DFKI research, SAM2/FixMatch work, and measurable open-source adoption provide more research trajectory and external validation than the finalists below.",
            "supporting_refs": [
              "c1",
              "c2",
              "s1",
              "s2"
            ]
          },
          {
            "candidate_id": "cand_20_ali_awais_safdar",
            "rank": 5,
            "comparative_notes": "The presented FIT 2024 vehicle-routing paper and PATHVQA system show credible research-oriented AI breadth, while the DNS client and blockchain ledger demonstrate systems ability. However, the evidence is less quantified and less explicitly implementation-detailed than the multimodal and full-stack achievements above, and the listed employment entries provide little active-impact detail.",
            "supporting_refs": [
              "s1",
              "s2",
              "s3",
              "s4",
              "s5"
            ]
          }
        ]
      }
    ],
    "stage3_top5_candidate_ids": [
      "cand_25_muhammad_abdullah",
      "cand_27_muhammad_taha_mukhtar",
      "cand_14_jatindar_kumar_mamnani",
      "cand_20_ali_awais_safdar",
      "cand_30_wahaj_ahmad_butt"
    ],
    "stage3_pairwise_matchups": [
      {
        "candidate_a": "cand_25_muhammad_abdullah",
        "candidate_b": "cand_27_muhammad_taha_mukhtar",
        "forward_winner": "cand_25_muhammad_abdullah",
        "forward_confidence": "clear",
        "reverse_winner": "cand_25_muhammad_abdullah",
        "reverse_confidence": "clear",
        "resolved_outcome": "a_wins",
        "decisive_reasons": "Muhammad Abdullah has the strongest directly verified combination of a peer-reviewed COLING 2025 publication, end-to-end hybrid RAG architecture using embeddings, BM25, FAISS, and rank fusion, plus a real-time Socket.IO full-stack product. Muhammad Taha Mukhtar shows impressive funded computer-vision research, but its publication is only upcoming and lacks a reported evaluation metric or comparable product architecture evidence. Muhammad Taha Mukhtar has the strongest validated alignment: a COLING 2025 publication for an actively developed hybrid FUSIONRAG system combining embeddings, BM25, FAISS, and rank fusion, plus ownership of a real-time Next.js/Socket.IO communication platform. Muhammad Abdullah shows stronger research-computing exposure, but lacks a reported model metric or completed publication and has less demonstrated full-stack architecture depth.",
        "supporting_claims": [
          {
            "candidate_id": "cand_25_muhammad_abdullah",
            "ref_id": "s2"
          },
          {
            "candidate_id": "cand_25_muhammad_abdullah",
            "ref_id": "s1"
          },
          {
            "candidate_id": "cand_27_muhammad_taha_mukhtar",
            "ref_id": "s1"
          },
          {
            "candidate_id": "cand_27_muhammad_taha_mukhtar",
            "ref_id": "c1"
          },
          {
            "candidate_id": "cand_25_muhammad_abdullah",
            "ref_id": "s2"
          },
          {
            "candidate_id": "cand_25_muhammad_abdullah",
            "ref_id": "s1"
          },
          {
            "candidate_id": "cand_25_muhammad_abdullah",
            "ref_id": "s3"
          },
          {
            "candidate_id": "cand_27_muhammad_taha_mukhtar",
            "ref_id": "s1"
          },
          {
            "candidate_id": "cand_27_muhammad_taha_mukhtar",
            "ref_id": "work_1"
          }
        ]
      },
      {
        "candidate_a": "cand_25_muhammad_abdullah",
        "candidate_b": "cand_14_jatindar_kumar_mamnani",
        "forward_winner": "cand_25_muhammad_abdullah",
        "forward_confidence": "narrow",
        "reverse_winner": "cand_25_muhammad_abdullah",
        "reverse_confidence": "clear",
        "resolved_outcome": "a_wins",
        "decisive_reasons": "Muhammad Abdullah has the stronger evidence of externally validated research and directly relevant retrieval architecture: an active COLING 2025 publication implementing embeddings, BM25, FAISS, and rank fusion, alongside a Socket.IO full-stack platform. Jatindar Kumar Mamnani is stronger in multimodal computer vision and has an excellent 82.4% mIoU result, but lacks comparable publication-level validation, RAG depth, or product/full-stack evidence. Jatindar Kumar Mamnani has the stronger overall fit through a published COLING 2025 RAG system with hybrid BM25, FAISS, embeddings, and rank fusion, plus active ownership of a real-time Next.js/Socket.IO communication platform. Muhammad Abdullah demonstrates deeper quantified multimodal vision work, but lacks B’s externally validated research output and equally strong full-stack architecture evidence.",
        "supporting_claims": [
          {
            "candidate_id": "cand_25_muhammad_abdullah",
            "ref_id": "s2"
          },
          {
            "candidate_id": "cand_25_muhammad_abdullah",
            "ref_id": "s1"
          },
          {
            "candidate_id": "cand_14_jatindar_kumar_mamnani",
            "ref_id": "s3"
          },
          {
            "candidate_id": "cand_14_jatindar_kumar_mamnani",
            "ref_id": "s4"
          },
          {
            "candidate_id": "cand_25_muhammad_abdullah",
            "ref_id": "s2"
          },
          {
            "candidate_id": "cand_25_muhammad_abdullah",
            "ref_id": "s1"
          },
          {
            "candidate_id": "cand_25_muhammad_abdullah",
            "ref_id": "s3"
          },
          {
            "candidate_id": "cand_14_jatindar_kumar_mamnani",
            "ref_id": "s4"
          },
          {
            "candidate_id": "cand_14_jatindar_kumar_mamnani",
            "ref_id": "s3"
          }
        ]
      },
      {
        "candidate_a": "cand_25_muhammad_abdullah",
        "candidate_b": "cand_20_ali_awais_safdar",
        "forward_winner": "cand_25_muhammad_abdullah",
        "forward_confidence": "narrow",
        "reverse_winner": "cand_25_muhammad_abdullah",
        "reverse_confidence": "clear",
        "resolved_outcome": "a_wins",
        "decisive_reasons": "Abdullah has the stronger direct fit for this applied AI/product role through an externally published COLING 2025 hybrid RAG system combining embeddings, BM25, FAISS, and rank fusion, plus active ownership of a Socket.IO/Next.js communication platform. Safdar demonstrates deeper multimodal VQA and optimization research, but lacks comparable evidence of end-to-end retrieval architecture or full-stack product ownership. Ali Awais Safdar has the stronger direct fit through a published, end-to-end RAG system combining OpenAI embeddings, BM25, FAISS, and rank fusion, plus active ownership of a real-time full-stack communication platform. Muhammad Abdullah shows credible research and multimodal VQA work, but lacks comparable retrieval-architecture depth or demonstrated product architecture and impact.",
        "supporting_claims": [
          {
            "candidate_id": "cand_25_muhammad_abdullah",
            "ref_id": "s2"
          },
          {
            "candidate_id": "cand_25_muhammad_abdullah",
            "ref_id": "s1"
          },
          {
            "candidate_id": "cand_20_ali_awais_safdar",
            "ref_id": "s3"
          },
          {
            "candidate_id": "cand_20_ali_awais_safdar",
            "ref_id": "s1"
          },
          {
            "candidate_id": "cand_25_muhammad_abdullah",
            "ref_id": "s2"
          },
          {
            "candidate_id": "cand_25_muhammad_abdullah",
            "ref_id": "s1"
          },
          {
            "candidate_id": "cand_20_ali_awais_safdar",
            "ref_id": "s2"
          },
          {
            "candidate_id": "cand_20_ali_awais_safdar",
            "ref_id": "s3"
          }
        ]
      },
      {
        "candidate_a": "cand_25_muhammad_abdullah",
        "candidate_b": "cand_30_wahaj_ahmad_butt",
        "forward_winner": "cand_25_muhammad_abdullah",
        "forward_confidence": "clear",
        "reverse_winner": "cand_25_muhammad_abdullah",
        "reverse_confidence": "clear",
        "resolved_outcome": "a_wins",
        "decisive_reasons": "Muhammad Abdullah has the strongest research and retrieval evidence: active ownership of a COLING 2025 publication implementing hybrid BM25, FAISS, embeddings, and rank fusion, directly matching the role’s RAG emphasis. A also demonstrates full-stack real-time ownership through a Next.js/Socket.IO communication platform, while Wahaj Ahmad Butt’s strongest evidence is advanced project work without publication or similarly validated retrieval architecture. Wahaj Ahmad Butt has the strongest research-grade evidence and explicit RAG ownership: a COLING 2025 publication for FUSIONRAG combining embeddings, BM25, FAISS, and rank fusion. B also built a multi-modal real-time communication platform, while Muhammad Abdullah’s strongest advantages are a quantified 82.7% vision result and WebRTC application but lack comparable externally validated research depth.",
        "supporting_claims": [
          {
            "candidate_id": "cand_25_muhammad_abdullah",
            "ref_id": "s2"
          },
          {
            "candidate_id": "cand_25_muhammad_abdullah",
            "ref_id": "s1"
          },
          {
            "candidate_id": "cand_30_wahaj_ahmad_butt",
            "ref_id": "s1"
          },
          {
            "candidate_id": "cand_30_wahaj_ahmad_butt",
            "ref_id": "s4"
          },
          {
            "candidate_id": "cand_25_muhammad_abdullah",
            "ref_id": "s2"
          },
          {
            "candidate_id": "cand_25_muhammad_abdullah",
            "ref_id": "s1"
          },
          {
            "candidate_id": "cand_30_wahaj_ahmad_butt",
            "ref_id": "s4"
          },
          {
            "candidate_id": "cand_30_wahaj_ahmad_butt",
            "ref_id": "s3"
          }
        ]
      },
      {
        "candidate_a": "cand_27_muhammad_taha_mukhtar",
        "candidate_b": "cand_14_jatindar_kumar_mamnani",
        "forward_winner": "cand_14_jatindar_kumar_mamnani",
        "forward_confidence": "clear",
        "reverse_winner": "cand_14_jatindar_kumar_mamnani",
        "reverse_confidence": "narrow",
        "resolved_outcome": "b_wins",
        "decisive_reasons": "Jatindar Kumar Mamnani demonstrates broader hands-on AI system construction across multimodal VQA, transformer table QA, and autonomous-driving multitask vision, including a concrete 82.4% mIoU result. Muhammad Taha Mukhtar has stronger funded research/international exposure, but lacks comparable reported model metrics and breadth of completed AI architectures. Muhammad Taha Mukhtar has stronger directly demonstrated AI system-building breadth for this role, including multimodal VQA, transformer table QA, FastAPI LLM integration, and a multitask autonomous-driving model achieving 82.4% mIoU. Jatindar Kumar Mamnani has superior externally funded and international research credentials, but lacks comparable reported model metrics or detailed end-to-end product architecture.",
        "supporting_claims": [
          {
            "candidate_id": "cand_14_jatindar_kumar_mamnani",
            "ref_id": "s3"
          },
          {
            "candidate_id": "cand_14_jatindar_kumar_mamnani",
            "ref_id": "s4"
          },
          {
            "candidate_id": "cand_14_jatindar_kumar_mamnani",
            "ref_id": "s2"
          },
          {
            "candidate_id": "cand_27_muhammad_taha_mukhtar",
            "ref_id": "s1"
          },
          {
            "candidate_id": "cand_27_muhammad_taha_mukhtar",
            "ref_id": "work_1"
          },
          {
            "candidate_id": "cand_14_jatindar_kumar_mamnani",
            "ref_id": "s3"
          },
          {
            "candidate_id": "cand_14_jatindar_kumar_mamnani",
            "ref_id": "s4"
          },
          {
            "candidate_id": "cand_14_jatindar_kumar_mamnani",
            "ref_id": "s1"
          },
          {
            "candidate_id": "cand_14_jatindar_kumar_mamnani",
            "ref_id": "s2"
          },
          {
            "candidate_id": "cand_27_muhammad_taha_mukhtar",
            "ref_id": "s1"
          },
          {
            "candidate_id": "cand_27_muhammad_taha_mukhtar",
            "ref_id": "c1"
          },
          {
            "candidate_id": "cand_27_muhammad_taha_mukhtar",
            "ref_id": "c2"
          },
          {
            "candidate_id": "cand_27_muhammad_taha_mukhtar",
            "ref_id": "s2"
          }
        ]
      },
      {
        "candidate_a": "cand_27_muhammad_taha_mukhtar",
        "candidate_b": "cand_20_ali_awais_safdar",
        "forward_winner": "cand_20_ali_awais_safdar",
        "forward_confidence": "narrow",
        "reverse_winner": "cand_27_muhammad_taha_mukhtar",
        "reverse_confidence": "clear",
        "resolved_outcome": "tie",
        "decisive_reasons": "Ali Awais Safdar has stronger externally validated research evidence through an authored and conference-presented vehicle-routing paper, plus a hands-on multimodal VQA system combining VGG-19, BERT, and attention. Muhammad Taha Mukhtar shows impressive funded remote-sensing research and international lab exposure, but lacks a reported model metric or completed publication, making B’s documented research output and multimodal architecture the edge. Ali Awais Safdar has stronger research-grade engineering evidence through active ownership of a semi-supervised remote-sensing segmentation system in an externally funded €80,000 DFKI/RPTU project, using FixMatch, domain adaptation, SAM2, and high-end GPU infrastructure. B also demonstrates measurable product/open-source impact with 500+ downloads and 100% test coverage, whereas Muhammad Taha Mukhtar’s publication and VQA work lack comparable evaluation or adoption metrics.",
        "supporting_claims": [
          {
            "candidate_id": "cand_20_ali_awais_safdar",
            "ref_id": "s1"
          },
          {
            "candidate_id": "cand_20_ali_awais_safdar",
            "ref_id": "s2"
          },
          {
            "candidate_id": "cand_20_ali_awais_safdar",
            "ref_id": "s3"
          },
          {
            "candidate_id": "cand_27_muhammad_taha_mukhtar",
            "ref_id": "c1"
          },
          {
            "candidate_id": "cand_27_muhammad_taha_mukhtar",
            "ref_id": "s1"
          },
          {
            "candidate_id": "cand_27_muhammad_taha_mukhtar",
            "ref_id": "c1"
          },
          {
            "candidate_id": "cand_27_muhammad_taha_mukhtar",
            "ref_id": "s1"
          },
          {
            "candidate_id": "cand_27_muhammad_taha_mukhtar",
            "ref_id": "s2"
          },
          {
            "candidate_id": "cand_27_muhammad_taha_mukhtar",
            "ref_id": "c2"
          },
          {
            "candidate_id": "cand_20_ali_awais_safdar",
            "ref_id": "s1"
          },
          {
            "candidate_id": "cand_20_ali_awais_safdar",
            "ref_id": "s2"
          },
          {
            "candidate_id": "cand_20_ali_awais_safdar",
            "ref_id": "s3"
          }
        ]
      },
      {
        "candidate_a": "cand_27_muhammad_taha_mukhtar",
        "candidate_b": "cand_30_wahaj_ahmad_butt",
        "forward_winner": "cand_27_muhammad_taha_mukhtar",
        "forward_confidence": "narrow",
        "reverse_winner": "cand_27_muhammad_taha_mukhtar",
        "reverse_confidence": "narrow",
        "resolved_outcome": "a_wins",
        "decisive_reasons": "Muhammad Taha Mukhtar has stronger research-grade evidence through active DFKI ownership of a FixMatch/SAM2 remote-sensing settlement model on H100/A100 infrastructure and participation in a €80,000 DAAD-funded project. Wahaj Ahmad Butt demonstrates broader multimodal and real-time product construction, including 82.7% vision accuracy and WebRTC, but lacks comparable externally funded international research depth or a fully reported VQA result. Wahaj Ahmad Butt has the stronger research trajectory through active engineering of a semi-supervised remote-sensing model at DFKI and participation in a €80,000 DAAD-funded project, plus international open-source experience. Muhammad Taha Mukhtar has a stronger demonstrated full-stack real-time build and a quantified 82.7% vision result, so the decision is close, but B’s research-grade depth is more distinctive for this AI-focused role.",
        "supporting_claims": [
          {
            "candidate_id": "cand_27_muhammad_taha_mukhtar",
            "ref_id": "c1"
          },
          {
            "candidate_id": "cand_27_muhammad_taha_mukhtar",
            "ref_id": "s1"
          },
          {
            "candidate_id": "cand_30_wahaj_ahmad_butt",
            "ref_id": "s1"
          },
          {
            "candidate_id": "cand_30_wahaj_ahmad_butt",
            "ref_id": "s3"
          },
          {
            "candidate_id": "cand_30_wahaj_ahmad_butt",
            "ref_id": "s4"
          },
          {
            "candidate_id": "cand_27_muhammad_taha_mukhtar",
            "ref_id": "c1"
          },
          {
            "candidate_id": "cand_27_muhammad_taha_mukhtar",
            "ref_id": "s1"
          },
          {
            "candidate_id": "cand_27_muhammad_taha_mukhtar",
            "ref_id": "c2"
          },
          {
            "candidate_id": "cand_27_muhammad_taha_mukhtar",
            "ref_id": "s2"
          },
          {
            "candidate_id": "cand_30_wahaj_ahmad_butt",
            "ref_id": "s3"
          },
          {
            "candidate_id": "cand_30_wahaj_ahmad_butt",
            "ref_id": "s4"
          }
        ]
      },
      {
        "candidate_a": "cand_14_jatindar_kumar_mamnani",
        "candidate_b": "cand_20_ali_awais_safdar",
        "forward_winner": "cand_14_jatindar_kumar_mamnani",
        "forward_confidence": "narrow",
        "reverse_winner": "cand_14_jatindar_kumar_mamnani",
        "reverse_confidence": "clear",
        "resolved_outcome": "a_wins",
        "decisive_reasons": "Jatindar Kumar Mamnani has the stronger directly demonstrated production-AI build profile: a multimodal CNN/LSTM/Transformer VQA system and a multitask autonomous-driving model with a concrete 82.4% mIoU result, plus an actively built FastAPI assistant. Ali Awais Safdar has the stronger research credential through a conference-presented paper, but its AI systems lack comparable evaluation metrics or documented end-to-end product depth. Ali Awais Safdar demonstrates stronger applied AI depth through a quantified autonomous-driving multitask model achieving 82.4% mIoU, plus hands-on multimodal VQA, transformer table answering, and FastAPI chatbot systems. Jatindar Kumar Mamnani has a valuable conference research publication, but lacks comparable model metrics or breadth of validated production-oriented AI architecture.",
        "supporting_claims": [
          {
            "candidate_id": "cand_14_jatindar_kumar_mamnani",
            "ref_id": "s4"
          },
          {
            "candidate_id": "cand_14_jatindar_kumar_mamnani",
            "ref_id": "s3"
          },
          {
            "candidate_id": "cand_14_jatindar_kumar_mamnani",
            "ref_id": "s1"
          },
          {
            "candidate_id": "cand_20_ali_awais_safdar",
            "ref_id": "s1"
          },
          {
            "candidate_id": "cand_20_ali_awais_safdar",
            "ref_id": "s2"
          },
          {
            "candidate_id": "cand_20_ali_awais_safdar",
            "ref_id": "s3"
          },
          {
            "candidate_id": "cand_14_jatindar_kumar_mamnani",
            "ref_id": "s4"
          },
          {
            "candidate_id": "cand_14_jatindar_kumar_mamnani",
            "ref_id": "s3"
          },
          {
            "candidate_id": "cand_14_jatindar_kumar_mamnani",
            "ref_id": "s2"
          },
          {
            "candidate_id": "cand_14_jatindar_kumar_mamnani",
            "ref_id": "s1"
          },
          {
            "candidate_id": "cand_20_ali_awais_safdar",
            "ref_id": "s1"
          },
          {
            "candidate_id": "cand_20_ali_awais_safdar",
            "ref_id": "s2"
          }
        ]
      },
      {
        "candidate_a": "cand_14_jatindar_kumar_mamnani",
        "candidate_b": "cand_30_wahaj_ahmad_butt",
        "forward_winner": "cand_14_jatindar_kumar_mamnani",
        "forward_confidence": "narrow",
        "reverse_winner": "cand_14_jatindar_kumar_mamnani",
        "reverse_confidence": "narrow",
        "resolved_outcome": "a_wins",
        "decisive_reasons": "Jatindar Kumar Mamnani has the stronger AI/research profile, including active computer-vision research and a multimodal autonomous-driving system spanning segmentation, lane detection, and object detection with 82.4% mIoU. Wahaj Ahmad Butt has the edge in real-time full-stack architecture through WebRTC, JWT, and MySQL, but A’s deeper measured multimodal modeling and research trajectory are more central to this AI/ML-focused role. Wahaj Ahmad Butt has stronger AI/research trajectory, including active computer-vision research internship ownership and a measured autonomous-driving multitask system achieving 82.4% mIoU, plus multimodal medical VQA. Jatindar Kumar Mamnani has the edge in real-time full-stack architecture through WebRTC, JWT, and MySQL, but B’s deeper, more varied, and more rigorously evaluated AI systems better match the role’s standout AI/ML criteria.",
        "supporting_claims": [
          {
            "candidate_id": "cand_14_jatindar_kumar_mamnani",
            "ref_id": "work_1"
          },
          {
            "candidate_id": "cand_14_jatindar_kumar_mamnani",
            "ref_id": "s3"
          },
          {
            "candidate_id": "cand_14_jatindar_kumar_mamnani",
            "ref_id": "s4"
          },
          {
            "candidate_id": "cand_30_wahaj_ahmad_butt",
            "ref_id": "s3"
          },
          {
            "candidate_id": "cand_30_wahaj_ahmad_butt",
            "ref_id": "s1"
          },
          {
            "candidate_id": "cand_30_wahaj_ahmad_butt",
            "ref_id": "s4"
          },
          {
            "candidate_id": "cand_14_jatindar_kumar_mamnani",
            "ref_id": "work_1"
          },
          {
            "candidate_id": "cand_14_jatindar_kumar_mamnani",
            "ref_id": "s3"
          },
          {
            "candidate_id": "cand_14_jatindar_kumar_mamnani",
            "ref_id": "s4"
          },
          {
            "candidate_id": "cand_30_wahaj_ahmad_butt",
            "ref_id": "s3"
          },
          {
            "candidate_id": "cand_30_wahaj_ahmad_butt",
            "ref_id": "s4"
          }
        ]
      },
      {
        "candidate_a": "cand_20_ali_awais_safdar",
        "candidate_b": "cand_30_wahaj_ahmad_butt",
        "forward_winner": "cand_30_wahaj_ahmad_butt",
        "forward_confidence": "narrow",
        "reverse_winner": "cand_20_ali_awais_safdar",
        "reverse_confidence": "narrow",
        "resolved_outcome": "tie",
        "decisive_reasons": "Wahaj demonstrates stronger applied engineering breadth: a quantified 82.7% vision result, multiple modern NLP/CV models, and an end-to-end authenticated real-time chat/video application using WebRTC, Laravel, and MySQL. Ali has the stronger research credential through an authored and presented paper, but lacks comparable evaluation metrics and full-stack production architecture evidence. Ali has the stronger research trajectory, with active authorship and conference presentation of an AI-driven vehicle-routing paper, plus a medical VQA system and multiple research/international lab roles. Wahaj has better quantified vision and real-time product evidence, but Ali’s externally presented research depth is the more differentiating factor for this role.",
        "supporting_claims": [
          {
            "candidate_id": "cand_30_wahaj_ahmad_butt",
            "ref_id": "s4"
          },
          {
            "candidate_id": "cand_30_wahaj_ahmad_butt",
            "ref_id": "s1"
          },
          {
            "candidate_id": "cand_30_wahaj_ahmad_butt",
            "ref_id": "s3"
          },
          {
            "candidate_id": "cand_30_wahaj_ahmad_butt",
            "ref_id": "s2"
          },
          {
            "candidate_id": "cand_20_ali_awais_safdar",
            "ref_id": "s1"
          },
          {
            "candidate_id": "cand_20_ali_awais_safdar",
            "ref_id": "s2"
          },
          {
            "candidate_id": "cand_20_ali_awais_safdar",
            "ref_id": "s1"
          },
          {
            "candidate_id": "cand_20_ali_awais_safdar",
            "ref_id": "s2"
          },
          {
            "candidate_id": "cand_20_ali_awais_safdar",
            "ref_id": "s3"
          },
          {
            "candidate_id": "cand_20_ali_awais_safdar",
            "ref_id": "work_1"
          },
          {
            "candidate_id": "cand_30_wahaj_ahmad_butt",
            "ref_id": "s4"
          },
          {
            "candidate_id": "cand_30_wahaj_ahmad_butt",
            "ref_id": "s3"
          }
        ]
      }
    ]
  }
};
