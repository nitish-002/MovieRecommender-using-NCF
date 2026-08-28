# Movie Recommender via Neural Collaborative Filtering

## Product Requirements Document

**Track:** Advanced Data Science\
**Domain:** Media / Entertainment\
**Duration:** 12 Weeks\
**Product Type:** Full-Stack Machine Learning Application\
**Primary Model:** Neural Collaborative Filtering / NeuMF\
**Dataset:** MovieLens 25M\
**Backend:** Python + FastAPI\
**Frontend:** React\
**ML Framework:** PyTorch

---

# 1. Project Overview

## Goal

Build a Neural Collaborative Filtering-based movie recommendation system that generates personalized Top-N movie recommendations for streaming-platform users.

The system will learn from historical user-movie interactions in the MovieLens 25M dataset and expose the trained recommendation model through a FastAPI backend with a React frontend.

The application will provide:

- Personalized movie recommendations.
- Movie search and discovery.
- Preference or rating prediction demonstration.
- Model performance visualization.
- Model comparison.
- Hit Rate\@10 and NDCG\@10 evaluation.
- Basic user-session handling.
- Reproducible model training and deployment.

The primary recommendation model will be **NeuMF**, combining Generalized Matrix Factorization and a Multi-Layer Perceptron.

---

## Inputs and Deliverables

### Inputs

- MovieLens 25M dataset.
- Neural Collaborative Filtering research paper.
- User-movie interaction data.
- Movie metadata including titles and genres.

### Research Grounding

The system is grounded in:

**Neural Collaborative Filtering — WWW, 2017**

The implementation should follow the fundamental concepts of Neural Collaborative Filtering while clearly documenting any engineering decisions that are not directly specified by the research paper.

---

## Required Deliverables

- Trained NCF / NeuMF model.
- Popularity baseline.
- GMF model.
- MLP model.
- NeuMF model.
- Top-N recommendation engine.
- Rating or preference prediction demonstration.
- Leave-One-Out evaluation pipeline.
- Hit Rate\@10.
- NDCG\@10.
- FastAPI backend.
- React frontend.
- Model performance dashboard.
- Unit and integration tests.
- Model artifact and metadata.
- Model card.
- Architecture documentation.
- README with reproduction instructions.
- Deployment configuration.

---

## Technology Stack

### Backend

- Python
- FastAPI
- Pydantic
- Uvicorn

### Machine Learning

- PyTorch
- Pandas
- NumPy
- Matplotlib
- Scikit-learn utilities where appropriate

### Frontend

- React
- JavaScript
- Vite
- Tailwind CSS
- Axios
- Recharts or Chart.js

### Engineering

- Docker
- Docker Compose
- Pytest
- GitHub Actions
- GitHub

---

# 2. Core Lifecycle

```text
Dataset
   ↓
Data Validation
   ↓
Exploratory Data Analysis
   ↓
Interaction Processing
   ↓
Implicit Feedback Generation
   ↓
Leave-One-Out Split
   ↓
Negative Sampling
   ↓
Baseline Model
   ↓
GMF / MLP / NeuMF Training
   ↓
Validation and Tuning
   ↓
Final Evaluation
   ↓
Model Artifact Creation
   ↓
FastAPI Model Serving
   ↓
React Frontend
   ↓
Testing and Deployment
```

---

# 3. MVP

The Minimum Viable Product must include:

- Dataset ingestion.
- Dataset validation.
- Exploratory data analysis.
- User and movie encoding.
- Implicit feedback generation.
- Negative sampling.
- Leave-One-Out evaluation.
- Popularity baseline.
- NeuMF model.
- Hit Rate\@10.
- NDCG\@10.
- Saved model artifacts.
- FastAPI recommendation API.
- React recommendation interface.
- Model metrics dashboard.
- Automated tests.
- Documentation.
- Deployment configuration.

GMF, MLP comparison, hybrid re-ranking, cold-start strategies, advanced metadata, and authentication are valuable additions but must not block the MVP.

---

# 4. Important Assumptions

The following details must be taken from the actual MovieLens dataset and preprocessing pipeline:

- Final number of users.
- Final number of movies.
- Final number of interactions.
- Number of eligible users after filtering.
- Rating threshold for positive interaction.
- Number of negative samples.
- Candidate set size during evaluation.
- Final train/test interaction counts.
- Model hyperparameters.
- Final HR\@10.
- Final NDCG\@10.

These values must not be fabricated in documentation.

---

# 5. Product Boundary

This project is an educational and prototype recommendation system.

It is not:

- A complete commercial streaming platform.
- A video streaming service.
- A payment or subscription platform.
- A real-time recommendation infrastructure.
- A large-scale distributed model serving system.
- A guarantee that users will enjoy recommended movies.

