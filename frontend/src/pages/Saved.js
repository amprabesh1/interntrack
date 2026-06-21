import { useState } from "react";
import { CompanyLogo, CATEGORY_COLORS, getBookmarks, saveBookmarks } from "../components/shared";

export default function Saved() {
  const [bookmarks, setBookmarksState] = useState(getBookmarks);
  const jobs = Object.values(bookmarks);

  const remove = (job) => {
    const key = `${job.company}||${job.role}`;
    const updated = { ...bookmarks };
    delete updated[key];
    setBookmarksState(updated);
    saveBookmarks(updated);
  };

  if (jobs.length === 0) {
    return (
      <div style={{ maxWidth: 860, margin: "80px auto", textAlign: "center", padding: "0 20px" }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>☆</div>
        <h2 style={{ color: "#1a0533", marginBottom: 8 }}>No saved jobs yet</h2>
        <p style={{ color: "#9ca3af" }}>Star listings on the Browse page to save them here.</p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 860, margin: "0 auto", padding: "28px 20px" }}>
      <h2 style={{ color: "#1a0533", marginBottom: 4 }}>Saved Jobs</h2>
      <p style={{ color: "#9ca3af", fontSize: 14, marginBottom: 24 }}>{jobs.length} saved listing{jobs.length !== 1 ? "s" : ""}</p>

      {jobs.map((job, i) => {
        const chip = CATEGORY_COLORS[job.category] || CATEGORY_COLORS["Other"];
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
                onClick={() => remove(job)}
                title="Remove"
                style={{ width: 36, height: 36, borderRadius: 8, cursor: "pointer", border: "1.5px solid #c4b5fd", background: "#f3e8ff", fontSize: 16, display: "flex", alignItems: "center", justifyContent: "center" }}
              >★</button>
              {job.apply_url && (
                <a href={job.apply_url} target="_blank" rel="noreferrer"
                  style={{ background: "#7c3aed", color: "white", padding: "8px 18px", borderRadius: 8, fontSize: 13, fontWeight: 600, textDecoration: "none" }}
                >Apply</a>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
