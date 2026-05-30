import { el, confetti } from "../ui.js";
import { Sound, speak } from "../audio.js";
import { Store } from "../state.js";
import { award } from "../rewards.js";
import { go } from "../main.js";
import { TRIVIA } from "../data/trivia.js";
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

export function renderTrivia(root) {
  // Avoid repeating questions seen in the last few rounds.
  const questions = pickFresh("trivia", TRIVIA, ROUND, (q) => q.q, 32);
  let idx = 0;
  let score = 0;

  const wrap = el("div");
  root.appendChild(wrap);

  function showQuestion() {
    const q = questions[idx];
    wrap.innerHTML = "";

    wrap.appendChild(el("h2", { class: "screen-title", text: "Disney Trivia" }));
    const prog = el("div", { class: "progress" }, [
      el("span", { style: `width:${(idx / ROUND) * 100}%` }),
    ]);
    wrap.appendChild(prog);
    wrap.appendChild(el("p", { class: "qcount", text: `Question ${idx + 1} of ${ROUND}` }));

    const panel = el("div", { class: "panel" });
    panel.appendChild(el("p", { class: "qtext", text: q.q }));
    panel.appendChild(
      el("button", { class: "read-btn", onclick: () => speak(q.q) }, ["🔊", " Read to me"])
    );

    const opts = el("div", { class: "options" });
    const picks = ["🅰️", "🅱️", "🇨", "🇩"];
    // shuffle option order but track correct
    const order = shuffle(q.choices.map((c, i) => ({ c, correct: i === q.a })));
    order.forEach((o, i) => {
      const btn = el("button", { class: "option" }, [
        el("span", { class: "pick", text: picks[i] }),
        el("span", { text: o.c }),
      ]);
      btn.addEventListener("click", () => pick(btn, o.correct, opts, order));
      opts.appendChild(btn);
    });
    panel.appendChild(opts);
    wrap.appendChild(panel);
  }

  function pick(btn, correct, opts, order) {
    [...opts.children].forEach((c) => c.classList.add("disabled"));
    if (correct) {
      btn.classList.add("correct");
      score++;
      Sound.correct();
      award(2);
    } else {
      btn.classList.add("wrong");
      Sound.wrong();
      // reveal the right one
      [...opts.children].forEach((c, i) => { if (order[i].correct) c.classList.add("reveal"); });
    }
    setTimeout(() => {
      idx++;
      if (idx < ROUND) showQuestion();
      else finish();
    }, 1100);
  }

  function finish() {
    const isBest = Store.setBest("trivia", score);
    const perfect = score === ROUND;
    if (score >= ROUND / 2) { Sound.win(); confetti(perfect ? 50 : 30); }
    award(score, `+${score} ✨ bonus!`);

    let emoji = "🌟", msg = "Great job!";
    if (perfect) { emoji = "🏆"; msg = "PERFECT! You're a Disney expert!"; }
    else if (score >= 6) { emoji = "🎉"; msg = "Amazing work!"; }
    else if (score >= 4) { emoji = "😀"; msg = "Well done!"; }
    else { emoji = "💪"; msg = "Good try — play again!"; }

    wrap.innerHTML = "";
    const res = el("div", { class: "panel result" }, [
      el("div", { class: "big-emoji", text: emoji }),
      el("div", { class: "score", text: `${score} / ${ROUND} correct` }),
      el("p", { class: "msg", text: msg }),
      isBest ? el("p", { class: "hint", text: "⭐ New best score!" }) : null,
    ]);
    wrap.appendChild(res);
    wrap.appendChild(el("div", { class: "center-col" }, [
      el("button", { class: "btn big", onclick: () => go("trivia") }, ["Play Again 🔁"]),
      el("button", { class: "btn secondary", onclick: () => go("home") }, ["Back Home 🏰"]),
    ]));
  }

  showQuestion();
}
