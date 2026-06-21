import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { getApplications, saveApplications } from "../components/shared";

const STATUSES   = ["Applied", "OA", "Interview", "Offer", "Rejected"];
const SOURCES    = ["LinkedIn", "Indeed", "Handshake", "Company Site", "Other"];
const CATEGORIES = ["Software Engineering", "AI/ML", "Data Science", "Data Analytics", "Data Engineering", "Other"];

const FIELD = {
  width: "100%", padding: "10px 14px", borderRadius: 8,
  border: "1.5px solid #e5e7eb", fontSize: 14,
  boxSizing: "border-box", outline: "none", fontFamily: "inherit",
  background: "white",
};

const LABEL = { fontSize: 13, fontWeight: 600, color: "#374151", display: "block", marginBottom: 6 };

export default function AddJob() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    company: "", role: "", location: "",
    source: "LinkedIn",
    dateApplied: new Date().toISOString().split("T")[0],
    status: "Applied",
    jobUrl: "",
    category: "Software Engineering",
    notes: "",
  });

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = (e) => {
    e.preventDefault();
    const apps = getApplications();
    saveApplications([...apps, { ...form, id: Date.now() }]);
    navigate("/applications");
  };

  return (
    <div style={{ maxWidth: 580, margin: "0 auto", padding: "36px 20px" }}>
      <h2 style={{ color: "#1a0533", marginBottom: 4 }}>Log an Application</h2>
      <p style={{ color: "#9ca3af", fontSize: 14, marginBottom: 28 }}>Track a job you've applied to or are planning to apply to.</p>

      <form onSubmit={handleSubmit} style={{ background: "white", border: "1px solid #ede9fe", borderRadius: 14, padding: 28 }}>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
          <div>
            <label style={LABEL}>Company *</label>
            <input required style={FIELD} value={form.company} onChange={e => set("company", e.target.value)} placeholder="e.g. Google" />
          </div>
          <div>
            <label style={LABEL}>Role *</label>
            <input required style={FIELD} value={form.role} onChange={e => set("role", e.target.value)} placeholder="e.g. SWE Intern" />
          </div>
        </div>

        <div style={{ marginBottom: 16 }}>
          <label style={LABEL}>Location</label>
          <input style={FIELD} value={form.location} onChange={e => set("location", e.target.value)} placeholder="e.g. San Francisco, CA" />
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
          <div>
            <label style={LABEL}>Source</label>
            <select style={FIELD} value={form.source} onChange={e => set("source", e.target.value)}>
              {SOURCES.map(s => <option key={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label style={LABEL}>Date Applied</label>
            <input type="date" style={FIELD} value={form.dateApplied} onChange={e => set("dateApplied", e.target.value)} />
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
          <div>
            <label style={LABEL}>Status</label>
            <select style={FIELD} value={form.status} onChange={e => set("status", e.target.value)}>
              {STATUSES.map(s => <option key={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label style={LABEL}>Category</label>
            <select style={FIELD} value={form.category} onChange={e => set("category", e.target.value)}>
              {CATEGORIES.map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
        </div>

        <div style={{ marginBottom: 16 }}>
          <label style={LABEL}>Job URL</label>
          <input type="url" style={FIELD} value={form.jobUrl} onChange={e => set("jobUrl", e.target.value)} placeholder="https://..." />
        </div>

        <div style={{ marginBottom: 28 }}>
          <label style={LABEL}>Notes</label>
          <textarea
            style={{ ...FIELD, height: 88, resize: "vertical" }}
            value={form.notes}
            onChange={e => set("notes", e.target.value)}
            placeholder="Recruiter name, referral, interview prep notes..."
          />
        </div>

        <button type="submit" style={{
          width: "100%", padding: "13px", background: "#7c3aed", color: "white",
          border: "none", borderRadius: 10, fontSize: 15, fontWeight: 600, cursor: "pointer",
        }}>Save Application →</button>

      </form>
    </div>
  );
}
