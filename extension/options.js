const $ = s => document.querySelector(s);

async function origins() {
  return (await chrome.storage.sync.get("origins")).origins || [];
}

async function render() {
  const list = $("#list");
  list.innerHTML = "";
  for (const o of await origins()) {
    const ok = await chrome.permissions.contains({ origins: [o + "/*"] });
    const li = document.createElement("li");
    li.innerHTML = `<div><code></code><div class="status">${ok ? "Access granted" : "Access not granted, remove and add again"}</div></div><button type="button">Remove</button>`;
    li.querySelector("code").textContent = o;
    li.querySelector("button").onclick = async () => {
      await chrome.storage.sync.set({ origins: (await origins()).filter(x => x !== o) });
      await chrome.permissions.remove({ origins: [o + "/*"] }).catch(() => {});
      render();
    };
    list.appendChild(li);
  }
}

$("#add").addEventListener("submit", async e => {
  e.preventDefault();
  $("#err").textContent = "";
  let origin;
  try { origin = new URL($("#url").value.trim()).origin; } catch { $("#err").textContent = "That is not a valid URL."; return; }
  // Must run inside the click handler: Chrome only shows the permission prompt on a user gesture.
  const granted = await chrome.permissions.request({ origins: [origin + "/*"] });
  if (!granted) { $("#err").textContent = "Permission was not granted."; return; }
  const all = await origins();
  if (!all.includes(origin)) await chrome.storage.sync.set({ origins: [...all, origin] });
  $("#url").value = "";
  render();
});

render();
