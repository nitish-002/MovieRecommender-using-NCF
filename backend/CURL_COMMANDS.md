# API Curl Commands

## Auth

### Register (random MovieLens ID assigned)
```bash
curl -X POST http://127.0.0.1:8000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "password": "mypassword123"}'
```

### Login
```bash
curl -X POST http://127.0.0.1:8000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "password": "mypassword123"}'
```

### Get your profile
```bash
curl http://127.0.0.1:8000/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

## Recommendations (Auth Required)

### Get top-10 recommendations
```bash
curl "http://127.0.0.1:8000/api/recommend?top_n=10" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Get top-5 recommendations
```bash
curl "http://127.0.0.1:8000/api/recommend?top_n=5" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Get top-20 recommendations
```bash
curl "http://127.0.0.1:8000/api/recommend?top_n=20" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

## Predictions (Auth Required)

### Predict preference for a movie
```bash
curl -X POST "http://127.0.0.1:8000/api/predict" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{"movie_id": 1}'
```

---

## Movies (No Auth)

### Search movies
```bash
curl "http://127.0.0.1:8000/api/movies/search?query=toy&limit=10"
```

### Get movie details
```bash
curl http://127.0.0.1:8000/api/movies/1
```

---

## Info (No Auth)

### Health check
```bash
curl http://127.0.0.1:8000/api/health
```

### Model metrics
```bash
curl http://127.0.0.1:8000/api/metrics
```
