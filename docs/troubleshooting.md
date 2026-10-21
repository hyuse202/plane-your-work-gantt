# Troubleshooting

### The Gantt button does not appear

1. Open the extension's settings (click its toolbar icon) and check that your Plane URL is listed with **Access granted**. The URL must match the address in your browser exactly, `https` and port included.
2. Reload the Plane tab after adding the URL or reloading the extension. Content scripts don't attach to pages that are already open.
3. The button only shows on the **Assigned / Created / Subscribed** tabs of *Your work* or a profile, not on Summary or Activity.
4. Open DevTools › Console and look for errors from `gantt.js`. Errors that mention React #418 come from Plane itself and are harmless.

### "Could not load work items: HTTP 401/403"

Your Plane session expired. Log in again and reload.

### The chart is empty or dates look wrong

Items without a start and due date are listed at the bottom of the sidebar with no bar. If only one of the two dates is set, the bar is one day long. Check whether *Hide completed* is hiding what you expect.

### It broke after upgrading Plane

See *Limitations* in [how-it-works.md](how-it-works.md). Usually a class name or the `user-issues` response shape changed.

### Exporter: `HTTP 403 ... error code: 1010`

A Cloudflare rule is blocking the client. The exporter already sends a custom User-Agent. If it still fails, allow the client in Cloudflare or run the exporter from inside your network.

### Exporter: `Missing configuration`

Copy `.env.example` to `.env` (in the repo root or `exporter/`) and fill in all three variables, or pass `--env path/to/file`.
