# Movie Recommender Backend

FastAPI backend for the Neural Collaborative Filtering Movie Recommender.

## API Endpoints

- `GET /api/health` - Health check
- `GET /api/recommend/{user_id}?top_n=10` - Get personalized recommendations
- `GET /api/movies/search?query=inception&limit=20` - Search movies
- `GET /api/movies/{movie_id}` - Get movie details
- `POST /api/predict` - Get a preference prediction for a movie using the authenticated user's profile
- `GET /api/metrics` - Get model metrics and dataset statistics

## Setup

1. Create a `.env` file from `.env.example`:
```bash
cp .env.example .env
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Start PostgreSQL (using Docker):
```bash
docker-compose up -d postgres
```

4. Run the backend:
```bash
uvicorn app.main:app --reload
```

Or run everything with Docker Compose:
```bash
docker-compose up
```

The `DATABASE_URL` in `backend/.env` must use the same database name, user, and password as the PostgreSQL instance. The supplied Docker Compose service defaults to database `movie_recommender`, user `postgres`, and password `postgres`. If PostgreSQL was initialized earlier with different credentials, update `DATABASE_URL` to match that instance; changing the Compose environment does not change credentials in an existing PostgreSQL data volume.

If registration returns `503 Registration is temporarily unavailable`, check the backend log for the database error, then verify `DATABASE_URL` and that the `users` table schema is initialized.

## Model Artifacts

The backend expects model artifacts in `./model_artifacts/`:
- `model_config.json` - Model configuration
- `user_mapping.json` - User ID mappings
- `movie_mapping.json` - Movie ID mappings
- `movie_metadata.csv` - Movie titles and genres
- `metrics.json` - Evaluation metrics
- `neumf_best.pth` - Trained model weights (generated after training)

## Notes

- The model is not trained yet. Train using the notebook in `../ML/Model.ipynb`
- Once trained, the model checkpoint will be saved as `neumf_best.pth`
- The API will return 503 if the model is not loaded
