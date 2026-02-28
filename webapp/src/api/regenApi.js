async function postJSON(url, payload) {
  const res = await fetch(url, {
    method: "POST",
    redirect: "follow",
    headers: { "Content-Type": "text/plain;charset=utf-8" }, // avoids preflight
    body: JSON.stringify(payload),
  });

  const text = await res.text();
  let data = {};
  try { data = JSON.parse(text); } catch { data = { ok: false, error: text }; }

  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  if (data && data.ok === false) throw new Error(data.error || "API error");
  return data;
}

export async function apiTasksList(userEmail) {
  return postJSON(import.meta.env.VITE_REGEN_API_URL, {
    key: import.meta.env.VITE_REGEN_API_KEY,
    userEmail,
    fn: "tasks.list",
  });
}

// NOTE: first argument is ASSIGNEE email (stored in userEmail column in sheet)
export async function apiTasksAdd(userEmail, payload) {
  return postJSON(import.meta.env.VITE_REGEN_API_URL, {
    key: import.meta.env.VITE_REGEN_API_KEY,
    userEmail,
    fn: "tasks.add",
    payload,
  });
}

export async function apiTasksUpdateStatus(userEmail, id, status) {
  return postJSON(import.meta.env.VITE_REGEN_API_URL, {
    key: import.meta.env.VITE_REGEN_API_KEY,
    userEmail,
    fn: "tasks.updateStatus",
    payload: { id, status },
  });
}

export async function apiTasksUpdate(userEmail, payload) {
  return postJSON(import.meta.env.VITE_REGEN_API_URL, {
    key: import.meta.env.VITE_REGEN_API_KEY,
    userEmail,
    fn: "tasks.update",
    payload,
  });
}

export async function apiTasksDelete(userEmail, id) {
  return postJSON(import.meta.env.VITE_REGEN_API_URL, {
    key: import.meta.env.VITE_REGEN_API_KEY,
    userEmail,
    fn: "tasks.delete",
    payload: { id },
  });
}
