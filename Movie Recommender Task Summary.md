# Movie Recommender – Completed vs Pending Tasks

## ✅ Completed Tasks

*None yet – you haven’t marked any items as done.*

---

## ⏳ Pending Tasks

### 🎯 Product Objectives
- Build a personalized movie recommendation system using Neural Collaborative Filtering
- Train the model using MovieLens 25M interactions
- Implement a popularity‑based baseline
- Implement GMF
- Implement MLP
- Implement NeuMF as the primary recommendation model
- Use Leave‑One‑Out evaluation
- Measure Hit Rate@10
- Measure NDCG@10
- Compare implemented models using the same evaluation protocol
- Serve recommendations via FastAPI
- Provide a React frontend
- Display recommendation and model performance information
- Save and version model artifacts
- Provide reproducible training and evaluation instructions
- Test the core ML pipeline and API

### 📦 Functional Requirements (FR‑001 – FR‑025)
- Dataset ingestion
- Data validation
- Exploratory Data Analysis (EDA)
- Interaction preprocessing
- Implicit feedback generation
- Negative sampling
- Leave‑One‑Out split
- Popularity baseline
- GMF model
- MLP model
- NeuMF model (trained & versioned)
- Evaluation (HR@10 & NDCG@10)
- Model comparison
- Recommendation API (Top‑N)
- Movie search API
- Prediction API (preference or rating)
- Metrics API (dataset & model metrics)
- Health API (service & artifact readiness)
- React UI (end‑to‑end recommendations)
- Model metadata (version & metrics)
- Automated tests (core pipeline & API)
- Model card (usage, data, metrics, limitations)
- Experiment tracking (training config & metrics)
- Hybrid re‑ranking (optional)
- Cold‑start fallback (optional)

### 🧑‍💻 User Stories (US‑001 – US‑030)
- Select a user profile to receive personalized recommendations
- Receive personalized Top‑N recommendations
- Choose how many recommendations to view
- Exclude already‑interacted movies from recommendations
- See movie titles and genres in recommendation cards
- Search for movies by title
- View a preference or rating prediction for a selected movie
- Switch profiles to explore recommendations for different users
- See loading states while recommendations are generated
- Receive meaningful error messages on failures
- View Hit Rate@10 as a product‑manager
- View NDCG@10 as a product‑manager
- Compare multiple recommendation models as a product analyst
- View dataset statistics as a product analyst
- Preprocess MovieLens interactions reproducibly as a data scientist
- Use negative sampling as a data scientist
- Use Leave‑One‑Out evaluation as a data scientist
- Calculate HR@10 as a data scientist
- Calculate NDCG@10 as a data scientist
- Keep evaluation interaction separate from training
- Compare popularity baseline, GMF, MLP, NeuMF as a data scientist
- Save model weights and mappings as an ML engineer
- Version model metadata as an ML engineer
- Request recommendations from FastAPI as a frontend application
- Search movies through an API as a frontend application
- Retrieve model metrics for dashboard as a frontend application
- Validate API requests as a developer
- Have a health endpoint as a developer
- Automated tests to prevent silent breaks as a developer
- Clear documentation of dataset, methodology, evaluation, model, and limitations as an evaluator

### 🏗️ Non‑Functional Requirements
- Model loads at startup; recommendation latency acceptable
- No retraining during inference
- Graceful handling of invalid user/movie IDs
- Structured API error responses
- Health checks fail when artifacts missing
- Input validation for all endpoints
- CORS limited to frontend origins
- Secrets stored in environment variables; no secrets committed
- Optional Redis caching layer
- Optional PostgreSQL for metadata storage
- Separate code for data processing, training, serving, API, UI

### 🧱 Technical Requirements & Architecture
- Create project repository structure (`backend/`, `frontend/`, `data/`, `docs/`)
- Write Dockerfile for FastAPI service
- Write Dockerfile for React UI
- Set up Docker‑Compose for local development (API, UI, optional DB)
- Add GitHub Actions CI pipeline (lint, test, build images)
- Implement versioned model artifact storage (`models/` with metadata JSON)
- Produce architecture diagram (data flow, components)
- Document deployment steps (Docker, optional Kubernetes)

### 📚 Documentation & Deliverables
- README with project overview, setup, and run instructions
- Model card (usage, data, metrics, limitations)
- API specification (OpenAPI/Swagger)
- Frontend UI guide (screens, interactions)
- Evaluation report (HR@10, NDCG@10 for each model)
- Experiment tracking log (hyperparameters, runs)

> Keep this file updated as you tick items off the main task list.

