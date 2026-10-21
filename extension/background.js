// Registers gantt.js as a content script on the Plane instances the user added in Options.
// Host access is requested per origin at runtime, so the extension ships without any hard-coded domain.

const SCRIPT_PREFIX = "plane-gantt-";

async function sync() {
  const { origins = [] } = await chrome.storage.sync.get("origins");
  const existing = await chrome.scripting.getRegisteredContentScripts();
  const mine = existing.filter(s => s.id.startsWith(SCRIPT_PREFIX)).map(s => s.id);
  if (mine.length) await chrome.scripting.unregisterContentScripts({ ids: mine });
  const granted = [];
  for (const o of origins) {
    if (await chrome.permissions.contains({ origins: [o + "/*"] })) granted.push(o);
  }
  if (!granted.length) return;
  await chrome.scripting.registerContentScripts(granted.map((o, i) => ({
    id: SCRIPT_PREFIX + i,
    matches: [o + "/*"],
    js: ["gantt.js"],
    runAt: "document_idle",
  })));
}

chrome.runtime.onInstalled.addListener(async ({ reason }) => {
  await sync();
  if (reason === "install") chrome.runtime.openOptionsPage();
});
chrome.runtime.onStartup.addListener(sync);
chrome.storage.onChanged.addListener(changes => { if (changes.origins) sync(); });
chrome.permissions.onRemoved.addListener(sync);
chrome.action.onClicked.addListener(() => chrome.runtime.openOptionsPage());
