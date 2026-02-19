import { Link } from "react-router-dom";

export default function Landing() {
  return (
    <div style={{ minHeight: "70vh", display: "grid", placeItems: "center", padding: 16 }}>
      <div style={{ maxWidth: 720, width: "100%", border: "1px solid #e5e5e5", borderRadius: 18, padding: 24 }}>
        <h1 style={{ margin: 0 }}>Regenplastics Private Limited</h1>
        <p style={{ marginTop: 10, opacity: 0.8 }}>
          Website is under construction.
        </p>

        <div style={{ marginTop: 18, display: "flex", gap: 12, flexWrap: "wrap" }}>
          <a
            href="mailto:info@regenplastic.com"
            style={{ padding: "10px 14px", borderRadius: 12, border: "1px solid #ddd", textDecoration: "none" }}
          >
            Contact: info@regenplastic.com
          </a>

          <Link
            to="/tracker"
            style={{ padding: "10px 14px", borderRadius: 12, border: "1px solid #ddd", textDecoration: "none" }}
          >
            Employee Tracker Login →
          </Link>
        </div>

        <p style={{ marginTop: 16, fontSize: 12, opacity: 0.65 }}>
          Tracker is restricted to @regenplastic.com Google accounts.
        </p>
      </div>
    </div>
  );
}
