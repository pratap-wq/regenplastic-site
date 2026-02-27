import React from "react";

export default function Landing() {
  return (
    <div style={{ background: "#0b1220", color: "#e8eefc", minHeight: "100vh" }}>
      <TopBar />

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "32px 16px" }}>
        <section style={{ padding: "28px 0 14px" }}>
          <h1 style={{ fontSize: 40, margin: 0, lineHeight: 1.1 }}>
            Regenplastics Private Limited
          </h1>
          <p style={{ fontSize: 18, opacity: 0.9, maxWidth: 760 }}>
            Injection-grade recycled PP granules for packaging and industrial applications.
          </p>

          <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 14 }}>
            <a href="mailto:info@regenplastic.com" style={btnPrimary}>Talk to Sales</a>
            <a href="/tracker" style={btnGhost}>Employee Tracker</a>
            <a href="/admin" style={btnGhost}>Admin</a>
          </div>
        </section>

        <section style={{ padding: "18px 0 8px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 12 }}>
            {[
              { title: "Capacity", value: "400+ MT/month" },
              { title: "Feedstock", value: "Rigid PP / PPCP" },
              { title: "Quality Focus", value: "Injection-Grade rPP" },
              { title: "Location", value: "Pashmailaram, Telangana" },
            ].map((h, idx) => (
              <div key={idx} style={card}>
                <div style={{ fontSize: 12, opacity: 0.8 }}>{h.title}</div>
                <div style={{ fontSize: 20, fontWeight: 700, marginTop: 6 }}>{h.value}</div>
              </div>
            ))}
          </div>
        </section>

        <section style={{ padding: "26px 0" }}>
          <h2 style={h2}>About Regenplastics</h2>
          <p style={{ opacity: 0.92, lineHeight: 1.6, maxWidth: 900 }}>
            Regenplastics manufactures high-quality recycled polypropylene (rPP) granules using
            advanced washing, sorting and extrusion technology. Our focus is consistent
            processability for injection molding used in paint, lubricants, FMCG and industrial
            packaging.
          </p>
        </section>

        <section style={{ padding: "10px 0 26px" }}>
          <h2 style={h2}>Products</h2>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 12 }}>
            <div style={card}>
              <div style={{ fontSize: 18, fontWeight: 800 }}>Injection Grade A rPP</div>
              <div style={{ opacity: 0.9, marginTop: 8 }}>
                Optimized recycled PP for injection molding applications including paint pails and rigid containers.
              </div>
              <ul style={{ marginTop: 10, paddingLeft: 18, opacity: 0.9 }}>
                <li>Stable MFI control</li>
                <li>Low contamination & odour</li>
                <li>Consistent batch quality</li>
              </ul>
            </div>

            <div style={card}>
              <div style={{ fontSize: 18, fontWeight: 800 }}>Custom Engineered Blends</div>
              <div style={{ opacity: 0.9, marginTop: 8 }}>
                Tailored polymer blends balancing impact strength and flow properties.
              </div>
              <ul style={{ marginTop: 10, paddingLeft: 18, opacity: 0.9 }}>
                <li>CO80MA compatibility focus</li>
                <li>TiO₂ & colour matching support</li>
                <li>Customer trial optimisation</li>
              </ul>
            </div>
          </div>
        </section>

        <section style={{ padding: "10px 0 26px" }}>
          <h2 style={h2}>Manufacturing Process</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 12 }}>
            {[
              {
                title: "Sorting & Inspection",
                desc: "Incoming rigid PP/PPCP waste is inspected and segregated to reduce contamination.",
              },
              {
                title: "Washing & Drying",
                desc: "High-efficiency washing removes labels, dirt and organic impurities.",
              },
              {
                title: "Extrusion & Melt Filtration",
                desc: "Extrusion with filtration and degassing ensures clean, consistent melt flow.",
              },
              {
                title: "Pelletizing & Packing",
                desc: "Uniform granules packed with batch traceability from input material to dispatch.",
              },
            ].map((s, idx) => (
              <div key={idx} style={card}>
                <div style={{ fontWeight: 800 }}>{s.title}</div>
                <div style={{ opacity: 0.9, marginTop: 8 }}>{s.desc}</div>
              </div>
            ))}
          </div>
        </section>

        <section style={{ padding: "10px 0 26px" }}>
          <h2 style={h2}>Quality & Traceability</h2>
          <div style={card}>
            <ul style={{ margin: 0, paddingLeft: 18, opacity: 0.92, lineHeight: 1.7 }}>
              <li>Batch-wise QC checks including MFI and contamination monitoring</li>
              <li>Customer trial validation and feedback loop</li>
              <li>Lot traceability from raw material to finished goods</li>
            </ul>
          </div>
        </section>

        <section style={{ padding: "10px 0 36px" }}>
          <div style={{ ...card, display: "flex", gap: 14, alignItems: "center", justifyContent: "space-between", flexWrap: "wrap" }}>
            <div>
              <div style={{ fontSize: 20, fontWeight: 900 }}>
                Need consistent recycled PP for injection molding?
              </div>
              <div style={{ opacity: 0.92, marginTop: 6, maxWidth: 720 }}>
                Share your application requirements and target MFI. Our team will recommend the right recycled polymer solution.
              </div>
            </div>
            <a href="mailto:info@regenplastic.com" style={btnPrimary}>
              Contact: info@regenplastic.com
            </a>
          </div>
        </section>

        <footer style={{ padding: "18px 0 30px", opacity: 0.75, fontSize: 12 }}>
          © Regenplastics Private Limited. All rights reserved.
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