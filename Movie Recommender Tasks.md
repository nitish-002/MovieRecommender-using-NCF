# Movie Recommender – Task List

This document enumerates the tasks derived from the **Movie Recommender via Neural Collaborative Filtering** PRD.  Tasks are presented as check‑boxes; tick `[x]` for completed items and leave `[ ]` for pending work.

---

## 🎯 Product Objectives (from Section 8)

- [ ] **1.** Build a personalized movie recommendation system using Neural Collaborative Filtering.
- [ ] **2.** Train the model using MovieLens 25M interactions.
- [ ] **3.** Implement a popularity‑based baseline.
- [ ] **4.** Implement GMF.
- [ ] **5.** Implement MLP.
- [ ] **6.** Implement NeuMF as the primary recommendation model.
- [ ] **7.** Use Leave‑One‑Out evaluation.
- [ ] **8.** Measure Hit Rate@10.
- [ ] **9.** Measure NDCG@10.
- [ ] **10.** Compare implemented models using the same evaluation protocol.
- [x] **11.** Serve recommendations via FastAPI.
- [x] **12.** Provide a React frontend.
- [x] **13.** Display recommendation and model performance information.
- [ ] **14.** Save and version model artifacts.
- [ ] **15.** Provide reproducible training and evaluation instructions.
- [ ] **16.** Test the core ML pipeline and API.

---

## 📦 Functional Requirements (FR‑001 – FR‑025)

| ID | Requirement | Status |
|----|-------------|--------|
| FR-001 | Dataset ingestion | [ ] |
| FR-002 | Data validation | [ ] |
| FR-003 | Exploratory Data Analysis (EDA) | [ ] |
| FR-004 | Interaction preprocessing | [ ] |
| FR-005 | Implicit feedback generation | [ ] |
| FR-006 | Negative sampling | [ ] |
| FR-007 | Leave‑One‑Out split | [ ] |
| FR-008 | Popularity baseline | [ ] |
| FR-009 | GMF model | [ ] |
| FR-010 | MLP model | [ ] |
| FR-011 | NeuMF model (trained & versioned) | [ ] |
| FR-012 | Evaluation (HR@10 & NDCG@10) | [ ] |
| FR-013 | Model comparison | [ ] |
| FR-014 | Recommendation API (Top‑N) | [x] |
| FR-015 | Movie search API | [x] |
| FR-016 | Prediction API (preference or rating) | [x] |
| FR-017 | Metrics API (dataset & model metrics) | [x] |
| FR-018 | Health API (service & artifact readiness) | [x] |
| FR-019 | React UI (end‑to‑end recommendations) | [x] |
| FR-020 | Model metadata (version & metrics) | [ ] |
| FR-021 | Automated tests (core pipeline & API) | [ ] |
| FR-022 | Model card (usage, data, metrics, limitations) | [ ] |
| FR-023 | Experiment tracking (training config & metrics) | [ ] |
| FR-024 | Hybrid re‑ranking (optional) | [ ] |
| FR-025 | Cold‑start fallback (optional) | [ ] |

---

## 🧑‍💻 User Stories (US‑001 – US‑030)

