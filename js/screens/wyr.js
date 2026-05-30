import { el } from "../ui.js";
import { Sound } from "../audio.js";
import { award } from "../rewards.js";
import { go } from "../main.js";
import { WOULD_YOU_RATHER } from "../data/wyr.js";

export function renderWyr(root) {
  let order = shuffle(WOULD_YOU_RATHER);
  let idx = 0;
  let answered = 0;
  const wrap = el("div");

  function shuffle(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = (Math.random() * (i + 1)) | 0;
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  function show() {
    if (idx >= order.length) { order = shuffle(order); idx = 0; }
    const it = order[idx];
    wrap.innerHTML = "";
    wrap.appendChild(el("h2", { class: "screen-title", text: "Would You Rather" }));
    wrap.appendChild(el("p", { class: "screen-sub", text: "No wrong answers — just pick!" }));

    const a = el("button", { class: "tile bg-pink", style: "min-height:150px;width:100%" }, [
      el("span", { class: "label", style: "font-size:22px;line-height:1.3", text: it.a }),
    ]);
    const orb = el("div", { style: "text-align:center;color:#fff;font-size:28px;font-weight:900;margin:14px 0;text-shadow:0 2px 0 #3d1c5c", text: "— OR —" });
    const b = el("button", { class: "tile bg-blue", style: "min-height:150px;width:100%", }, [
      el("span", { class: "label", style: "font-size:22px;line-height:1.3", text: it.b }),
    ]);

    function choose(btn) {
      btn.classList.add("wiggle");
      Sound.correct();
      answered++;
      if (answered % 3 === 0) award(1, "+1 ✨ for chatting!");
      setTimeout(() => { idx++; show(); }, 700);
    }
    a.addEventListener("click", () => choose(a));
    b.addEventListener("click", () => choose(b));

    wrap.append(a, orb, b);
    wrap.appendChild(el("button", { class: "btn secondary", style: "margin-top:18px", onclick: () => go("home") }, ["Back Home 🏰"]));
  }

  root.appendChild(wrap);
  show();
}
