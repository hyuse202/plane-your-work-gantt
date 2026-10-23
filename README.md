# Plane Your Work Gantt

A Gantt view of **all your work items across every project** in [Plane](https://plane.so), right on the *Your work* page.

Plane Community Edition only offers Gantt inside a single project. *Your work › Assigned* is limited to List and Board, and workspace Views to List and Spreadsheet. If your tasks are spread over many projects, you can't see them on one timeline. This project adds that timeline.

It comes in two parts:

| | What it does | Needs |
|---|---|---|
| [`extension/`](extension) | Browser extension. Adds a **Gantt** button next to the List/Board switcher on *Your work* and renders the chart inside the page, styled like Plane's own Gantt. | A Chromium browser (Chrome, Brave, Edge, …), logged in to Plane |
| [`exporter/`](exporter) | Python script that exports a member's work items to a standalone, shareable HTML Gantt file. | Python 3.8+, a Plane API token |

## Features

- One timeline for work items from every project, for the **Assigned**, **Created** and **Subscribed** tabs.
- Looks like Plane's native Gantt: Week / Month / Quarter scales, *Today*, full screen, same colours, light and dark theme.
- Bars use each item's state colour. Items without dates are listed at the bottom.
- *Hide completed* toggle, on by default.
- Fresh data every time you open the Gantt (button click, page reload or switching tabs). The toolbar shows when it was last updated.
- Works on any member's profile page, not only yours.
- Read-only: the extension never changes data in Plane.
- No API key and no hard-coded domain. The extension uses your existing Plane session and only gets access to the instance URLs you add.

## Install the extension

The extension is not on the Chrome Web Store yet, so you load it unpacked:

1. **[Download the latest extension (.zip)](https://github.com/hyuse202/plane-your-work-gantt/releases/latest/download/plane-your-work-gantt-extension.zip)** and unzip it. All versions are on the [Releases](https://github.com/hyuse202/plane-your-work-gantt/releases) page.
2. Open `chrome://extensions` (or `brave://extensions`, `edge://extensions`) and turn on **Developer mode**.
3. Click **Load unpacked** and select the unzipped `plane-your-work-gantt-extension` folder. Keep the folder: the browser loads the extension from it.
4. The settings page opens. Enter your Plane URL (for example `https://plane.example.com`), click **Add**, then allow access.
5. Reload Plane and go to **Your work**. A Gantt icon appears next to the List and Board icons.

To change instances later, click the extension icon in the toolbar.

**Updating:** download the new zip and unzip it over the same folder, then click ↻ on the extension card and reload Plane. If you cloned the repo instead, `git pull` and load the `extension` folder.

## Use the exporter

```bash
cp .env.example .env          # then fill in PLANE_BASE_URL, PLANE_API_KEY, PLANE_WORKSPACE
python3 exporter/export_gantt.py                       # your own work items -> gantt.html
python3 exporter/export_gantt.py --assignee jane -o jane.html
```

The HTML file contains the exported work items (but not the API key). Share it only with people allowed to see that data.

## Compatibility

Built and tested against **Plane Community Edition v1.4.0** (self-hosted). The extension relies on Plane's internal web API and on the page markup of that version. A major Plane upgrade may break it; see [docs/how-it-works.md](docs/how-it-works.md) for what to check.

## Documentation

- [How it works](docs/how-it-works.md): architecture, endpoints used, permissions, limitations
- [Troubleshooting](docs/troubleshooting.md)

## Privacy

- The extension runs only on the origins you add, and only reads data your account can already see.
- Nothing is sent anywhere except your own Plane server. There is no analytics or telemetry.
- Settings (the list of origins and your view preferences) are stored in browser storage.

## License

[MIT](LICENSE)

---

### Tiếng Việt (tóm tắt)

Extension trình duyệt thêm nút **Gantt** cạnh nút List/Board ở trang *Your work* của Plane, hiển thị task của **mọi project** trên một timeline, giao diện giống Gantt gốc. Tải file zip ở mục [Releases](https://github.com/hyuse202/plane-your-work-gantt/releases/latest), giải nén, rồi cài bằng *Load unpacked* thư mục vừa giải nén, rồi nhập URL Plane của bạn ở trang cài đặt. Script `exporter/` xuất Gantt ra file HTML, cấu hình qua `.env`.
