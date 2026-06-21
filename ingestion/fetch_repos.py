import requests
import psycopg2
from datetime import datetime
from dotenv import load_dotenv
import os

load_dotenv()

def get_db_connection():
    return psycopg2.connect(
        host=os.getenv("DB_HOST"),
        port=os.getenv("DB_PORT"),
        dbname=os.getenv("DB_NAME"),
        user=os.getenv("DB_USER"),
        password=os.getenv("DB_PASSWORD")
    )

def fetch_trending_repos():
    token = os.getenv("GITHUB_TOKEN")
    headers = {"Authorization": f"token {token}"}
    url = "https://api.github.com/search/repositories"
    params = {
        "q": "stars:>1000 created:>2024-01-01",
        "sort": "stars",
        "order": "desc",
        "per_page": 30
    }
    response = requests.get(url, headers=headers, params=params)
    return response.json()["items"]

def save_repos(repos):
    conn = get_db_connection()
    cur = conn.cursor()

    for repo in repos:
        # upsert into repos table
        cur.execute("""
            INSERT INTO repos (repo_name, owner, description, language, stars, forks, url, fetched_at)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
            ON CONFLICT DO NOTHING
        """, (
            repo["name"],
            repo["owner"]["login"],
            repo["description"],
            repo["language"],
            repo["stargazers_count"],
            repo["forks_count"],
            repo["html_url"],
            datetime.now()
        ))

        # save daily snapshot
        cur.execute("""
            INSERT INTO repo_snapshots (repo_name, owner, stars, forks, snapshot_date)
            VALUES (%s, %s, %s, %s, CURRENT_DATE)
            ON CONFLICT DO NOTHING
        """, (
            repo["name"],
            repo["owner"]["login"],
            repo["stargazers_count"],
            repo["forks_count"]
        ))

    conn.commit()
    cur.close()
    conn.close()
    print(f"Saved {len(repos)} repos and snapshots.")

if __name__ == "__main__":
    repos = fetch_trending_repos()
    save_repos(repos)