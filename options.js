const keyInput = document.getElementById("api-key");
const saveButton = document.getElementById("save");
const statusBox = document.getElementById("status");

function setStatus(message, kind) {
  statusBox.textContent = message;
  statusBox.className = kind || "";
}

async function init() {
  if (await getApiKey()) {
    keyInput.placeholder = "A key is saved. Paste a new one to replace it.";
  }
}

document.getElementById("key-form").addEventListener("submit", async (event) => {
  event.preventDefault();
  const apiKey = keyInput.value.trim();
  if (!apiKey) return setStatus("Paste your API key first.", "error");

  saveButton.disabled = true;
  setStatus("Checking the key…");
  try {
    // The key is saved only after Angelwood has accepted it.
    const me = await api("/me", { apiKey });
    await setApiKey(apiKey);
    keyInput.value = "";
    keyInput.placeholder = "A key is saved. Paste a new one to replace it.";
    const canWrite = me.permissions.includes("write") || me.permissions.includes("admin");
    setStatus(
      "Connected to " + me.organization.name + "." +
        (canWrite ? "" : " This key is read-only, so it cannot add tasks. Create one with write permission."),
      canWrite ? "ok" : "error"
    );
  } catch (error) {
    setStatus(error.message, "error");
  } finally {
    saveButton.disabled = false;
  }
});

document.getElementById("remove").addEventListener("click", async () => {
  await setApiKey("");
  await ext.storage.local.remove("lastProjectId");
  keyInput.value = "";
  keyInput.placeholder = "sk_live_…";
  setStatus("The key was removed from this browser.", "ok");
});

init();