| ID | Story | Status |
|----|-------|--------|
| US-001 | Select a user profile to receive personalized recommendations. | [x] |
| US-002 | Receive personalized Top‑N recommendations. | [x] |
| US-003 | Choose how many recommendations to view. | [x] |
| US-004 | Exclude already‑interacted movies from recommendations. | [ ] |
| US-005 | See movie titles and genres in recommendation cards. | [x] |
| US-006 | Search for movies by title. | [x] |
| US-007 | View a preference or rating prediction for a selected movie. | [x] |
| US-008 | Switch profiles to explore recommendations for different users. | [x] |
| US-009 | See loading states while recommendations are generated. | [x] |
| US-010 | Receive meaningful error messages on failures. | [x] |
| US-011 | View Hit Rate@10 as a product‑manager. | [x] |
| US-012 | View NDCG@10 as a product‑manager. | [x] |
| US-013 | Compare multiple recommendation models as a product analyst. | [x] |
| US-014 | View dataset statistics as a product analyst. | [x] |
| US-015 | Preprocess MovieLens interactions reproducibly as a data scientist. | [ ] |
| US-016 | Use negative sampling as a data scientist. | [ ] |
| US-017 | Use Leave‑One‑Out evaluation as a data scientist. | [ ] |
| US-018 | Calculate HR@10 as a data scientist. | [ ] |
| US-019 | Calculate NDCG@10 as a data scientist. | [ ] |
| US-020 | Keep evaluation interaction separate from training. | [ ] |
| US-021 | Compare popularity baseline, GMF, MLP, NeuMF as a data scientist. | [ ] |
| US-022 | Save model weights and mappings as an ML engineer. | [ ] |
| US-023 | Version model metadata as an ML engineer. | [ ] |
| US-024 | Request recommendations from FastAPI as a frontend application. | [x] |
| US-025 | Search movies through an API as a frontend application. | [x] |
| US-026 | Retrieve model metrics for dashboard as a frontend application. | [x] |
| US-027 | Validate API requests as a developer. | [x] |
| US-028 | Have a health endpoint as a developer. | [x] |
| US-029 | Automated tests to prevent silent breaks as a developer. | [ ] |
| US-030 | Clear documentation of dataset, methodology, evaluation, model, and limitations as an evaluator. | [ ] |

---

> **How to use**: Open this file in your editor, tick the boxes (`[x]`) when a task is finished, and commit the changes to keep the project roadmap up‑to‑date.


---

## 🏗️ Non‑Functional Requirements

| Category | Requirement | Status |
|----------|-------------|--------|
| Performance | Model loads at startup; recommendation latency acceptable | [ ] |
| Performance | No retraining during inference | [ ] |
| Reliability | Graceful handling of invalid user/movie IDs | [ ] |
| Reliability | Structured API error responses | [ ] |
| Reliability | Health checks fail when artifacts missing | [ ] |
| Security | Input validation for all endpoints | [ ] |
| Security | CORS limited to frontend origins | [ ] |
| Security | Secrets stored in environment variables; no secrets committed | [ ] |
| Scalability | Optional Redis caching layer | [ ] |
| Scalability | Optional PostgreSQL for metadata storage | [ ] |
| Maintainability | Separate code for data processing, training, serving, API, UI | [ ] |

---

## 🧱 Technical Requirements & Architecture

| ID | Task | Status |
|----|------|--------|
| TA-001 | Create project repository structure (`backend/`, `frontend/`, `data/`, `docs/`) | [ ] |
| TA-002 | Write Dockerfile for FastAPI service | [ ] |
| TA-003 | Write Dockerfile for React UI | [ ] |
| TA-004 | Set up Docker‑Compose for local development (API, UI, optional DB) | [ ] |
| TA-005 | Add GitHub Actions CI pipeline (lint, test, build images) | [ ] |
| TA-006 | Implement versioned model artifact storage (`models/` with metadata JSON) | [ ] |
| TA-007 | Produce architecture diagram (data flow, components) | [ ] |
| TA-008 | Document deployment steps (Docker, optional Kubernetes) | [ ] |

---

## 📚 Documentation & Deliverables

| ID | Deliverable | Status |
|----|------------|--------|
| DOC-001 | README with project overview, setup, and run instructions | [ ] |
| DOC-002 | Model card (usage, data, metrics, limitations) | [ ] |
| DOC-003 | API specification (OpenAPI/Swagger) | [ ] |
| DOC-004 | Frontend UI guide (screens, interactions) | [ ] |
| DOC-005 | Evaluation report (HR@10, NDCG@10 for each model) | [ ] |
| DOC-006 | Experiment tracking log (hyperparameters, runs) | [ ] |

---

> Keep ticking items as you complete them. Feel free to add additional subtasks or break down large items.
