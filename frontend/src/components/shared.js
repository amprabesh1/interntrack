import { useState } from "react";

export const CATEGORY_COLORS = {
  "AI/ML":                { bg: "#f3e8ff", color: "#7c3aed" },
  "Data Engineering":     { bg: "#dcfce7", color: "#15803d" },
  "Data Science":         { bg: "#dbeafe", color: "#1d4ed8" },
  "Data Analytics":       { bg: "#fef3c7", color: "#b45309" },
  "Software Engineering": { bg: "#cffafe", color: "#0e7490" },
  "Other":                { bg: "#f3f4f6", color: "#4b5563" },
};

export const STATUS_COLORS = {
  "Applied":   { bg: "#dbeafe", color: "#1d4ed8" },
  "OA":        { bg: "#ede9fe", color: "#7c3aed" },
  "Interview": { bg: "#fef3c7", color: "#b45309" },
  "Offer":     { bg: "#dcfce7", color: "#15803d" },
  "Rejected":  { bg: "#fee2e2", color: "#dc2626" },
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

export function getCompanyDomain(company) {
  const key = company.toLowerCase().trim();
  return DOMAIN_OVERRIDES[key] || key.replace(/[^a-z0-9]/g, "") + ".com";
}

export function CompanyLogo({ company, size = 36 }) {
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

export function getBookmarks() {
  try { return JSON.parse(localStorage.getItem("interntrack_bookmarks") || "{}"); }
  catch { return {}; }
}

export function saveBookmarks(data) {
  localStorage.setItem("interntrack_bookmarks", JSON.stringify(data));
}

export function getApplications() {
  try { return JSON.parse(localStorage.getItem("interntrack_applications") || "[]"); }
  catch { return []; }
}

export function saveApplications(data) {
  localStorage.setItem("interntrack_applications", JSON.stringify(data));
}
