/**
 * Regen Website Leads API (Apps Script Web App)
 *
 * Required Script Properties:
 * - SHEET_ID : Google Sheet id
 * Optional Script Properties:
 * - API_KEY  : if set, POST must include {"key": "<API_KEY>"}
 * - APP_VERSION : version string exposed by doGet
 * - CORS_ORIGIN : default "*" (informational in body, see note below)
 *
 * Sheet tab name: Website_Leads
 *
 * Notes:
 * Apps Script web-app responses do not expose arbitrary response-header APIs
 * for ContentService. This script returns CORS metadata in body and handles
 * explicit preflight-style probes via query params for operational visibility.
 */

function doPost(e) {
  try {
    var props = PropertiesService.getScriptProperties();
    var corsOrigin = props.getProperty("CORS_ORIGIN") || "*";
    var body = (e && e.postData && e.postData.contents) ? e.postData.contents : "{}";
    var payload = JSON.parse(body);
    var now = new Date();

    var sheetId = props.getProperty("SHEET_ID");
    if (!sheetId) return json_(false, "SHEET_ID not set in Script Properties", corsOrigin);

    var requiredKey = props.getProperty("API_KEY"); // optional
    if (requiredKey && payload.key !== requiredKey) return json_(false, "Unauthorized (bad key)", corsOrigin);

    var validation = validatePayload_(payload);
    if (!validation.ok) return json_(false, validation.message, corsOrigin);

    var rateLimit = enforceRateLimit_(validation.clean);
    if (!rateLimit.ok) return json_(false, rateLimit.message, corsOrigin);

    var ss = SpreadsheetApp.openById(sheetId);
    var sh = ss.getSheetByName("Website_Leads") || ss.insertSheet("Website_Leads");

    // Header row
    if (sh.getLastRow() === 0) {
      sh.appendRow([
        "Timestamp",
        "Source",
        "Page",
        "Name",
        "Company",
        "Email",
        "Phone",
        "Requirement",
        "Message"
      ]);
    }

    sh.appendRow([
      now,
      validation.clean.source,
      validation.clean.page,
      validation.clean.name,
      validation.clean.company,
      validation.clean.email,
      validation.clean.phone,
      validation.clean.requirement,
      validation.clean.message
    ]);

    return json_(true, "ok", corsOrigin, {
      version: getVersion_(),
      ts: now.toISOString()
    });
  } catch (err) {
    var fallbackOrigin = (PropertiesService.getScriptProperties().getProperty("CORS_ORIGIN") || "*");
    return json_(false, (err && err.message) ? err.message : "Unknown error", fallbackOrigin);
  }
}

function doGet(e) {
  var props = PropertiesService.getScriptProperties();
  var corsOrigin = props.getProperty("CORS_ORIGIN") || "*";
  var mode = (e && e.parameter && e.parameter.mode) ? String(e.parameter.mode).toLowerCase() : "";

  if (mode === "options" || mode === "preflight") {
    return json_(true, "preflight", corsOrigin, {
      allowMethods: "GET,POST,OPTIONS",
      allowHeaders: "Content-Type,Authorization,X-Requested-With"
    });
  }

  return json_(true, "healthy", corsOrigin, {
    health: "ok",
    service: "regen-website-leads-api",
    version: getVersion_(),
    ts: new Date().toISOString()
  });
}

function json_(ok, msg, corsOrigin, extra) {
  var res = {
    ok: ok,
    message: msg,
    cors: {
      allowOrigin: corsOrigin || "*",
      allowMethods: "GET,POST,OPTIONS",
      allowHeaders: "Content-Type,Authorization,X-Requested-With"
    }
  };
  if (extra && typeof extra === "object") {
    Object.keys(extra).forEach(function(k) {
      res[k] = extra[k];
    });
  }

  return ContentService
    .createTextOutput(JSON.stringify(res))
    .setMimeType(ContentService.MimeType.JSON);
}

function getVersion_() {
  return PropertiesService.getScriptProperties().getProperty("APP_VERSION") || "v1";
}

