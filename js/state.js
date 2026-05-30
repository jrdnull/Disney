// Persistent player state (coins, stickers, scores) in localStorage.
const KEY = "queuequest.v1";

const DEFAULTS = {
  coins: 0,
  stickers: ["mouse"], // first one free
  best: { trivia: 0, emoji: 0 },
  sound: true,
  lastPark: 4, // Disneyland Paris — that's where we are!
};

let state = load();

function load() {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return { ...DEFAULTS, ...JSON.parse(raw) };
  } catch (e) { /* private mode / disabled storage */ }
  return { ...DEFAULTS };
}

function save() {
  try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) { /* ignore */ }
}

export const Store = {
  get: () => state,
  get coins() { return state.coins; },
  addCoins(n) { state.coins += n; save(); return state.coins; },
  hasSticker(id) { return state.stickers.includes(id); },
  unlockSticker(id) {
    if (!state.stickers.includes(id)) { state.stickers.push(id); save(); }
  },
  setBest(game, score) {
    if (score > (state.best[game] || 0)) { state.best[game] = score; save(); return true; }
    return false;
  },
  best(game) { return state.best[game] || 0; },
  get sound() { return state.sound; },
  toggleSound() { state.sound = !state.sound; save(); return state.sound; },
  get lastPark() { return state.lastPark; },
  set lastPark(id) { state.lastPark = id; save(); },
};
