import { el } from "../ui.js";
import { Sound } from "../audio.js";
import { Store } from "../state.js";
import { go } from "../main.js";
import { PARKS } from "../data/parks.js";

// queue-times.com is free but sends no CORS header, so from a browser we go
// through a public CORS proxy. Real deployed origins (e.g. *.github.io) send a
// proper Origin header that these proxies accept. We try several in order of
// reliability, each with a short timeout so a hanging one falls through fast.
function endpoints(parkId) {
  const target = `https://queue-times.com/parks/${parkId}/queue_times.json`;
  const enc = encodeURIComponent(target);
  return [
    `https://corsproxy.io/?url=${enc}`,
    `https://api.codetabs.com/v1/proxy/?quest=${target}`,
    `https://api.allorigins.win/raw?url=${enc}`,
  ];
}

async function fetchWithTimeout(url, ms = 8000) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), ms);
  try {
    return await fetch(url, { cache: "no-store", signal: ctrl.signal });
  } finally {
    clearTimeout(t);
  }
}

async function fetchTimes(parkId) {
  let lastErr;
  for (const url of endpoints(parkId)) {
    try {
      const res = await fetchWithTimeout(url);
      if (!res.ok) throw new Error(res.status);
      const data = await res.json();
      if (data && (data.lands || data.rides)) return data;
      throw new Error("bad payload");
    } catch (e) { lastErr = e; }
  }
  throw lastErr || new Error("offline");
}

function flatten(data) {
  const rides = [];
  (data.lands || []).forEach((l) => (l.rides || []).forEach((r) => rides.push(r)));
  (data.rides || []).forEach((r) => rides.push(r));
  return rides;
}

function band(mins, open) {
  if (!open) return "closed";
  if (mins <= 20) return "low";
  if (mins <= 45) return "med";
  return "high";
}

export function renderWaitTimes(root) {
  const wrap = el("div");
  wrap.appendChild(el("h2", { class: "screen-title", text: "Live Wait Times" }));

  const select = el("select", { class: "park-select" });
  PARKS.forEach((p) => {
    const opt = el("option", { value: p.id, text: p.name });
    if (p.id === Store.lastPark) opt.selected = true;
    select.appendChild(opt);
  });
  select.addEventListener("change", () => { Store.lastPark = +select.value; load(); });
  wrap.appendChild(select);

  const list = el("div", {});
  wrap.appendChild(list);

  const refresh = el("button", { class: "btn", style: "margin-top:14px" }, ["🔄 Refresh"]);
  refresh.addEventListener("click", () => { Sound.tap(); load(); });
  wrap.appendChild(refresh);
  wrap.appendChild(el("button", { class: "btn secondary", style: "margin-top:10px", onclick: () => go("home") }, ["Back Home 🏰"]));
  wrap.appendChild(el("p", { class: "muted", style: "margin-top:14px", text: "Data from queue-times.com 💙 Needs internet." }));

  async function load() {
    list.innerHTML = "";
    list.appendChild(el("p", { class: "spinner-load", text: "Loading wait times… ⏳" }));
    try {
      const data = await fetchTimes(+select.value);
      const rides = flatten(data)
        .sort((a, b) => (b.is_open - a.is_open) || (b.wait_time - a.wait_time));
      list.innerHTML = "";
      if (!rides.length) {
        list.appendChild(el("p", { class: "spinner-load", text: "No rides listed right now." }));
        return;
      }
      // Shortest open waits first is most useful for "what can we ride now"
      const open = rides.filter((r) => r.is_open).sort((a, b) => a.wait_time - b.wait_time);
      const closed = rides.filter((r) => !r.is_open);
      list.appendChild(el("p", { class: "hint", style: "color:#fff;margin-top:14px", text: "Shortest lines first! 👇" }));
      [...open, ...closed].forEach((r) => {
        const b = band(r.wait_time, r.is_open);
        list.appendChild(el("div", { class: "wait-row" }, [
          el("span", { class: "nm", text: r.name }),
          el("span", { class: `mins ${b}`, text: r.is_open ? `${r.wait_time}m` : "Closed" }),
        ]));
      });
    } catch (e) {
      list.innerHTML = "";
      list.appendChild(el("div", { class: "panel" }, [
        el("p", { class: "qtext", style: "font-size:20px", text: "Couldn't load times 😕" }),
        el("p", { class: "hint", text: "Check your internet and tap Refresh. The line games all work offline though — go play those!" }),
      ]));
    }
  }

  root.appendChild(wrap);
  load();
}
