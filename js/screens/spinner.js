import { el, confetti } from "../ui.js";
import { Sound, speak } from "../audio.js";
import { go } from "../main.js";

// Kid-friendly "wheel of silliness" — spin to get a fun thing to do in the line.
const SEGMENTS = [
  { t: "Do a silly dance!", e: "💃", c: "#ff5da2" },
  { t: "Tell a joke!", e: "😂", c: "#2ec5ff" },
  { t: "Make a funny face!", e: "🤪", c: "#3ddc97" },
  { t: "Sing a Disney song!", e: "🎤", c: "#ffd23f" },
  { t: "Hop on one foot!", e: "🦩", c: "#b18cff" },
  { t: "Do your best lion roar!", e: "🦁", c: "#ff8a5b" },
  { t: "Strike a hero pose!", e: "🦸", c: "#ff5252" },
  { t: "Give a big high-five!", e: "🙌", c: "#56c2ff" },
];

export function renderSpinner(root) {
  const wrap = el("div");
  wrap.appendChild(el("h2", { class: "screen-title", text: "Magic Wheel" }));
  wrap.appendChild(el("p", { class: "screen-sub", text: "Spin for a silly challenge!" }));

  const sw = el("div", { class: "spinner-wrap" });
  sw.appendChild(el("div", { class: "wheel-pointer", text: "🔻" }));

  const size = 360;
  const canvas = el("canvas", { id: "wheel", width: size, height: size });
  drawWheel(canvas, size);
  sw.appendChild(canvas);
  wrap.appendChild(sw);

  const result = el("div", { class: "spin-result", text: "" });
  wrap.appendChild(result);

  let spinning = false;
  let current = 0;
  const spinBtn = el("button", { class: "btn big", style: "margin-top:16px" }, ["SPIN! 🎡"]);
  spinBtn.addEventListener("click", () => {
    if (spinning) return;
    spinning = true;
    result.textContent = "";
    Sound.spin();
    const n = SEGMENTS.length;
    const seg = (Math.random() * n) | 0;
    const turns = 5 + Math.floor(Math.random() * 3);
    // pointer is at top (-90deg). Land middle of chosen segment under pointer.
    const segAngle = 360 / n;
    const target = turns * 360 + (360 - (seg * segAngle + segAngle / 2)) - 90;
    current = target;
    canvas.style.transform = `rotate(${current}deg)`;
    setTimeout(() => {
      spinning = false;
      const s = SEGMENTS[seg];
      Sound.win();
      confetti(24);
      result.textContent = `${s.e} ${s.t}`;
      speak(s.t);
    }, 4100);
  });
  wrap.appendChild(spinBtn);
  wrap.appendChild(el("button", { class: "btn secondary", style: "margin-top:12px", onclick: () => go("home") }, ["Back Home 🏰"]));

  root.appendChild(wrap);
}

function drawWheel(canvas, size) {
  const ctx = canvas.getContext("2d");
  const n = SEGMENTS.length;
  const r = size / 2;
  const segAngle = (2 * Math.PI) / n;
  for (let i = 0; i < n; i++) {
    const start = i * segAngle - Math.PI / 2;
    const end = start + segAngle;
    ctx.beginPath();
    ctx.moveTo(r, r);
    ctx.arc(r, r, r - 6, start, end);
    ctx.closePath();
    ctx.fillStyle = SEGMENTS[i].c;
    ctx.fill();
    ctx.strokeStyle = "rgba(255,255,255,0.6)";
    ctx.lineWidth = 3;
    ctx.stroke();
    // emoji label
    ctx.save();
    ctx.translate(r, r);
    ctx.rotate(start + segAngle / 2);
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.font = "40px serif";
    ctx.fillText(SEGMENTS[i].e, r * 0.62, 0);
    ctx.restore();
  }
  // center hub
  ctx.beginPath();
  ctx.arc(r, r, 34, 0, 2 * Math.PI);
  ctx.fillStyle = "#fff";
  ctx.fill();
  ctx.font = "34px serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("🏰", r, r + 1);
}