The core responsibility of the system is to demonstrate a technically correct, reproducible, end-to-end Neural Collaborative Filtering recommendation pipeline.

---

# 6. Business Problem

Streaming platforms contain large catalogs of movies, making content discovery difficult.

Users may struggle to identify movies that match their interests, while product teams need a measurable way to evaluate whether recommendation algorithms are producing relevant results.

A simple popularity-based system recommends the same highly popular content to many users and does not adequately model individual preferences.

The product addresses this problem by learning patterns from historical user-movie interactions and generating personalized recommendations.

---

# 7. Target Personas

| Persona         | Goal                                | Pain Point                                     |
| --------------- | ----------------------------------- | ---------------------------------------------- |
| Streaming User  | Discover relevant movies            | Large catalog and poor discoverability         |
| Product Manager | Evaluate recommendation quality     | Needs measurable product performance           |
| Growth Analyst  | Understand engagement opportunities | Needs evidence of recommendation effectiveness |
| Data Scientist  | Train and evaluate models           | Requires reproducible experiments              |
| ML Engineer     | Serve the trained model             | Needs stable artifacts and APIs                |
| Developer       | Integrate frontend and backend      | Needs documented, validated endpoints          |

---

# 8. Product Objectives

1. Build a personalized movie recommendation system using Neural Collaborative Filtering.
2. Train the model using MovieLens 25M interactions.
3. Implement a popularity-based baseline.
4. Implement GMF.
5. Implement MLP.
6. Implement NeuMF as the primary recommendation model.
7. Use Leave-One-Out evaluation.
8. Measure Hit Rate\@10.
9. Measure NDCG\@10.
10. Compare implemented models using the same evaluation protocol.
11. Serve recommendations using FastAPI.
12. Provide a React frontend.
13. Display recommendation and model performance information.
14. Save and version model artifacts.
15. Provide reproducible training and evaluation instructions.
16. Test the core ML pipeline and API.

---

# 9. Product Requirements

## Features

### Personalized Recommendations

The user can select a profile and receive personalized movie recommendations.

The recommendation engine must:

- Generate scores for candidate movies.
- Exclude previously interacted movies.
- Rank candidates by relevance.
- Return the Top-N results.
- Support configurable recommendation counts.

Recommended values:

- Top 5
- Top 10
- Top 20

---

### User Profile Selection

For the MVP, the system will use MovieLens user IDs as demonstration profiles.

The application must allow:

- User ID selection.
- User switching.
- Session persistence during navigation.

Full production authentication is not required for the MVP.

---

### Movie Discovery

The user can search for movies by:

- Full title.
- Partial title.

Search results should display:

- Movie title.
- Movie ID.
- Genres.

---

### Personalized Recommendation Results

Each recommendation should display:

- Rank.
- Movie title.
- Genres.
- Recommendation or preference score.

The interface should clearly indicate that the score represents model-estimated relevance and is not a guarantee of user satisfaction.

---

### Rating or Preference Prediction

The system will provide a demonstration where a user selects a movie and receives a prediction.

The product must distinguish between:

1. **Implicit preference score**
2. **Explicit 1–5 rating prediction**

A NeuMF model trained on binary implicit interactions produces a preference or relevance score.

It must not be falsely displayed as a precise star rating.

If 1–5 rating prediction is required, an explicit rating prediction model must be implemented or the prediction must be clearly labeled as a preference estimate.

---

### Model Performance Dashboard

The dashboard must display:

- Total users.
- Total movies.
- Total interactions.
- Number of positive interactions.
- Number of training interactions.
- Number of evaluation users.
- Negative sampling configuration.
- Hit Rate\@10.
- NDCG\@10.
- Model version.

If multiple models are implemented, the dashboard should compare:

- Popularity Baseline.
- GMF.
- MLP.
- NeuMF.

---

### Hybrid Re-Ranking

As an advanced feature, recommendations may combine collaborative filtering with content-based similarity.

Initial content features may include:

- Genres.

The hybrid score may be:

```text
Final Score =
α × NCF Score
+
(1 - α) × Content Similarity
```

This feature is optional for the MVP.

---

### Cold Start

Users with insufficient interaction history cannot be reliably modeled by collaborative filtering.

The fallback strategy may include:

- Popular movies.
- Highly interacted movies.
- Genre-based recommendations.

Cold-start behavior must be documented.

---

### Model Versioning

Every deployed model should be associated with:

- Model version.
- Training date.
- Dataset version.
- Preprocessing configuration.
- Hyperparameters.
- Evaluation metrics.

Prediction responses should be traceable to the model artifact that generated them.

---

# 10. User Stories

**US-001:** As a streaming-platform user, I want to select a user profile so that I can receive personalized movie recommendations.

