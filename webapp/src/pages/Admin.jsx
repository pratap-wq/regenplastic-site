import React from "react";
import { apiCall } from "../api/regenApi";
import { DEFAULTS } from "../lib/siteDefaults";

function rowsToMap(rows) {
  const m = {};
  for (const r of rows || []) m[`${r.section}.${r.key}`] = r.value ?? "";
  return m;
}

export default function Admin() {
  const [rows, setRows] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState(null);

  const [newSection, setNewSection] = React.useState("hero");
  const [newKey, setNewKey] = React.useState("title");
  const [newValue, setNewValue] = React.useState("");

  async function load() {
    try {
      setLoading(true);
      setError(null);
      const res = await apiCall("site.get", {});
      setRows(res.rows || []);
    } catch (e) {
      setError(e.message || "Failed to load");
    } finally {
      setLoading(false);
    }
  }

  React.useEffect(() => {
    load();
  }, []);

  async function saveRow(section, key, value) {
    try {
      setSaving(true);
      const res = await apiCall("site.update", { section, key, value });
      const updated = res.row;

      setRows((prev) => {
        const next = [...prev];
        const idx = next.findIndex((r) => r.section === section && r.key === key);
        if (idx >= 0) next[idx] = updated;
        else next.push(updated);
        // sort for readability
        next.sort((a, b) =>
          `${a.section}.${a.key}`.localeCompare(`${b.section}.${b.key}`)
        );
        return next;
      });
    } catch (e) {
      alert(e.message || "Save failed");
    } finally {
      setSaving(false);
    }
  }

  async function seedDefaults() {
    if (!confirm("Seed default website content into WebsiteContent sheet?")) return;
    try {
      setSaving(true);
      const entries = Object.entries(DEFAULTS);
      for (const [fullKey, value] of entries) {
        const [section, key] = fullKey.split(".");
        await apiCall("site.update", { section, key, value });
      }
      await load();
      alert("Seed completed. Home page will now show CMS content.");
    } catch (e) {
      alert(e.message || "Seed failed");
    } finally {
      setSaving(false);
    }
  }

  const map = rowsToMap(rows);

  return (
    <div style={{ padding: 18, fontFamily: "system-ui", maxWidth: 1100, margin: "0 auto" }}>
      <h1 style={{ marginTop: 0 }}>Website Admin (CMS)</h1>

      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 12 }}>
        <button onClick={load} disabled={loading || saving}>
          {loading ? "Loading…" : "Reload"}
        </button>
        <button onClick={seedDefaults} disabled={saving}>
          {saving ? "Working…" : "Seed Default Website Content"}
        </button>
        <a href="/" style={{ alignSelf: "center" }}>Open Website</a>
      </div>

      {error ? (
        <div style={{ background: "#fee", border: "1px solid #f99", padding: 10, borderRadius: 8 }}>
          {error}
        </div>
      ) : null}

      <hr style={{ margin: "16px 0" }} />

      <h2>Add / Update Key</h2>
      <div style={{ display: "grid", gap: 8, gridTemplateColumns: "1fr 1fr", maxWidth: 700 }}>
        <label>
          Section
          <input value={newSection} onChange={(e) => setNewSection(e.target.value)} style={inp} />
        </label>
        <label>
          Key
          <input value={newKey} onChange={(e) => setNewKey(e.target.value)} style={inp} />
        </label>
        <label style={{ gridColumn: "1 / -1" }}>
          Value
          <textarea value={newValue} onChange={(e) => setNewValue(e.target.value)} style={{ ...inp, minHeight: 80 }} />
        </label>
        <div style={{ gridColumn: "1 / -1" }}>
          <button
            disabled={saving || !newSection.trim() || !newKey.trim()}
            onClick={() => saveRow(newSection.trim(), newKey.trim(), newValue)}
          >
            Save
          </button>
        </div>
      </div>

      <hr style={{ margin: "18px 0" }} />

      <h2>All WebsiteContent</h2>

      <div style={{ display: "grid", gap: 12 }}>
        {Object.keys(map).length === 0 ? (
          <div style={{ opacity: 0.8 }}>
            No CMS content found. Click <b>Seed Default Website Content</b>.
          </div>
        ) : null}

        {rows
          .slice()
          .sort((a, b) => `${a.section}.${a.key}`.localeCompare(`${b.section}.${b.key}`))
          .map((r) => (
            <CmsCard key={`${r.section}.${r.key}`} row={r} saving={saving} onSave={saveRow} />
          ))}
      </div>
    </div>
  );
}

function CmsCard({ row, saving, onSave }) {
  const [value, setValue] = React.useState(row.value ?? "");

  React.useEffect(() => setValue(row.value ?? ""), [row.value]);

  const fullKey = `${row.section}.${row.key}`;

  return (
    <div style={{ border: "1px solid #ddd", borderRadius: 10, padding: 12 }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 10, alignItems: "center" }}>
        <div>
          <div style={{ fontWeight: 800 }}>{fullKey}</div>
          <div style={{ fontSize: 12, opacity: 0.7 }}>Updated: {row.updatedAt || "-"}</div>
        </div>
        <button disabled={saving || value === (row.value ?? "")} onClick={() => onSave(row.section, row.key, value)}>
          {saving ? "Saving…" : "Save"}
        </button>
      </div>

      <textarea
        value={value}
        onChange={(e) => setValue(e.target.value)}
        style={{ width: "100%", marginTop: 10, minHeight: 80, padding: 10, borderRadius: 8 }}
      />
    </div>
  );
}

const inp = {
  width: "100%",
  padding: 10,
  borderRadius: 8,
  border: "1px solid #ccc",
  marginTop: 6,
};