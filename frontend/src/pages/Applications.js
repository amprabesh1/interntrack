import { useState } from "react";
import { CompanyLogo, STATUS_COLORS, CATEGORY_COLORS, getApplications, saveApplications } from "../components/shared";

const STATUSES = ["Applied", "OA", "Interview", "Offer", "Rejected"];

export default function Applications() {
  const [apps, setApps] = useState(getApplications);
  const [filter, setFilter] = useState("All");
  const [expandedId, setExpandedId] = useState(null);

  const counts = STATUSES.reduce((acc, s) => ({ ...acc, [s]: apps.filter(a => a.status === s).length }), {});
  const total = apps.length;
  const filtered = filter === "All" ? apps : apps.filter(a => a.status === filter);

  const updateStatus = (id, status) => {
    const updated = apps.map(a => a.id === id ? { ...a, status } : a);
    setApps(updated);
    saveApplications(updated);
  };

  const deleteApp = (id) => {
    const updated = apps.filter(a => a.id !== id);
    setApps(updated);
    saveApplications(updated);
  };

  if (apps.length === 0) {
    return (
      <div style={{ maxWidth: 860, margin: "80px auto", textAlign: "center", padding: "0 20px" }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>📋</div>
        <h2 style={{ color: "#1a0533", marginBottom: 8 }}>No applications yet</h2>
        <p style={{ color: "#9ca3af" }}>Use the Add Job tab to log your first application.</p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 860, margin: "0 auto", padding: "28px 20px" }}>
      <h2 style={{ color: "#1a0533", marginBottom: 20 }}>My Applications</h2>

      {/* Funnel row */}
      <div style={{ display: "flex", gap: 12, marginBottom: 24, flexWrap: "wrap" }}>
        {STATUSES.map(s => {
          const sc = STATUS_COLORS[s];
          return (
            <div
              key={s}
              onClick={() => setFilter(filter === s ? "All" : s)}
              style={{
                background: sc.bg, color: sc.color,
                border: `2px solid ${filter === s ? sc.color : "transparent"}`,
                borderRadius: 12, padding: "14px 22px",
                cursor: "pointer", minWidth: 90, textAlign: "center",
                transition: "border-color 0.15s",
              }}
            >
              <div style={{ fontSize: 26, fontWeight: 700 }}>{counts[s]}</div>
              <div style={{ fontSize: 12, fontWeight: 600 }}>{s}</div>
            </div>
          );
        })}
      </div>

      {/* Filter pills */}
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 20 }}>
        {["All", ...STATUSES].map(s => (
          <button key={s} onClick={() => setFilter(s)} style={{
            padding: "6px 14px", borderRadius: 20,
            border: `1.5px solid ${filter === s ? "#7c3aed" : "#e5e7eb"}`,
            background: filter === s ? "#7c3aed" : "white",
            color: filter === s ? "white" : "#374151",
            cursor: "pointer", fontSize: 13, fontWeight: filter === s ? 600 : 400,
          }}>
            {s} ({s === "All" ? total : counts[s]})
          </button>
        ))}
      </div>

      <p style={{ color: "#6b7280", fontSize: 14, marginBottom: 16 }}>
        {filtered.length} application{filtered.length !== 1 ? "s" : ""}
      </p>

      {filtered.map(app => {
        const sc = STATUS_COLORS[app.status] || STATUS_COLORS["Applied"];
        const cc = CATEGORY_COLORS[app.category] || CATEGORY_COLORS["Other"];
        const isExpanded = expandedId === app.id;
        return (
          <div key={app.id} style={{
            background: "white", border: `1px solid ${isExpanded ? "#c4b5fd" : "#ede9fe"}`, borderRadius: 12,
            padding: "16px 20px", marginBottom: 10,
            boxShadow: isExpanded ? "0 4px 16px rgba(124,58,237,0.12)" : "0 1px 4px rgba(124,58,237,0.06)",
            transition: "box-shadow 0.15s, border-color 0.15s",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <CompanyLogo company={app.company} size={44} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 3 }}>
                  <span style={{ fontWeight: 700, fontSize: 15, color: "#111827" }}>{app.company}</span>
                  <span
                    onClick={() => setExpandedId(isExpanded ? null : app.id)}
                    title="Click to update status"
                    style={{ padding: "2px 9px", borderRadius: 20, fontSize: 11, fontWeight: 600, background: sc.bg, color: sc.color, cursor: "pointer", userSelect: "none" }}
                  >{app.status} ▾</span>
                  <span style={{ padding: "2px 9px", borderRadius: 20, fontSize: 11, fontWeight: 600, background: cc.bg, color: cc.color }}>{app.category}</span>
                </div>
                <div style={{ color: "#374151", fontSize: 14, marginBottom: 2 }}>{app.role}</div>
                <div style={{ color: "#9ca3af", fontSize: 12 }}>
                  {app.location && <span>📍 {app.location} · </span>}
                  <span>Applied {app.dateApplied}</span>
                  {app.source && <span> via {app.source}</span>}
                </div>
                {app.notes && <div style={{ color: "#6b7280", fontSize: 12, marginTop: 4, fontStyle: "italic" }}>{app.notes}</div>}
              </div>
              <div style={{ display: "flex", gap: 8, alignItems: "center", flexShrink: 0 }}>
                {app.jobUrl && (
                  <a href={app.jobUrl} target="_blank" rel="noreferrer"
                    style={{ background: "#7c3aed", color: "white", padding: "7px 14px", borderRadius: 8, fontSize: 13, fontWeight: 600, textDecoration: "none" }}
                  >View</a>
                )}
                <button
                  onClick={() => deleteApp(app.id)}
                  style={{ width: 32, height: 32, borderRadius: 8, border: "1px solid #fee2e2", background: "#fff5f5", color: "#dc2626", cursor: "pointer", fontSize: 14, display: "flex", alignItems: "center", justifyContent: "center" }}
                >✕</button>
              </div>
            </div>

            {/* Inline status picker */}
            {isExpanded && (
              <div style={{ marginTop: 14, paddingTop: 14, borderTop: "1px solid #f3f4f6", display: "flex", gap: 8, flexWrap: "wrap" }}>
                <span style={{ fontSize: 12, color: "#9ca3af", alignSelf: "center", marginRight: 4 }}>Move to:</span>
                {STATUSES.map(s => {
                  const ssc = STATUS_COLORS[s];
                  const isActive = app.status === s;
                  return (
                    <button
                      key={s}
                      onClick={() => { updateStatus(app.id, s); setExpandedId(null); }}
                      style={{
                        padding: "5px 14px", borderRadius: 20, fontSize: 12, cursor: "pointer", fontWeight: isActive ? 700 : 500,
                        border: `1.5px solid ${isActive ? ssc.color : "#e5e7eb"}`,
                        background: isActive ? ssc.bg : "white",
                        color: isActive ? ssc.color : "#374151",
                      }}
                    >{s}{isActive ? " ✓" : ""}</button>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
