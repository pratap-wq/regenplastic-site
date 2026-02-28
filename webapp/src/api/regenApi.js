// ===============================
// Regenplastics API Client
// Google Apps Script backend
// ===============================

const API_URL = import.meta.env.VITE_REGEN_API_URL;

// fallback is intentional so prod never breaks if .env not embedded
const API_KEY =
  import.meta.env.VITE_REGEN_API_KEY ||
  "regen-2026-ops-123";

/**
 * Generic API caller
 */
export async function apiCall(fn, payload = {}) {
  if (!API_URL) throw new Error("Missing VITE_REGEN_API_URL");

  const body = {
    fn,
    // send both key names to match backend expectations
    key: API_KEY,
    apiKey: API_KEY,
    ...payload,
  };

  const res = await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "text/plain;charset=utf-8" },
    body: JSON.stringify(body),
  });

  const json = await res.json();

  if (!json || json.ok !== true) {
    throw new Error(json?.error || "API error");
  }

  return json.data;
}

// ===============================
// WEBSITE CMS API
// ===============================

export async function apiSiteGet() {
  return apiCall("site.get");
}

export async function apiSiteUpdate(section, key, value) {
  return apiCall("site.update", { section, key, value });
}

// ===============================
// TASK TRACKER API
// ===============================

export async function apiTasksList() {
  return apiCall("tasks.list");
}

export async function apiTasksAdd(task) {
  return apiCall("tasks.add", { task });
}

export async function apiTasksUpdate(id, updates) {
  return apiCall("tasks.update", { id, updates });
}

export async function apiTasksUpdateStatus(id, status) {
  return apiCall("tasks.updateStatus", { id, status });
}

export async function apiTasksDelete(id) {
  return apiCall("tasks.delete", { id });
}