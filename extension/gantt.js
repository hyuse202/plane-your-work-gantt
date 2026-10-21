// Plane Your Work Gantt: adds a cross-project Gantt layout to Plane's "Your work" / profile pages.
// The button sits next to the List/Board switcher and the chart renders inside the content area using
// Plane's own Tailwind classes, so it matches the native Gantt and follows the theme.
// Data comes from Plane's internal web API using the logged-in session (cookies). Read-only.
(() => {
  if (window.__planeGantt) return;
  window.__planeGantt = true;

  const MODES = { assigned: "assignees", created: "created_by", subscribed: "subscriber" };
  const VIEWS = { week: 60, month: 20, quarter: 5 }; // px per day, same as Plane's native Gantt
  const SIDEBAR = 360, HEAD = 48, ROW = 44, DAY = 864e5;
  const WD = ["Su", "M", "T", "W", "Th", "F", "Sa"];
  const MON = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const ICON_D = "M13.5415 11.333C13.5415 11.0142 13.5416 10.8062 13.5308 10.6465C13.5203 10.4927 13.5017 10.4293 13.4878 10.3955C13.4159 10.2221 13.2784 10.0837 13.105 10.0117C13.0713 9.99777 13.008 9.98025 12.854 9.96973C12.6943 9.95884 12.4857 9.95802 12.1665 9.95802H6.8335C6.51462 9.95802 6.30666 9.95887 6.14698 9.96973C5.99329 9.98022 5.92974 9.9978 5.896 10.0117C5.72244 10.0836 5.58411 10.222 5.51222 10.3955C5.49828 10.4293 5.48071 10.4928 5.47022 10.6465C5.45935 10.8062 5.4585 11.0141 5.4585 11.333C5.4585 11.6519 5.45935 11.8599 5.47022 12.0195C5.48071 12.1732 5.49828 12.2368 5.51222 12.2705C5.58411 12.4441 5.72244 12.5824 5.896 12.6543C5.92974 12.6682 5.99329 12.6858 6.14698 12.6963C6.30666 12.7072 6.51462 12.708 6.8335 12.708H12.1665C12.4857 12.708 12.6943 12.7072 12.854 12.6963C13.008 12.6858 13.0713 12.6683 13.105 12.6543C13.2784 12.5824 13.4159 12.444 13.4878 12.2705C13.5017 12.2368 13.5203 12.1733 13.5308 12.0195C13.5416 11.8599 13.5415 11.6519 13.5415 11.333ZM10.5415 4.667C10.5415 4.34815 10.5416 4.14015 10.5308 3.98048C10.5203 3.82667 10.5017 3.76324 10.4878 3.7295C10.4159 3.55605 10.2784 3.41765 10.105 3.34571C10.0713 3.33176 10.008 3.31424 9.85401 3.30372C9.69428 3.29282 9.4857 3.292 9.16651 3.292H3.8335C3.51462 3.292 3.30666 3.29285 3.14698 3.30372C2.99329 3.31421 2.92974 3.33178 2.896 3.34571C2.72244 3.4176 2.58411 3.55594 2.51222 3.7295C2.49828 3.76324 2.48071 3.82678 2.47022 3.98048C2.45935 4.14015 2.4585 4.34811 2.4585 4.667C2.4585 4.98589 2.45935 5.19385 2.47022 5.35352C2.48071 5.50722 2.49828 5.57076 2.51222 5.6045C2.58411 5.77806 2.72244 5.9164 2.896 5.98829C2.92974 6.00222 2.99329 6.0198 3.14698 6.03028C3.30666 6.04115 3.51462 6.042 3.8335 6.042H9.16651C9.4857 6.042 9.69428 6.04118 9.85401 6.03028C10.008 6.01976 10.0713 6.00224 10.105 5.98829C10.2784 5.91635 10.4159 5.77795 10.4878 5.6045C10.5017 5.57076 10.5203 5.50733 10.5308 5.35352C10.5416 5.19385 10.5415 4.98585 10.5415 4.667ZM14.7915 11.333C14.7915 11.6351 14.7923 11.8933 14.7778 12.1055C14.763 12.3231 14.7305 12.5378 14.6431 12.749C14.4443 13.2289 14.0623 13.6098 13.5825 13.8086C13.3712 13.8961 13.1567 13.9295 12.939 13.9443C12.7268 13.9588 12.4686 13.958 12.1665 13.958H6.8335C6.53143 13.958 6.27319 13.9588 6.06104 13.9443C5.8434 13.9295 5.62874 13.8961 5.41749 13.8086C4.93769 13.6098 4.55668 13.2288 4.35792 12.749C4.27042 12.5378 4.23704 12.3231 4.22218 12.1055C4.2077 11.8933 4.2085 11.6351 4.2085 11.333C4.2085 11.0309 4.2077 10.7727 4.22218 10.5606C4.23704 10.3429 4.27042 10.1283 4.35792 9.917C4.55668 9.4372 4.93769 9.05619 5.41749 8.85743C5.62874 8.76993 5.8434 8.73656 6.06104 8.72169C6.27319 8.70721 6.53143 8.70802 6.8335 8.70802H12.1665C12.4686 8.70802 12.7268 8.70721 12.939 8.72169C13.1567 8.73654 13.3712 8.76996 13.5825 8.85743C14.0623 9.05618 14.4443 9.43715 14.6431 9.917C14.7305 10.1282 14.763 10.343 14.7778 10.5606C14.7923 10.7727 14.7915 11.0309 14.7915 11.333ZM11.7915 4.667C11.7915 4.96908 11.7923 5.22732 11.7778 5.43946C11.763 5.65705 11.7305 5.87183 11.6431 6.08302C11.4443 6.56287 11.0623 6.94384 10.5825 7.14259C10.3712 7.23005 10.1567 7.26347 9.93897 7.27833C9.72682 7.2928 9.46859 7.292 9.16651 7.292H3.8335C3.53143 7.292 3.27319 7.2928 3.06104 7.27833C2.8434 7.26346 2.62874 7.23009 2.41749 7.14259C1.93769 6.94383 1.55668 6.56281 1.35792 6.08302C1.27042 5.87177 1.23704 5.65711 1.22218 5.43946C1.2077 5.22731 1.2085 4.96908 1.2085 4.667C1.2085 4.36492 1.2077 4.10669 1.22218 3.89454C1.23704 3.67689 1.27042 3.46224 1.35792 3.25098C1.55668 2.77119 1.93769 2.39017 2.41749 2.19141C2.62874 2.10391 2.8434 2.07054 3.06104 2.05567C3.27319 2.0412 3.53143 2.042 3.8335 2.042H9.16651C9.46859 2.042 9.72682 2.0412 9.93897 2.05567C10.1567 2.07053 10.3712 2.10395 10.5825 2.19141C11.0623 2.39017 11.4443 2.77113 11.6431 3.25098C11.7305 3.46218 11.763 3.67695 11.7778 3.89454C11.7923 4.10668 11.7915 4.36492 11.7915 4.667Z";
  const icon = cls => `<svg width="14" height="14" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" class="size-3.5 ${cls}"><path d="${ICON_D}" fill="currentColor"/></svg>`;
  const BTN_OFF = "pg-btn group grid h-5.5 w-7 place-items-center overflow-hidden rounded-sm transition-all hover:bg-layer-transparent-hover";
  const BTN_ON = "pg-btn group grid h-5.5 w-7 place-items-center overflow-hidden rounded-sm transition-all bg-layer-transparent-active hover:bg-layer-transparent-active";
  const CHIP = on => `cursor-pointer rounded-md p-1 px-2 text-11 hover:bg-layer-transparent-hover ${on ? "bg-layer-transparent-selected" : "bg-layer-transparent"}`;

  const esc = s => String(s ?? "").replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const d2n = s => Math.round(Date.parse(s.slice(0, 10) + "T00:00:00Z") / DAY);
  const n2d = n => new Date(n * DAY);
  const pad = n => String(n).padStart(2, "0");
  const today = () => { const d = new Date(); return d2n(`${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`); };
  let TODAY = today();
  const store = {
    get(k, d) { try { const v = localStorage.getItem("planeGantt_" + k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } },
    set(k, v) { try { localStorage.setItem("planeGantt_" + k, JSON.stringify(v)); } catch (e) {} },
  };
  const st = { active: store.get("active", false), view: store.get("view", "week"), hideDone: store.get("hideDone", true), full: false };
  const save = () => ["active", "view", "hideDone"].forEach(k => store.set(k, st[k]));

  // ------------------------------------------------------------ API (internal web API, session cookie)
  async function get(path, params) {
    const url = new URL(path, location.origin);
    for (const [k, v] of Object.entries(params || {})) url.searchParams.set(k, v);
    const r = await fetch(url, { credentials: "include", headers: { Accept: "application/json" } });
    if (!r.ok) throw new Error(`HTTP ${r.status} ${url.pathname}`);
    return r.json();
  }
  function flatten(x) {
    if (!x) return [];
    if (Array.isArray(x)) return x;
    if (Array.isArray(x.results)) return x.results;
    if (x.results && typeof x.results === "object") return Object.values(x.results).flatMap(flatten);
    return [];
  }
  async function load(slug, uid, mode) {
    const [projects, states] = await Promise.all([get(`/api/workspaces/${slug}/projects/`), get(`/api/workspaces/${slug}/states/`)]);
    const P = Object.fromEntries(flatten(projects).map(p => [p.id, p]));
    const S = Object.fromEntries(flatten(states).map(s => [s.id, s]));
    const issues = [];
    for (let page = 0; page < 50; page++) {
      const d = await get(`/api/workspaces/${slug}/user-issues/${uid}/`, { [MODES[mode]]: uid, per_page: 100, cursor: `100:${page}:0` });
      issues.push(...flatten(d));
      if (Array.isArray(d) || !d.next_page_results) break;
    }
    const seen = new Set();
    return issues.filter(i => i && i.id && !seen.has(i.id) && seen.add(i.id)).map(i => {
      const p = P[i.project_id] || {}, s = S[i.state_id] || {};
      const key = `${p.identifier || "?"}-${i.sequence_id}`;
      return { key, name: i.name, group: s.group || "backlog", color: s.color || "#60646C", start: i.start_date, due: i.target_date, url: `/${slug}/browse/${key}/` };
    });
  }

  // ------------------------------------------------------------ locating things on the page
  function route() {
    const parts = location.pathname.split("/").filter(Boolean);
    const i = parts.indexOf("profile");
    if (i < 0 || !MODES[parts[i + 2]]) return null;
    return { slug: parts[0], uid: parts[i + 1], mode: parts[i + 2] };
  }
  const switcher = () => document.querySelector("div.flex.items-center.gap-1.rounded-md.bg-layer-3.p-1");
  function contentArea() {
    // Content area = the element right after the Summary/Assigned/... tab bar
    const tab = [...document.querySelectorAll("a")].find(a => /\/profile\/[^/]+\/assigned\/?$/.test(a.getAttribute("href") || ""));
    for (let p = tab; p && p !== document.body; p = p.parentElement) {
      const n = p.nextElementSibling;
      if (n && n.getBoundingClientRect().height > 100) return n;
    }
    return null;
  }

  // ------------------------------------------------------------ UI
  const btn = document.createElement("button");
  btn.type = "button";
  btn.title = "Gantt chart";
  btn.onclick = () => { st.active = true; save(); wantRefresh = true; tick(); };

  const root = document.createElement("div");
  root.className = "pg-root flex flex-col bg-surface-1";
  root.addEventListener("click", e => {
    const t = e.target.closest("[data-act]");
    if (!t) return;
    const a = t.dataset.act;
    if (a in VIEWS) { st.view = a; save(); render(); scrollToday(); }
    else if (a === "today") scrollToday(true);
    else if (a === "done") { st.hideDone = !st.hideDone; save(); render(); }
    else if (a === "full") setFull(!st.full);
  });
  addEventListener("keydown", e => { if (e.key === "Escape" && st.full) setFull(false); });

  let DATA = null, loadedFor = "", loading = false, error = "", geom = null, lastView = null, fetchedAt = null, wantRefresh = false;

  // Full screen mounts the chart on <body>: inside the content area a fixed box would sit under Plane's header
  // (and ancestors with container queries can trap position: fixed).
  function mount(area) {
    const target = st.full ? document.body : area;
    if (!target || root.parentElement === target) return false;
    Object.assign(root.style, st.full
      ? { position: "fixed", inset: "0", zIndex: "2147483000" }
      : { position: "absolute", inset: "0", zIndex: "4" });
    if (!st.full) target.style.position = "relative";
    target.appendChild(root);
    return true;
  }
  function setFull(v) {
    st.full = v;
    mount(contentArea());
    render();
    scrollToday();
  }

  function toolbar(count) {
    return `<div class="px-page-x relative flex w-full flex-shrink-0 flex-wrap items-center gap-2 bg-surface-1 py-2 whitespace-nowrap" style="height:40px">
      <div class="ml-auto"><div class="ml-auto text-11 font-medium text-tertiary">${count} Work items${fetchedAt ? ` · updated ${pad(fetchedAt.getHours())}:${pad(fetchedAt.getMinutes())}` : ""}</div></div>
      <div class="flex flex-wrap items-center gap-2">
        <div data-act="done" class="${CHIP(st.hideDone)}">Hide completed</div>
        ${Object.keys(VIEWS).map(v => `<div data-act="${v}" class="${CHIP(st.view === v)}">${v[0].toUpperCase() + v.slice(1)}</div>`).join("")}
      </div>
      <button type="button" data-act="today" class="rounded-md bg-layer-transparent p-1 px-2 text-11 hover:bg-layer-transparent-hover">Today</button>
      <button type="button" data-act="full" title="${st.full ? "Exit full screen" : "Full screen"}" class="flex items-center justify-center rounded-md border border-subtle bg-layer-transparent p-1 transition-all hover:bg-layer-transparent-hover">
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-3.5 text-secondary">${st.full
          ? '<path d="M8 3v3a2 2 0 0 1-2 2H3"/><path d="M21 8h-3a2 2 0 0 1-2-2V3"/><path d="M3 16h3a2 2 0 0 1 2 2v3"/><path d="M16 21v-3a2 2 0 0 1 2-2h3"/>'
          : '<path d="M15 3h6v6"/><path d="M9 21H3v-6"/><path d="M21 3l-7 7"/><path d="M3 21l7-7"/>'}</svg>
      </button></div>`;
  }

  const span = r => { let s = r.start ? d2n(r.start) : null, e = r.due ? d2n(r.due) : null; if (s == null) s = e; if (e == null) e = s; return e < s ? [e, s] : [s, e]; };
  const isoWeek = d => { const t = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate())); const day = t.getUTCDay() || 7; t.setUTCDate(t.getUTCDate() + 4 - day); return Math.ceil(((t - Date.UTC(t.getUTCFullYear(), 0, 1)) / DAY + 1) / 7); };

  function render() {
    if (!root.isConnected) return;
    if (!DATA) {
      root.innerHTML = toolbar(DATA ? DATA.length : 0) + `<div class="grid h-full w-full place-items-center text-13 text-tertiary">${error ? "Could not load work items: " + esc(error) : "Loading…"}</div>`;
      return;
    }
    const rows = DATA.filter(r => !(st.hideDone && (r.group === "completed" || r.group === "cancelled")));
    const dated = rows.filter(r => r.start || r.due).sort((a, b) => span(a)[0] - span(b)[0] || span(a)[1] - span(b)[1]);
    const list = [...dated, ...rows.filter(r => !r.start && !r.due)];
    const dw = VIEWS[st.view];
    // Time range: cover every item with padding, aligned to Sunday (week/month) or month start (quarter).
    const padDays = { week: 14, month: 35, quarter: 75 }[st.view];
    let min = TODAY - padDays, max = TODAY + padDays * 2;
    dated.forEach(r => { const [s, e] = span(r); min = Math.min(min, s - padDays); max = Math.max(max, e + padDays); });
    if (st.view === "quarter") { const d = n2d(min); min = d2n(`${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-01`); }
    else min -= n2d(min).getUTCDay();
    max += 6 - n2d(max).getUTCDay();
    const W = (max - min + 1) * dw, x = n => (n - min) * dw;
    geom = { x };

    // Header + background columns
    let top = "", bottom = "", cols = "";
    if (st.view === "week") {
      for (let n = min; n <= max; n += 7) {
        const d = n2d(n), dEnd = n2d(n + 6);
        let days = "", body = "";
        for (let k = 0; k < 7; k++) {
          const day = n2d(n + k), today = n + k === TODAY, we = k === 0 || k === 6;
          days += `<div class="flex flex-shrink-0 justify-between p-1 text-center capitalize outline-[0.25px] outline-subtle-1${today ? " bg-accent-primary/20" : ""}" style="width:${dw}px"><div class="space-x-1 text-11 font-medium text-placeholder">${WD[k]}</div><div class="space-x-1 text-11 font-medium"><span class="${today ? "rounded-sm bg-accent-primary px-1 text-on-color" : ""}">${day.getUTCDate()}</span></div></div>`;
          body += `<div class="h-full overflow-hidden outline-[0.25px] outline-subtle${today ? " bg-accent-primary/20" : ""}" style="width:${dw}px">${we ? '<div class="h-full bg-surface-2 outline-[0.25px] outline-strong"></div>' : ""}</div>`;
        }
        cols += `<div class="relative flex flex-col outline-[0.25px] outline-subtle-1">
          <div class="sticky top-0 w-full flex-shrink-0 bg-surface-1 outline-[1px] outline-subtle-1" style="height:${HEAD}px;z-index:8">
            <div class="inline-flex h-7 w-full justify-between"><div class="sticky z-[1] m-1 flex items-center bg-surface-1 px-3 py-1 text-13 font-regular whitespace-nowrap text-secondary capitalize" style="left:${SIDEBAR}px">${MON[dEnd.getUTCMonth()]} ${dEnd.getUTCFullYear()}</div><div class="sticky px-3 py-2 text-11 whitespace-nowrap text-placeholder capitalize">Week ${isoWeek(n2d(n + 1))}</div></div>
            <div class="flex h-5 w-full">${days}</div></div>
          <div class="flex h-full w-full flex-grow bg-surface-1">${body}</div></div>`;
      }
    } else {
      // Month view: months on top, weeks below. Quarter view: quarters on top, months below.
      const unitsTop = [], unitsBottom = [];
      for (let n = min; n <= max;) {
        const d = n2d(n);
        if (st.view === "month") {
          const last = Math.min(max, d2n(`${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-01`) + new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + 1, 0)).getUTCDate() - 1);
          unitsTop.push({ from: n, to: last, title: `${MON[d.getUTCMonth()]} ${d.getUTCFullYear()}` });
          n = last + 1;
        } else {
          const q = Math.floor(d.getUTCMonth() / 3), endMonth = q * 3 + 3;
          const last = Math.min(max, d2n(new Date(Date.UTC(d.getUTCFullYear(), endMonth, 1)).toISOString()) - 1);
          unitsTop.push({ from: n, to: last, title: `Q${q + 1} ${d.getUTCFullYear()}` });
          n = last + 1;
        }
      }
      for (let n = min; n <= max;) {
        const d = n2d(n);
        let last, title;
        if (st.view === "month") { last = Math.min(max, n + 6); title = `${d.getUTCDate()}-${n2d(last).getUTCDate()}`; }
        else { last = Math.min(max, d2n(new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + 1, 1)).toISOString()) - 1); title = MON[d.getUTCMonth()]; }
        unitsBottom.push({ from: n, to: last, title, today: TODAY >= n && TODAY <= last });
        n = last + 1;
      }
      top = unitsTop.map(u => `<div class="flex outline-[0.5px] outline-subtle-1" style="width:${(u.to - u.from + 1) * dw}px"><div class="sticky z-[1] m-1 flex items-center bg-surface-1 px-3 py-1 text-14 font-regular whitespace-nowrap text-secondary capitalize" style="left:${SIDEBAR}px">${u.title}</div></div>`).join("");
      bottom = unitsBottom.map(u => `<div class="flex flex-shrink-0 justify-between px-2 py-1 text-center capitalize outline-[0.25px] outline-subtle-1${u.today ? " bg-accent-primary/20" : ""}" style="width:${(u.to - u.from + 1) * dw}px"><div class="space-x-1 text-11 font-medium text-placeholder"><span class="${u.today ? "rounded-sm bg-accent-primary px-1 text-on-color" : ""}">${u.title}</span></div></div>`).join("");
      cols = `<div class="relative flex flex-col outline-[0.25px] outline-subtle-1" style="width:${W}px">
        <div class="sticky top-0 w-full flex-shrink-0 bg-surface-1 outline-[1px] outline-subtle-1" style="height:${HEAD}px;z-index:8"><div class="flex h-7">${top}</div><div class="flex h-5 w-full">${bottom}</div></div>
        <div class="flex h-full w-full flex-grow bg-surface-1">${unitsBottom.map(u => `<div class="h-full overflow-hidden outline-[0.25px] outline-subtle${u.today ? " bg-accent-primary/20" : ""}" style="width:${(u.to - u.from + 1) * dw}px"></div>`).join("")}</div></div>`;
    }

    // Sidebar rows + bars
    let side = "", bars = "";
    for (const r of list) {
      const has = r.start || r.due, [s, e] = has ? span(r) : [0, 0], days = e - s + 1;
      side += `<div class="px-page-x group flex w-full items-center gap-2 bg-layer-transparent pr-4 hover:bg-layer-transparent-hover" style="height:${ROW}px">
        <div class="flex h-full flex-grow items-center justify-between gap-2 truncate"><div class="flex-grow truncate">
          <a href="${esc(r.url)}" target="_blank" class="line-clamp-1 w-full cursor-pointer text-13 text-primary"><div class="relative flex h-full w-full cursor-pointer items-center gap-2">
            <div class="flex shrink-0 items-center space-x-2"><span class="font-medium whitespace-nowrap text-caption-sm-regular text-tertiary">${esc(r.key)}</span></div>
            <span class="flex-grow truncate text-13 font-medium" title="${esc(r.name)}">${esc(r.name)}</span></div></a></div>
          <div class="flex-shrink-0 text-13 text-secondary"><span>${has ? `${days} day${days > 1 ? "s" : ""}` : ""}</span></div></div></div>`;
      bars += has
        ? `<div class="relative z-[5]" style="height:${ROW}px;margin-left:${x(s)}px;width:${days * dw}px"><div class="flex h-full w-full items-center"><div class="relative h-full w-full"><div class="group relative z-[5] inline-flex h-full w-full cursor-pointer items-center font-medium transition-all"><div class="relative z-[6] flex h-8 w-full items-center rounded-sm">
            <a href="${esc(r.url)}" target="_blank" title="${esc(r.key + " · " + r.name + " · " + (r.start || "?") + " → " + (r.due || "?"))}" class="space-between relative flex h-full w-full cursor-pointer items-center rounded-sm" style="background-color:${esc(r.color)}${r.group === "completed" || r.group === "cancelled" ? ";opacity:.6" : ""}">
              <div class="absolute top-0 left-0 h-full w-full bg-surface-1/50"></div>
              <div class="sticky w-auto flex-1 truncate overflow-hidden px-2.5 py-1 text-13 text-primary" style="left:${SIDEBAR}px">${esc(r.name)}</div></a></div></div></div></div></div>`
        : `<div style="height:${ROW}px"></div>`;
    }

    const prev = root.querySelector(".pg-scroll");
    const keep = prev ? [prev.scrollLeft, prev.scrollTop, lastView === st.view] : null;
    lastView = st.view;
    root.innerHTML = toolbar(list.length) + `
      <div class="pg-scroll vertical-scrollbar horizontal-scrollbar flex scrollbar-lg h-full w-full overflow-auto border-t-[0.5px] border-subtle">
        <div class="px-0 sticky left-0 z-10 h-max min-h-full flex-shrink-0 border-r-[0.5px] border-subtle-1 bg-surface-1" style="width:${SIDEBAR}px">
          <div class="px-page-x sticky top-0 z-10 box-border flex flex-shrink-0 items-end justify-between gap-2 border-b-[0.5px] border-subtle-1 bg-surface-1 pr-4 pb-2 text-13 font-medium text-tertiary" style="height:${HEAD}px"><div class="flex items-center gap-2"><h6>Work items</h6></div><h6>Duration</h6></div>
          <div class="px-0 h-max min-h-full bg-surface-1">${side || '<div class="px-page-x py-4 text-13 text-tertiary">No work items.</div>'}</div>
        </div>
        <div class="relative h-max min-h-full flex-shrink-0 flex-grow" style="width:${W}px">
          <div class="absolute top-0 left-0 flex h-max min-h-full w-max">${cols}</div>
          <div class="relative h-full" style="padding-top:${HEAD}px">${bars}</div>
        </div>
      </div>`;
    if (keep) { const sc = root.querySelector(".pg-scroll"); sc.scrollTop = keep[1]; if (keep[2]) sc.scrollLeft = keep[0]; }
  }
  // Centre today in the visible part of the timeline (the sticky sidebar covers the first SIDEBAR px).
  // Runs after layout, because the container may just have been moved or resized (e.g. full screen).
  function scrollToday(smooth) {
    requestAnimationFrame(() => requestAnimationFrame(() => {
      const sc = root.querySelector(".pg-scroll");
      if (!sc || !geom) return;
      const left = geom.x(TODAY) + VIEWS[st.view] / 2 - (sc.clientWidth - SIDEBAR) / 2;
      sc.scrollTo({ left: Math.max(0, left), behavior: smooth ? "smooth" : "auto" });
    }));
  }

  // Data is fetched each time the Gantt is opened (button click, page load, tab change).
  // First load shows "Loading…" and centres on today; a reopen swaps the data in place and keeps the scroll.
  async function ensureData(r) {
    const key = `${r.uid}/${r.mode}`;
    if (loading) return;
    const first = loadedFor !== key;
    if (!first && !wantRefresh) return;
    wantRefresh = false;
    loadedFor = key; loading = true; error = "";
    if (first) { DATA = null; fetchedAt = null; render(); }
    try {
      const d = await load(r.slug, r.uid, r.mode);
      if (loadedFor === key) { DATA = d; fetchedAt = new Date(); TODAY = today(); }
    } catch (e) {
      if (first) { error = e.message; loadedFor = ""; }
      // on a failed reopen, keep showing the last data
    }
    loading = false;
    render();
    if (first) scrollToday();
  }

  // ------------------------------------------------------------ keep in sync with the page (Plane is an SPA and React may re-render)
  let secondaryColor = null;
  const style = document.createElement("style");
  function tick() {
    const r = route(), sw = r && switcher();
    if (!r || !sw) {
      btn.remove(); root.remove(); st.full = false;
      if (!r) loadedFor = "";
      return;
    }
    if (!secondaryColor) {
      const probe = sw.querySelector("button:not(.pg-btn) svg.text-secondary");
      if (probe) secondaryColor = getComputedStyle(probe).color;
    }
    style.textContent = `.pg-on > button:not(.pg-btn){background-color:transparent!important}` +
      (secondaryColor ? `.pg-on > button:not(.pg-btn) svg{color:${secondaryColor}!important}` : "");
    if (!style.isConnected) document.head.appendChild(style);
    if (btn.parentElement !== sw) sw.appendChild(btn);
    if (!sw.__pgHooked) {
      sw.__pgHooked = true;
      sw.addEventListener("click", e => { if (!e.target.closest(".pg-btn")) { st.active = false; save(); tick(); } }, true);
    }
    const on = st.active;
    const cls = on ? BTN_ON : BTN_OFF;
    if (btn.className !== cls) { btn.className = cls; btn.innerHTML = icon(on ? "text-primary" : "text-secondary"); }
    sw.classList.toggle("pg-on", on);
    if (!on) { root.remove(); st.full = false; return; }
    const area = contentArea();
    if (!area && !st.full) return;
    if (mount(area)) {
      render();
      if (DATA) scrollToday();
    }
    ensureData(r);
  }

  const start = () => setTimeout(() => { tick(); setInterval(tick, 400); }, 1200);
  if (document.readyState === "complete") start();
  else addEventListener("load", start, { once: true });
})();
