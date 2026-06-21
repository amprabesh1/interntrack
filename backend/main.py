from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import psycopg2
import os
from dotenv import load_dotenv

load_dotenv()

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

def get_db_connection():
    return psycopg2.connect(
        host=os.getenv("DB_HOST"),
        port=os.getenv("DB_PORT"),
        dbname=os.getenv("DB_NAME"),
        user=os.getenv("DB_USER"),
        password=os.getenv("DB_PASSWORD")
    )

@app.get("/jobs")
def get_jobs(category: str = None):
    conn = get_db_connection()
    cur = conn.cursor()
    if category and category != "All":
        cur.execute("""
            SELECT company, role, location, apply_url, source_repo, category, posted_at
            FROM job_postings
            WHERE category = %s
            ORDER BY posted_at DESC
        """, (category,))
    else:
        cur.execute("""
            SELECT company, role, location, apply_url, source_repo, category, posted_at
            FROM job_postings
            ORDER BY posted_at DESC
        """)
    rows = cur.fetchall()
    cur.close()
    conn.close()
    return [
        {
            "company": r[0],
            "role": r[1],
            "location": r[2],
            "apply_url": r[3],
            "source_repo": r[4],
            "category": r[5],
            "posted_at": str(r[6])
        }
        for r in rows
    ]

@app.post("/subscribe")
def subscribe(email: str):
    conn = get_db_connection()
    cur = conn.cursor()
    try:
        cur.execute("INSERT INTO users (email) VALUES (%s)", (email,))
        conn.commit()
        return {"message": "Subscribed successfully"}
    except:
        conn.rollback()
        return {"message": "Email already subscribed"}
    finally:
        cur.close()
        conn.close()

@app.get("/stats")
def get_stats():
    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute("SELECT COUNT(*) FROM job_postings")
    total = cur.fetchone()[0]
    cur.execute("SELECT COUNT(DISTINCT company) FROM job_postings")
    companies = cur.fetchone()[0]
    cur.execute("SELECT COUNT(*) FROM users")
    subscribers = cur.fetchone()[0]
    cur.execute("SELECT category, COUNT(*) FROM job_postings GROUP BY category ORDER BY COUNT(*) DESC")
    categories = {row[0]: row[1] for row in cur.fetchall()}
    cur.close()
    conn.close()
    return {
        "total_jobs": total,
        "companies": companies,
        "subscribers": subscribers,
        "by_category": categories
    }