**US-002:** As a user, I want to receive personalized Top-N recommendations so that I can discover movies I may enjo

**US-003:** As a user, I want to choose how many recommendations to view so that I can control the amount of content displayed.

**US-004:** As a user, I want recommendations to exclude movies I have already interacted with so that I discover new movies.

**US-005:** As a user, I want to see movie titles and genres so that I can understand the recommended content.

**US-006:** As a user, I want to search for movies so that I can quickly find a specific title.

**US-007:** As a user, I want to view a preference or rating prediction for a selected movie so that I can estimate whether the movie matches my interests.

**US-008:** As a user, I want to switch profiles so that I can explore recommendations for different users.

**US-009:** As a user, I want to see loading states while recommendations are generated so that I understand the application is processing my request.

**US-010:** As a user, I want meaningful error messages so that I know what to do when a request fails.

**US-011:** As a product manager, I want to view Hit Rate\@10 so that I can assess whether relevant movies appear in the recommendation list.

**US-012:** As a product manager, I want to view NDCG\@10 so that I can assess ranking quality.

**US-013:** As a product analyst, I want to compare multiple recommendation models so that I can determine whether NeuMF improves performance.

**US-014:** As a product analyst, I want to view dataset statistics so that I understand the scale of the recommendation system.

**US-015:** As a data scientist, I want to preprocess MovieLens interactions consistently so that model experiments are reproducible.

**US-016:** As a data scientist, I want to use negative sampling so that the model can learn positive and negative interactions.

**US-017:** As a data scientist, I want to use Leave-One-Out evaluation so that the held-out interaction is evaluated consistently.

**US-018:** As a data scientist, I want to calculate HR\@10 so that I can measure Top-10 recommendation success.

**US-019:** As a data scientist, I want to calculate NDCG\@10 so that I can measure ranking position quality.

**US-020:** As a data scientist, I want the evaluation interaction to remain separate from training so that results are not affected by data leakage.

**US-021:** As a data scientist, I want to compare the popularity baseline, GMF, MLP, and NeuMF so that model improvements can be measured.

**US-022:** As an ML engineer, I want to save model weights and mappings so that inference can occur without retraining.

**US-023:** As an ML engineer, I want model metadata to be versioned so that predictions can be traced to a specific model.

**US-024:** As a frontend application, I want to request recommendations from FastAPI so that I can display them to users.

**US-025:** As a frontend application, I want to search movies through an API so that users can select movies.

**US-026:** As a frontend application, I want to retrieve model metrics so that the dashboard can display system performance.

**US-027:** As a developer, I want validated API requests so that invalid inputs do not reach the model.

**US-028:** As a developer, I want a health endpoint so that I can verify the service and model artifacts are available.

**US-029:** As a developer, I want automated tests so that changes do not silently break the ML pipeline or APIs.

**US-030:** As an evaluator, I want clear documentation of the dataset, methodology, evaluation, model, and limitations so that I can assess the project.

---

# 11. Product Principles

## Personalize First

The primary purpose of the system is personalized recommendation rather than globally popular ranking.

Popularity-based recommendations are a baseline and fallback mechanism.

---

## Recommend, Do Not Guarantee

A recommendation represents a model-estimated relevance signal.

The system must not claim that a user will definitely enjoy a recommended movie.

---

## Ranking Quality Matters

The model should not only identify relevant movies.

It should place relevant movies near the top of the recommendation list.

Therefore:

- Hit Rate\@10 measures whether the item is found.
- NDCG\@10 measures where it is ranked.

---

## Keep Evaluation Leakage-Free

The held-out test interaction must never be used for training.

Preprocessing decisions affecting interaction history must respect the evaluation protocol.

---

## Separate Training from Serving

Training and experimentation are separate from the production-like inference service.

```text
Training Pipeline
       ↓
Versioned Model Artifact
       ↓
FastAPI Inference Service
       ↓
React Application
```

The FastAPI service must not retrain models during user requests.

---

## Load Once, Predict Many Times

The model and required artifacts should be loaded during application startup.

Inference requests should reuse the loaded model.

---

## Version Every Model

Model artifacts must include sufficient metadata to reproduce or identify:

- Model architecture.
- Dataset version.
- Hyperparameters.
- Preprocessing configuration.
- Training date.
- Evaluation metrics.

---

## Measure Before Claiming Improvement

NeuMF must not be claimed to outperform other approaches unless evaluation demonstrates improvement under the same protocol.

---

## Keep the Architecture Simple

The MVP architecture should remain:

```text
React
   ↓
FastAPI
   ↓
PyTorch Model
   ↓
Model Artifacts
```

A database, microservices, vector databases, or distributed infrastructure should not be added unless there is a clear requirement.

---

# 12. UX Requirements

