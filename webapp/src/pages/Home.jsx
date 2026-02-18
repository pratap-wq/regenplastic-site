import { useState } from "react";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PHONE_PATTERN = /^[0-9+()\-\s]{7,20}$/;

const COLORS = {
  dark: "#005030",
  primary: "#10B060",
  accent: "#A0C030",
  bg: "#07150f",
  card: "rgba(255,255,255,0.06)",
  stroke: "rgba(255,255,255,0.12)",
};

export default function Home() {
  const mapsLink = "https://maps.app.goo.gl/YNnVEYMnfJxWxePR6";
  const embedUrl =
    "https://www.google.com/maps?q=Plot%20no%20245,%20phase%203,%20Pashamylaram,%20Hyderabad,%20Telangana%20502307&output=embed";

  const portalUrl = "https://portal.regenplastic.com";
  const contactEmail = "info@regenplastic.com";

  const [form, setForm] = useState({
    name: "",
    company: "",
    email: "",
    phone: "",
    requirement: "Samples / Grade selection",
    message: "",
    website: "",
  });


  const [status, setStatus] = useState({ type: "idle", msg: "" });

  const apiUrl = import.meta.env.VITE_REGEN_LEADS_API_URL || "";
  const apiKey = import.meta.env.VITE_REGEN_LEADS_API_KEY || "";

  const onChange = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  async function startEnquiryAttempt(forceRefresh) {
    if (!apiUrl) return null;
    if (!forceRefresh && formStartedAt && startToken) return { formStartedAt: formStartedAt, token: startToken };

    const startUrl = `${apiUrl}${apiUrl.includes("?") ? "&" : "?"}fn=start`;
    const startRes = await fetch(startUrl, { method: "GET" });
    const startData = await startRes.json().catch(() => ({}));
    if (!startRes.ok || startData?.ok !== true || !startData?.token) {
      throw new Error(startData?.message || "Unable to start enquiry form.");
    }

    const startedAt = Date.now();
    setFormStartedAt(startedAt);
    setStartToken(startData.token);
    return { formStartedAt: startedAt, token: startData.token };
  }

  async function handleAttemptStart() {
    if (!formStartedAt || !startToken) {
      try {
        await startEnquiryAttempt(false);
      } catch {
        // Start token retrieval is retried at submit time.
      }
    }
  }

  async function submitLead(e) {
    e.preventDefault();
    setStatus({ type: "idle", msg: "" });

    const cleanName = form.name.trim();
    const cleanEmail = form.email.trim();
    const cleanPhone = form.phone.trim();
    const cleanMessage = form.message.trim();


    if (!cleanName || !cleanEmail) {
      setStatus({ type: "error", msg: "Please enter Name and Email." });
      return;
    }
    if (!EMAIL_PATTERN.test(cleanEmail)) {
      setStatus({ type: "error", msg: "Please enter a valid email address." });
      return;
    }
    if (cleanPhone && !PHONE_PATTERN.test(cleanPhone)) {
      setStatus({ type: "error", msg: "Please enter a valid phone number." });
      return;
    }
    if (form.website) {
      setStatus({ type: "error", msg: "Spam check failed. Please refresh and try again." });
      return;
    }
    if (secondsToSubmit < 3) {
      setStatus({ type: "error", msg: "Please review your details and submit again." });
      return;
    }
    if (cleanMessage && cleanMessage.length < 10) {
      setStatus({ type: "error", msg: "Please add a few more details in your message." });
      return;
    }
    if (!apiUrl) {
      setStatus({
        type: "error",
        msg:
          "Leads API is not configured yet. Add VITE_REGEN_LEADS_API_URL in .env, then rebuild + deploy.",
      });
      return;
    }

    const payload = JSON.stringify({
      key: apiKey,
      source: "website",
      name: cleanName,
      email: cleanEmail,
      phone: cleanPhone,
      company: form.company.trim(),
      requirement: form.requirement,
      message: cleanMessage,
      website: form.website,
      page: "home",
    });

    try {
      const beaconBody = new Blob([payload], { type: "text/plain;charset=utf-8" });
      const beaconSent = typeof navigator !== "undefined" && navigator.sendBeacon(apiUrl, beaconBody);

      if (!beaconSent) {
        await fetch(apiUrl, {
          method: "POST",
          mode: "no-cors",
          headers: { "Content-Type": "text/plain;charset=utf-8" },
          body: payload,
        });
      }

      setStatus({ type: "ok", msg: "Enquiry submitted. Our team will contact you shortly." });
      setForm({
        name: "",
        company: "",
        email: "",
        phone: "",
        requirement: "Samples / Grade selection",
        message: "",
        website: "",
      });
      setFormStartedAt(0);
      setStartToken("");
    } catch (err) {
      setStatus({ type: "error", msg: err?.message || "Submit failed. Try again." });
    }
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: `radial-gradient(900px 600px at 15% 10%, rgba(16,176,96,0.25), transparent 55%),
                     radial-gradient(900px 600px at 85% 15%, rgba(160,192,48,0.18), transparent 55%),
                     ${COLORS.bg}`,
        color: "white",
      }}
    >
      <header
        style={{
          borderBottom: `1px solid ${COLORS.stroke}`,
          background: "rgba(0,0,0,0.25)",
          backdropFilter: "blur(8px)",
        }}
      >
        <div
          style={{
            maxWidth: 1100,
            margin: "0 auto",
            padding: "14px 20px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 16,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <img
              src="/regen-logo.png"
              alt="Regenplastics logo"
              style={{
                width: 44,
                height: 44,
                borderRadius: 12,
                background: "rgba(255,255,255,0.9)",
                padding: 6,
              }}
            />
            <div>
              <div style={{ fontWeight: 900, letterSpacing: 0.2 }}>
                Regenplastics Private Limited
              </div>
              <div style={{ fontSize: 12, opacity: 0.75 }}>
                Premium recycled PP & PPCP granules for injection molding
              </div>
            </div>
          </div>

          <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
            <a
              href={portalUrl}
              target="_blank"
              rel="noreferrer"
              style={{
                textDecoration: "none",
                color: "white",
                border: `1px solid ${COLORS.stroke}`,
                background: "rgba(255,255,255,0.04)",
                padding: "10px 12px",
                borderRadius: 12,
                fontWeight: 800,
              }}
              title="Employees only (Google login). We'll build this next."
            >
              Employee Portal
            </a>
            <a
              href="#contact"
              style={{
                textDecoration: "none",
                color: "black",
                background: COLORS.primary,
                padding: "10px 14px",
                borderRadius: 12,
                fontWeight: 900,
              }}
            >
              Enquiry
            </a>
          </div>
        </div>
      </header>

      <main>
        <section style={{ maxWidth: 1100, margin: "0 auto", padding: "54px 20px 26px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1.2fr 0.8fr", gap: 18, alignItems: "stretch" }}>
            <div style={{ border: `1px solid ${COLORS.stroke}`, background: COLORS.card, borderRadius: 18, padding: 22 }}>
              <div style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "6px 10px", borderRadius: 999, border: `1px solid ${COLORS.stroke}`, background: "rgba(255,255,255,0.04)", fontSize: 12, opacity: 0.9 }}>
                <span style={{ width: 8, height: 8, borderRadius: 99, background: COLORS.accent }} />
                B2B recycled polymer supplier
              </div>

              <h1 style={{ margin: "14px 0 10px", fontSize: 42, lineHeight: 1.08, letterSpacing: -0.5 }}>
                Consistent recycled PP materials designed for real production.
              </h1>

              <p style={{ margin: 0, opacity: 0.82, lineHeight: 1.7, maxWidth: 720 }}>
                We manufacture high-quality recycled PP & PPCP granules engineered for injection molding applications
                like paint pails, lubricant containers, FMCG packaging, and industrial components — with controlled
                contamination, stable melt flow, and repeatable batches.
              </p>

              <div style={{ marginTop: 18, display: "flex", flexWrap: "wrap", gap: 10 }}>
                <a href="#grades" style={{ textDecoration: "none", color: "white", border: `1px solid ${COLORS.stroke}`, background: "rgba(255,255,255,0.04)", padding: "10px 12px", borderRadius: 12, fontWeight: 800 }}>
                  View Grades
                </a>
                <a href={mapsLink} target="_blank" rel="noreferrer" style={{ textDecoration: "none", color: "black", background: COLORS.accent, padding: "10px 12px", borderRadius: 12, fontWeight: 900 }}>
                  Open Location
                </a>
              </div>
            </div>

            <div style={{ border: `1px solid ${COLORS.stroke}`, background: COLORS.card, borderRadius: 18, padding: 18, display: "grid", gap: 12 }}>
              <div style={{ border: `1px solid ${COLORS.stroke}`, borderRadius: 16, padding: 14 }}>
                <div style={{ fontSize: 12, opacity: 0.75 }}>Material Focus</div>
                <div style={{ fontSize: 18, fontWeight: 900, marginTop: 6 }}>Recycled PP / PPCP</div>
              </div>
              <div style={{ border: `1px solid ${COLORS.stroke}`, borderRadius: 16, padding: 14 }}>
                <div style={{ fontSize: 12, opacity: 0.75 }}>Use Cases</div>
                <div style={{ fontSize: 18, fontWeight: 900, marginTop: 6 }}>Rigid injection molding</div>
              </div>
              <div style={{ border: `1px solid ${COLORS.stroke}`, borderRadius: 16, padding: 14 }}>
                <div style={{ fontSize: 12, opacity: 0.75 }}>Support</div>
                <div style={{ fontSize: 18, fontWeight: 900, marginTop: 6 }}>Samples + grade selection</div>
              </div>
            </div>
          </div>
        </section>

        <section id="grades" style={{ maxWidth: 1100, margin: "0 auto", padding: "18px 20px 30px" }}>
          <h2 style={{ margin: "0 0 10px", fontSize: 28 }}>Material Grades</h2>
          <p style={{ margin: "0 0 18px", opacity: 0.78, lineHeight: 1.6 }}>
            Simple lineup for buyers: stable PP, impact PPCP, and custom blends aligned to your application.
          </p>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14 }}>
            <div style={{ border: `1px solid ${COLORS.stroke}`, background: COLORS.card, borderRadius: 18, padding: 18 }}>
              <div style={{ fontWeight: 900 }}>Injection Grade PP</div>
              <div style={{ fontSize: 12, opacity: 0.75, marginTop: 6 }}>Rigid packaging • pails • containers</div>
              <ul style={{ margin: "12px 0 0", paddingLeft: 18, opacity: 0.85, lineHeight: 1.6 }}>
                <li>Controlled melt flow (as per requirement)</li>
                <li>Stable batch-to-batch output</li>
                <li>Optimized for injection processing</li>
              </ul>
            </div>

            <div style={{ border: `1px solid ${COLORS.stroke}`, background: COLORS.card, borderRadius: 18, padding: 18 }}>
              <div style={{ fontWeight: 900 }}>PPCP Impact Modified</div>
              <div style={{ fontSize: 12, opacity: 0.75, marginTop: 6 }}>Impact parts • tough pails • closures</div>
              <ul style={{ margin: "12px 0 0", paddingLeft: 18, opacity: 0.85, lineHeight: 1.6 }}>
                <li>Better toughness profile</li>
                <li>Improved process stability</li>
                <li>Suited for demanding applications</li>
              </ul>
            </div>

            <div style={{ border: `1px solid ${COLORS.stroke}`, background: COLORS.card, borderRadius: 18, padding: 18 }}>
              <div style={{ fontWeight: 900 }}>Custom Compounds</div>
              <div style={{ fontSize: 12, opacity: 0.75, marginTop: 6 }}>Tailored blends • opacity • additives</div>
              <ul style={{ margin: "12px 0 0", paddingLeft: 18, opacity: 0.85, lineHeight: 1.6 }}>
                <li>Compatibility-focused blends</li>
                <li>Opacity / whiteness options</li>
                <li>Designed for your part requirements</li>
              </ul>
            </div>
          </div>
        </section>

        <section id="contact" style={{ maxWidth: 1100, margin: "0 auto", padding: "10px 20px 60px" }}>
          <div style={{ border: `1px solid ${COLORS.stroke}`, background: COLORS.card, borderRadius: 18, padding: 18, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            <div>
              <h2 style={{ margin: "0 0 10px" }}>Enquiry</h2>

              <form onSubmit={submitLead} onFocusCapture={handleAttemptStart} style={{ display: "grid", gap: 10 }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                  <input name="name" value={form.name} onChange={onChange} placeholder="Your name *" required
                    style={inputStyle(COLORS)} />
                  <input name="company" value={form.company} onChange={onChange} placeholder="Company"
                    style={inputStyle(COLORS)} />
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                  <input name="email" value={form.email} onChange={onChange} placeholder="Email *" type="email" required
                    style={inputStyle(COLORS)} />
                  <input name="phone" value={form.phone} onChange={onChange} placeholder="Phone" type="tel"
                    style={inputStyle(COLORS)} />
                </div>

                <input
                  name="website"
                  value={form.website}
                  onChange={onChange}
                  tabIndex={-1}
                  autoComplete="off"
                  aria-hidden="true"
                  style={{ position: "absolute", left: "-9999px", opacity: 0, pointerEvents: "none" }}
                />

                <select name="requirement" value={form.requirement} onChange={onChange} style={inputStyle(COLORS)}>
                  <option>Samples / Grade selection</option>
                  <option>Bulk supply enquiry</option>
                  <option>Custom compound requirement</option>
                  <option>Plant visit / business meeting</option>
                  <option>Other</option>
                </select>

                <textarea name="message" value={form.message} onChange={onChange} placeholder="Message / requirement details"
                  rows={4} style={inputStyle(COLORS)} />

                <button type="submit" onClick={handleAttemptStart} style={{
                  cursor: "pointer",
                  background: COLORS.primary,
                  color: "black",
                  border: "none",
                  padding: "12px 14px",
                  borderRadius: 12,
                  fontWeight: 900,
                }}>
                  Submit Enquiry
                </button>

                {status.type !== "idle" ? (
                  <div style={{
                    padding: "10px 12px",
                    borderRadius: 12,
                    border: `1px solid ${COLORS.stroke}`,
                    background: status.type === "ok" ? "rgba(16,176,96,0.18)" : "rgba(239,68,68,0.18)",
                    opacity: 0.95,
                    fontSize: 13,
                    lineHeight: 1.5
                  }}>
                    {status.msg}
                    <div style={{ marginTop: 8, fontSize: 12, opacity: 0.75 }}>
                      Or email us directly:{" "}
                      <a href={`mailto:${contactEmail}`} style={{ color: COLORS.accent, fontWeight: 900, textDecoration: "none" }}>
                        {contactEmail}
                      </a>
                    </div>
                  </div>
                ) : null}
              </form>

              <div style={{ marginTop: 14, opacity: 0.82, lineHeight: 1.7 }}>
                <div><b>Regenplastics Private Limited</b></div>
                <div>Plot no 245, Phase 3, Pashamylaram, Hyderabad, Telangana 502307</div>
                <div style={{ marginTop: 8 }}>
                  <a href={`mailto:${contactEmail}`} style={{ color: COLORS.accent, fontWeight: 900, textDecoration: "none" }}>
                    {contactEmail}
                  </a>
                </div>
                <div style={{ marginTop: 10 }}>
                  <a href={mapsLink} target="_blank" rel="noreferrer"
                     style={{ color: "black", background: COLORS.accent, padding: "10px 12px", borderRadius: 12, fontWeight: 900, textDecoration: "none", display: "inline-block" }}>
                    Open in Google Maps
                  </a>
                </div>
              </div>
            </div>

            <div style={{ borderRadius: 16, overflow: "hidden", border: `1px solid ${COLORS.stroke}` }}>
              <iframe
                title="Regenplastics location map"
                src={embedUrl}
                width="100%"
                height="420"
                style={{ border: 0, display: "block" }}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </div>
        </section>
      </main>

      <footer style={{ borderTop: `1px solid ${COLORS.stroke}`, padding: "18px 20px", opacity: 0.7 }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", fontSize: 12, display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
          <div>© {new Date().getFullYear()} Regenplastics Private Limited</div>
          <div style={{ color: COLORS.accent }}>Premium recycled PP & PPCP • Hyderabad</div>
        </div>
      </footer>

      <style>{`
        @media (max-width: 900px) {
          h1 { font-size: 34px !important; }
          section > div[style*="grid-template-columns: 1.2fr 0.8fr"] { grid-template-columns: 1fr !important; }
          #grades div[style*="grid-template-columns: repeat(3, 1fr)"] { grid-template-columns: 1fr !important; }
          #contact div[style*="grid-template-columns: 1fr 1fr"] { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}

function inputStyle(COLORS) {
  return {
    width: "100%",
    borderRadius: 12,
    border: `1px solid ${COLORS.stroke}`,
    background: "rgba(0,0,0,0.25)",
    color: "white",
    padding: "10px 12px",
    outline: "none",
    fontSize: 13
  };
}
