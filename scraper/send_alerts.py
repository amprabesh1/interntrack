import psycopg2
import os
from dotenv import load_dotenv
from sendgrid import SendGridAPIClient
from sendgrid.helpers.mail import Mail
from datetime import datetime, timedelta

load_dotenv()

def get_db_connection():
    return psycopg2.connect(os.getenv("DATABASE_URL"))

def get_new_jobs():
    conn = get_db_connection()
    cur = conn.cursor()
    since = datetime.now() - timedelta(hours=24)
    cur.execute("""
        SELECT company, role, location, apply_url, category
        FROM job_postings
        WHERE posted_at >= %s
        ORDER BY category, company
    """, (since,))
    jobs = cur.fetchall()
    cur.close()
    conn.close()
    return jobs

def get_subscribers():
    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute("SELECT email FROM users")
    emails = [row[0] for row in cur.fetchall()]
    cur.close()
    conn.close()
    return emails

def build_email_html(jobs):
    rows = ""
    for job in jobs:
        company, role, location, apply_url, category = job
        apply_btn = f'<a href="{apply_url}" style="background:#1e40af;color:white;padding:6px 14px;border-radius:6px;text-decoration:none;font-size:13px;">Apply</a>' if apply_url else ""
        rows += f"""
        <tr>
            <td style="padding:12px;border-bottom:1px solid #f1f5f9;">
                <strong>{company}</strong><br>
                <span style="color:#475569;font-size:13px;">{role}</span><br>
                <span style="color:#94a3b8;font-size:12px;">📍 {location}</span>
            </td>
            <td style="padding:12px;border-bottom:1px solid #f1f5f9;color:#7c3aed;font-size:12px;">{category}</td>
            <td style="padding:12px;border-bottom:1px solid #f1f5f9;">{apply_btn}</td>
        </tr>
        """

    return f"""
    <div style="font-family:sans-serif;max-width:600px;margin:0 auto;">
        <div style="background:linear-gradient(135deg,#1e40af,#7c3aed);padding:30px;text-align:center;border-radius:12px 12px 0 0;">
            <h1 style="color:white;margin:0;font-size:24px;">🎯 InternTrack</h1>
            <p style="color:rgba(255,255,255,0.85);margin:8px 0 0;font-size:14px;">{len(jobs)} new internship listings today</p>
        </div>
        <div style="background:white;padding:24px;border-radius:0 0 12px 12px;border:1px solid #e2e8f0;">
            <table width="100%" cellpadding="0" cellspacing="0">
                <thead>
                    <tr style="background:#f8fafc;">
                        <th style="padding:10px 12px;text-align:left;font-size:12px;color:#64748b;">COMPANY & ROLE</th>
                        <th style="padding:10px 12px;text-align:left;font-size:12px;color:#64748b;">CATEGORY</th>
                        <th style="padding:10px 12px;text-align:left;font-size:12px;color:#64748b;">LINK</th>
                    </tr>
                </thead>
                <tbody>{rows}</tbody>
            </table>
            <p style="color:#94a3b8;font-size:12px;margin-top:24px;text-align:center;">
                You're receiving this because you subscribed to InternTrack alerts.
            </p>
        </div>
    </div>
    """

def send_alerts():
    jobs = get_new_jobs()
    if not jobs:
        print("No new jobs in the last 24 hours.")
        return

    subscribers = get_subscribers()
    if not subscribers:
        print("No subscribers yet.")
        return

    html = build_email_html(jobs)
    sg = SendGridAPIClient(os.getenv("SENDGRID_API_KEY"))

    for email in subscribers:
        message = Mail(
            from_email=os.getenv("ALERT_FROM_EMAIL"),
            to_emails=email,
            subject=f"🎯 InternTrack — {len(jobs)} new internships today",
            html_content=html
        )
        sg.send(message)
        print(f"Sent to {email}")

    print(f"Alerts sent to {len(subscribers)} subscribers.")

if __name__ == "__main__":
    send_alerts()