## Information Architecture

```text
Home / Overview
        ↓
User Profile Selection
        ↓
Recommendations
        ↓
Movie Search / Prediction
        ↓
Model Performance
        ↓
Model Information
        ↓
Limitations
```

---

## Recommendation Screen

The recommendation screen must include:

- User profile selector.
- Top-N selector.
- Recommendation request button.
- Loading state.
- Error state.
- Ranked recommendation cards.

Each movie card should display:

- Rank.
- Title.
- Genres.
- Preference score.

---

## Prediction Screen

The prediction screen must include:

- User selector.
- Movie search.
- Movie selection.
- Prediction request.
- Prediction result.
- Clear explanation of prediction meaning.

---

## Model Performance Screen

Display:

- HR\@10.
- NDCG\@10.
- Model comparison.
- Dataset statistics.
- Evaluation configuration.
- Model version.

Charts should be readable and should not rely solely on color to communicate meaning.

---

## Accessibility

The application should support:

- Keyboard navigation.
- Semantic HTML.
- Accessible form labels.
- Readable validation messages.
- Responsive layouts.
- Sufficient contrast.
- Error indicators that do not rely only on color.

---

## Required UI States

Every major screen should handle:

- Initial state.
- Loading state.
- Success state.
- Empty state.
- Validation error.
- API error.
- Backend unavailable state.

---

# 13. Functional Requirements

| ID     | Requirement               | Priority | Acceptance Criteria                               |
| ------ | ------------------------- | -------- | ------------------------------------------------- |
| FR-001 | Dataset ingestion         | Must     | Dataset source and schema documented              |
| FR-002 | Data validation           | Must     | Missing values, duplicates and data types checked |
| FR-003 | EDA                       | Must     | Key findings and visualizations documented        |
| FR-004 | Interaction preprocessing | Must     | User and movie mappings reproducibly generated    |
| FR-005 | Implicit feedback         | Must     | Positive interaction rule documented              |
| FR-006 | Negative sampling         | Must     | Configurable negative sampling implemented        |
| FR-007 | Leave-One-Out split       | Must     | Latest eligible interaction held out              |
| FR-008 | Popularity baseline       | Must     | Baseline metrics recorded                         |
| FR-009 | GMF                       | Should   | Model can train and evaluate                      |
| FR-010 | MLP                       | Should   | Model can train and evaluate                      |
| FR-011 | NeuMF                     | Must     | Versioned trained artifact produced               |
| FR-012 | Evaluation                | Must     | HR\@10 and NDCG\@10 calculated                    |
| FR-013 | Model comparison          | Should   | Comparable metrics recorded                       |
| FR-014 | Recommendation API        | Must     | Top-N recommendations returned                    |
| FR-015 | Movie search API          | Must     | Matching movies returned                          |
| FR-016 | Prediction API            | Should   | Preference or rating prediction returned          |
| FR-017 | Metrics API               | Must     | Dataset and model metrics available               |
| FR-018 | Health API                | Must     | Service and artifact readiness verified           |
| FR-019 | React UI                  | Must     | End-to-end recommendations work                   |
| FR-020 | Model metadata            | Must     | Version and metrics available                     |
| FR-021 | Automated tests           | Must     | Core pipeline and API covered                     |
| FR-022 | Model card                | Must     | Use, data, metrics and limitations documented     |
| FR-023 | Experiment tracking       | Should   | Training configuration and metrics recorded       |
| FR-024 | Hybrid re-ranking         | Could    | Genre-based re-ranking implemented                |
| FR-025 | Cold-start fallback       | Should   | New or sparse users receive fallback results      |

---

# 14. Non-Functional Requirements

## Performance

- The model must load during application startup.
- Recommendation requests should complete within an acceptable interactive response time.
- The application must not retrain during inference.
- Recommendation generation should avoid unnecessary full retraining or preprocessing.

---

## Reliability

- Invalid user IDs must be handled safely.
- Invalid movie IDs must be handled safely.
- API errors must return structured responses.
- Missing model artifacts must cause health checks to fail.
- Frontend failures must not crash the application.

---

## Security

The MVP should:

- Validate all API input.
- Restrict CORS to configured frontend origins.
- Store secrets in environment variables.
- Avoid committing secrets.
- Avoid exposing internal file paths or stack traces to users.

Because MovieLens uses anonymized IDs, no real user authentication data is required for the MVP.

---

## Scalability

The initial system is intended for educational and prototype use.

Future scaling may include:

- Redis caching.
- PostgreSQL.
- Model registry.
- Object storage.
- Background recommendation jobs.
- Autoscaling.
- API gateway.

These are not MVP requirements.

---

## Maintainability

The system should separate:

