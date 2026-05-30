import { el, confetti, toast } from "../ui.js";
import { Sound } from "../audio.js";
import { Store } from "../state.js";
import { refreshCoins, go } from "../main.js";
import { STICKERS } from "../data/stickers.js";

export function renderStickers(root) {
  const wrap = el("div");
  wrap.appendChild(el("h2", { class: "screen-title", text: "Sticker Book" }));
  wrap.appendChild(el("p", { class: "screen-sub", text: "Tap a locked sticker to buy it with ✨ coins!" }));

  const grid = el("div", { class: "sticker-grid" });

  function paint() {
    grid.innerHTML = "";
    STICKERS.forEach((s) => {
      const owned = Store.hasSticker(s.id);
      const cell = el("div", { class: `sticker ${owned ? "" : "locked"}` }, [
        el("span", { text: s.emoji }),
        el("span", { class: "nm", text: owned ? s.name : `✨${s.cost}` }),
      ]);
      if (!owned) {
        cell.addEventListener("click", () => buy(s, cell));
      }
      grid.appendChild(cell);
    });
  }

  function buy(s, cell) {
    if (Store.coins < s.cost) {
      Sound.wrong();
      cell.classList.add("wiggle");
      setTimeout(() => cell.classList.remove("wiggle"), 500);
      toast(`Need ${s.cost - Store.coins} more ✨ — keep playing!`);
      return;
    }
    Store.addCoins(-s.cost);
    Store.unlockSticker(s.id);
    Sound.win();
    confetti(28);
    refreshCoins();
    toast(`Unlocked ${s.name}! 🎉`);
    paint();
  }

  paint();
  wrap.appendChild(grid);

  const owned = STICKERS.filter((s) => Store.hasSticker(s.id)).length;
  wrap.appendChild(el("p", { class: "muted", style: "margin-top:16px", text: `Collected ${owned} of ${STICKERS.length} stickers` }));
  wrap.appendChild(el("button", { class: "btn secondary", style: "margin-top:8px", onclick: () => go("home") }, ["Back Home 🏰"]));

  root.appendChild(wrap);
}
