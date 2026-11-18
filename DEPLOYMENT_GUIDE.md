# 🚀 CineMatch Deployment Guide: Render (Backend + PostgreSQL) & Netlify (Frontend)

This guide provides the exact step-by-step instructions to deploy your complete Movie Recommendation system using:
* **PostgreSQL:** Render Managed PostgreSQL (Free Tier)
* **Backend API:** Render Web Service (FastAPI + PyTorch)
* **Frontend Client:** Netlify (React 19 + Vite)

---

## 📋 Pre-Deployment Checklist

Before pushing to GitHub:
1. **Secrets are safe:** Your `.gitignore` is configured to prevent committing any `.env` files.
2. **Model weight is included:** `neumf_best.pth` (53 MB) is whitelisted so Render can load the trained PyTorch model.
3. **SPA Routing is configured:** `Frontend/public/_redirects` and `Frontend/netlify.toml` are created to prevent 404 errors on page refresh in Netlify.

---

## 🗄️ Step 1: Create PostgreSQL Database on Render

1. Log into your [Render Dashboard](https://dashboard.render.com/).
2. Click **New +** and select **PostgreSQL**.
3. Fill in the database details:
   * **Name:** `cinematch-db`
   * **Database:** `movie_recommender`
   * **User:** `postgres`
   * **Region:** Choose a region close to you (e.g. *Frankfurt* or *Oregon*).
   * **Plan:** **Free**
4. Click **Create Database**.
5. Once provisioned (takes ~1 minute), scroll down to the **Connections** section:
   * Copy the **Internal Database URL** (e.g., `postgresql://postgres:...@dpg-...-a/movie_recommender`).  
     *(Note: If deploying backend outside Render, copy the External Database URL instead).*

---

## 🐍 Step 2: Deploy Backend Web Service on Render

1. In your Render Dashboard, click **New +** and select **Web Service**.
2. Connect your GitHub repository.
3. Configure the Web Service settings:
   * **Name:** `cinematch-api`
   * **Region:** Select the **same region** as your PostgreSQL database.
   * **Root Directory:** `backend`
   * **Runtime:** **Python 3**
   * **Build Command:**
     ```bash
     pip install -r requirements.txt
     ```
   * **Start Command:**
     ```bash
     uvicorn app.main:app --host 0.0.0.0 --port $PORT
     ```
   * **Plan:** **Free**

4. Scroll down to **Environment Variables** and add the following:

   | Key | Value | Notes |
   | :--- | :--- | :--- |
   | `DATABASE_URL` | *(Paste Internal Database URL from Step 1)* | Standard `postgresql://` is auto-converted to asyncpg by our config sanitizer |
   | `SECRET_KEY` | *(Enter any random 32+ character string)* | Used for JWT signing |
   | `ACCESS_TOKEN_EXPIRE_DAYS` | `7` | Keeps user logged in for 1 week |
   | `CORS_ORIGINS` | `*` | Allows initial connection; you can restrict this to your Netlify URL in Step 4 |
   | `MODEL_ARTIFACTS_DIR` | `./model_artifacts` | Points to trained weights and vocabulary maps |
   | `ENVIRONMENT` | `production` | Production mode |
   | `ADMIN_PASSWORD` | `12345qwe` | Administrator benchmark access password |

5. Click **Create Web Service**.
6. Render will install dependencies and start the API. When deployment completes, Render will provide your public backend URL:
   * Example: **`https://cinematch-api.onrender.com`**
   * Verify it by opening `https://cinematch-api.onrender.com/api/health` in your browser (should return `{"status": "healthy", "model_loaded": true}`).

---

## ⚡ Step 3: Deploy Frontend on Netlify

1. Log into your [Netlify Dashboard](https://app.netlify.com/).
2. Click **Add new site** -> **Import an existing project**.
3. Select **GitHub** and choose your repository.
4. Configure the build settings:
   * **Base directory:** `Frontend`
   * **Build command:** `npm run build`
   * **Publish directory:** `Frontend/dist` (or `dist` if base is `Frontend`)
5. Click **Add environment variables** and add:

   | Key | Value |
   | :--- | :--- |
   | `VITE_API_BASE_URL` | `https://cinematch-api.onrender.com` *(Your Render backend URL from Step 2)* |

6. Click **Deploy cinematch**.
7. Netlify will build and deploy the React 19 app in ~1-2 minutes.
   * Netlify will give you a live URL, e.g. **`https://cinematch-movies.netlify.app`**.

---

## 🔒 Step 4: Secure CORS (Optional but Recommended)

Now that you have your live Netlify frontend URL:
1. Go back to your **Render Web Service** (`cinematch-api`) -> **Environment**.
2. Update `CORS_ORIGINS`:
   * Set `CORS_ORIGINS` to: `https://cinematch-movies.netlify.app`
3. Save changes. Render will automatically redeploy with the restricted CORS policy.

---

## 🛠️ Summary of Architecture

```
[ User Browser ]
       │
       ▼ HTTPS
[ Netlify CDN ] ─────────► Serves React 19 SPA (Vite / Tailwind)
       │
       ▼ REST API (JWT Bearer Token)
[ Render Web Service ] ──► FastAPI + PyTorch NeuMF (Port dynamically assigned by Render)
       │
       ▼ Internal Network (Private VPC)
[ Render PostgreSQL ] ───► Stores Users, Auth credentials, and Real-time Likes/Dislikes
```
