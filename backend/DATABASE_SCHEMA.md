# Database Schema

## Users (Auth)

```sql
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    movie_lens_user_id INTEGER UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_movie_lens_id ON users(movie_lens_user_id);
```

| Column | Type | Constraints |
|--------|------|-------------|
| id | SERIAL | Primary Key, auto-increment |
| email | VARCHAR(255) | Unique, indexed, NOT NULL |
| password_hash | VARCHAR(255) | NOT NULL (bcrypt hash) |
| movie_lens_user_id | INTEGER | Unique, indexed, NOT NULL |
| created_at | TIMESTAMP WITH TIME ZONE | Server default: NOW() |

**Purpose:** App accounts. On registration, a random unassigned MovieLens user ID is linked. Each ID can only be assigned once (unique constraint).

## Movies (Catalog)

```sql
CREATE TABLE movies (
    id SERIAL PRIMARY KEY,
    movie_id INTEGER UNIQUE NOT NULL,
    title VARCHAR(500) NOT NULL,
    genres TEXT NOT NULL
);
CREATE INDEX idx_movies_movie_id ON movies(movie_id);
CREATE INDEX idx_movies_title ON movies(title);
```

| Column | Type | Constraints |
|--------|------|-------------|
| id | SERIAL | Primary Key, auto-increment |
| movie_id | INTEGER | Unique, indexed, NOT NULL |
| title | VARCHAR(500) | Indexed, NOT NULL |
| genres | TEXT | NOT NULL (pipe-separated) |

**Purpose:** Movie catalog with titles and genres for search and display.

## User Interactions (Ratings)

```sql
CREATE TABLE user_interactions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    movie_id INTEGER NOT NULL,
    rating NUMERIC(2,1) NOT NULL,
    timestamp BIGINT NOT NULL
);
CREATE INDEX idx_interactions_user ON user_interactions(user_id);
CREATE INDEX idx_interactions_movie ON user_interactions(movie_id);
```

| Column | Type | Constraints |
|--------|------|-------------|
| id | SERIAL | Primary Key, auto-increment |
| user_id | INTEGER | Indexed, NOT NULL |
| movie_id | INTEGER | Indexed, NOT NULL |
| rating | NUMERIC(2,1) | NOT NULL (0.5-5.0) |
| timestamp | BIGINT | NOT NULL (Unix epoch) |

**Purpose:** Historical user-movie ratings from MovieLens for training and retraining.

## Model Metadata