- Data processing.
- Model training.
- Evaluation.
- Model serving.
- API routes.
- Frontend components.

---

# 15. Technical Requirements

## Architecture

```text
                         ┌───────────────────┐
                         │  MovieLens 25M    │
                         └─────────┬─────────┘
                                   │
                                   ▼
                         ┌───────────────────┐
                         │ Data Processing   │
                         │ Validation + EDA  │
                         └─────────┬─────────┘
                                   │
                                   ▼
                         ┌───────────────────┐
                         │ Training Pipeline │
                         │ GMF / MLP / NeuMF │
                         └─────────┬─────────┘
                                   │
                                   ▼
                         ┌───────────────────┐
                         │ Evaluation        │
                         │ HR@10 / NDCG@10   │
                         └─────────┬─────────┘
                                   │
                                   ▼
                         ┌───────────────────┐
                         │ Model Artifacts   │
                         │ Weights + Mappings│
                         └─────────┬─────────┘
                                   │
                                   ▼
┌──────────────────┐      ┌───────────────────┐
│ React Frontend   │─────▶│ FastAPI Backend   │
│                  │ REST │                   │
│ Recommendations  │◀─────│ Recommendation    │
│ Prediction       │      │ Search / Metrics  │
│ Dashboard        │      └───────────────────┘
└──────────────────┘
```

---

# 16. Technical Requirement IDs

| ID     | Technical Requirement           |
| ------ | ------------------------------- |
| TR-001 | Reproducible dataset ingestion  |
| TR-002 | Dataset/schema validation       |
| TR-003 | Reproducible preprocessing      |
| TR-004 | EDA artifacts                   |
| TR-005 | Popularity baseline             |
| TR-006 | GMF implementation              |
| TR-007 | MLP implementation              |
| TR-008 | NeuMF implementation            |
| TR-009 | Negative sampling               |
| TR-010 | Leave-One-Out evaluation        |
| TR-011 | HR\@10 calculation              |
| TR-012 | NDCG\@10 calculation            |
| TR-013 | Hyperparameter configuration    |
| TR-014 | Model artifact/versioning       |
| TR-015 | FastAPI recommendation endpoint |
| TR-016 | FastAPI search endpoint         |
| TR-017 | FastAPI metrics endpoint        |
| TR-018 | Health endpoint                 |
| TR-019 | React recommendation UI         |
| TR-020 | React analytics dashboard       |
| TR-021 | Automated backend tests         |
| TR-022 | ML pipeline tests               |
| TR-023 | API integration tests           |
| TR-024 | Model card                      |
| TR-025 | Deployment configuration        |

---

# 17. Data and Evaluation Protocol

## Dataset

Primary files:

- ratings.csv
- movies.csv

Optional:

- tags.csv
- links.csv

---

## Interaction Processing

A positive interaction rule must be explicitly defined.

Example:

```text
Rating >= threshold
        ↓
Positive Interaction = 1
```

The final threshold must be documented and justified.

---

## Leave-One-Out Evaluation

For each eligible user:

1. Sort positive interactions by timestamp.
2. Hold out the latest positive interaction.
3. Use earlier interactions for training.
4. Sample negative movies not interacted with by the user.
5. Score all candidate movies.
6. Rank candidates.
7. Calculate HR\@10.
8. Calculate NDCG\@10.

---

## Negative Sampling

Training data should contain:

```text
Positive Interaction
        +
Sampled Negative Interactions
```

The negative-to-positive ratio must be configurable.

Example:

```text
1 Positive : 4 Negatives
```

The actual final ratio should be documented.

---

# 18. API Requirements

## GET /health

Purpose:

Verify that:

- FastAPI is running.
- Required model artifacts are loaded.
- The service is ready for inference.

Example response:

```json
{
  "status": "healthy",
  "model_loaded": true,
  "model_version": "v1"
}
```

---

## GET /recommend/{user\_id}

Parameters:

- user\_id
- top\_n

Example:

```text
GET /recommend/42?top_n=10
```

Response:

```json
{
  "user_id": 42,
  "model_version": "v1",
  "recommendations": [
    {
      "rank": 1,
      "movie_id": 123,
      "title": "Example Movie",
      "genres": ["Action", "Sci-Fi"],
      "score": 0.94
    }
  ]
}
```

---

## GET /movies/search

Example:

```text
GET /movies/search?query=inception
```

Returns:

- Movie ID.
- Title.
- Genres.

---

## POST /predict

Request:

```json
{
  "user_id": 42,
  "movie_id": 123
}
```

Response:

```json
{
  "user_id": 42,
  "movie_id": 123,
  "prediction_type": "preference_score",
  "score": 0.87,
  "model_version": "v1"
}
```

If an explicit rating model is implemented, the API may additionally return:

