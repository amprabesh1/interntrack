import requests
import psycopg2
import re
import base64
from dotenv import load_dotenv
import os

load_dotenv()

INTERNSHIP_REPOS = [
    ("speedyapply", "2026-SWE-College-Jobs"),
    ("speedyapply", "2026-AI-College-Jobs"),
]

def get_db_connection():
    return psycopg2.connect(os.getenv("DATABASE_URL"))

def fetch_readme(owner, repo):
    token = os.getenv("GITHUB_TOKEN")
    headers = {"Authorization": f"token {token}"}
    url = f"https://api.github.com/repos/{owner}/{repo}/readme"
    response = requests.get(url, headers=headers)
    if response.status_code != 200:
        print(f"Could not fetch {owner}/{repo}")
        return None
    content = response.json().get("content", "")
    return base64.b64decode(content).decode("utf-8")

def parse_jobs(readme, source_repo):
    jobs = []
    lines = readme.split("\n")
    for line in lines:
        if "|" not in line:
            continue
        cols = [c.strip() for c in line.split("|")]
        cols = [c for c in cols if c]
        if len(cols) < 3:
            continue

        company_match = re.search(r'<strong>(.*?)</strong>', cols[0])
        if not company_match:
            continue
        company = company_match.group(1).strip()

        role = cols[1].strip()
        location = cols[2].strip() if len(cols) > 2 else ""

        apply_url = ""
        all_urls = re.findall(r'href="(https?://[^"]+)"', line)
        for url in all_urls:
            if "jobright.ai" not in url and "speedyapply.com" not in url and "imgur.com" not in url and "github.com" not in url:
                if len(url) > len(apply_url):
                    apply_url = url

        if company and role and role not in ["Position", "---", "-----"]:
            jobs.append({
                "company": company,
                "role": role,
                "location": location,
                "apply_url": apply_url,
                "source_repo": source_repo
            })
    return jobs

def categorize_role(role):
    role_lower = role.lower()
    if any(k in role_lower for k in ["data engineer", "data pipeline", "etl", "dbt", "airflow"]):
        return "Data Engineering"
    elif any(k in role_lower for k in ["data analyst", "data analysis", "business analyst", "analytics"]):
        return "Data Analytics"
    elif any(k in role_lower for k in ["machine learning", "ml ", "ai ", "artificial intelligence", "deep learning", "nlp"]):
        return "AI/ML"
    elif any(k in role_lower for k in ["data scientist", "data science"]):
        return "Data Science"
    elif any(k in role_lower for k in ["software engineer", "software developer", "swe", "backend", "frontend", "full stack"]):
        return "Software Engineering"
    else:
        return "Other"

def save_jobs(jobs):
    conn = get_db_connection()
    cur = conn.cursor()
    count = 0
    for job in jobs:
        category = categorize_role(job["role"])
        cur.execute("""
            INSERT INTO job_postings (company, role, location, apply_url, source_repo, category)
            VALUES (%s, %s, %s, %s, %s, %s)
            ON CONFLICT DO NOTHING
        """, (job["company"], job["role"], job["location"], job["apply_url"], job["source_repo"], category))
        count += 1
    conn.commit()
    cur.close()
    conn.close()
    print(f"Saved {count} job postings.")

if __name__ == "__main__":
    for owner, repo in INTERNSHIP_REPOS:
        print(f"Fetching {owner}/{repo}...")
        readme = fetch_readme(owner, repo)
        if readme:
            jobs = parse_jobs(readme, f"{owner}/{repo}")
            save_jobs(jobs)