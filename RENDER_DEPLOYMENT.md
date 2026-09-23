# Deployment Guide: Hosting MedLeave Portal on Render

This guide walks you through the step-by-step process of deploying the **MedLeave Portal** on Render. Since this is a monorepo consisting of a Node.js/Express backend and a Next.js frontend, we will host them as separate, interconnected services.

---

## Architecture Overview

```mermaid
graph TD
    User([User's Browser]) -->|HTTPS| Frontend[Render Web Service: Next.js Frontend]
    Frontend -->|API Requests| Backend[Render Web Service: Express Backend]
    Backend -->|Database Queries| DB[(Render PostgreSQL Managed Database)]
    Backend -->|OCR & Analysis| OpenAI[OpenAI API / Mock]
    Backend -->|File Uploads| Cloudinary[Cloudinary / Mock]
```

To host the complete portal, you will set up **three resources** on Render:
1. **Render PostgreSQL**: A managed database service.
2. **Backend Web Service**: A Node.js web service running the Express API.
3. **Frontend Web Service**: A Node.js web service running the Next.js frontend.

---

## Step 1: Push Changes to GitHub

I have already updated your database configuration to use PostgreSQL and removed the SQLite-specific migration files. 
Commit and push these changes to your GitHub repository:

```bash
git add .
git commit -m "Configure database for PostgreSQL and Render deployment"
git push origin main
```

---

## Step 2: Set Up Render PostgreSQL

1. Log in to your [Render Dashboard](https://dashboard.render.com/).
2. Click **New** (top right) and select **PostgreSQL**.
3. Configure the database details:
   - **Name**: `medleave-db`
   - **Database Name**: `medleave`
   - **User**: (leave default or set custom)
   - **Region**: Choose the region closest to your users.
   - **Instance Type**: Select **Free** (or your preferred tier).
4. Click **Create Database**.
5. Once created, copy the **Internal Database URL** (we will use this for the backend service).

---

## Step 3: Deploy the Express Backend

Deploy the Express backend as a **Web Service** on Render.

1. Click **New** -> **Web Service**.
2. Connect your GitHub repository.
3. Configure the service:
   - **Name**: `medleave-backend`
   - **Region**: (Same region as your database)
   - **Branch**: `main` (or your active branch)
   - **Root Directory**: `backend` (This points Render directly to your backend folder)
   - **Runtime**: `Node`
4. Set the build and start commands:
   - **Build Command**: 
     ```bash
     npm install --production=false && npx prisma generate && npm run build
     ```
   - **Start Command**: 
     ```bash
     npx prisma db push && npx prisma db seed && npm start
     ```
     *(Note: Adding `npx prisma db seed` here automatically creates and seeds your database tables for free every time Render deploys).*

### Environment Variables
Click **Advanced** or navigate to **Environment** in the sidebar, and add the following keys:

| Key | Value | Description |
| :--- | :--- | :--- |
| `DATABASE_URL` | `postgresql://medleave_gtv1_user:QUtqhkbJMMdlp1guSX6aQIg1q9pFG4jj@dpg-dape64psrm7s73f5s8m0-a/medleave_gtv1` | **Internal Database URL** (used for services hosted on Render for private, fast connection). |
| `PORT` | `10000` | Render's default port. |
| `NODE_ENV` | `production` | Enables production mode. |
| `JWT_SECRET` | *[Create a random secret string]* | Secret key for signing authorization tokens. |
| `JWT_EXPIRES_IN` | `7d` | Expiration limit for user tokens. |
| `OPENAI_API_KEY` | `mock` or *[Your actual OpenAI API Key]* | Use `mock` to run without API charges, or enter your key for real vision OCR. |
| `CLOUDINARY_CLOUD_NAME` | `mock` or *[Your Cloudinary Cloud Name]* | Use `mock` to save uploads locally (ephemeral), or provide details for persistent cloud storage. |
| `CLOUDINARY_API_KEY` | `mock` or *[Your Cloudinary API Key]* | Cloudinary auth key (required if name is not `mock`). |
| `CLOUDINARY_API_SECRET`| `mock` or *[Your Cloudinary API Secret]*| Cloudinary private secret (required if name is not `mock`). |

5. Click **Create Web Service**.
6. Once deployed, note down the backend's public URL (e.g., `https://medleave-backend.onrender.com`).

### Seeding the Database (2 Free Methods)
Since Render's interactive Shell requires a paid plan, choose one of these **100% free** options to populate your database with test accounts (e.g. `student@juit.ac.in`, `doctor@juit.ac.in` with password `password123`):

#### Method 1: Automatic seeding on Render Start Command (Easiest)
In your Render Backend Web Service settings, set the **Start Command** to:
```bash
npx prisma db push && npx prisma db seed && npm start
```
Every time Render builds and starts your web service, it automatically seeds the database.

#### Method 2: Seed directly from your local terminal
Because your local `.env` file uses the **External Database URL**, you can seed the live Render database directly from your local computer for free:
```bash
cd backend
npx prisma db seed
```

---

## Step 4: Deploy the Next.js Frontend

Next.js 15 apps containing dynamic routing and client-side page transitions are deployed as a Node-based **Web Service**.

1. Click **New** -> **Web Service**.
2. Connect the same GitHub repository.
3. Configure the service:
   - **Name**: `medleave-frontend`
   - **Region**: (Same region as the backend)
   - **Branch**: `main` (or your active branch)
   - **Root Directory**: `frontend`
   - **Runtime**: `Node`
4. Set the build and start commands:
   - **Build Command**: 
     ```bash
     npm install --production=false --legacy-peer-deps && npm run build
     ```
   - **Start Command**: 
     ```bash
     npm start
     ```

### Environment Variables
Navigate to the **Environment** tab and add the following keys:

| Key | Value | Description |
| :--- | :--- | :--- |
| `NEXT_PUBLIC_API_URL` | `https://medleave-backend.onrender.com/api` | **CRITICAL**: The URL of your deployed backend (replace with your actual backend URL). |
| `NODE_ENV` | `production` | Optimized production bundle. |

5. Click **Create Web Service**.
6. Once deployed, Render will provide a public URL for your frontend (e.g., `https://medleave-frontend.onrender.com`). You can visit this URL to access the MedLeave Portal!
