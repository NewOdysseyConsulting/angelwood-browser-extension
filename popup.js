const setup = document.getElementById("setup");
const form = document.getElementById("task-form");
const projectSelect = document.getElementById("project");
const titleInput = document.getElementById("title");
const descriptionInput = document.getElementById("description");
const prioritySelect = document.getElementById("priority");
const submitButton = document.getElementById("submit");
const statusBox = document.getElementById("status");

function setStatus(message, kind) {
  statusBox.textContent = message;
  statusBox.className = kind || "";
}

function openSettings() {
  ext.runtime.openOptionsPage();
}
document.getElementById("open-settings").addEventListener("click", openSettings);
document.getElementById("settings-link").addEventListener("click", openSettings);

function showSetup(message) {
  form.hidden = true;
  setup.hidden = false;
  setStatus(message || "", message ? "error" : "");
}

// The page's title and address are read only when the popup is opened, through
// the activeTab permission, and are sent only when the form is submitted.
async function currentPage() {
  try {
    const [tab] = await ext.tabs.query({ active: true, currentWindow: true });
    return { title: (tab && tab.title) || "", url: (tab && tab.url) || "" };
  } catch {
    return { title: "", url: "" };
  }
}

async function loadProjects() {
  const projects = [];
  let offset = 0;
  // Up to 300 active projects; more than that is not usable in a dropdown anyway.
  for (let pageNumber = 0; pageNumber < 3; pageNumber += 1) {
    const result = await api("/projects?status=active&limit=100&offset=" + offset);
    projects.push(...result.data);
    if (!result.has_more) break;
    offset = result.next_offset;
  }
  projects.sort((a, b) => a.name.localeCompare(b.name));
  return projects;
}

async function init() {
  if (!(await getApiKey())) return showSetup();

  setStatus("Loading your projects…");
  let projects;
  try {
    projects = await loadProjects();
  } catch (error) {
    if (error.status === 401) return showSetup("Your API key was not accepted. Check it in settings.");
    return setStatus(error.message, "error");
  }
  if (projects.length === 0) {
    return setStatus("You have no active projects in Angelwood yet. Create one, then try again.", "error");
  }

  const stored = await ext.storage.local.get("lastProjectId");
  for (const project of projects) {
    const option = document.createElement("option");
    option.value = String(project.id);
    option.textContent = project.client ? project.name + " (" + project.client.name + ")" : project.name;
    if (project.id === stored.lastProjectId) option.selected = true;
    projectSelect.append(option);
  }

  const page = await currentPage();
  titleInput.value = page.title.slice(0, 500);
  descriptionInput.value = /^https?:/.test(page.url) ? page.url : "";

  setStatus("");
  form.hidden = false;
  titleInput.focus();
  titleInput.select();
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  const title = titleInput.value.trim();
  if (!title) return setStatus("Give the task a name.", "error");

  submitButton.disabled = true;
  setStatus("Adding…");
  const projectId = Number(projectSelect.value);
  const description = descriptionInput.value.trim();
  try {
    const task = await api("/tasks", {
      method: "POST",
      body: {
        project_id: projectId,
        title,
        priority: prioritySelect.value,
        ...(description ? { description } : {}),
      },
    });
    await ext.storage.local.set({ lastProjectId: projectId });
    setStatus('Added "' + task.title + '" to ' + task.project.name + ".", "ok");
    submitButton.textContent = "Added";
  } catch (error) {
    submitButton.disabled = false;
    if (error.code === "INSUFFICIENT_SCOPE") {
      setStatus("This API key is read-only. Create a key with write permission in Angelwood and add it in settings.", "error");
    } else {
      setStatus(error.message, "error");
    }
  }
});

init();
