import { useState, useEffect } from "react";
import { CompanyLogo, CATEGORY_COLORS, getBookmarks, saveBookmarks, getApplications, saveApplications } from "../components/shared";

const API = "https://interntrack123.vercel.app";
const CATEGORIES = ["All", "Software Engineering", "AI/ML", "Data Science", "Data Analytics", "Data Engineering", "Other"];

export default function Browse() {
  const [jobs, setJobs] = useState([]);
  const [stats, setStats] = useState({});
  const [category, setCategory] = useState("All");
  const [search, setSearch] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [bookmarks, setBookmarksState] = useState(getBookmarks);
  const [promptJob, setPromptJob] = useState(null);

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

  const toggleBookmark = (job) => {
    const key = `${job.company}||${job.role}`;
    const updated = { ...bookmarks };
    if (updated[key]) delete updated[key];
    else updated[key] = job;
    setBookmarksState(updated);
    saveBookmarks(updated);
  };

  const isBookmarked = (job) => !!bookmarks[`${job.company}||${job.role}`];

  const isTracked = (job) => {
    const apps = getApplications();
    return apps.some(a => a.company === job.company && a.role === job.role);
  };

  const handleApply = (job) => {
    window.open(job.apply_url, "_blank", "noreferrer");
    if (!isTracked(job)) setPromptJob(job);
  };

  const logApplication = (job) => {
    const apps = getApplications();
    saveApplications([...apps, {
      id: Date.now(),
      company: job.company,
      role: job.role,
      location: job.location || "",
      source: "Company Site",
      dateApplied: new Date().toISOString().split("T")[0],
      status: "Applied",
      jobUrl: job.apply_url || "",
      category: job.category || "Other",
      notes: "",
    }]);
    setPromptJob(null);
  };

  const filtered = jobs.filter(j =>
    j.company.toLowerCase().includes(search.toLowerCase()) ||
    j.role.toLowerCase().includes(search.toLowerCase()) ||
    (j.location || "").toLowerCase().includes(search.toLowerCase())
  );

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
    <div>
      {/* Hero */}
      <div style={{
        background: "linear-gradient(135deg, #1a0533 0%, #3b0764 55%, #1e3a8a 100%)",
        padding: "64px 24px 56px", textAlign: "center",
      }}>
        <h1 style={{ color: "white", fontSize: 40, fontWeight: 800, margin: "0 0 16px", lineHeight: 1.2, letterSpacing: "-0.5px" }}>
          Track every internship.<br />Land the one that matters.
        </h1>
        <p style={{ color: "rgba(255,255,255,0.72)", fontSize: 17, margin: "0 auto 36px", maxWidth: 520, lineHeight: 1.6 }}>
          300+ live listings pulled daily from GitHub. Save jobs, track applications, get email alerts.
        </p>
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
        <div style={{ display: "flex", gap: 8, maxWidth: 400, margin: "0 auto", justifyContent: "center" }}>
          <input
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="your@email.com"
            style={{ flex: 1, padding: "11px 16px", borderRadius: 8, border: "none", fontSize: 14, outline: "none" }}
          />
          <button
            onClick={handleSubscribe}
            style={{ padding: "11px 20px", background: "#7c3aed", color: "white", border: "none", borderRadius: 8, cursor: "pointer", fontSize: 14, fontWeight: 600, whiteSpace: "nowrap" }}
          >Get Alerts</button>
        </div>
        {message && <p style={{ color: "#c4b5fd", fontSize: 13, marginTop: 10 }}>{message}</p>}
      </div>

      {/* Stats row */}
      <div style={{ background: "white", borderBottom: "1px solid #ede9fe", display: "flex", justifyContent: "center", gap: 56, padding: "20px 32px", flexWrap: "wrap" }}>
        {[
          { label: "Total Jobs",   value: stats.total_jobs?.toLocaleString()  ?? "—" },
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
        <div style={{ background: "#faf9ff", borderBottom: "1px solid #ede9fe", padding: "14px 32px", display: "flex", alignItems: "center", gap: 28, overflowX: "auto" }}>
          <span style={{ fontSize: 10, color: "#9ca3af", whiteSpace: "nowrap", fontWeight: 600, textTransform: "uppercase", letterSpacing: "1px" }}>Hiring Now</span>
          {logoCompanies.map(company => (
            <div key={company} style={{ display: "flex", alignItems: "center", gap: 7, flexShrink: 0 }}>
              <CompanyLogo company={company} size={26} />
              <span style={{ fontSize: 13, color: "#6b7280", whiteSpace: "nowrap" }}>{company}</span>
            </div>
          ))}
        </div>
      )}

      {/* Listings */}
      <div style={{ maxWidth: 860, margin: "0 auto", padding: "28px 20px" }}>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 20 }}>
          {CATEGORIES.map(c => (
            <button key={c} onClick={() => setCategory(c)} style={{
              padding: "7px 16px", borderRadius: 20,
              border: `1.5px solid ${category === c ? "#7c3aed" : "#e5e7eb"}`,
              cursor: "pointer", fontSize: 13,
              fontWeight: category === c ? 600 : 400,
              background: category === c ? "#7c3aed" : "white",
              color: category === c ? "white" : "#374151",
            }}>{c}</button>
          ))}
        </div>

        <p style={{ color: "#6b7280", fontSize: 14, marginBottom: 16 }}>
          {loading ? "Loading listings…" : `${filtered.length} listings found`}
        </p>

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
                  <span style={{ padding: "2px 9px", borderRadius: 20, fontSize: 11, fontWeight: 600, background: chip.bg, color: chip.color }}>{job.category}</span>
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
                  <button
                    onClick={() => handleApply(job)}
                    style={{ background: "#7c3aed", color: "white", padding: "8px 18px", borderRadius: 8, fontSize: 13, fontWeight: 600, border: "none", cursor: "pointer", whiteSpace: "nowrap" }}
                  >Apply</button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Log application modal */}
      {promptJob && (
        <div
          onClick={() => setPromptJob(null)}
          style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 200 }}
        >
          <div onClick={e => e.stopPropagation()} style={{ background: "white", borderRadius: 16, padding: 28, maxWidth: 380, width: "90%", boxShadow: "0 20px 60px rgba(0,0,0,0.2)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
              <CompanyLogo company={promptJob.company} size={40} />
              <div>
                <div style={{ fontWeight: 700, fontSize: 15, color: "#111827" }}>{promptJob.company}</div>
                <div style={{ color: "#6b7280", fontSize: 13 }}>{promptJob.role}</div>
              </div>
            </div>
            <p style={{ color: "#374151", fontSize: 14, margin: "0 0 20px" }}>
              Want to log this as an application so you can track its status?
            </p>
            <div style={{ display: "flex", gap: 10 }}>
              <button
                onClick={() => logApplication(promptJob)}
                style={{ flex: 1, padding: "10px", background: "#7c3aed", color: "white", border: "none", borderRadius: 8, fontWeight: 600, cursor: "pointer", fontSize: 14 }}
              >Yes, log it</button>
              <button
                onClick={() => setPromptJob(null)}
                style={{ flex: 1, padding: "10px", background: "#f3f4f6", color: "#374151", border: "none", borderRadius: 8, fontWeight: 600, cursor: "pointer", fontSize: 14 }}
              >Skip</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
