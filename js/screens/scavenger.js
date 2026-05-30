import { el, confetti, toast } from "../ui.js";
import { Sound } from "../audio.js";
import { award } from "../rewards.js";
import { go } from "../main.js";
import { SCAVENGER } from "../data/scavenger.js";

const ROUND = 6;

function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = (Math.random() * (i + 1)) | 0;
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function renderScavenger(root) {
  const items = shuffle(SCAVENGER).slice(0, ROUND);
  let found = 0;
  const wrap = el("div");

  wrap.appendChild(el("h2", { class: "screen-title", text: "I-Spy Hunt" }));
  wrap.appendChild(el("p", { class: "screen-sub", text: "Look around the line. Tap each one you spot!" }));

  const list = el("div", { class: "spy-list" });
  items.forEach((it) => {
    const row = el("div", { class: "spy-item" }, [
      el("span", { class: "ico", text: it.ico }),
      el("span", { class: "name", text: it.name }),
      el("span", { class: "check", text: "✓" }),
    ]);
    row.addEventListener("click", () => {
      if (row.classList.contains("found")) return;
      row.classList.add("found");
      Sound.correct();
      award(2);
      found++;
      if (found === ROUND) win();
    });
    list.appendChild(row);
  });
  wrap.appendChild(list);

  function win() {
    Sound.win();
    confetti(40);
    award(6, "Hunt complete! +6 ✨");
    setTimeout(() => {
      const done = el("div", { class: "panel result" }, [
        el("div", { class: "big-emoji", text: "🔍" }),
        el("div", { class: "score", text: "You found them all!" }),
        el("p", { class: "msg", text: "Sharp eyes! 👀" }),
      ]);
      wrap.appendChild(done);
      done.scrollIntoView({ behavior: "smooth" });
    }, 400);
  }

  wrap.appendChild(el("div", { class: "btn-row" }, [
    el("button", { class: "btn secondary", onclick: () => go("scavenger") }, ["New Hunt 🔁"]),
    el("button", { class: "btn secondary", onclick: () => go("home") }, ["Home 🏰"]),
  ]));

  root.appendChild(wrap);
}
