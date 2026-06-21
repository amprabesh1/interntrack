# InternTrack

A full-stack data engineering project that scrapes internship and new-grad job listings from GitHub daily, stores them in PostgreSQL, serves them through a FastAPI backend, and displays them on a React frontend with email alerts for subscribers.

**Live:** [interntrackpa.vercel.app](https://interntrackpa.vercel.app) · **API:** [interntrack123.vercel.app](https://interntrack123.vercel.app)

---

## What It Does

- Scrapes structured job listings from curated GitHub repos (e.g. [speedyapply/2026-SWE-College-Jobs](https://github.com/speedyapply/2026-SWE-College-Jobs)) by parsing their README tables
- Categorizes roles automatically into Software Engineering, AI/ML, Data Science, Data Analytics, Data Engineering, and Other
- Stores listings in a Supabase PostgreSQL database
- Serves jobs, stats, and subscriptions via a FastAPI REST API deployed on Vercel
- Displays a searchable, filterable job board on a React frontend
- Sends daily digest emails to all subscribers via SendGrid
- Sends a confirmation email immediately when a new user subscribes

---

## Architecture

```
GitHub READMEs
      │
      ▼
scraper/fetch_jobs.py   ──► Supabase (PostgreSQL)
                                    │
                         ┌──────────┴──────────┐
                         ▼                     ▼
               backend/main.py          scraper/send_alerts.py
               (FastAPI on Vercel)      (daily digest via SendGrid)
                         │
                         ▼
               frontend/src/App.js
               (React on Vercel)
```

---

## Tech Stack

| Layer | Technology |
|---|---|
| Scraping | Python, `requests`, GitHub API |
| Database | PostgreSQL via Supabase |
| Backend | FastAPI, `psycopg2`, deployed on Vercel |
| Frontend | React (Create React App), deployed on Vercel |
| Email | SendGrid |
| Infra | Vercel (serverless), Render (alternative config included) |

---

## Project Structure

```
interntrack/
├── api/
│   └── index.py              # Vercel serverless entrypoint (imports FastAPI app)
├── backend/
│   └── main.py               # FastAPI app — /jobs, /stats, /subscribe
├── dashboard/
│   └── app.py                # Streamlit dashboard (local use)
├── database/
│   └── schema.sql            # Table definitions
├── frontend/
│   └── src/
│       └── App.js            # React job board UI
├── ingestion/
│   └── fetch_repos.py        # Scrapes trending GitHub repos (separate pipeline)
├── scraper/
│   ├── fetch_jobs.py         # Scrapes internship listings from GitHub READMEs
│   └── send_alerts.py        # Sends daily job digest to all subscribers
├── requirements.txt
├── vercel.json               # Vercel deployment config for FastAPI backend
└── render.yaml               # Render deployment config (alternative)
```

---

## Running Locally

**1. Clone and set up the environment**

```bash
git clone https://github.com/amprabesh1/interntrack.git
cd interntrack
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

**2. Configure environment variables**

Create a `.env` file in the root:

```
DATABASE_URL=postgresql://user:password@host:port/dbname
GITHUB_TOKEN=your_github_pat
SENDGRID_API_KEY=your_sendgrid_key
ALERT_FROM_EMAIL=you@yourdomain.com
```

**3. Set up the database**

```bash
psql $DATABASE_URL -f database/schema.sql
```

**4. Scrape jobs**

```bash
python scraper/fetch_jobs.py
```

**5. Run the API**

```bash
uvicorn backend.main:app --host 0.0.0.0 --port 8000
```

**6. Run the frontend**

```bash
cd frontend
npm install
npm start
```

**7. Send alerts manually**

```bash
python scraper/send_alerts.py
```

---

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/jobs` | All job listings, optionally filtered by `?category=` |
| `GET` | `/stats` | Aggregate counts — total jobs, companies, subscribers, by category |
| `POST` | `/subscribe?email=` | Subscribe an email; sends a confirmation email via SendGrid |

---

## Automation

`scraper/fetch_jobs.py` and `scraper/send_alerts.py` are designed to run on a schedule (cron or a cloud scheduler):

- **fetch_jobs.py** — run daily to pull fresh listings from GitHub
- **send_alerts.py** — run daily after the scrape; sends all subscribers a digest of jobs posted in the last 24 hours

Example cron (8am UTC daily):

```
0 8 * * * cd /path/to/interntrack && python scraper/fetch_jobs.py
5 8 * * * cd /path/to/interntrack && python scraper/send_alerts.py
```

---

## Deployment

**Backend (Vercel)**

Import the repo on Vercel, set root to `/`, and add these environment variables in Project Settings:

```
DATABASE_URL
SENDGRID_API_KEY
ALERT_FROM_EMAIL
```

**Frontend (Vercel)**

Import the same repo as a second Vercel project and set the root directory to `frontend/`.
