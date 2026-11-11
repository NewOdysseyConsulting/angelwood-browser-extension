// Shared by the popup and the options page. Talks to the Angelwood public API
// and nothing else.
const API_BASE = "https://angelwood-api-uzil.onrender.com/api/v1";
const ext = globalThis.browser ?? globalThis.chrome;

async function getApiKey() {
  const stored = await ext.storage.local.get("apiKey");
  return stored.apiKey || "";
}

async function setApiKey(apiKey) {
  if (apiKey) await ext.storage.local.set({ apiKey });
  else await ext.storage.local.remove("apiKey");
}

class ApiError extends Error {
  constructor(status, code, message) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

async function api(path, { method = "GET", body, apiKey } = {}) {
  const key = apiKey ?? (await getApiKey());
  if (!key) throw new ApiError(401, "NO_KEY", "Add your Angelwood API key in the extension settings.");

  let response;
  try {
    response = await fetch(API_BASE + path, {
      method,
      headers: {
        Authorization: "Bearer " + key,
        ...(body ? { "Content-Type": "application/json" } : {}),
      },
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new ApiError(0, "NETWORK", "Could not reach Angelwood. Check your connection and try again.");
  }

  let payload = null;
  try {
    payload = await response.json();
  } catch {
    // An empty or non-JSON body is handled by the status check below.
  }
  if (!response.ok) {
    const error = payload && payload.error;
    throw new ApiError(
      response.status,
      (error && error.code) || "ERROR",
      (error && error.message) || "Angelwood returned an error (" + response.status + ")."
    );
  }
  return payload;
}
