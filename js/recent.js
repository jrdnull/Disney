// "Recently seen" memory so the same questions / movies / challenges don't keep
// reappearing. Tracks a per-game list of keys in localStorage (most recent last).
const KEY = "queuequest.recent.v1";

function loadAll() {
  try { return JSON.parse(localStorage.getItem(KEY)) || {}; }
  catch (e) { return {}; }
}
function saveAll(o) {
  try { localStorage.setItem(KEY, JSON.stringify(o)); } catch (e) { /* ignore */ }
}
function loadGame(game) {
  const all = loadAll();
  return Array.isArray(all[game]) ? all[game] : [];
}

function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = (Math.random() * (i + 1)) | 0;
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Choose `count` items, preferring ones not recently seen. Does NOT record them.
export function chooseFresh(game, items, count, keyOf = (_, i) => String(i)) {
  const recent = loadGame(game);
  const rank = new Map(recent.map((k, i) => [k, i])); // smaller = older
  const decorated = items.map((it, i) => ({ it, key: keyOf(it, i) }));
  const fresh = shuffle(decorated.filter((d) => !rank.has(d.key)));
  let chosen = fresh.slice(0, count);
  if (chosen.length < count) {
    // Not enough fresh — top up with the least-recently-used first.
    const stale = decorated
      .filter((d) => rank.has(d.key))
      .sort((a, b) => rank.get(a.key) - rank.get(b.key));
    chosen = chosen.concat(stale.slice(0, count - chosen.length));
  }
  return chosen.map((d) => d.it);
}

// Record that these keys were just seen, keeping at most `cap` of the newest.
export function remember(game, keys, cap = 40) {
  const all = loadAll();
  const recent = (Array.isArray(all[game]) ? all[game] : []).filter((k) => !keys.includes(k));
  all[game] = recent.concat(keys).slice(-cap);
  saveAll(all);
}

// Convenience: choose fresh items AND record them in one call.
export function pickFresh(game, items, count, keyOf = (_, i) => String(i), cap = 40) {
  const chosen = chooseFresh(game, items, count, keyOf);
  remember(game, chosen.map((it, i) => keyOf(it, i)), cap);
  return chosen;
}