function validatePayload_(payload) {
  var clean = {
    source: str_(payload.source, 40, "website"),
    page: str_(payload.page, 120, "home"),
    name: str_(payload.name, 120, ""),
    company: str_(payload.company, 160, ""),
    email: str_(payload.email, 254, "").toLowerCase(),
    phone: str_(payload.phone, 40, ""),
    requirement: str_(payload.requirement, 300, ""),
    message: str_(payload.message, 2500, "")
  };
  var honeypot = str_(payload.website, 200, "");
  var formStartedAt = Number(payload.formStartedAt || 0);
  var submitTs = Number(payload.submitTs || 0);

  if (!clean.name || !clean.email) {
    return { ok: false, message: "Name and Email are required" };
  }
  if (!isValidEmail_(clean.email)) {
    return { ok: false, message: "Invalid email format" };
  }
  if (honeypot) {
    return { ok: false, message: "Rejected as spam" };
  }
  var timeCheck = validateSubmissionTiming_(formStartedAt, submitTs);
  if (!timeCheck.ok) {
    return { ok: false, message: timeCheck.message };
  }
  if (clean.message && hasSpamSignals_(clean.message)) {
    return { ok: false, message: "Message failed spam checks" };
  }
  if (hasSpamSignals_([clean.name, clean.company, clean.requirement].join(" "))) {
    return { ok: false, message: "Submission failed spam checks" };
  }
  if (isDisposableEmail_(clean.email)) {
    return { ok: false, message: "Please use your business email address" };
  }

  return { ok: true, clean: clean };
}

function validateSubmissionTiming_(formStartedAt, submitTs) {
  if (!formStartedAt || !submitTs || isNaN(formStartedAt) || isNaN(submitTs)) {
    return { ok: false, message: "Missing form metadata" };
  }
  var deltaMs = submitTs - formStartedAt;
  if (deltaMs < 3000) {
    return { ok: false, message: "Submitted too quickly" };
  }
  if (deltaMs > 2 * 60 * 60 * 1000) {
    return { ok: false, message: "Form expired. Please refresh and submit again." };
  }
  return { ok: true };
}

function enforceRateLimit_(clean) {
  var cache = CacheService.getScriptCache();
  var emailHash = hash_(clean.email);
  var fingerprint = hash_([clean.name, clean.email, clean.phone, clean.message].join("|"));
  var minuteBucket = Utilities.formatDate(new Date(), "UTC", "yyyyMMddHHmm");

  var dupKey = "dup:" + fingerprint;
  if (cache.get(dupKey)) {
    return { ok: false, message: "Duplicate submission detected. Please wait." };
  }
  cache.put(dupKey, "1", 120);

  var emailKey = "rl:email:" + emailHash + ":" + minuteBucket;
  var emailCount = incrementCounter_(cache, emailKey, 60);
  if (emailCount > 3) {
    return { ok: false, message: "Too many submissions for this email. Try again later." };
  }

  var globalKey = "rl:global:" + minuteBucket;
  var globalCount = incrementCounter_(cache, globalKey, 60);
  if (globalCount > 40) {
    return { ok: false, message: "Server is busy. Please retry shortly." };
  }

  return { ok: true };
}

function incrementCounter_(cache, key, ttlSeconds) {
  var lock = LockService.getScriptLock();
  lock.waitLock(5000);
  try {
    var current = Number(cache.get(key) || "0");
    var next = current + 1;
    cache.put(key, String(next), ttlSeconds);
    return next;
  } finally {
    lock.releaseLock();
  }
}

function hasSpamSignals_(text) {
  var t = String(text || "").toLowerCase();
  var links = (t.match(/https?:\/\//g) || []).length;
  var spamTerms = /(crypto|bitcoin|forex|casino|viagra|loan|seo|backlink|telegram|whatsapp\s*group|earn\s*money)/;
  if (links >= 3) return true;
  if (spamTerms.test(t)) return true;
  if (/(.)\1{8,}/.test(t)) return true;
  return false;
}

function isDisposableEmail_(email) {
  var domain = String(email || "").split("@")[1] || "";
  var blocked = {
    "mailinator.com": true,
    "guerrillamail.com": true,
    "10minutemail.com": true,
    "tempmail.com": true,
    "yopmail.com": true
  };
  return !!blocked[domain.toLowerCase()];
}

function isValidEmail_(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email);
}

function str_(value, maxLen, fallback) {
  var s = String(value == null ? "" : value).trim();
  if (!s && fallback != null) return fallback;
  return s.substring(0, maxLen);
}

function hash_(s) {
  var digest = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, String(s), Utilities.Charset.UTF_8);
  return digest.map(function(b) {
    var v = (b < 0 ? b + 256 : b).toString(16);
    return v.length === 1 ? "0" + v : v;
  }).join("");
}
