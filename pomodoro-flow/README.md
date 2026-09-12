# Pomodoro Flow

A minimal, single-page Pomodoro timer that runs entirely in the browser — no build step, no dependencies.

## Features

- Focus / Short Break / Long Break modes (25 / 5 / 15 minutes)
- Animated ring progress indicator
- Session logging with daily count, day streak, and all-time total (stored in `localStorage`)
- Recent sessions list

## Running locally

Open `index.html` directly in a browser, or serve the folder over HTTP:

```bash
powershell -File serve.ps1
```

Then visit `http://localhost:5173/`.

## Files

- `index.html` — page structure
- `style.css` — styling and layout
- `script.js` — timer logic and session tracking
- `serve.ps1` — tiny local dev server (no dependencies)
