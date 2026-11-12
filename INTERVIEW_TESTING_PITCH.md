# Interview Guide: System Testing & Performance

When an interviewer asks:  
> *"What all did you test in this project, and how did the components perform?"*

Here is a structured, high-impact spoken response you can deliver, followed by concise bullet points if they ask for follow-up details.

---

## 🎙️ Spoken Interview Response (Ready to Speak)

> "To ensure production readiness, I implemented an automated end-to-end test harness with **56 test scenarios** covering every tier of the application—from the PyTorch neural network and ML data pipeline to the backend APIs, security layer, database transactions, and frontend build.
>
> On the **Machine Learning side**, I validated model artifact schemas and bijectivity across all **162,148 users and 47,396 movies**, verified PyTorch tensor weight integrity in `neumf_best.pth`, and tested the **NeuMF** architecture by asserting that forward and batch passes produce calibrated probabilities strictly bounded between 0 and 1, along with verifying backpropagation gradient flow. For the **Recommender Engine**, I tested top-$N$ ranking order, filtering of already-seen history, and defensive error boundaries for unknown users or invalid $K$ parameters.
>
> On the **Backend and Security side**, I tested bcrypt password hashing, the 72-byte truncation boundary, JWT token lifecycles, and tamper resistance. I also tested all FastAPI public and protected endpoints, database registration, and authenticated recommendation flows using isolated test databases.
>
> In terms of **performance**, the entire 55-test backend suite executes in **under 11 seconds** with a **100% pass rate**, and the React frontend compiles **2,598 modules cleanly in under 2 seconds** with zero linter errors.
>
> Most importantly, testing caught a critical real-world edge case: the MovieLens dataset has **393 gap IDs** among its 162k users. Our test suite caught that new registrations could occasionally be assigned an unmapped user ID, triggering 404s during recommendation inference. I resolved this by enforcing strict key-space sampling directly from the trained model's index map. That bug fix guaranteed seamless onboarding and instant recommendation delivery for every new user."

---

## 📋 Quick Cheat Sheet for Follow-Up Questions

If the interviewer drills down into specifics, use these targeted talking points:

### 1. ML & Data Pipeline Testing
* **Data Bijectivity:** Validated 1-to-1 forward and inverse mapping between raw MovieLens IDs and contiguous tensor indices (`raw_to_index` $\leftrightarrow$ `index_to_raw`).
* **NeuMF Architecture:** Tested both GMF and MLP embedding paths, linear projections, and verified that sigmoid activation ensures output bounds $\in [0, 1]$.
* **Gradient Backpropagation:** Tested binary cross-entropy loss backward pass to ensure no vanishing or exploding gradients across all trainable parameters.

### 2. Recommendation Engine & Ranking
* **Monotonic Top-$N$ Ordering:** Tested that returned recommendations strictly satisfy $S_1 \ge S_2 \ge \dots \ge S_k$.
* **History Exclusion:** Tested that movies previously rated or watched by the user during training are excluded from candidate pools.
* **Fuzzy & Case-Insensitive Search:** Tested movie catalog search against exact titles, substrings, and varying casing (e.g. `"tOy stOrY"`).

### 3. Auth, Security & API
* **Bcrypt & JWT:** Tested password hashing format (`$2b$`), the bcrypt 72-byte password safety boundary, and validated that tampered or expired JWT signatures return 401 Unauthorized.
* **HTTP & Schema Validation:** Tested FastAPI route responses (200, 400, 401, 404, 422) for missing parameters, malformed emails, and unauthenticated requests.

### 4. The "Star" Debugging Story (393 Gap IDs)
* **What Happened:** MovieLens 25M has 162,148 users, but max ID is 162,541. 393 IDs were pruned in the original benchmark.
* **Why it matters:** A naive `range(min_id, max_id + 1)` occasionally assigned an orphaned ID to new users.
* **The Fix:** Rewrote the allocator to sample directly from `ModelService._user2idx.keys()`, completely eliminating onboarding 404 errors.

