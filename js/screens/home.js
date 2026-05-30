import { el } from "../ui.js";
import { Sound } from "../audio.js";
import { go } from "../main.js";

const TILES = [
  { route: "trivia", emoji: "🧠", label: "Trivia", sub: "Quiz time!", cls: "bg-pink" },
  { route: "emoji", emoji: "🎬", label: "Guess the Movie", sub: "From emojis", cls: "bg-blue" },
  { route: "scavenger", emoji: "🔍", label: "I-Spy Hunt", sub: "Look around!", cls: "bg-green" },
  { route: "wyr", emoji: "🤔", label: "Would You Rather", sub: "Silly choices", cls: "bg-yellow" },
  { route: "spinner", emoji: "🎡", label: "Magic Wheel", sub: "Can't decide?", cls: "bg-violet" },
  { route: "stickers", emoji: "🏅", label: "Sticker Book", sub: "Your prizes", cls: "bg-red" },
];

export function renderHome(root) {
  const hero = el("div", { class: "hero" }, [
    el("h1", { text: "Queue Quest" }),
    el("p", { text: "Beat the boring line! 🏰" }),
  ]);

  const tiles = el("div", { class: "tiles" });
  TILES.forEach((t) => {
    tiles.appendChild(
      el("button", {
        class: `tile ${t.cls}`,
        onclick: () => { Sound.tap(); go(t.route); },
      }, [
        el("span", { class: "emoji", text: t.emoji }),
        el("span", { class: "label", text: t.label }),
        el("span", { class: "sub", text: t.sub }),
      ])
    );
  });

  // Wait-times full-width tile
  tiles.appendChild(
    el("button", {
      class: "tile full bg-blue",
      onclick: () => { Sound.tap(); go("wait"); },
    }, [
      el("span", { class: "emoji", text: "⏱️" }),
      el("div", {}, [
        el("div", { class: "label", text: "Live Wait Times" }),
        el("div", { class: "sub", text: "How long for each ride? (needs internet)" }),
      ]),
    ])
  );

  root.append(hero, tiles);
  root.appendChild(el("p", { class: "muted", style: "margin-top:18px", text: "Earn ✨ coins by playing, then unlock stickers!" }));
}
