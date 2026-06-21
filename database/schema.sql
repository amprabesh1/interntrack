CREATE TABLE IF NOT EXISTS repos (
    id          SERIAL PRIMARY KEY,
    repo_name   TEXT NOT NULL,
    owner       TEXT NOT NULL,
    description TEXT,
    language    TEXT,
    stars       INTEGER,
    forks       INTEGER,
    url         TEXT,
    fetched_at  TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS repo_snapshots (
    id            SERIAL PRIMARY KEY,
    repo_name     TEXT NOT NULL,
    owner         TEXT NOT NULL,
    stars         INTEGER,
    forks         INTEGER,
    snapshot_date DATE DEFAULT CURRENT_DATE
);

CREATE TABLE IF NOT EXISTS job_postings (
    id            SERIAL PRIMARY KEY,
    company       TEXT NOT NULL,
    role          TEXT NOT NULL,
    location      TEXT,
    apply_url     TEXT,
    source_repo   TEXT,
    posted_at     TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS users (
    id         SERIAL PRIMARY KEY,
    email      TEXT UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);