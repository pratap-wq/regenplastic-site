import React from "react";
import { apiCall } from "../api/regenApi";
import { DEFAULTS } from "../lib/siteDefaults";
import { THEME } from "../lib/theme";

const SCHEMA = [
  {
    id: "hero",
    title: "Hero",
    fields: [
      { key: "title", label: "Title", type: "text" },
      { key: "subtitle", label: "Subtitle", type: "textarea" },
      { key: "ctaPrimaryText", label: "Primary CTA Text", type: "text" },
      { key: "ctaPrimaryHref", label: "Primary CTA Link", type: "text" },
      { key: "ctaSecondaryText", label: "Secondary CTA Text", type: "text" },
      { key: "ctaSecondaryHref", label: "Secondary CTA Link", type: "text" },
    ],
  },
  {
    id: "highlights",
    title: "Highlights (JSON)",
    fields: [
      { key: "items", label: "Items (array: {title,value})", type: "json", template: DEFAULTS["highlights.items"] },
    ],
  },
  {
    id: "about",
    title: "About",
    fields: [
      { key: "heading", label: "Heading", type: "text" },
      { key: "body", label: "Body", type: "textarea" },
    ],
  },
  {
    id: "products",
    title: "Products (JSON)",
    fields: [
      { key: "heading", label: "Heading", type: "text" },
      { key: "items", label: "Items (array: {name,desc,specs[]})", type: "json", template: DEFAULTS["products.items"] },
    ],
  },
  {
    id: "process",
    title: "Process (JSON)",
    fields: [
      { key: "heading", label: "Heading", type: "text" },
      { key: "steps", label: "Steps (array: {title,desc})", type: "json", template: DEFAULTS["process.steps"] },
    ],
  },
  {
    id: "quality",
    title: "Quality (JSON)",
    fields: [
      { key: "heading", label: "Heading", type: "text" },
      { key: "points", label: "Points (array of strings)", type: "json", template: DEFAULTS["quality.points"] },
    ],
  },
  {
    id: "cta",
    title: "CTA",
    fields: [
      { key: "heading", label: "Heading", type: "text" },
      { key: "body", label: "Body", type: "textarea" },
      { key: "buttonText", label: "Button Text", type: "text" },
      { key: "buttonHref", label: "Button Link", type: "text" },
    ],
  },
  {
    id: "footer",
    title: "Footer",
    fields: [{ key: "note", label: "Footer Note", type: "text" }],
  },
];

function rowsToMap(rows) {
  const m = {};
  for (const r of rows || []) m[`${r.section}.${r.key}`] = r.value ?? "";
  return m;
}
function getValue(map, fullKey, field) {
  const v = map[fullKey];
  const fallback = DEFAULTS[fullKey] || field?.template || "";
  return v && String(v).trim() ? v : fallback;
}
function prettyJson(raw) {
  try {
    const obj = JSON.parse(raw);
    return JSON.stringify(obj, null, 2);
  } catch {
    return raw;
  }
}
function isValidJson(raw) {
  try { JSON.parse(raw); return true; } catch { return false; }
}
function hexA(hex, a) {
  const h = hex.replace("#", "");
  const r = parseInt(h.substring(0, 2), 16);
  const g = parseInt(h.substring(2, 4), 16);
  const b = parseInt(h.substring(4, 6), 16);
  return `rgba(${r},${g},${b},${a})`;
}