```json
{
  "prediction_type": "rating",
  "predicted_rating": 4.2
}
```

---

## GET /metrics

Returns:

- Dataset statistics.
- Evaluation configuration.
- HR\@10.
- NDCG\@10.
- Model comparison.
- Model version.

---

# 19. Model Artifact Requirements

A deployment artifact package should contain:

```text
artifacts/
├── neumf_model.pth
├── user_mapping.json
├── movie_mapping.json
├── metadata.json
├── config.json
└── metrics.json
```

Metadata should include:

- Model version.
- Architecture.
- Embedding dimension.
- Hidden layer sizes.
- Dataset version.
- Interaction threshold.
- Negative sampling ratio.
- Evaluation protocol.
- HR\@10.
- NDCG\@10.
- Training timestamp.

---

# 20. Testing Strategy

## Unit Tests

Test:

- Dataset validation.
- User encoding.
- Movie encoding.
- Interaction preprocessing.
- Negative sampling.
- Leave-One-Out splitting.
- HR\@10.
- NDCG\@10.
- Model forward pass.
- Recommendation filtering.

---

## API Tests

Test:

- Valid recommendation request.
- Invalid user.
- Invalid Top-N value.
- Movie search.
- Prediction endpoint.
- Metrics endpoint.
- Health endpoint.
- Missing model artifact behavior.

---

## Integration Tests

Test the complete flow:

```text
React
   ↓
FastAPI
   ↓
Model Artifact
   ↓
Recommendation Response
   ↓
Frontend Display
```

---

# 21. Security Requirements

- Validate request parameters.
- Use Pydantic schemas.
- Configure CORS explicitly.
- Store secrets in environment variables.
- Do not commit credentials.
- Do not expose internal exception traces in production mode.
- Apply request size limits where practical.

The MVP does not require complex authentication.

If authentication is later added:

- Passwords must never be stored in plaintext.
- Session or token security must be documented.
- Authentication logic must remain separate from recommendation logic.

---

# 22. CI/CD Requirements

Recommended pipeline:

```text
Code Push
    ↓
Linting
    ↓
Unit Tests
    ↓
API Tests
    ↓
Frontend Tests
    ↓
ML Artifact Validation
    ↓
Build
    ↓
Deployment
```

ML quality gates should verify:

- Required artifacts exist.
- Metadata exists.
- Metrics exist.
- Model loads successfully.
- Evaluation protocol is documented.

Recommended branching:

```text
main
feature/*
```

Release versions should tag:

- Application version.
- Model version.

---

# 23. Observability

## Logs

Record:

- Request ID.
- Endpoint.
- HTTP status.
- Request latency.
- Model version.
- Error code.

Avoid logging unnecessary raw user interaction histories.

---

## Application Metrics

Track:

- Request rate.
- Error rate.
- p50 latency.
- p95 latency.
- Model load failures.
- Recommendation requests.
- Prediction requests.
- Model version usage.

---

## Future ML Monitoring

A future production-like system may monitor:

- Interaction distribution drift.
- User activity drift.
- Movie popularity changes.
- Prediction score distribution.
- Recommendation diversity.
- Recommendation popularity concentration.
- Offline metric changes.
- Outcome-based performance when feedback becomes available.

---

# 24. Deployment Architecture

```text
User
  ↓
React Static Application
  ↓ HTTPS / REST
FastAPI
  ↓
PyTorch Model + Metadata + Mappings
```

For the MVP:

- React may be deployed as a static application.
- FastAPI may run in a Docker container.
- Model artifacts may be stored locally or mounted into the backend container.

---

## Rollback

Previous versions of:

- Application.
- Model artifact.
- Metadata.

Should be retained so the previous stable version can be restored.

---

# 25. Cost Analysis

## MVP Cost Drivers

Potential costs include:

- Training compute.
- Optional GPU usage.
- FastAPI hosting.
- React static hosting.
- Model artifact storage.
- CI/CD usage.
- Optional monitoring.

---

## GPU

GPU is useful for training experiments but is not automatically required for inference.

The project should:

1. Measure CPU training performance.
2. Measure dataset and model size.
3. Use GPU acceleration if training time becomes a practical constraint.

Inference should generally remain CPU-compatible for the MVP unless profiling proves otherwise.

---

## Optimization Principles

- Load the model once.
- Keep inference stateless.
- Avoid unnecessary database infrastructure.
- Avoid microservices for the MVP.
- Cache only when measurement justifies it.
- Scale infrastructure only when needed.

---

# 26. Risks

