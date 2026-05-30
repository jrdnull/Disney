# 🏰 Queue Quest — Disney Line Games

A free, mobile-first mini-game collection to keep kids (ages **5–10**) happily
busy while waiting in long theme-park queues. Built to run from nothing but a
GitHub repo — no servers, no build step, no accounts.

> Made for a family stuck in the Paris sunshine ☀️🇫🇷 — Disneyland Paris is the
> default park for live wait times.

## ✨ What's inside

| Game | What kids do |
| --- | --- |
| 🧠 **Trivia** | Friendly Disney multiple-choice quiz (40+ questions, easy & harder). |
| 🎬 **Guess the Movie** | Work out the Disney film from a string of emojis. |
| 🔍 **I-Spy Hunt** | Spot real things around the queue (a balloon, Mickey ears, an ice cream…). Keeps eyes busy and heads up! |
| 🤔 **Would You Rather** | Silly Disney "this or that" choices to chat about. No wrong answers. |
| 🎡 **Magic Wheel** | Spin for a fun challenge — silly dance, lion roar, hero pose. |
| 🏅 **Sticker Book** | Spend the ✨ coins you earn to unlock 12 collectible stickers. |
| ⏱️ **Live Wait Times** | Real ride wait times for any Disney park (needs internet). |

### Kid-friendly touches
- **Big touch targets** and bright, chunky buttons for little fingers.
- **🔊 "Read to me"** uses the phone's voice so pre-readers can play too.
- **Sound effects** (toggle with the 🔊 button) and confetti celebrations.
- **✨ Coins & stickers** give a gentle reward loop without any spending or ads.
- Progress (coins, stickers, best scores) is **saved on the device**.

## 📲 Works offline (PWA)

The whole thing is a Progressive Web App with a service worker, so once it has
loaded once it **keeps working even with terrible signal** in the line. On a
phone, use the browser's **"Add to Home Screen"** to get a full-screen app icon.

Only the *Live Wait Times* screen needs a connection — every game works offline.

## 🚀 Deploy it (GitHub Pages, ~1 minute)

This repo is a plain static site, so GitHub Pages serves it directly.

1. Push this branch to GitHub.
2. In the repo, go to **Settings → Pages**.
3. Under **Build and deployment → Source**, choose **GitHub Actions**.
4. The included workflow (`.github/workflows/deploy.yml`) runs on every push and
   publishes the site. The live URL appears in the Actions run summary
   (usually `https://<you>.github.io/<repo>/`).

That's it — no build tools, no Node, no secrets.

## 🌐 Data sources (all free, no API keys)

- **Live wait times:** [queue-times.com](https://queue-times.com) public JSON API.
  It doesn't send CORS headers, so from the browser the app routes the request
  through a public CORS proxy (with fallbacks) — a real `*.github.io` origin is
  accepted by these proxies. If a proxy is down the app fails gracefully and
  tells you the games still work offline.
- All game content (trivia, emoji puzzles, scavenger items, etc.) is bundled in
  `js/data/` so the games never depend on the network.

## 🛠️ Run locally

```bash
npx http-server -p 8123 -c-1   # then open http://localhost:8123
```

Any static file server works. A service worker requires `http(s)://`
(not `file://`), so don't just double-click `index.html`.

## 📁 Project layout

```
index.html              app shell
manifest.webmanifest    PWA manifest
sw.js                   service worker (offline cache)
css/style.css           styles
icons/                  generated app icons (see scripts/make_icons.py)
js/
  main.js               router + shell
  state.js              localStorage save data
  audio.js              sound effects + read-aloud
  ui.js, rewards.js     helpers (DOM, toast, confetti, coins)
  data/                 all game content
  screens/              one file per game screen
.github/workflows/      GitHub Pages deploy
```

Icons are regenerated with `python3 scripts/make_icons.py` (pure Python, no deps).

Have fun, and survive the queue! 🎢
