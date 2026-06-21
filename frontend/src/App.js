import { useState, useEffect } from "react";

const API = "https://interntrack123.vercel.app";

const CATEGORIES = ["All", "Software Engineering", "AI/ML", "Data Science", "Data Analytics", "Data Engineering", "Other"];

const CATEGORY_COLORS = {
  "AI/ML":                { bg: "#f3e8ff", color: "#7c3aed" },
  "Data Engineering":     { bg: "#dcfce7", color: "#15803d" },
  "Data Science":         { bg: "#dbeafe", color: "#1d4ed8" },
  "Data Analytics":       { bg: "#fef3c7", color: "#b45309" },
  "Software Engineering": { bg: "#cffafe", color: "#0e7490" },
  "Other":                { bg: "#f3f4f6", color: "#4b5563" },
};

const DOMAIN_OVERRIDES = {
  "meta": "meta.com", "google": "google.com", "microsoft": "microsoft.com",
  "apple": "apple.com", "amazon": "amazon.com", "netflix": "netflix.com",
  "nvidia": "nvidia.com", "openai": "openai.com", "tesla": "tesla.com",
  "salesforce": "salesforce.com", "ibm": "ibm.com", "intel": "intel.com",
  "qualcomm": "qualcomm.com", "adobe": "adobe.com", "uber": "uber.com",
  "lyft": "lyft.com", "airbnb": "airbnb.com", "stripe": "stripe.com",
  "palantir": "palantir.com", "databricks": "databricks.com",
  "snowflake": "snowflake.com", "coinbase": "coinbase.com",
  "pinterest": "pinterest.com", "linkedin": "linkedin.com",
  "rivian": "rivian.com", "deloitte": "deloitte.com",
  "jp morgan": "jpmorgan.com", "jpmorgan": "jpmorgan.com",
  "goldman sachs": "goldmansachs.com", "morgan stanley": "morganstanley.com",
  "boeing": "boeing.com", "lockheed martin": "lockheedmartin.com",
  "raytheon": "rtx.com", "twilio": "twilio.com", "figma": "figma.com",
  "notion": "notion.so", "asana": "asana.com", "shopify": "shopify.com",
  "spotify": "spotify.com", "slack": "slack.com", "zoom": "zoom.us",
};

function getCompanyDomain(company) {
  const key = company.toLowerCase().trim();
  return DOMAIN_OVERRIDES[key] || key.replace(/[^a-z0-9]/g, "") + ".com";
}

function CompanyLogo({ company, size = 36 }) {
  const [failed, setFailed] = useState(false);
  const initials = company.split(/\s+/).map(w => w[0]).join("").slice(0, 2).toUpperCase();

  if (failed) {
    return (
      <div style={{
        width: size, height: size, borderRadius: 8, flexShrink: 0,
        background: "#ede9fe", color: "#7c3aed",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: size * 0.36, fontWeight: 700,
      }}>
        {initials}
      </div>
    );
  }

  return (
    <img
      src={`https://logo.clearbit.com/${getCompanyDomain(company)}`}
      alt={company}
      onError={() => setFailed(true)}
      style={{ width: size, height: size, borderRadius: 8, objectFit: "contain", flexShrink: 0, background: "#fff" }}
    />
  );
}