```sql
CREATE TABLE model_metadata (
    id SERIAL PRIMARY KEY,
    model_version VARCHAR(50) UNIQUE NOT NULL,
    model_name VARCHAR(100) NOT NULL,
    embedding_dimension INTEGER NOT NULL,
    num_users INTEGER NOT NULL,
    num_movies INTEGER NOT NULL,
    positive_threshold NUMERIC(3,1) NOT NULL,
    training_completed BOOLEAN NOT NULL,
    training_timestamp TIMESTAMP WITH TIME ZONE,
    artifact_path VARCHAR(500),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

| Column | Type | Constraints |
|--------|------|-------------|
| id | SERIAL | Primary Key, auto-increment |
| model_version | VARCHAR(50) | Unique, NOT NULL |
| model_name | VARCHAR(100) | NOT NULL |
| embedding_dimension | INTEGER | NOT NULL |
| num_users | INTEGER | NOT NULL |
| num_movies | INTEGER | NOT NULL |
| positive_threshold | NUMERIC(3,1) | NOT NULL |
| training_completed | BOOLEAN | NOT NULL |
| training_timestamp | TIMESTAMP WITH TIME ZONE | Nullable |
| artifact_path | VARCHAR(500) | Nullable |
| created_at | TIMESTAMP WITH TIME ZONE | Default: NOW() |

**Purpose:** Version tracking for trained models with hyperparameters and artifact locations.

## Evaluation Metrics

```sql
CREATE TABLE evaluation_metrics (
    id SERIAL PRIMARY KEY,
    model_version VARCHAR(50) NOT NULL,
    model_name VARCHAR(100) NOT NULL,
    metric_name VARCHAR(50) NOT NULL,
    metric_value NUMERIC(10,8) NOT NULL,
    evaluated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
CREATE INDEX idx_metrics_model ON evaluation_metrics(model_version, model_name);
CREATE INDEX idx_metrics_name ON evaluation_metrics(metric_name);
```

| Column | Type | Constraints |
|--------|------|-------------|
| id | SERIAL | Primary Key, auto-increment |
| model_version | VARCHAR(50) | Indexed, NOT NULL |
| model_name | VARCHAR(100) | Indexed, NOT NULL |
| metric_name | VARCHAR(50) | Indexed, NOT NULL |
| metric_value | NUMERIC(10,8) | NOT NULL |
| evaluated_at | TIMESTAMP WITH TIME ZONE | Default: NOW() |

**Purpose:** Store HR@10, NDCG@10 and other metrics per model for comparison dashboard.

## Preprocessing Config

```sql
CREATE TABLE preprocessing_config (
    id SERIAL PRIMARY KEY,
    dataset_name VARCHAR(100) NOT NULL,
    positive_rule VARCHAR(100) NOT NULL,
    minimum_user_interactions INTEGER NOT NULL,
    minimum_positive_interactions INTEGER NOT NULL,
    negative_ratio VARCHAR(20) NOT NULL,
    eval_negatives INTEGER NOT NULL,
    total_ratings INTEGER NOT NULL,
    total_users INTEGER NOT NULL,
    total_movies INTEGER NOT NULL,
    total_positives INTEGER NOT NULL,
    train_positives INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

| Column | Type | Constraints |
|--------|------|-------------|
| id | SERIAL | Primary Key, auto-increment |
| dataset_name | VARCHAR(100) | NOT NULL |
| positive_rule | VARCHAR(100) | NOT NULL |
| minimum_user_interactions | INTEGER | NOT NULL |
| minimum_positive_interactions | INTEGER | NOT NULL |
| negative_ratio | VARCHAR(20) | NOT NULL |
| eval_negatives | INTEGER | NOT NULL |
| total_ratings | INTEGER | NOT NULL |
| total_users | INTEGER | NOT NULL |
| total_movies | INTEGER | NOT NULL |
| total_positives | INTEGER | NOT NULL |
| train_positives | INTEGER | NOT NULL |
| created_at | TIMESTAMP WITH TIME ZONE | Default: NOW() |

**Purpose:** Reproducibility - track how data was preprocessed for each training run.

## Recommendation Logs

```sql
CREATE TABLE recommendation_logs (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    movie_lens_user_id INTEGER NOT NULL,
    top_n INTEGER NOT NULL,
    model_version VARCHAR(50) NOT NULL,
    recommended_movie_ids INTEGER[] NOT NULL,
    scores NUMERIC(10,8)[] NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
CREATE INDEX idx_rec_logs_user ON recommendation_logs(user_id);
CREATE INDEX idx_rec_logs_created ON recommendation_logs(created_at);
```

| Column | Type | Constraints |
|--------|------|-------------|
| id | SERIAL | Primary Key, auto-increment |
| user_id | INTEGER | Indexed, NOT NULL |
| movie_lens_user_id | INTEGER | NOT NULL |
| top_n | INTEGER | NOT NULL |
| model_version | VARCHAR(50) | NOT NULL |
| recommended_movie_ids | INTEGER[] | NOT NULL (PostgreSQL array) |
| scores | NUMERIC(10,8)[] | NOT NULL (PostgreSQL array) |
| created_at | TIMESTAMP WITH TIME ZONE | Default: NOW() |

**Purpose:** Observability - track what recommendations were served to which users.

## Prediction Logs

```sql
CREATE TABLE prediction_logs (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    movie_lens_user_id INTEGER NOT NULL,
    movie_id INTEGER NOT NULL,
    prediction_type VARCHAR(50) NOT NULL,
    score NUMERIC(10,8) NOT NULL,
    model_version VARCHAR(50) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
CREATE INDEX idx_pred_logs_user ON prediction_logs(user_id);
```

| Column | Type | Constraints |
|--------|------|-------------|
| id | SERIAL | Primary Key, auto-increment |
| user_id | INTEGER | Indexed, NOT NULL |
| movie_lens_user_id | INTEGER | NOT NULL |
| movie_id | INTEGER | NOT NULL |
| prediction_type | VARCHAR(50) | NOT NULL |
| score | NUMERIC(10,8) | NOT NULL |
| model_version | VARCHAR(50) | NOT NULL |
| created_at | TIMESTAMP WITH TIME ZONE | Default: NOW() |

**Purpose:** Observability - track prediction requests for monitoring and debugging.

## Relationships

```
users.movie_lens_user_id  -> MovieLens user ID (external dataset, not FK)
user_interactions.user_id -> users.movie_lens_user_id (logical)
user_interactions.movie_id -> movies.movie_id (logical)
recommendation_logs.user_id -> users.id (logical)
prediction_logs.user_id    -> users.id (logical)
evaluation_metrics.model_version -> model_metadata.model_version (logical)
```

## Table Status

| Table | Status | Notes |
|-------|--------|-------|
| users | **Active** | Auth system, random MovieLens ID assignment |
| movies | Future | Search currently uses movie_metadata.csv |
| user_interactions | Future | Would enable retraining pipeline |
| model_metadata | Future | Model versioning and A/B testing |
| evaluation_metrics | Future | Metrics dashboard data source |
| preprocessing_config | Future | Training reproducibility |
| recommendation_logs | Future | Observability and monitoring |
| prediction_logs | Future | Observability and monitoring |
