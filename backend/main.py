from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import psycopg2
import os
from dotenv import load_dotenv
from sendgrid import SendGridAPIClient
from sendgrid.helpers.mail import Mail

load_dotenv()

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

def get_db_connection():
    return psycopg2.connect(os.getenv("DATABASE_URL"))

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

def send_confirmation_email(email: str):
    sg = SendGridAPIClient(os.getenv("SENDGRID_API_KEY"))
    message = Mail(
        from_email=os.getenv("ALERT_FROM_EMAIL"),
        to_emails=email,
        subject="🎯 You're subscribed to InternTrack",
        html_content="""
        <div style="font-family:sans-serif;max-width:600px;margin:0 auto;">
            <div style="background:linear-gradient(135deg,#1e40af,#7c3aed);padding:30px;text-align:center;border-radius:12px 12px 0 0;">
                <h1 style="color:white;margin:0;font-size:24px;">🎯 InternTrack</h1>
            </div>
            <div style="background:white;padding:24px;border-radius:0 0 12px 12px;border:1px solid #e2e8f0;">
                <h2 style="margin-top:0;">You're in!</h2>
                <p>Thanks for subscribing. You'll receive daily emails whenever new internship listings are posted.</p>
                <p style="color:#94a3b8;font-size:12px;margin-top:24px;">
                    You're receiving this because you subscribed to InternTrack alerts.
                </p>
            </div>
        </div>
        """
    )
    sg.send(message)

@app.post("/subscribe")
def subscribe(email: str):
    conn = get_db_connection()
    cur = conn.cursor()
    try:
        cur.execute("INSERT INTO users (email) VALUES (%s)", (email,))
        conn.commit()
        send_confirmation_email(email)
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