| Risk                            | Impact                           | Mitigation                                     |
| ------------------------------- | -------------------------------- | ---------------------------------------------- |
| Data leakage                    | Invalid evaluation               | Strict Leave-One-Out separation                |
| Incorrect negative sampling     | Poor training/evaluation         | Document and test sampling                     |
| Overfitting                     | Weak generalization              | Regularization and validation                  |
| Popularity bias                 | Low recommendation diversity     | Compare personalization and diversity          |
| Sparse users                    | Poor recommendations             | Cold-start fallback                            |
| Dataset mismatch                | Limited real-world applicability | Clearly document MovieLens limitations         |
| Incorrect rating interpretation | Misleading UI                    | Separate preference and rating prediction      |
| Large dataset training cost     | Slow development                 | Prototype on subset, then scale                |
| Model artifact mismatch         | Serving failures                 | Version artifacts together                     |
| API latency                     | Poor UX                          | Load model once and optimize candidate scoring |
| Scope creep                     | Incomplete core system           | Prioritize NCF and evaluation first            |

---

# 27. Roadmap

## 12-Week Roadmap

| Phase              | Week | Deliverable                                |
| ------------------ | ---: | ------------------------------------------ |
| Research           |    1 | NCF paper and MovieLens study              |
| Requirements       |    2 | BRD, PRD, UX and architecture              |
| Data               |    3 | Dataset ingestion, validation and EDA      |
| Processing         |    4 | Interaction pipeline and evaluation split  |
| Baseline           |    5 | Popularity model and metrics               |
| Modeling           |    6 | GMF and MLP                                |
| NeuMF              |    7 | NeuMF training and tuning                  |
| Evaluation         |    8 | HR\@10, NDCG\@10 and comparison            |
| Backend            |    9 | FastAPI model serving                      |
| Frontend           |   10 | React application and dashboard            |
| Testing/Deployment |   11 | Tests, Docker and deployment               |
| Finalization       |   12 | Model card, documentation and presentation |

---

## Definition of Done

The project is complete when it is:

- Implemented.
- Tested.
- Evaluated.
- Documented.
- Integrated.
- Reproducible.
- Demonstrable end-to-end.

---

# 28. Team Responsibilities

## Data Science / Modeling

Responsibilities:

- Dataset validation.
- EDA.
- Interaction preprocessing.
- Negative sampling.
- Baseline implementation.
- GMF.
- MLP.
- NeuMF.
- Hyperparameter tuning.
- Evaluation.
- Error analysis.
- Model card.

---

## ML Engineering / Full Stack

Responsibilities:

- Model artifact loading.
- FastAPI.
- API design.
- React.
- Axios integration.
- Tailwind CSS.
- API tests.
- Integration testing.
- Docker.
- Deployment.

---

## Shared Responsibilities

- High-level architecture.
- Low-level design.
- Documentation.
- Security.
- CI/CD.
- Model traceability.
- Architecture decisions.
- Final presentation.

Every team member should understand the complete system lifecycle.

---

# 29. GitHub Repository Structure

```text
movie-recommender/
│
├── docs/
│   ├── project-overview.md
│   ├── brd.md
│   ├── prd.md
│   ├── ux-requirements.md
│   ├── trd.md
│   ├── architecture.md
│   ├── model-card.md
│   └── adrs/
│
├── training/
│   ├── notebooks/
│   ├── src/
│   │   ├── data/
│   │   ├── models/
│   │   ├── training/
│   │   └── evaluation/
│   ├── configs/
│   └── artifacts/
│
├── backend/
│   ├── app/
│   │   ├── api/
│   │   ├── services/
│   │   ├── schemas/
│   │   ├── models/
│   │   └── main.py
│   └── tests/
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   └── App.jsx
│   └── tests/
│
├── data/
├── models/
├── tests/
├── scripts/
├── .github/
│   └── workflows/
│
├── docker-compose.yml
├── README.md
├── CONTRIBUTING.md
├── LICENSE
└── .gitignore
```

Large datasets and generated artifacts should not be committed unnecessarily.

Secrets must never be committed.

---

# 30. README Requirements

The README must include:

## Problem

Build a Neural Collaborative Filtering-based movie recommendation system that generates personalized Top-N recommendations.

## Solution

PyTorch training pipeline + FastAPI recommendation service + React frontend.

## Features

- Dataset validation.
- EDA.
- Popularity baseline.
- GMF.
- MLP.
- NeuMF.
- Negative sampling.
- Leave-One-Out evaluation.
- HR\@10.
- NDCG\@10.
- Recommendation API.
- Movie search.
- Analytics dashboard.
- Model card.

## Research

Explain how the implementation relates to the Neural Collaborative Filtering research paper.

Do not claim that every implementation detail comes directly from the paper.

## Dataset

Document:

- Exact dataset source.
- Dataset version.
- Files used.
- Preprocessing decisions.
- Interaction threshold.

## Local Setup

Document:

