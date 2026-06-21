import { BrowserRouter, Routes, Route, NavLink } from "react-router-dom";
import Browse from "./pages/Browse";
import Applications from "./pages/Applications";
import Saved from "./pages/Saved";
import AddJob from "./pages/AddJob";
import Dashboard from "./pages/Dashboard";

const NAV_LINKS = [
  { to: "/",             label: "Browse",          end: true },
  { to: "/applications", label: "My Applications", end: false },
  { to: "/saved",        label: "Saved",           end: false },
  { to: "/add",          label: "Add Job",         end: false },
  { to: "/dashboard",    label: "Dashboard",       end: false },
];

export default function App() {
  return (
    <BrowserRouter>
      <div style={{ fontFamily: "'Inter', system-ui, sans-serif", background: "#f8f7ff", minHeight: "100vh" }}>

        <nav style={{
          background: "#1a0533", padding: "0 32px", height: 58,
          display: "flex", alignItems: "center", gap: 8,
          position: "sticky", top: 0, zIndex: 100,
          boxShadow: "0 2px 16px rgba(26,5,51,0.4)",
        }}>
          <span style={{ color: "white", fontWeight: 800, fontSize: 19, letterSpacing: "-0.3px", marginRight: 20, whiteSpace: "nowrap" }}>
            🎯 InternTrack
          </span>
          {NAV_LINKS.map(({ to, label, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              style={({ isActive }) => ({
                color: isActive ? "white" : "rgba(255,255,255,0.55)",
                textDecoration: "none",
                fontSize: 14,
                fontWeight: isActive ? 600 : 400,
                padding: "4px 12px",
                borderRadius: 6,
                background: isActive ? "rgba(255,255,255,0.12)" : "transparent",
                whiteSpace: "nowrap",
              })}
            >{label}</NavLink>
          ))}
        </nav>

        <Routes>
          <Route path="/"             element={<Browse />} />
          <Route path="/applications" element={<Applications />} />
          <Route path="/saved"        element={<Saved />} />
          <Route path="/add"          element={<AddJob />} />
          <Route path="/dashboard"    element={<Dashboard />} />
        </Routes>

      </div>
    </BrowserRouter>
  );
}
