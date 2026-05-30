import { el, confetti } from "../ui.js";
import { Sound } from "../audio.js";
import { Store } from "../state.js";
import { award } from "../rewards.js";
import { go } from "../main.js";
import { EMOJI_QUIZ } from "../data/emoji.js";
import { pickFresh } from "../recent.js";

const ROUND = 8;

function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = (Math.random() * (i + 1)) | 0;
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function renderEmoji(root) {
  // Avoid repeating movies seen in the last few rounds.
  const items = pickFresh("emoji", EMOJI_QUIZ, ROUND, (it) => it.answer, 24);
  let idx = 0, score = 0;
  const wrap = el("div");
  root.appendChild(wrap);

  function show() {
    const it = items[idx];
    wrap.innerHTML = "";
    wrap.appendChild(el("h2", { class: "screen-title", text: "Guess the Movie" }));
    wrap.appendChild(el("div", { class: "progress" }, [el("span", { style: `width:${(idx / ROUND) * 100}%` })]));
    wrap.appendChild(el("p", { class: "qcount", text: `Movie ${idx + 1} of ${ROUND}` }));

    const panel = el("div", { class: "panel" });
    panel.appendChild(el("div", { class: "qemoji", text: it.emoji }));
    panel.appendChild(el("p", { class: "hint", text: "Which Disney movie is this?" }));

    const choices = shuffle([
      { c: it.answer, correct: true },
      ...it.decoys.map((d) => ({ c: d, correct: false })),
    ]);
    const opts = el("div", { class: "options" });
    choices.forEach((o) => {
      const btn = el("button", { class: "option" }, [el("span", { text: o.c })]);
      btn.addEventListener("click", () => pick(btn, o.correct, opts, choices));
      opts.appendChild(btn);
    });
    panel.appendChild(opts);
    wrap.appendChild(panel);
  }

  function pick(btn, correct, opts, choices) {
    [...opts.children].forEach((c) => c.classList.add("disabled"));
    if (correct) { btn.classList.add("correct"); score++; Sound.correct(); award(2); }
    else {
      btn.classList.add("wrong"); Sound.wrong();
      [...opts.children].forEach((c, i) => { if (choices[i].correct) c.classList.add("reveal"); });
    }
    setTimeout(() => { idx++; idx < ROUND ? show() : finish(); }, 1100);
  }

  function finish() {
    const isBest = Store.setBest("emoji", score);
    const perfect = score === ROUND;
    if (score >= ROUND / 2) { Sound.win(); confetti(perfect ? 50 : 30); }
    award(score, `+${score} ✨ bonus!`);
    let emoji = "🎬", msg = "Nice watching!";
    if (perfect) { emoji = "🏆"; msg = "PERFECT! Movie master!"; }
    else if (score >= 6) { emoji = "🍿"; msg = "Brilliant!"; }
    else if (score >= 4) { emoji = "😀"; msg = "Well done!"; }
    else { msg = "Good try — watch again!"; }
    wrap.innerHTML = "";
    wrap.appendChild(el("div", { class: "panel result" }, [
      el("div", { class: "big-emoji", text: emoji }),
      el("div", { class: "score", text: `${score} / ${ROUND} correct` }),
      el("p", { class: "msg", text: msg }),
      isBest ? el("p", { class: "hint", text: "⭐ New best score!" }) : null,
    ]));
    wrap.appendChild(el("div", { class: "center-col" }, [
      el("button", { class: "btn big", onclick: () => go("emoji") }, ["Play Again 🔁"]),
      el("button", { class: "btn secondary", onclick: () => go("home") }, ["Back Home 🏰"]),
    ]));
  }

  show();
}
