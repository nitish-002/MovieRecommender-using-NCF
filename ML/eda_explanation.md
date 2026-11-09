# Master Viva Defense & Detailed EDA Report: MovieLens 25M for NCF

This document is a comprehensive, viva-ready technical guide detailing the **Exploratory Data Analysis (EDA)** performed on the **MovieLens 25M** dataset in [`ML/eda.ipynb`](file:///c:/Users/ACER/OneDrive/Desktop/movie%20Remommender%20using%20NCF/ML/eda.ipynb). It contains exact statistical findings, mathematical definitions, data visualizations, preprocessing blueprints, and an **Examiner Q&A / Viva Defense Cheat Sheet**.

---

## 1. Executive Summary & Quick Pitch

> **Project Goal:** Build a Deep Learning-based **Neural Collaborative Filtering (NCF / NeuMF)** recommendation engine to deliver personalized movie recommendations.
>
> **Dataset:** MovieLens 25M dataset released by GroupLens Research (25 million ratings across 62,423 movies by 162,541 users from 1995 to 2019).
>
> **Key Finding from EDA:** The rating interaction matrix is **99.74% sparse**, following a severe **long-tail power-law distribution** where 10% of popular movies account for 74.6% of all ratings. Traditional matrix factorization fails to capture non-linear user-item interactions in high sparsity; hence, an NCF model combining linear GMF and non-linear MLP is required.

---

## 2. Dataset Schema & Structure Analysis

The dataset consists of four primary CSV files. Below is the detailed breakdown:

### 2.1 File-by-File Breakdown

#### 1. `ratings.csv` (Core Interaction Table)
* **Shape:** $25,000,095 \text{ rows} \times 4 \text{ columns}$
* **Columns & Types:**
  - `userId` (`int64`): Unique anonymous user identifier ($1 \to 162,541$).
  - `movieId` (`int64`): Unique movie identifier ($1 \to 209,171$).
  - `rating` (`float64`): 5-star rating scale with 0.5 increments ($0.5 \to 5.0$).
  - `timestamp` (`int64`): POSIX timestamp (seconds since UTC 1/1/1970).
* **Missing Values:** `0` null values.
* **Role in NCF:** Primary source for creating the user-item interaction matrix $R \in \mathbb{R}^{U \times I}$ and performing temporal train/val/test splits.

#### 2. `movies.csv` (Item Metadata Table)
* **Shape:** $62,423 \text{ rows} \times 3 \text{ columns}$
* **Columns & Types:**
  - `movieId` (`int64`): Unique movie ID matching `ratings.csv`.
  - `title` (`object/string`): Full movie title including release year in parentheses (e.g., `"Toy Story (1995)"`).
  - `genres` (`object/string`): Pipe-separated string of genres (e.g., `"Adventure|Animation|Children|Comedy|Fantasy"`).
* **Missing Values:** `0` null values (20 movies have `"(no genres listed)"`).
* **Role in NCF:** Provides human-readable titles for UI display and genre embeddings for hybrid NCF feature concatenation.

#### 3. `tags.csv` (User Tagging Table)
* **Shape:** $1,093,360 \text{ rows} \times 4 \text{ columns}$
* **Columns & Types:** `userId`, `movieId`, `tag` (`string`), `timestamp`.
* **Missing Values:** 16 missing tags (dropped during cleaning).
* **Role in NCF:** Used for tag cloud visualizations and potential text embedding extensions (BERT/TF-IDF) in advanced iterations.

#### 4. `links.csv` (External Identifier Mapping)
* **Shape:** $62,423 \text{ rows} \times 3 \text{ columns}$
* **Columns & Types:** `movieId`, `imdbId`, `tmdbId`.
* **Missing Values:** 107 missing `tmdbId` values.
* **Role in NCF:** Used by the FastAPI backend to fetch movie posters, trailers, and synopses from The Movie Database (TMDB) API for the React UI.

---

## 3. Mathematical & Statistical EDA Findings

### 3.1 Matrix Sparsity Calculation

$$\text{Total Possible Interactions} = |U| \times |I| = 162,541 \times 59,047 = 9,597,553,427$$

$$\text{Actual Observed Ratings } (|R|) = 25,000,095$$

$$\text{Matrix Density } (D) = \frac{|R|}{|U| \times |I|} = \frac{25,000,095}{9,597,553,427} \approx 0.0026048 \quad (0.2605\%)$$

$$\text{Matrix Sparsity } (S) = 1 - D = 1 - 0.0026048 = \mathbf{99.7396\%}$$

#### Viva Explanation:
> *"Sir/Ma'am, out of nearly 9.6 billion potential user-movie pairs, we only observe 25 million actual interactions. That means 99.74% of the matrix is completely unobserved. Simple distance-based algorithms or raw matrix representations fail under such extreme sparsity. Neural embeddings compress sparse discrete user/item IDs into dense latent vectors, allowing the model to generalize across unobserved pairs."*

---

### 3.2 Rating Distribution & Threshold Selection

| Rating Value | Absolute Count | Percentage (%) | Cumulative % |
| :---: | :---: | :---: | :---: |
| **0.5** | 393,094 | 1.57% | 1.57% |
| **1.0** | 776,815 | 3.11% | 4.68% |
| **1.5** | 399,490 | 1.60% | 6.28% |
| **2.0** | 1,640,868 | 6.56% | 12.84% |
| **2.5** | 1,263,797 | 5.06% | 17.90% |
| **3.0** | 4,991,568 | 19.97% | 37.87% |
| **3.5** | 3,277,536 | 13.11% | 50.98% |
| **4.0** | 6,709,439 | 26.84% | 77.82% |
| **4.5** | 2,200,539 | 8.80% | 86.62% |
| **5.0** | 3,346,949 | 13.38% | **100.00%** |

* **Mean Rating:** $3.5315$
* **Median Rating:** $3.50$
* **Standard Deviation:** $1.060$

#### Implicit Feedback Formulation:
We convert explicit 5-star ratings into implicit binary interaction targets:

$$y_{u,i} = \begin{cases} 1, & \text{if } r_{u,i} \ge 3.5 \quad (\text{User liked the movie}) \\ 0, & \text{if } r_{u,i} < 3.5 \text{ or unobserved} \quad (\text{Negative / Non-interaction}) \end{cases}$$

#### Viva Justification for $\ge 3.5$ Threshold:
> *"Explicit ratings carry user bias (some users rate everything 5, others rate everything 3). By thresholding at $\ge 3.5$, we isolate true positive affinity signals (62.1% of all ratings) and train NCF on implicit feedback, which aligns directly with modern industrial recommendation standards (e.g., Netflix, YouTube)."*

---

### 3.3 User Activity & Item Popularity (Long-Tail Analysis)

#### User Activity Statistics:
* **Minimum Ratings per User:** 20 (MovieLens benchmark guarantee)
* **Maximum Ratings per User:** 9,152 (Power user)
* **Median Ratings per User:** 96 ratings
* **Interquartile Range (IQR):** 43 to 222 ratings

#### Item Popularity Distribution:
* **Most Rated Movie:** *Forrest Gump (1994)* with **81,491 ratings** (~50.1% of all users rated it).
* **Top 5 Rated Movies:**
  1. *Forrest Gump (1994)* – 81,491 ratings
  2. *The Shawshank Redemption (1994)* – 81,482 ratings
  3. *Pulp Fiction (1994)* – 79,672 ratings
  4. *The Silence of the Lambs (1991)* – 74,127 ratings
  5. *The Matrix (1999)* – 72,674 ratings
* **The 80/20 Rule (Pareto Principle):** The top **10% of movies** account for **74.6% of total ratings**. Over **30,000 movies** have fewer than 10 ratings.

---

### 3.4 Genre Breakdown

20 unique genres are present in the dataset. Movies average **1.9 genres** per title.

| Genre | Movie Count | Total Ratings Received | Average Rating |
| :--- | :---: | :---: | :---: |
| **Drama** | 25,606 | 11,048,642 | 3.68 |
| **Comedy** | 16,870 | 8,829,235 | 3.42 |
| **Action** | 7,348 | 7,046,392 | 3.45 |
| **Thriller** | 8,654 | 6,614,943 | 3.51 |
| **Romance** | 7,719 | 4,499,350 | 3.54 |
| **Adventure** | 4,145 | 5,548,294 | 3.52 |
| **Sci-Fi** | 3,595 | 4,374,523 | 3.46 |
| **Crime** | 5,319 | 4,173,080 | 3.70 |

---

## 4. Key Visualizations Explained

When presenting `ML/eda.ipynb` in front of examiners, be prepared to explain each of the 6 key plots:

1. **Rating Distribution Bar Chart:** Showcases the right-skewed nature of ratings. Explains why $3.5$ is chosen as the implicit positive cutoff.
2. **User Activity Distribution (Log Scale Log-Histogram):** Illustrates power-law user activity; highlights the necessity of min-rating filtering (min 5 positive ratings for training).
3. **Item Popularity Long-Tail Plot:** Ranks items from most popular to least popular. Demonstrates why naive popularity models fail (they recommend the top 20 movies to everyone, ignoring personalization).
4. **Cumulative Rating Percentage vs. Top Item Percentile:** Quantifies the 80/20 Pareto distribution (top 10% movies = 74.6% ratings).
5. **Genre Frequency & Average Rating Horizontal Bar Chart:** Shows Drama/Comedy dominance and highlights high-rated niche genres (e.g., Film-Noir average rating 3.92).
6. **Temporal Volume Line Plot (1995–2019):** Tracks ratings over time. Shows spikes in rating activity during early 2000s and 2015-2016, justifying **temporal train-validation-test splitting**.

---

## 5. Viva Defense Cheat Sheet: Expected Questions & Answers

### Q1: Why use Neural Collaborative Filtering (NCF / NeuMF) instead of traditional Matrix Factorization (SVD / ALS)?
> **Answer:** 
> Matrix Factorization (MF) models user item interactions using a simple **inner product** of latent vectors ($\mathbf{p}_u^T \mathbf{q}_i$). The inner product linearly combines latent dimensions, which assumes latent factors are independent and linear. 
> NCF replaces or augments the inner product with a neural network architecture. It combines **Generalized Matrix Factorization (GMF)** (linear kernel) and a **Multi-Layer Perceptron (MLP)** (non-linear deep feature learning) into **NeuMF**. This allows the model to capture complex, non-linear user-item interaction patterns that linear SVD misses.

---

### Q2: Why use Implicit Feedback instead of predicting the exact star rating (1 to 5)?
> **Answer:** 
> 1. In real-world applications, user feedback is predominantly implicit (clicks, watch time, purchases) rather than explicit ratings.
> 2. Explicit ratings are noisy and subjective (a 3-star rating from a harsh critic might equal a 5-star rating from a lenient user).
> 3. Predicting star ratings via regression (e.g., RMSE minimization) prioritizes fitting rating scores for items the user already rated, whereas recommendation engines must rank unobserved candidate items. Binary implicit optimization directly optimizes item ranking.

---

### Q3: Why use a Temporal Leave-One-Out split instead of random 80/20 K-Fold Cross Validation?
> **Answer:** 
> Standard random splits suffer from **data leakage** in time-series and recommender contexts. If a model is trained on a rating from 2018 to predict a rating from 2005 for the same user, it uses future knowledge to predict the past.
> In **Temporal Leave-One-Out splitting**, for every user we sort their interaction history by timestamp:
> - **Test Item:** The user's *very last* interaction ($t_{last}$).
> - **Validation Item:** The user's *second-to-last* interaction ($t_{second\_last}$).
> - **Train Set:** All interactions preceding the validation timestamp ($t < t_{second\_last}$).
> This strictly evaluates the model's ability to predict future user preferences based on past history.

---

### Q4: What is Negative Sampling, and why do we sample 4 negative items per positive interaction?
> **Answer:** 
> Implicit feedback data only contains positive interactions ($y_{u,i} = 1$). If we train a neural network using binary cross-entropy loss exclusively on positive instances, the model will output $\hat{y}_{u,i} = 1$ for all inputs (trivial solution).
> To prevent this, we perform **Negative Sampling**: for each positive pair $(u, i^+)$, we randomly sample $K$ items $(u, i^-_1), (u, i^-_2), \dots, (u, i^-_K)$ that the user has *never interacted with*, assigning them target $y=0$.
> Research by Xiangnan He et al. (NCF paper, WWW 2017) demonstrated that $K \in [4, 8]$ negative samples per positive interaction yields optimal convergence and ranking performance.

---

### Q5: How do Hit Ratio @ K (HR@K) and NDCG@K evaluation metrics work?
> **Answer:** 
> For evaluation, each test user's ground-truth positive item is mixed with 99 unobserved negative items, creating a candidate pool of 100 items. NCF ranks these 100 items.
> - **Hit Ratio @ 10 (HR@10):** A binary indicator ($1$ or $0$) measuring whether the ground-truth test movie appears anywhere within the top 10 ranked recommendations:
>   $$\text{HR@10} = \frac{1}{|U|} \sum_{u \in U} \mathbb{I}(\text{rank}_u \le 10)$$
> - **Normalized Discounted Cumulative Gain @ 10 (NDCG@10):** Measures the *positional quality* of the recommendation. If the test movie is at Rank 1, NDCG@10 = 1.0. If it is at Rank 10, NDCG@10 is penalized by logarithmic decay:
>   $$\text{NDCG@10} = \frac{1}{|U|} \sum_{u \in U} \frac{1}{\log_2(\text{rank}_u + 1)}$$

---

### Q6: What is NeuMF, and how are GMF and MLP combined?
> **Answer:** 
> NeuMF (Neural Matrix Factorization) is a dual-branch architecture:
> 1. **GMF Branch:** Takes user embedding $\mathbf{p}_u^G$ and item embedding $\mathbf{q}_i^G$, performing element-wise multiplication: $\mathbf{\phi}^{GMF} = \mathbf{p}_u^G \odot \mathbf{q}_i^G$.
> 2. **MLP Branch:** Takes user embedding $\mathbf{p}_u^M$ and item embedding $\mathbf{q}_i^M$, concatenates them $[\mathbf{p}_u^M, \mathbf{q}_i^M]$, and passes them through dense layers with ReLU activation: $\mathbf{\phi}^{MLP} = a_L(\mathbf{W}_L^T \dots a_1(\mathbf{W}_1^T [\mathbf{p}_u^M, \mathbf{q}_i^M] + \mathbf{b}_1) \dots + \mathbf{b}_L)$.
> 3. **Fusion Layer:** Concatenates GMF and MLP representations and projects to a single output neuron via Sigmoid:
>    $$\hat{y}_{u,i} = \sigma \left( \mathbf{h}^T \left[ \mathbf{\phi}^{GMF}, \mathbf{\phi}^{MLP} \right] \right)$$
> This allows NeuMF to leverage both linear embedding multiplication and non-linear deep feature learning simultaneously.
