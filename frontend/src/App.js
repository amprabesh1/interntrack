import { useState, useEffect } from "react";

const CATEGORIES = ["All", "Software Engineering", "AI/ML", "Data Science", "Data Analytics", "Data Engineering", "Other"];

export default function App() {
  const [jobs, setJobs] = useState([]);
  const [stats, setStats] = useState({});
  const [category, setCategory] = useState("All");
  const [search, setSearch] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`http://127.0.0.1:8000/jobs?category=${category}`)
      .then(res => res.json())
      .then(data => { setJobs(data); setLoading(false); });
    fetch("http://127.0.0.1:8000/stats")
      .then(res => res.json())
      .then(data => setStats(data));
  }, [category]);

  const filtered = jobs.filter(j =>
    j.company.toLowerCase().includes(search.toLowerCase()) ||
    j.role.toLowerCase().includes(search.toLowerCase()) ||
    j.location.toLowerCase().includes(search.toLowerCase())
  );

  const handleSubscribe = () => {
    fetch(`http://127.0.0.1:8000/subscribe?email=${email}`, { method: "POST" })
      .then(res => res.json())
      .then(data => { setMessage(data.message); setEmail(""); });
  };

  return (
    <div style={{ fontFamily: "sans-serif", maxWidth: 1100, margin: "0 auto", padding: "20px" }}>

      {/* Header */}
      <div style={{ marginBottom: 30 }}>
        <h1 style={{ fontSize: 28, marginBottom: 4 }}>🎯 InternTrack</h1>
        <p style={{ color: "#666", margin: 0 }}>Live internship listings pulled daily from GitHub — direct company links, no middlemen</p>
      </div>

      {/* Stats */}
      <div style={{ display: "flex", gap: 16, marginBottom: 30 }}>
        {[
          { label: "Total Jobs", value: stats.total_jobs },
          { label: "Companies", value: stats.companies },
          { label: "Subscribers", value: stats.subscribers },
        ].map(s => (
          <div key={s.label} style={{ background: "#f5f5f5", borderRadius: 10, padding: "14px 24px", minWidth: 120 }}>
            <div style={{ fontSize: 22, fontWeight: "bold" }}>{s.value}</div>
            <div style={{ fontSize: 13, color: "#888" }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Subscribe */}
      <div style={{ background: "#f0f7ff", borderRadius: 10, padding: 20, marginBottom: 30 }}>
        <p style={{ margin: "0 0 10px", fontWeight: 500 }}>Get email alerts when new jobs are posted</p>
        <div style={{ display: "flex", gap: 10 }}>
          <input
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="your@email.com"
            style={{ flex: 1, padding: "8px 12px", borderRadius: 6, border: "1px solid #ccc", fontSize: 14 }}
          />
          <button
            onClick={handleSubscribe}
            style={{ padding: "8px 18px", background: "#2563eb", color: "white", border: "none", borderRadius: 6, cursor: "pointer", fontSize: 14 }}
          >
            Subscribe
          </button>
        </div>
        {message && <p style={{ margin: "8px 0 0", color: "#2563eb", fontSize: 13 }}>{message}</p>}
      </div>

      {/* Filters */}
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 16 }}>
        {CATEGORIES.map(c => (
          <button
            key={c}
            onClick={() => setCategory(c)}
            style={{
              padding: "6px 14px", borderRadius: 20, border: "1px solid #ddd", cursor: "pointer", fontSize: 13,
              background: category === c ? "#2563eb" : "white",
              color: category === c ? "white" : "#333"
            }}
          >
            {c}
          </button>
        ))}
      </div>

      {/* Search */}
      <input
        value={search}
        onChange={e => setSearch(e.target.value)}
        placeholder="Search by company, role, or location..."
        style={{ width: "100%", padding: "10px 14px", borderRadius: 8, border: "1px solid #ddd", fontSize: 14, marginBottom: 20, boxSizing: "border-box" }}
      />

      {/* Job count */}
      <p style={{ color: "#666", fontSize: 14, marginBottom: 16 }}>{filtered.length} jobs found</p>

      {/* Jobs */}
      {loading ? <p>Loading...</p> : filtered.map((job, i) => (
        <div key={i} style={{ background: "white", border: "1px solid #eee", borderRadius: 10, padding: 18, marginBottom: 12 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div>
              <div style={{ fontWeight: 600, fontSize: 16 }}>{job.company}</div>
              <div style={{ color: "#333", margin: "4px 0" }}>{job.role}</div>
              <div style={{ color: "#888", fontSize: 13 }}>{job.location}</div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 8 }}>
              <span style={{ background: "#f0f7ff", color: "#2563eb", padding: "3px 10px", borderRadius: 12, fontSize: 12 }}>
                {job.category}
              </span>
              {job.apply_url && (
                <a href={job.apply_url} target="_blank" rel="noreferrer"
                  style={{ background: "#2563eb", color: "white", padding: "6px 14px", borderRadius: 6, fontSize: 13, textDecoration: "none" }}>
                  Apply
                </a>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}