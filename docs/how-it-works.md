# How it works

## Layout

```
extension/
  manifest.json    MV3 manifest: no host permissions up front, optional_host_permissions only
  background.js    registers gantt.js as a content script on the origins the user added
  options.html/js  settings page: add/remove Plane URLs, requests host permission per origin
  gantt.js         content script: button, data loading, chart rendering
exporter/
  export_gantt.py  REST API v1 client + HTML export (standard library only)
  template.html    standalone chart page; data is injected at export time
```

## Extension

### Permissions

The manifest declares no host permissions. When you add `https://plane.example.com` in Options, the extension asks for `https://plane.example.com/*` only. `background.js` then registers `gantt.js` on that origin with `chrome.scripting.registerContentScripts`. If you remove the origin or revoke access, the script is unregistered.

`storage` keeps the origin list (synced) and view preferences. View preferences are kept in the page's `localStorage` under `planeGantt_*` keys.

### Data

`gantt.js` runs in the Plane page and calls the same internal endpoints the Plane web app uses, with the session cookie:

| Endpoint | Used for |
|---|---|
| `GET /api/workspaces/{slug}/projects/` | project identifiers and names |
| `GET /api/workspaces/{slug}/states/` | state name, group and colour |
| `GET /api/workspaces/{slug}/user-issues/{userId}/?assignees=…` | work items of the profile tab (`assignees`, `created_by` or `subscriber`), paginated with `cursor=100:{page}:0` |

Workspace slug, user id and tab come from the URL: `/{slug}/profile/{userId}/{assigned|created|subscribed}`. No API key is involved, and only `GET` requests are made.

### Freshness

Plane doesn't push work item changes to the browser. The chart fetches its data each time it is opened: clicking the Gantt button, reloading the page, or switching between Assigned / Created / Subscribed. When you reopen it, the old data is replaced in place and the scroll position is kept. The toolbar shows the time of the last update. There is no background polling. Each load costs 2 requests plus one per 100 work items.

### Placement in the page

Plane is a React single-page app that hydrates the whole document. Inserting nodes before hydration finishes triggers React error #418, and React re-renders the page and wipes them. So the script:

1. waits for `load` plus a short delay;
2. then checks the page every 400 ms. On a profile tab it puts the Gantt button back into the layout switcher (`div.bg-layer-3.p-1` next to *Display*) if React removed it, and mounts the chart into the content area (the element right after the Summary/Assigned/… tab bar).

Nothing in Plane's React tree is modified. The native switcher buttons are only greyed out through a stylesheet rule while Gantt is active, and clicking one of them switches back.

### Look and feel

The chart is plain HTML built with the **Tailwind classes that Plane's own Gantt uses** (`bg-surface-1`, `outline-subtle-1`, `bg-accent-primary/20`, `text-placeholder` …). Plane already ships those classes and its theme variables, so the chart matches the native one in light and dark mode. Scale widths follow Plane's: 60 px/day (Week), 20 (Month), 5 (Quarter). Sidebar is 360 px, rows are 44 px, the header is 48 px.

Clicking a work item opens it in a new tab at `/{slug}/browse/{KEY}/`. Plane's peek panel is driven by internal app state, so an extension can't open it.

## Exporter

`export_gantt.py` uses the public REST API (`/api/v1/…`) with `X-API-Key`. It lists projects, then each project's work items, and keeps those assigned to the chosen member. The result is written into `template.html` as JSON. It respects Plane's 60 requests/minute limit by waiting on HTTP 429 and sends its own User-Agent, because some proxies block urllib's default one.

## Limitations

- **Internal API and markup.** The extension depends on the `user-issues` endpoint and on a few CSS class names of Plane CE v1.4.0. After upgrading Plane, check that the switcher selector in `gantt.js` (`switcher()`) and the content-area lookup (`contentArea()`) still match. Also check that the endpoint still returns `project_id`, `state_id`, `start_date` and `target_date`.
- Read-only: no drag-to-reschedule or resize.
- Profile-page filters (Display / Filters) are not applied to the Gantt. *Hide completed* is its own toggle.
- Chromium only, tested on Brave and Chrome. Firefox would need small manifest changes.
