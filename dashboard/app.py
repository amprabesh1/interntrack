import streamlit as st
import psycopg2
import pandas as pd
from dotenv import load_dotenv
import os

load_dotenv()

def get_db_connection():
    return psycopg2.connect(os.getenv("DATABASE_URL"))

st.set_page_config(page_title="GitHub Trending", layout="wide", page_icon="📈")

conn = get_db_connection()
df = pd.read_sql(
    "SELECT repo_name, owner, language, stars, forks, url, fetched_at FROM repos ORDER BY stars DESC",
    conn
)
conn.close()

st.title("GitHub Trending Repos")
st.caption("Data pulled from the GitHub API and stored in PostgreSQL")
st.divider()

col1, col2, col3, col4 = st.columns(4)
col1.metric("Repos", len(df))
col2.metric("Most Stars", f"{df['stars'].max():,}")
col3.metric("Languages", df['language'].nunique())
col4.metric("Total Stars", f"{df['stars'].sum():,}")

st.divider()

left, right = st.columns([2, 1])

with left:
    st.subheader("Stars by Language")
    lang_df = df.groupby("language")["stars"].sum().sort_values(ascending=False).head(8)
    st.bar_chart(lang_df)

with right:
    st.subheader("Top Repos")
    for _, row in df.head(5).iterrows():
        st.markdown(f"**[{row['repo_name']}]({row['url']})**")
        st.caption(f"⭐ {row['stars']:,}  ·  {row['language']}  ·  @{row['owner']}")
        st.divider()

st.subheader("Star Growth Over Time")
conn2 = get_db_connection()
snapshot_df = pd.read_sql(
    "SELECT repo_name, stars, snapshot_date FROM repo_snapshots ORDER BY snapshot_date ASC",
    conn2
)
conn2.close()

if not snapshot_df.empty:
    top_repos = df["repo_name"].head(5).tolist()
    filtered = snapshot_df[snapshot_df["repo_name"].isin(top_repos)]
    pivot = filtered.pivot(index="snapshot_date", columns="repo_name", values="stars")
    st.line_chart(pivot)
else:
    st.caption("Run the ingestion script daily to see growth trends here.")

st.subheader("Full Table")
st.dataframe(
    df[["repo_name", "owner", "language", "stars", "forks"]],
    hide_index=True,
    use_container_width=True
)