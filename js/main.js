// Router + shell. Screens register themselves and are mounted into #screen.
import { Store } from "./state.js";
import { Sound } from "./audio.js";
import { renderHome } from "./screens/home.js";
import { renderTrivia } from "./screens/trivia.js";
import { renderEmoji } from "./screens/emoji.js";
import { renderScavenger } from "./screens/scavenger.js";
import { renderWyr } from "./screens/wyr.js";
import { renderSpinner } from "./screens/spinner.js";
import { renderStickers } from "./screens/stickers.js";
import { renderWaitTimes } from "./screens/waittimes.js";

const ROUTES = {
  home: renderHome,
  trivia: renderTrivia,
  emoji: renderEmoji,
  scavenger: renderScavenger,
  wyr: renderWyr,
  spinner: renderSpinner,
  stickers: renderStickers,
  wait: renderWaitTimes,
};

const screenEl = document.getElementById("screen");
const topbar = document.getElementById("topbar");
const coinCount = document.getElementById("coinCount");

export function refreshCoins() {
  coinCount.textContent = Store.coins;
}

export function go(route) {
  Sound.unlock();
  window.speechSynthesis && window.speechSynthesis.cancel();
  const render = ROUTES[route] || ROUTES.home;
  screenEl.innerHTML = "";
  topbar.hidden = route === "splash";
  refreshCoins();
  render(screenEl);
  screenEl.scrollTop = 0;
  window.scrollTo(0, 0);
}

// Topbar wiring
document.getElementById("homeBtn").addEventListener("click", () => { Sound.tap(); go("home"); });
const soundBtn = document.getElementById("soundBtn");
function paintSound() { soundBtn.textContent = Store.sound ? "🔊" : "🔇"; }
soundBtn.addEventListener("click", () => {
  const on = Store.toggleSound();
  paintSound();
  if (on) Sound.tap();
});
paintSound();

// Register service worker for offline play (queues have bad signal!) and make
// sure installed copies (incl. iOS home-screen apps) pick up new versions.
if ("serviceWorker" in navigator) {
  let reloading = false;
  // Only reload when a NEW worker replaces an existing one (a real update) —
  // not on the very first install, where claiming the page is expected.
  const hadController = !!navigator.serviceWorker.controller;
  navigator.serviceWorker.addEventListener("controllerchange", () => {
    if (!hadController || reloading) return;
    reloading = true;
    window.location.reload();
  });

  window.addEventListener("load", () => {
    navigator.serviceWorker.register("sw.js").then((reg) => {
      // Check for an update now, when the app regains focus, and hourly.
      reg.update().catch(() => {});
      const checkForUpdate = () => reg.update().catch(() => {});
      document.addEventListener("visibilitychange", () => {
        if (document.visibilityState === "visible") checkForUpdate();
      });
      setInterval(checkForUpdate, 60 * 60 * 1000);
      // If an updated worker is waiting, ask it to activate immediately.
      reg.addEventListener("updatefound", () => {
        const nw = reg.installing;
        if (!nw) return;
        nw.addEventListener("statechange", () => {
          if (nw.state === "installed" && navigator.serviceWorker.controller) {
            reg.waiting && reg.waiting.postMessage("skip-waiting");
          }
        });
      });
    }).catch(() => { /* offline is fine */ });
  });
}

go("home");
