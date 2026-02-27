const API_KEY = "regen-2026-ops-123";

function corsJSON_(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

function doGet(e) {
  return corsJSON_({ ok: true, msg: "Regen Tracker API running" });
}

function doPost(e) {
  try {
    if (!e || !e.postData || !e.postData.contents) {
      return corsJSON_({ ok: false, error: "Missing POST body" });
    }

    const body = JSON.parse(e.postData.contents);

    if (body.key !== API_KEY) {
      return corsJSON_({ ok: false, error: "Unauthorized: invalid key" });
    }

    const fn = body.fn;

    if (fn === "tasks.list") {
      return corsJSON_({
        ok: true,
        tasks: []
      });
    }

    if (fn === "tasks.add") {
      return corsJSON_({
        ok: true,
        message: "Task added"
      });
    }

    if (fn === "tasks.updateStatus") {
      return corsJSON_({
        ok: true,
        message: "Status updated"
      });
    }

    return corsJSON_({ ok: false, error: "Unknown function" });

  } catch (err) {
    return corsJSON_({
      ok: false,
      error: String(err)
    });
  }
}
