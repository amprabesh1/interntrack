import { BarChart, Bar, XAxis, YAxis, Tooltip, PieChart, Pie, Cell, Legend, ResponsiveContainer } from "recharts";
import { getApplications } from "../components/shared";

const STATUSES   = ["Applied", "OA", "Interview", "Offer", "Rejected"];
const CATEGORIES = ["Software Engineering", "AI/ML", "Data Science", "Data Analytics", "Data Engineering", "Other"];

const STATUS_FILL = {
  "Applied":   "#3b82f6",
  "OA":        "#8b5cf6",
  "Interview": "#f59e0b",
  "Offer":     "#10b981",
  "Rejected":  "#ef4444",
};

const CATEGORY_FILL = {
  "Software Engineering": "#0e7490",
  "AI/ML":                "#7c3aed",
  "Data Science":         "#1d4ed8",
  "Data Analytics":       "#b45309",
  "Data Engineering":     "#15803d",
  "Other":                "#6b7280",
};

export default function Dashboard() {
  const apps = getApplications();

  if (apps.length === 0) {
    return (
      <div style={{ maxWidth: 860, margin: "80px auto", textAlign: "center", padding: "0 20px" }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>📊</div>
        <h2 style={{ color: "#1a0533", marginBottom: 8 }}>No data yet</h2>
        <p style={{ color: "#9ca3af" }}>Add applications to see your pipeline analytics here.</p>
      </div>
    );
  }

  const statusData = STATUSES
    .map(s => ({ name: s, count: apps.filter(a => a.status === s).length, fill: STATUS_FILL[s] }))
    .filter(d => d.count > 0);

  const categoryData = CATEGORIES
    .map(c => ({ name: c, value: apps.filter(a => a.category === c).length, fill: CATEGORY_FILL[c] }))
    .filter(d => d.value > 0);

  const Card = ({ children, title }) => (
    <div style={{ background: "white", border: "1px solid #ede9fe", borderRadius: 14, padding: 24 }}>
      <h3 style={{ margin: "0 0 20px", color: "#1a0533", fontSize: 15, fontWeight: 600 }}>{title}</h3>
      {children}
    </div>
  );

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: "28px 20px" }}>
      <h2 style={{ color: "#1a0533", marginBottom: 4 }}>Dashboard</h2>
      <p style={{ color: "#9ca3af", fontSize: 14, marginBottom: 28 }}>{apps.length} total application{apps.length !== 1 ? "s" : ""} tracked</p>

      {/* Summary chips */}
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 28 }}>
        {statusData.map(s => (
          <div key={s.name} style={{ background: "#f8f7ff", border: "1px solid #ede9fe", borderRadius: 10, padding: "12px 20px", textAlign: "center", minWidth: 80 }}>
            <div style={{ fontSize: 22, fontWeight: 700, color: s.fill }}>{s.count}</div>
            <div style={{ fontSize: 12, color: "#6b7280" }}>{s.name}</div>
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>

        <Card title="Applications by Status">
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={statusData} barSize={32}>
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} allowDecimals={false} width={28} />
              <Tooltip cursor={{ fill: "#f3f4f6" }} />
              <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                {statusData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card title="Applications by Category">
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie
                data={categoryData}
                cx="50%" cy="45%"
                innerRadius={55} outerRadius={85}
                dataKey="value" nameKey="name"
                paddingAngle={2}
              >
                {categoryData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
              </Pie>
              <Tooltip formatter={(val, name) => [val, name]} />
              <Legend iconSize={9} iconType="circle" wrapperStyle={{ fontSize: 11 }} />
            </PieChart>
          </ResponsiveContainer>
        </Card>

      </div>
    </div>
  );
}