export default function Admin() {
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState(null);

  const [map, setMap] = React.useState({});
  const [active, setActive] = React.useState("hero");
  const [draft, setDraft] = React.useState({});

  async function load() {
    try {
      setLoading(true);
      setError(null);
      const res = await apiCall("site.get", {});
      const rows = res.rows || [];
      const m = rowsToMap(rows);
      setMap(m);

      // init draft with current values (or defaults)
      const d = {};
      for (const section of SCHEMA) {
        for (const f of section.fields) {
          const fk = `${section.id}.${f.key}`;
          const val = getValue(m, fk, f);
          d[fk] = f.type === "json" ? prettyJson(val || "[]") : val;
        }
      }
      setDraft(d);
    } catch (e) {
      setError(e.message || "Failed to load");
    } finally {
      setLoading(false);
    }
  }

  React.useEffect(() => { load(); }, []);

  async function saveFullKey(fullKey) {
    const [section, key] = fullKey.split(".");
    const value = draft[fullKey] ?? "";

    const sectionSchema = SCHEMA.find((s) => s.id === section);
    const field = sectionSchema?.fields?.find((f) => f.key === key);

    if (field?.type === "json" && value && !isValidJson(value)) {
      alert(`Invalid JSON for ${fullKey}. Fix JSON and try again.`);
      return;
    }

    setSaving(true);
    try {
      await apiCall("site.update", { section, key, value });
      setMap((prev) => ({ ...prev, [fullKey]: value }));
      alert(`Saved: ${fullKey}`);
    } catch (e) {
      alert(e.message || "Save failed");
    } finally {
      setSaving(false);
    }
  }

  async function saveSection(sectionId) {
    const sectionSchema = SCHEMA.find((s) => s.id === sectionId);
    if (!sectionSchema) return;

    for (const f of sectionSchema.fields) {
      const fk = `${sectionId}.${f.key}`;
      if (f.type === "json" && draft[fk] && !isValidJson(draft[fk])) {
        alert(`Invalid JSON in ${fk}. Fix it before saving.`);
        return;
      }
    }

    setSaving(true);
    try {
      for (const f of sectionSchema.fields) {
        const fk = `${sectionId}.${f.key}`;
        await apiCall("site.update", { section: sectionId, key: f.key, value: draft[fk] ?? "" });
      }
      setMap((prev) => {
        const next = { ...prev };
        for (const f of sectionSchema.fields) next[`${sectionId}.${f.key}`] = draft[`${sectionId}.${f.key}`] ?? "";
        return next;
      });
      alert(`Saved section: ${sectionSchema.title}`);
    } catch (e) {
      alert(e.message || "Save failed");
    } finally {
      setSaving(false);
    }
  }

  async function seedDefaults() {
    if (!confirm("Seed default website content into WebsiteContent sheet?")) return;
    setSaving(true);
    try {
      for (const [fullKey, value] of Object.entries(DEFAULTS)) {
        const [section, key] = fullKey.split(".");
        await apiCall("site.update", { section, key, value });
      }
      await load();
      alert("Seed completed.");
    } catch (e) {
      alert(e.message || "Seed failed");
    } finally {
      setSaving(false);
    }
  }

  function resetSectionToDefaults(sectionId) {
    const sectionSchema = SCHEMA.find((s) => s.id === sectionId);
    if (!sectionSchema) return;

    setDraft((prev) => {
      const next = { ...prev };
      for (const f of sectionSchema.fields) {
        const fk = `${sectionId}.${f.key}`;
        const def = DEFAULTS[fk] || f.template || "";
        next[fk] = f.type === "json" ? prettyJson(def || "[]") : def;
      }
      return next;
    });
  }

  if (loading) {
    return <div style={{ padding: 18, color: THEME.text, background: THEME.bg, minHeight: "100vh" }}>Loading Admin…</div>;
  }

  const activeSection = SCHEMA.find((s) => s.id === active);

  return (
    <div style={{ background: THEME.bg, color: THEME.text, minHeight: "100vh" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "18px 16px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <img src="/regen-logo.png" alt="Regenplastics" style={{ height: 30 }} />
            <div style={{ fontSize: 20, fontWeight: 950 }}>Admin CMS</div>
          </div>

          <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
            <a href="/" style={link}>Open Website</a>
            <button style={btnGhost} onClick={load} disabled={saving}>Reload</button>
            <button style={btnGhost} onClick={seedDefaults} disabled={saving}>Seed Defaults</button>
          </div>
        </div>

        {error ? (
          <div style={{ marginTop: 12, background: "rgba(255,80,80,0.14)", border: "1px solid rgba(255,80,80,0.22)", padding: 10, borderRadius: 12 }}>
            {error}
          </div>
        ) : null}

        <div style={{ display: "grid", gridTemplateColumns: "280px 1fr", gap: 14, marginTop: 14 }}>
          <div style={{ ...panel, padding: 10 }}>
            <div style={{ fontWeight: 900, marginBottom: 10, opacity: 0.9 }}>Sections</div>
            {SCHEMA.map((s) => (
              <button
                key={s.id}
                onClick={() => setActive(s.id)}
                style={{
                  ...navBtn,
                  background: active === s.id ? `linear-gradient(90deg, ${hexA(THEME.primary, 0.22)}, ${hexA(THEME.primary2, 0.18)})` : "transparent",
                  borderColor: active === s.id ? hexA(THEME.primary2, 0.35) : THEME.border,
                }}
              >
                {s.title}
              </button>
            ))}

            <div style={{ marginTop: 12, fontSize: 12, opacity: 0.8, lineHeight: 1.5 }}>
              JSON fields support <b>Format JSON</b> + validation.
            </div>
          </div>

          <div style={{ ...panel, padding: 14 }}>
            <SectionEditor
              section={activeSection}
              draft={draft}
              setDraft={setDraft}
              saving={saving}
              onSaveSection={saveSection}
              onSaveKey={saveFullKey}
              onResetDefaults={resetSectionToDefaults}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function SectionEditor({ section, draft, setDraft, saving, onSaveSection, onSaveKey, onResetDefaults }) {
  if (!section) return null;

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
        <div>
          <div style={{ fontSize: 18, fontWeight: 950 }}>{section.title}</div>
          <div style={{ fontSize: 12, opacity: 0.75 }}>{section.id}</div>
        </div>

        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <button style={btnGhost} onClick={() => onResetDefaults(section.id)} disabled={saving}>Reset to Defaults</button>
          <button style={btnPrimary} onClick={() => onSaveSection(section.id)} disabled={saving}>
            {saving ? "Saving…" : "Save Section"}
          </button>
        </div>
      </div>

      <div style={{ marginTop: 14, display: "grid", gap: 12 }}>
        {section.fields.map((f) => {
          const fk = `${section.id}.${f.key}`;
          const val = draft[fk] ?? "";
          const isJson = f.type === "json";
          const valid = !isJson || !val || isValidJson(val);

          return (
            <div key={fk} style={{ ...fieldBox, borderColor: valid ? THEME.border : "rgba(255,80,80,0.35)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
                <div>
                  <div style={{ fontWeight: 900 }}>{f.label}</div>
                  <div style={{ fontSize: 12, opacity: 0.75 }}>{fk}</div>
                </div>

                <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
                  {isJson ? (
                    <>
                      <button style={miniBtn} onClick={() => setDraft((p) => ({ ...p, [fk]: prettyJson(val) }))} disabled={saving}>
                        Format JSON
                      </button>
                      <button style={miniBtn} onClick={() => setDraft((p) => ({ ...p, [fk]: f.template || "[]" }))} disabled={saving}>
                        Use Template
                      </button>
                    </>
                  ) : null}

                  <button style={miniBtnPrimary} onClick={() => onSaveKey(fk)} disabled={saving || (isJson && !valid)}>
                    Save
                  </button>
                </div>
              </div>

              {f.type === "text" ? (
                <input value={val} onChange={(e) => setDraft((p) => ({ ...p, [fk]: e.target.value }))} style={input} />
              ) : (
                <textarea
                  value={val}
                  onChange={(e) => setDraft((p) => ({ ...p, [fk]: e.target.value }))}
                  style={{
                    ...input,
                    minHeight: isJson ? 180 : 110,
                    fontFamily: isJson ? "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace" : "inherit",
                  }}
                />
              )}

              {isJson && !valid ? (
                <div style={{ marginTop: 8, color: "rgba(255,120,120,0.95)", fontSize: 12 }}>
                  Invalid JSON — fix formatting before saving.
                </div>
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}

const panel = {
  border: `1px solid ${THEME.border}`,
  background: THEME.panel,
  borderRadius: THEME.radius,
};

const navBtn = {
  width: "100%",
  textAlign: "left",
  padding: "10px 12px",
  marginBottom: 8,
  borderRadius: 12,
  border: `1px solid ${THEME.border}`,
  background: "transparent",
  color: THEME.text,
  cursor: "pointer",
  fontWeight: 800,
};

const fieldBox = {
  border: `1px solid ${THEME.border}`,
  borderRadius: 14,
  padding: 12,
  background: "rgba(255,255,255,0.03)",
};

const input = {
  width: "100%",
  marginTop: 10,
  padding: 10,
  borderRadius: 12,
  border: `1px solid ${THEME.border}`,
  background: "rgba(0,0,0,0.18)",
  color: THEME.text,
};

const btnPrimary = {
  padding: "10px 14px",
  borderRadius: 12,
  border: "none",
  cursor: "pointer",
  fontWeight: 900,
  color: THEME.primaryText,
  background: `linear-gradient(90deg, ${THEME.primary}, ${THEME.primary2})`,
};

const btnGhost = {
  padding: "10px 14px",
  borderRadius: 12,
  border: `1px solid ${THEME.border}`,
  cursor: "pointer",
  fontWeight: 800,
  color: THEME.text,
  background: "rgba(255,255,255,0.02)",
};

const miniBtn = {
  padding: "6px 10px",
  borderRadius: 10,
  border: `1px solid ${THEME.border}`,
  cursor: "pointer",
  fontWeight: 800,
  color: THEME.text,
  background: "rgba(255,255,255,0.02)",
  fontSize: 12,
};

const miniBtnPrimary = {
  padding: "6px 10px",
  borderRadius: 10,
  border: "none",
  cursor: "pointer",
  fontWeight: 900,
  color: THEME.primaryText,
  background: `linear-gradient(90deg, ${THEME.primary}, ${THEME.primary2})`,
  fontSize: 12,
};

const link = { color: THEME.text, textDecoration: "none", fontWeight: 800 };