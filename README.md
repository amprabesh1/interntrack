# InternTrack

Live internship and new-grad job listings scraped daily from GitHub, stored in PostgreSQL, served via FastAPI, and displayed on a React frontend with SendGrid email alerts.

**Frontend:** https://interntrackpa.vercel.app  
**API:** https://interntrack123.vercel.app

---

## What It Does

InternTrack pulls job listings from curated GitHub repositories (like [speedyapply/2026-SWE-College-Jobs](https://github.com/speedyapply/2026-SWE-College-Jobs)) that aggregate internship postings in structured README tables. It parses those tables, categorizes each role, stores them in Supabase, and exposes them through a REST API.

Users can browse and filter listings by category (Software Engineering, AI/ML, Data Science, etc.), search by company or role, and subscribe with their email to receive daily digests. A confirmation email is sent immediately on signup.

---

## Architecture

```
GitHub README tables
        │
        ▼
scraper/fetch_jobs.py
        │  parses + categorizes roles
        ▼
Supabase (PostgreSQL)
        │
   ┌────┴────────────────────┐
   ▼                         ▼
backend/main.py         scraper/send_alerts.py
FastAPI on Vercel       daily digest via SendGrid
   │
   ▼
frontend/src/App.js
React on Vercel
```

---

## Tech Stack

| Layer        | Technology                        |
|--------------|-----------------------------------|
| Scraping     | Python, `requests`, GitHub API    |
| Database     | PostgreSQL (Supabase)             |
| Backend      | FastAPI, `psycopg2`               |
| Frontend     | React (Create React App)          |
| Email        | SendGrid                          |
| Deployment   | Vercel (backend + frontend)       |

---

## Project Structure

```
interntrack/
├── api/
│   └── index.py              # Vercel serverless entrypoint — imports FastAPI app
├── backend/
│   └── main.py               # FastAPI routes: /jobs /stats /subscribe
├── dashboard/
│   └── app.py                # Streamlit dashboard for local exploration
├── database/
│   └── schema.sql            # Table definitions for repos, job_postings, users
├── frontend/
│   └── src/
│       └── App.js            # React job board with filters, search, subscribe
├── ingestion/
│   └── fetch_repos.py        # Scrapes trending GitHub repos (separate pipeline)
├── scraper/
│   ├── fetch_jobs.py         # Parses internship listings from GitHub READMEs
│   └── send_alerts.py        # Sends daily job digest to all subscribers
├── requirements.txt
├── vercel.json               # Routes all requests to api/index.py
└── render.yaml               # Alternative Render deployment config
```

---

## How to Run Locally

**1. Install dependencies**

```bash
git clone https://github.com/amprabesh1/interntrack.git
cd interntrack
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
```

**2. Set environment variables**

Create a `.env` file in the project root:

```
DATABASE_URL=postgresql://user:password@host:5432/dbname
GITHUB_TOKEN=your_github_personal_access_token
SENDGRID_API_KEY=your_sendgrid_api_key
ALERT_FROM_EMAIL=alerts@yourdomain.com
```

**3. Create database tables**

```bash
psql $DATABASE_URL -f database/schema.sql
```

**4. Populate job listings**

```bash
python scraper/fetch_jobs.py
```

**5. Start the API**

```bash
uvicorn backend.main:app --host 0.0.0.0 --port 8000
```

**6. Start the frontend**

```bash
cd frontend
npm install
npm start
```

The app will be available at `http://localhost:3000`, calling the API at `http://localhost:8000`.

---

## API Endpoints

| Method | Path                     | Description                                              |
|--------|--------------------------|----------------------------------------------------------|
| GET    | `/jobs`                  | Returns all job listings. Filter with `?category=AI/ML`  |
| GET    | `/stats`                 | Total jobs, companies, subscribers, and counts by category |
| POST   | `/subscribe?email=`      | Saves email and sends a SendGrid confirmation email       |

---

## Automation

Run the scraper and alert scripts on a daily schedule to keep listings fresh and notify subscribers.

**Cron (8:00 AM UTC daily):**

```bash
0 8 * * * cd /path/to/interntrack && .venv/bin/python scraper/fetch_jobs.py
5 8 * * * cd /path/to/interntrack && .venv/bin/python scraper/send_alerts.py
```

`fetch_jobs.py` pulls the latest listings from GitHub and upserts them into the database. `send_alerts.py` queries for jobs posted in the last 24 hours and emails every subscriber a formatted digest. If no new jobs were posted or there are no subscribers, it exits cleanly without sending.

---

## Deployment

**Backend on Vercel**

1. Import the repo at vercel.com
2. Leave root directory as `/`
3. Add environment variables: `DATABASE_URL`, `SENDGRID_API_KEY`, `ALERT_FROM_EMAIL`

Vercel picks up `vercel.json` automatically and routes all requests through `api/index.py`.

**Frontend on Vercel**

Import the same repo as a second Vercel project and set the **Root Directory** to `frontend`. No environment variables needed.
