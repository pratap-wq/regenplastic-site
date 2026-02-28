import React from "react";
import { apiCall } from "../api/regenApi";
import { DEFAULTS } from "../lib/siteDefaults";

function rowsToMap(rows) {
  const m = {};
  for (const r of rows || []) m[`${r.section}.${r.key}`] = r.value ?? "";
  return m;
}
function get(m, key) {
  const v = m[key];
  return v && String(v).trim() ? v : (DEFAULTS[key] || "");
}
function safeJson(raw, fallback) {
  try { return JSON.parse(raw); } catch { return fallback; }
}

export default function Landing() {
  const [m, setM] = React.useState({});
  const [err, setErr] = React.useState(null);

  React.useEffect(() => {
    (async () => {
      try {
        const res = await apiCall("site.get", {});
        setM(rowsToMap(res.rows || []));
      } catch (e) {
        setErr(e.message || "CMS load failed");
      }
    })();
  }, []);

  const heroTitle = get(m, "hero.title");
  const heroSubtitle = get(m, "hero.subtitle");
  const cta1Text = get(m, "hero.ctaPrimaryText");
  const cta1Href = get(m, "hero.ctaPrimaryHref");
  const cta2Text = get(m, "hero.ctaSecondaryText");
  const cta2Href = get(m, "hero.ctaSecondaryHref");

  const highlights = safeJson(get(m, "highlights.items") || "[]", []);
  const aboutHeading = get(m, "about.heading");
  const aboutBody = get(m, "about.body");

  const productsHeading = get(m, "products.heading");
  const products = safeJson(get(m, "products.items") || "[]", []);

  const processHeading = get(m, "process.heading");
  const steps = safeJson(get(m, "process.steps") || "[]", []);

  const qualityHeading = get(m, "quality.heading");
  const qualityPoints = safeJson(get(m, "quality.points") || "[]", []);

  const ctaHeading = get(m, "cta.heading");
  const ctaBody = get(m, "cta.body");
  const ctaBtnText = get(m, "cta.buttonText");
  const ctaBtnHref = get(m, "cta.buttonHref");

  const footerNote = get(m, "footer.note");

  return (
    <div style={{ background: "#0b1220", color: "#e8eefc", minHeight: "100vh" }}>
      <TopBar />

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "32px 16px" }}>
        {err ? (
          <div style={{ background: "rgba(255,80,80,0.15)", border: "1px solid rgba(255,80,80,0.25)", padding: 10, borderRadius: 10, marginBottom: 14 }}>
            CMS load failed: {err}. Showing default content.
          </div>
        ) : null}

        <section style={{ padding: "28px 0 14px" }}>
          <h1 style={{ fontSize: 40, margin: 0, lineHeight: 1.1 }}>{heroTitle}</h1>
          <p style={{ fontSize: 18, opacity: 0.9, maxWidth: 760 }}>{heroSubtitle}</p>

          <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 14 }}>
            <a href={cta1Href} style={btnPrimary}>{cta1Text}</a>
            <a href={cta2Href} style={btnGhost}>{cta2Text}</a>
            <a href="/admin" style={btnGhost}>Admin</a>
          </div>
        </section>

        <section style={{ padding: "18px 0 8px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 12 }}>
            {highlights.map((h, idx) => (
              <div key={idx} style={card}>
                <div style={{ fontSize: 12, opacity: 0.8 }}>{h.title}</div>
                <div style={{ fontSize: 20, fontWeight: 700, marginTop: 6 }}>{h.value}</div>
              </div>
            ))}
          </div>
        </section>

        <section style={{ padding: "26px 0" }}>
          <h2 style={h2}>{aboutHeading}</h2>
          <p style={{ opacity: 0.92, lineHeight: 1.6, maxWidth: 900 }}>{aboutBody}</p>
        </section>

        <section style={{ padding: "10px 0 26px" }}>
          <h2 style={h2}>{productsHeading}</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 12 }}>
            {products.map((p, idx) => (
              <div key={idx} style={card}>
                <div style={{ fontSize: 18, fontWeight: 800 }}>{p.name}</div>
                <div style={{ opacity: 0.9, marginTop: 8 }}>{p.desc}</div>
                {p.specs?.length ? (
                  <ul style={{ marginTop: 10, paddingLeft: 18, opacity: 0.9 }}>
                    {p.specs.map((s, i) => <li key={i}>{s}</li>)}
                  </ul>
                ) : null}
              </div>
            ))}
          </div>
        </section>

        <section style={{ padding: "10px 0 26px" }}>
          <h2 style={h2}>{processHeading}</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 12 }}>
            {steps.map((s, idx) => (
              <div key={idx} style={card}>
                <div style={{ fontWeight: 800 }}>{s.title}</div>
                <div style={{ opacity: 0.9, marginTop: 8 }}>{s.desc}</div>
              </div>
            ))}
          </div>
        </section>

        <section style={{ padding: "10px 0 26px" }}>
          <h2 style={h2}>{qualityHeading}</h2>
          <div style={card}>
            <ul style={{ margin: 0, paddingLeft: 18, opacity: 0.92, lineHeight: 1.7 }}>
              {qualityPoints.map((q, idx) => <li key={idx}>{q}</li>)}
            </ul>
          </div>
        </section>

        <section style={{ padding: "10px 0 36px" }}>
          <div style={{ ...card, display: "flex", gap: 14, alignItems: "center", justifyContent: "space-between", flexWrap: "wrap" }}>
            <div>
              <div style={{ fontSize: 20, fontWeight: 900 }}>{ctaHeading}</div>
              <div style={{ opacity: 0.92, marginTop: 6, maxWidth: 720 }}>{ctaBody}</div>
            </div>
            <a href={ctaBtnHref} style={btnPrimary}>{ctaBtnText}</a>
          </div>
        </section>

        <footer style={{ padding: "18px 0 30px", opacity: 0.75, fontSize: 12 }}>
          {footerNote}
        </footer>
      </div>
    </div>
  );
}

function TopBar() {
  return (
    <div style={{ borderBottom: "1px solid rgba(255,255,255,0.08)", background: "rgba(0,0,0,0.25)" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "12px 16px", display: "flex", justifyContent: "space-between" }}>
        <div style={{ fontWeight: 800 }}>REGENPLASTICS</div>
        <div style={{ display: "flex", gap: 14, opacity: 0.9 }}>
          <a href="/" style={link}>Home</a>
          <a href="/tracker" style={link}>Tracker</a>
          <a href="/admin" style={link}>Admin</a>
        </div>
      </div>
    </div>
  );
}

const h2 = { fontSize: 22, margin: "0 0 10px", fontWeight: 900 };

const card = {
  border: "1px solid rgba(255,255,255,0.10)",
  background: "rgba(255,255,255,0.04)",
  borderRadius: 14,
  padding: 14,
};

const btnPrimary = {
  display: "inline-block",
  padding: "10px 14px",
  borderRadius: 12,
  background: "#ffffff",
  color: "#0b1220",
  textDecoration: "none",
  fontWeight: 800,
};

const btnGhost = {
  display: "inline-block",
  padding: "10px 14px",
  borderRadius: 12,
  border: "1px solid rgba(255,255,255,0.22)",
  color: "#e8eefc",
  textDecoration: "none",
  fontWeight: 700,
};

const link = { color: "#e8eefc", textDecoration: "none" };