export default function App() {
  const [jobs, setJobs] = useState([]);
  const [stats, setStats] = useState({});
  const [category, setCategory] = useState("All");
  const [search, setSearch] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [bookmarks, setBookmarks] = useState(() => {
    try { return JSON.parse(localStorage.getItem("interntrack_bookmarks") || "{}"); }
    catch { return {}; }
  });

  useEffect(() => {
    setLoading(true);
    fetch(`${API}/jobs?category=${category}`)
      .then(res => res.json())
      .then(data => {
        setJobs(data);
        setLoading(false);
        const dates = data.map(j => new Date(j.posted_at)).filter(d => !isNaN(d));
        if (dates.length) setLastUpdated(new Date(Math.max(...dates)));
      });
    fetch(`${API}/stats`)
      .then(res => res.json())
      .then(data => setStats(data));
  }, [category]);

  const filtered = jobs.filter(j =>
    j.company.toLowerCase().includes(search.toLowerCase()) ||
    j.role.toLowerCase().includes(search.toLowerCase()) ||
    (j.location || "").toLowerCase().includes(search.toLowerCase())
  );

  const toggleBookmark = (job) => {
    const key = `${job.company}||${job.role}`;
    const updated = { ...bookmarks };
    if (updated[key]) delete updated[key];
    else updated[key] = true;
    setBookmarks(updated);
    localStorage.setItem("interntrack_bookmarks", JSON.stringify(updated));
  };

  const isBookmarked = (job) => !!bookmarks[`${job.company}||${job.role}`];

  const handleSubscribe = () => {
    fetch(`${API}/subscribe?email=${email}`, { method: "POST" })
      .then(res => res.json())
      .then(data => { setMessage(data.message); setEmail(""); });
  };

  const formatDate = (date) => {
    if (!date) return "—";
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
  };

  const logoCompanies = [...new Set(jobs.map(j => j.company))].slice(0, 16);

  return (
    <div style={{ fontFamily: "'Inter', system-ui, sans-serif", background: "#f8f7ff", minHeight: "100vh" }}>

      {/* Navbar */}
      <nav style={{
        background: "#1a0533", padding: "0 32px", height: 58,
        display: "flex", alignItems: "center",
        position: "sticky", top: 0, zIndex: 100,
        boxShadow: "0 2px 16px rgba(26,5,51,0.4)",
      }}>
        <span style={{ color: "white", fontWeight: 800, fontSize: 20, letterSpacing: "-0.3px" }}>
          🎯 InternTrack
        </span>
      </nav>

      {/* Hero */}
      <div style={{
        background: "linear-gradient(135deg, #1a0533 0%, #3b0764 55%, #1e3a8a 100%)",
        padding: "64px 24px 56px", textAlign: "center",
      }}>
        <h1 style={{
          color: "white", fontSize: 40, fontWeight: 800,
          margin: "0 0 16px", lineHeight: 1.2, letterSpacing: "-0.5px",
        }}>
          Track every internship.<br />Land the one that matters.
        </h1>
        <p style={{
          color: "rgba(255,255,255,0.72)", fontSize: 17,
          margin: "0 auto 36px", maxWidth: 520, lineHeight: 1.6,
        }}>
          300+ live listings pulled daily from GitHub. Save jobs, track applications, get email alerts.
        </p>

        {/* Hero search */}
        <div style={{ maxWidth: 520, margin: "0 auto 24px" }}>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by company, role, or location..."
            style={{
              width: "100%", padding: "14px 20px", borderRadius: 12, border: "none",
              fontSize: 15, boxSizing: "border-box", outline: "none",
              boxShadow: "0 4px 24px rgba(0,0,0,0.25)",
            }}
          />
        </div>

        {/* Subscribe */}
        <div style={{ display: "flex", gap: 8, maxWidth: 400, margin: "0 auto", justifyContent: "center" }}>
          <input
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="your@email.com"
            style={{
              flex: 1, padding: "11px 16px", borderRadius: 8, border: "none",
              fontSize: 14, outline: "none",
            }}
          />
          <button
            onClick={handleSubscribe}
            style={{
              padding: "11px 20px", background: "#7c3aed", color: "white",
              border: "none", borderRadius: 8, cursor: "pointer",
              fontSize: 14, fontWeight: 600, whiteSpace: "nowrap",
            }}
          >
            Get Alerts
          </button>
        </div>
        {message && <p style={{ color: "#c4b5fd", fontSize: 13, marginTop: 10 }}>{message}</p>}
      </div>

      {/* Stats row */}
      <div style={{
        background: "white", borderBottom: "1px solid #ede9fe",
        display: "flex", justifyContent: "center", gap: 56, padding: "20px 32px",
        flexWrap: "wrap",
      }}>
        {[
          { label: "Total Jobs",   value: stats.total_jobs?.toLocaleString() ?? "—" },
          { label: "Companies",    value: stats.companies?.toLocaleString()   ?? "—" },
          { label: "Subscribers",  value: stats.subscribers?.toLocaleString() ?? "—" },
          { label: "Last Updated", value: formatDate(lastUpdated) },
        ].map(s => (
          <div key={s.label} style={{ textAlign: "center" }}>
            <div style={{ fontSize: 22, fontWeight: 700, color: "#1a0533" }}>{s.value}</div>
            <div style={{ fontSize: 12, color: "#9ca3af", marginTop: 3, textTransform: "uppercase", letterSpacing: "0.5px" }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Logo strip */}
      {logoCompanies.length > 0 && (
        <div style={{
          background: "#faf9ff", borderBottom: "1px solid #ede9fe",
          padding: "14px 32px", display: "flex", alignItems: "center",
          gap: 28, overflowX: "auto",
        }}>
          <span style={{ fontSize: 10, color: "#9ca3af", whiteSpace: "nowrap", fontWeight: 600, textTransform: "uppercase", letterSpacing: "1px" }}>
            Hiring Now
          </span>
          {logoCompanies.map(company => (
            <div key={company} style={{ display: "flex", alignItems: "center", gap: 7, flexShrink: 0 }}>
              <CompanyLogo company={company} size={26} />
              <span style={{ fontSize: 13, color: "#6b7280", whiteSpace: "nowrap" }}>{company}</span>
            </div>
          ))}
        </div>
      )}

      {/* Main content */}
      <div style={{ maxWidth: 860, margin: "0 auto", padding: "28px 20px" }}>

        {/* Category filters */}
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 20 }}>
          {CATEGORIES.map(c => (
            <button
              key={c}
              onClick={() => setCategory(c)}
              style={{
                padding: "7px 16px", borderRadius: 20,
                border: `1.5px solid ${category === c ? "#7c3aed" : "#e5e7eb"}`,
                cursor: "pointer", fontSize: 13,
                fontWeight: category === c ? 600 : 400,
                background: category === c ? "#7c3aed" : "white",
                color: category === c ? "white" : "#374151",
              }}
            >{c}</button>
          ))}
        </div>

        <p style={{ color: "#6b7280", fontSize: 14, marginBottom: 16 }}>
          {loading ? "Loading listings…" : `${filtered.length} listings found`}
        </p>

        {/* Job cards */}
        {!loading && filtered.map((job, i) => {
          const chip = CATEGORY_COLORS[job.category] || CATEGORY_COLORS["Other"];
          const bookmarked = isBookmarked(job);
          return (
            <div key={i} style={{
              background: "white", border: "1px solid #ede9fe", borderRadius: 12,
              padding: "16px 20px", marginBottom: 10,
              display: "flex", alignItems: "center", gap: 14,
              boxShadow: "0 1px 4px rgba(124,58,237,0.06)",
            }}>
              <CompanyLogo company={job.company} size={44} />

              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 3 }}>
                  <span style={{ fontWeight: 700, fontSize: 15, color: "#111827" }}>{job.company}</span>
                  <span style={{
                    padding: "2px 9px", borderRadius: 20, fontSize: 11, fontWeight: 600,
                    background: chip.bg, color: chip.color,
                  }}>{job.category}</span>
                </div>
                <div style={{ color: "#374151", fontSize: 14, marginBottom: 3 }}>{job.role}</div>
                <div style={{ color: "#9ca3af", fontSize: 12 }}>📍 {job.location}</div>
              </div>

              <div style={{ display: "flex", gap: 8, alignItems: "center", flexShrink: 0 }}>
                <button
                  onClick={() => toggleBookmark(job)}
                  title={bookmarked ? "Remove bookmark" : "Save job"}
                  style={{
                    width: 36, height: 36, borderRadius: 8, cursor: "pointer",
                    border: `1.5px solid ${bookmarked ? "#c4b5fd" : "#e5e7eb"}`,
                    background: bookmarked ? "#f3e8ff" : "#f9fafb",
                    fontSize: 16, display: "flex", alignItems: "center", justifyContent: "center",
                  }}
                >{bookmarked ? "★" : "☆"}</button>
                {job.apply_url && (
                  <a
                    href={job.apply_url} target="_blank" rel="noreferrer"
                    style={{
                      background: "#7c3aed", color: "white", padding: "8px 18px",
                      borderRadius: 8, fontSize: 13, fontWeight: 600, textDecoration: "none",
                      whiteSpace: "nowrap",
                    }}
                  >Apply</a>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
