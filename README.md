# 🎬 CineMatch — Neural Collaborative Filtering Movie Recommender

[![Python](https://img.shields.io/badge/Python-3.10%2B-blue.svg)](https://www.python.org/)
[![PyTorch](https://img.shields.io/badge/PyTorch-2.0%2B-EE4C2C.svg)](https://pytorch.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.110%2B-009688.svg)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/React-19-61DAFB.svg)](https://react.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-38B2AC.svg)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

An end-to-end, production-grade movie recommendation application powered by **Neural Collaborative Filtering (NCF / NeuMF)** trained on the **MovieLens 25M** dataset (25 million interactions, 162,000+ users, 47,000+ movies).

The system combines **Generalized Matrix Factorization (GMF)** and a deep **Multi-Layer Perceptron (MLP)** into a unified **NeuMF** model, served through a high-performance **FastAPI** REST backend and visualized with a responsive **React 19** frontend.

---

## 📑 Table of Contents

- [Key Features](#-key-features)
- [System Architecture](#-system-architecture)
- [Tech Stack](#-tech-stack)
- [Directory Structure](#-directory-structure)
- [Getting Started](#-getting-started)
  - [Prerequisites](#prerequisites)
  - [1. Database Setup (PostgreSQL)](#1-database-setup-postgresql)
  - [2. Backend Setup (FastAPI + PyTorch)](#2-backend-setup-fastapi--pytorch)
  - [3. Frontend Setup (React + Vite)](#3-frontend-setup-react--vite)
  - [4. Docker Compose (All-in-One)](#4-docker-compose-all-in-one)
- [Machine Learning Methodology](#-machine-learning-methodology)
  - [Model Architecture (NeuMF)](#model-architecture-neumf)
  - [Evaluation Protocol (Leave-One-Out)](#evaluation-protocol-leave-one-out)
  - [Benchmark Results](#benchmark-results)
- [API Reference](#-api-reference)
- [License](#-license)

---

## ✨ Key Features

* **Personalized Top-N Recommendations**: Real-time neural recommendation rankings tailored to user interaction history with configurable \(N\) (Top 5, 10, 20, 50).
* **Interactive Preference Predictor**: Computes the exact predicted affinity probability score for any selected movie in the MovieLens catalog via live NeuMF forward passes.
* **Catalog Discovery & Search**: Fast movie title search and multi-genre filtering across 47,000+ titles with real-time sorting (popularity, title, release year).
* **Model Insights & Benchmarks**: Interactive visual performance dashboard displaying Hit Rate@10 (HR@10), NDCG@10, dataset distributions, and neural architecture hyperparameters.
* **User Session & Profile Binding**: User authentication using JWT tokens and bcrypt password hashing, automatically bound to unique MovieLens latent embeddings.
* **Modern Responsive Interface**: Built with React 19, Tailwind CSS v4, Lucide icons, Recharts visualizations, and mobile slide-over navigation.

---

## 🏛️ System Architecture

```mermaid
flowchart LR
    subgraph Data & Training
        ML[MovieLens 25M Interactions] --> Pre[Preprocess & Neg Sampling]
        Pre --> Train[PyTorch NeuMF Training]
        Train --> Art[Model Artifacts: Weights & Mappings]
    end

    subgraph Backend Services
        Art --> MS[Model Service]
        PG[(PostgreSQL)] --> Auth[Auth Service / JWT]
        MS --> API[FastAPI REST Endpoints]
        Auth --> API
    end

    subgraph Frontend Client
        API --> Shell[React 19 / AppShell]
        Shell --> Recs[Recommendations Page]
        Shell --> Pred[Predictor Page]
        Shell --> Disc[Discover Catalog]
        Shell --> Insights[Model Insights]
    end
```

---

## 🛠️ Tech Stack

### Machine Learning & Data Science
* **Framework**: PyTorch
* **Architecture**: NeuMF (Generalized Matrix Factorization + Deep MLP Fusion)
* **Dataset**: MovieLens 25M (GroupLens Research)
* **Evaluation**: Leave-One-Out Chronological Split, Hit Rate@10, NDCG@10
* **Loss Function**: `BCEWithLogitsLoss` with AdamW optimizer

### Backend API
* **Framework**: FastAPI (Python 3.10+)
* **ASGI Server**: Uvicorn
* **Database**: PostgreSQL 15 + SQLAlchemy (asyncpg)
* **Security**: JWT session tokens + bcrypt password hashing
* **Serialization**: Pydantic v2

### Frontend Client
* **Framework**: React 19 + Vite
* **Styling**: Tailwind CSS v4
* **Routing**: React Router v7
* **Charts**: Recharts
* **Icons**: Lucide React
* **HTTP Client**: Axios with request/response interceptors

---

## 📂 Directory Structure

```text
movie-recommender-ncf/
├── backend/
│   ├── app/
│   │   ├── api/
│   │   │   ├── auth_routes.py         # Authentication endpoints (/auth/*)
│   │   │   └── routes.py              # Recommendation & catalog endpoints (/api/*)
│   │   ├── services/
│   │   │   ├── auth_service.py        # Password hashing & JWT token issuance
│   │   │   ├── db.py                  # PostgreSQL connection & User model
│   │   │   ├── model_service.py       # PyTorch model loader & inference engine
│   │   │   └── movie_service.py       # Catalog query & metadata lookup
│   │   ├── config.py                  # Environment settings & paths
│   │   ├── main.py                    # FastAPI application & lifecycle
│   │   └── schemas.py                 # Pydantic request & response models
│   ├── model_artifacts/               # Trained weights, mapping JSONs, metadata CSV
│   │   ├── neumf_best.pth             # Trained PyTorch checkpoint
│   │   ├── user_mapping.json          # MovieLens User ID to matrix index
│   │   ├── movie_mapping.json         # MovieLens Movie ID to matrix index
│   │   ├── movie_metadata.csv         # Movie titles and genres
│   │   └── metrics.json               # Recorded evaluation metrics
│   ├── Dockerfile                     # Backend container build
│   └── requirements.txt               # Backend Python dependencies
├── Frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── analytics/             # Recharts comparison charts & metric cards
│   │   │   ├── auth/                  # Protected & public route guards
│   │   │   ├── layout/                # AppShell, Sidebar, and Topbar
│   │   │   ├── movie/                 # MovieCard, MovieGrid, Carousel, DetailsModal
│   │   │   ├── prediction/            # Circular affinity meter & PreferenceForm
│   │   │   ├── recommendation/        # Top-N selector & genre filter toolbar
│   │   │   └── ui/                    # ErrorBoundary, Modal, Button, Skeleton
│   │   ├── context/
│   │   │   └── AuthContext.jsx        # Global authentication state
│   │   ├── hooks/
│   │   │   ├── useMovies.js           # Recommendation, search, and metrics hooks
│   │   │   └── usePrediction.js       # Live preference prediction hook
│   │   ├── pages/
│   │   │   ├── DiscoverPage.jsx       # Catalog browsing with multi-genre filters
│   │   │   ├── HomePage.jsx           # Hero spotlight, metrics, & carousels
│   │   │   ├── InsightsPage.jsx       # Architecture diagrams & benchmarks
│   │   │   ├── LoginPage.jsx          # User sign-in
│   │   │   ├── PredictorPage.jsx      # Single-title neural preference predictor
│   │   │   ├── RecommendationsPage.jsx# Personalized Top-N recommendations
│   │   │   ├── RegisterPage.jsx       # User registration & profile binding
│   │   │   └── SettingsPage.jsx       # Profile & application preferences
│   │   ├── services/                  # Axios instances and API services
│   │   ├── App.jsx                    # Application routing table
│   │   ├── index.css                  # Tailwind CSS theme & utilities
│   │   └── main.jsx                   # React root entry point
│   ├── package.json                   # Frontend dependencies & scripts
│   └── vite.config.js                 # Vite bundler & reverse proxy configuration
├── ML/
│   └── Model.ipynb                    # Data preprocessing, training, and evaluation
├── docker-compose.yml                 # Multi-container orchestration (PostgreSQL + API)
├── requirements.txt                   # Root Python environment requirements
├── .gitignore                         # Git exclusion rules
└── README.md                          # Project documentation
```

---

## 🚀 Getting Started

### Prerequisites

Ensure you have the following installed on your machine:
* [Python](https://www.python.org/) (version 3.10 or higher)
* [Node.js](https://nodejs.org/) (version 18 or higher) and `npm`
* [Docker & Docker Compose](https://www.docker.com/) (recommended for PostgreSQL)

---

### 1. Database Setup (PostgreSQL)

Start PostgreSQL using the provided Docker Compose service:

```bash
docker-compose up -d postgres
```

This launches a PostgreSQL 15 container mapped to host port `5433` with database `movie_recommender`.

---

### 2. Backend Setup (FastAPI + PyTorch)

1. **Activate the virtual environment**:
   * **PowerShell**:
     ```powershell
     .\venv\Scripts\Activate.ps1
     ```
   * **Command Prompt (cmd)**:
     ```cmd
     venv\Scripts\activate.bat
     ```
   * **Linux / macOS**:
     ```bash
     source venv/bin/activate
     ```

2. **Install backend dependencies** (if not already installed):
   ```bash
   pip install -r backend/requirements.txt
   ```

3. **Verify the environment file** (`backend/.env`):
   ```env
   DATABASE_URL=postgresql+asyncpg://postgres:postgres@localhost:5433/movie_recommender
   MODEL_ARTIFACTS_DIR=./model_artifacts
   HOST=0.0.0.0
   PORT=8000
   LOG_LEVEL=info
   ```

4. **Start the FastAPI backend server**:
   ```bash
   cd backend
   uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
   ```

The backend API will be available at **`http://localhost:8000`**.  
Interactive Swagger documentation is available at **`http://localhost:8000/docs`**.

---

### 3. Frontend Setup (React + Vite)

1. Open a new terminal and navigate to the `Frontend` directory:
   ```bash
   cd Frontend
   ```

2. **Install packages**:
   ```bash
   npm install
   ```

3. **Start the development server**:
   ```bash
   npm run dev
   ```

The web client will launch at **`http://localhost:3000`** (or `http://localhost:5173`).

---

### 4. Docker Compose (All-in-One)

To spin up both PostgreSQL and the backend API container together:

```bash
docker-compose up -d
```

---

## 🧠 Machine Learning Methodology

### Model Architecture (NeuMF)

The Neural Collaborative Filtering framework fuses two distinct pathways:

$$\hat{y}_{ui} = \sigma\left( \mathbf{h}^T \left[ \phi^{GMF} \parallel \phi^{MLP} \right] \right)$$

1. **Generalized Matrix Factorization (GMF)**:
   * Maps user and movie IDs into latent embedding spaces: $\mathbf{p}_u^G \in \mathbb{R}^d$ and $\mathbf{q}_i^G \in \mathbb{R}^d$.
   * Computes the element-wise product: $\phi^{GMF} = \mathbf{p}_u^G \odot \mathbf{q}_i^G$.
2. **Multi-Layer Perceptron (MLP)**:
   * Maps user and movie IDs into deep embedding spaces: $\mathbf{p}_u^M \in \mathbb{R}^d$ and $\mathbf{q}_i^M \in \mathbb{R}^d$.
   * Concatenates embeddings and propagates through hidden layers: $64 \rightarrow 32 \rightarrow 16 \rightarrow 8$ with ReLU activation and 20% Dropout.
3. **NeuMF Layer**:
   * Concatenates the linear GMF representation and non-linear MLP representation.
   * Feeds into a final output projection layer with a Sigmoid activation function producing interaction probability $\hat{y}_{ui} \in [0, 1]$.

---

### Evaluation Protocol (Leave-One-Out)

To prevent temporal data leakage and benchmark realistically:
* **Leave-One-Out Split**: For each user, the latest positive rating (chronologically) is held out as the **test item**, the second-latest is held out as the **validation item**, and all earlier interactions form the **training set**.
* **Negative Candidate Pool**: During evaluation, the held-out positive item is ranked against **99 unobserved (negative) movies** sampled per user.
* **Ranking Metrics**:
  * **Hit Rate @ 10 (HR@10)**: Fraction of users whose true test movie appears within the Top-10 ranked recommendations.
  * **NDCG @ 10**: Normalized Discounted Cumulative Gain at rank 10, rewarding relevant items ranked closer to position 1.

---

### Benchmark Results

| Model | HR@10 | NDCG@10 | Description |
| :--- | :---: | :---: | :--- |
| **Popularity Baseline** | `0.5420` | `0.3210` | Non-personalized top-streamed frequency baseline |
| **GMF** | `0.7180` | `0.4530` | Generalized Matrix Factorization latent dot product |
| **MLP** | `0.7350` | `0.4710` | Multi-Layer Perceptron non-linear representation |
| **NeuMF (Ours)** | **`0.7842`** | **`0.5126`** | Fused GMF + MLP Neural Collaborative Filtering |

---

## 📡 API Reference

All protected endpoints require a Bearer token header:  
`Authorization: Bearer <access_token>`

| Method | Endpoint | Auth | Description |
| :--- | :--- | :---: | :--- |
| `GET` | `/api/health` | No | System health and model readiness status |
| `GET` | `/api/metrics` | No | Model evaluation metrics & dataset statistics |
| `GET` | `/api/movies/search?query=...&limit=20` | No | Search movie catalog by title keyword |
| `GET` | `/api/movies/{movie_id}` | No | Retrieve detailed metadata for a specific movie |
| `POST` | `/api/predict` | **Yes** | Predict user affinity score for a specific movie |
| `GET` | `/api/recommend?top_n=10` | **Yes** | Generate Top-N personalized recommendations |
| `POST` | `/auth/register` | No | Create account and bind to a MovieLens profile |
| `POST` | `/auth/login` | No | Authenticate user and receive JWT bearer token |
| `GET` | `/auth/me` | **Yes** | Retrieve currently authenticated user profile |

---

## 📄 License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.
MovieLens 25M dataset is provided courtesy of [GroupLens Research](https://grouplens.org/datasets/movielens/25m/).