- Python version.
- Node.js version.
- Backend dependencies.
- Frontend dependencies.
- Dataset location.
- Model artifact location.
- Environment variables.
- Training command.
- Backend start command.
- Frontend start command.

## Testing

Document how to run:

- ML tests.
- Backend tests.
- Frontend tests.

---

# 31. Model Card

# Model Card — Neural Collaborative Filtering Movie Recommender

## Model Details

Primary model:

NeuMF implemented using PyTorch.

Supporting models may include:

- Popularity Baseline.
- GMF.
- MLP.

---

## Intended Use

Educational and prototype personalized movie recommendation.

The model is intended to:

- Rank candidate movies.
- Generate Top-N recommendations.
- Demonstrate Neural Collaborative Filtering.
- Support experimentation with recommendation metrics.

---

## Out of Scope

The model is not intended to:

- Guarantee user satisfaction.
- Replace real streaming recommendation infrastructure.
- Make high-stakes decisions.
- Infer personal demographic characteristics.
- Provide exact explicit ratings unless trained for that purpose.

---

## Data

MovieLens 25M.

The final model card must record:

- Dataset source.
- Dataset version.
- Files used.
- Final number of users.
- Final number of movies.
- Final interactions.
- Filtering rules.
- Positive interaction threshold.

---

## Evaluation

Evaluation will use:

- Leave-One-Out protocol.
- Negative candidate sampling.
- Hit Rate\@10.
- NDCG\@10.

The final model card must document the exact candidate sampling configuration.

---

## Limitations

- MovieLens behavior may not represent a real streaming platform.
- Offline metrics do not guarantee online engagement.
- Collaborative filtering struggles with cold-start users and movies.
- Popularity bias may affect recommendations.
- Sparse interaction histories reduce personalization quality.
- Historical preferences can change over time.

---

## Ethical Considerations

Consider:

- Recommendation diversity.
- Popularity bias.
- Filter bubbles.
- Cold-start fairness.
- Data minimization.
- Transparent explanation of model limitations.

---

## Monitoring

Future versions may monitor:

- Interaction drift.
- Score distribution.
- Recommendation diversity.
- Popularity concentration.
- Offline metric changes.
- Online engagement if production feedback becomes available.

---

# 32. Architecture Decision Records

## ADR-001 — FastAPI

Use FastAPI because:

- The ML model is implemented in Python.
- FastAPI supports typed request validation.
- FastAPI provides automatic OpenAPI documentation.
- Model serving can remain close to PyTorch artifacts.

---

## ADR-002 — React

Use React because:

- It supports component-based UI development.
- It integrates cleanly with REST APIs.
- It is suitable for dashboards and interactive recommendation interfaces.

---

## ADR-003 — PyTorch

Use PyTorch because:

- The project requires deep learning.
- NeuMF can be implemented directly.
- Training and inference can share model definitions.

---

## ADR-004 — NeuMF as Primary Model

Use NeuMF because it combines:

- Generalized Matrix Factorization.
- Nonlinear MLP interactions.

It directly aligns with the project's Neural Collaborative Filtering objective.

---

## ADR-005 — Leave-One-Out Evaluation

Use Leave-One-Out evaluation because it matches the specified project requirements and is a standard approach for ranking-based recommendation evaluation.

---

## ADR-006 — HR\@10 and NDCG\@10

Use:

- HR\@10 to measure whether the relevant item appears.
- NDCG\@10 to reward higher ranking positions.

Using both prevents relying on a single metric.

---

## ADR-007 — No Mandatory Database

The MVP can operate without a database because:

- Movie metadata can be loaded from prepared artifacts.
- The model is inference-focused.
- User profiles come from the dataset.

A database should only be introduced if the product requirements expand.

---

## ADR-008 — Separate Training and Serving

Training code and serving code will remain separate.

Training produces versioned artifacts.

FastAPI consumes those artifacts.

This prevents expensive training operations from becoming part of the inference path.

---

# 33. Final Product Definition

The final product will be a full-stack movie recommendation system with the following architecture:

```text
MovieLens 25M
      ↓
Data Validation + EDA
      ↓
Interaction Processing
      ↓
Negative Sampling
      ↓
GMF / MLP / NeuMF
      ↓
Leave-One-Out Evaluation
      ↓
HR@10 + NDCG@10
      ↓
Versioned Model Artifact
      ↓
FastAPI
      ↓
React
      ↓
Personalized Movie Recommendations
```

The final application must demonstrate a complete machine learning product lifecycle:

**Data → Modeling → Evaluation → Model Serving → Frontend Integration → Testing → Documentation → Deployment**

The project should prioritize technical correctness over unnecessary features.

A polished dashboard with an invalid evaluation pipeline is a worse project than a simpler interface with a correct model and reproducible evaluation.
