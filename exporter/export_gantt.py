#!/usr/bin/env python3
"""Export a cross-project Gantt chart of one member's Plane work items to a standalone HTML file.

Uses Plane's public REST API (v1) with an API key. Configuration comes from environment variables
or a .env file (see .env.example):

    PLANE_BASE_URL   e.g. https://plane.example.com
    PLANE_API_KEY    personal API token (Profile settings > API tokens)
    PLANE_WORKSPACE  workspace slug, the first segment of your Plane URLs

Usage:
    python3 export_gantt.py [--assignee me|<display name>|<email>] [-o gantt.html] [--env path/to/.env]

Standard library only. The output embeds the work item data but never the API key.
"""
import argparse
import html
import json
import os
import sys
import time
import urllib.error
import urllib.parse
import urllib.request
from datetime import date
from pathlib import Path

HERE = Path(__file__).resolve().parent


def load_env(path):
    cfg = {}
    for p in [path] if path else [Path.cwd() / ".env", HERE / ".env", HERE.parent / ".env"]:
        if p and Path(p).exists():
            for line in Path(p).read_text().splitlines():
                line = line.strip()
                if line and not line.startswith("#") and "=" in line:
                    k, v = line.split("=", 1)
                    cfg[k.strip()] = v.strip().strip('"').strip("'")
            break
    for k in ("PLANE_BASE_URL", "PLANE_API_KEY", "PLANE_WORKSPACE"):
        if os.environ.get(k):
            cfg[k] = os.environ[k]
    missing = [k for k in ("PLANE_BASE_URL", "PLANE_API_KEY", "PLANE_WORKSPACE") if not cfg.get(k)]
    if missing:
        sys.exit(f"Missing configuration: {', '.join(missing)}. Copy .env.example to .env and fill it in.")
    return cfg


class Plane:
    def __init__(self, cfg):
        self.root = cfg["PLANE_BASE_URL"].rstrip("/")
        self.ws = f"{self.root}/api/v1/workspaces/{cfg['PLANE_WORKSPACE']}/"
        self.key = cfg["PLANE_API_KEY"]
        self.slug = cfg["PLANE_WORKSPACE"]

    def get(self, path, params=None):
        url = (self.root + path) if path.startswith("/api/") else self.ws + path.lstrip("/")
        if params:
            url += "?" + urllib.parse.urlencode(params)
        for attempt in range(4):
            req = urllib.request.Request(url, headers={
                "X-API-Key": self.key, "Accept": "application/json",
                # Some proxies (e.g. Cloudflare) block urllib's default User-Agent.
                "User-Agent": "plane-your-work-gantt/1.0"})
            try:
                with urllib.request.urlopen(req, timeout=60) as r:
                    return json.loads(r.read() or b"null")
            except urllib.error.HTTPError as e:
                if e.code == 429 and attempt < 3:  # Plane allows 60 requests/minute per key
                    reset = int(e.headers.get("X-RateLimit-Reset") or 0)
                    time.sleep(max(1, min(60, reset - int(time.time()))) if reset else 5)
                    continue
                sys.exit(f"HTTP {e.code} on {url.replace(self.root, '')}: {e.read().decode(errors='replace')[:300]}")
            except (TimeoutError, urllib.error.URLError) as e:
                if attempt == 3:
                    sys.exit(f"Network error on {url.replace(self.root, '')}: {e}")
                time.sleep(2 * (attempt + 1))

    def paged(self, path):
        params, out = {"per_page": 100}, []
        while True:
            d = self.get(path, params)
            if isinstance(d, list):
                return d
            out += d.get("results", [])
            if not d.get("next_page_results") or not d.get("next_cursor"):
                return out
            params["cursor"] = d["next_cursor"]


def find_member(plane, ref):
    if ref == "me":
        return plane.get("/api/v1/users/me/")["id"]
    ref = ref.lower()
    for m in plane.paged("members/"):
        email = (m.get("email") or "").lower()
        if ref in ((m.get("display_name") or "").lower(), email, email.split("@")[0], m["id"]):
            return m["id"]
    sys.exit(f"No workspace member matches '{ref}'")


def collect(plane, uid):
    rows = []
    for p in plane.paged("projects/"):
        items = [i for i in plane.paged(f"projects/{p['id']}/work-items/") if uid in (i.get("assignees") or [])]
        if not items:
            continue
        states = {s["id"]: s for s in plane.paged(f"projects/{p['id']}/states/")}
        for i in items:
            s = states.get(i.get("state")) or {}
            key = f"{p['identifier']}-{i['sequence_id']}"
            rows.append({
                "key": key, "name": i["name"], "project": p["identifier"], "projectName": p["name"],
                "state": s.get("name", "-"), "group": s.get("group", "backlog"), "color": s.get("color") or "#888",
                "priority": i.get("priority") or "none", "start": i.get("start_date"), "due": i.get("target_date"),
                "url": f"{plane.root}/{plane.slug}/browse/{key}/",
            })
        print(f"{p['identifier']:<12} {len(items)} work items", file=sys.stderr)
    return rows


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--assignee", default="me", help="'me' (default), display name, email or member id")
    ap.add_argument("-o", "--out", default="gantt.html")
    ap.add_argument("--env", help="path to a .env file")
    a = ap.parse_args()
    plane = Plane(load_env(a.env))
    rows = collect(plane, find_member(plane, a.assignee))
    tpl = (HERE / "template.html").read_text()
    out = tpl.replace("__DATA__", json.dumps(rows, ensure_ascii=False).replace("</", "<\\/")) \
             .replace("__TODAY__", date.today().isoformat()) \
             .replace("__WHO__", html.escape(a.assignee))
    Path(a.out).write_text(out)
    print(f"Wrote {a.out} ({len(rows)} work items)")


if __name__ == "__main__":
    main()
