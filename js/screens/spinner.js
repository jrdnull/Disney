import { el, confetti } from "../ui.js";
import { Sound, speak } from "../audio.js";
import { go } from "../main.js";
import { chooseFresh, remember } from "../recent.js";

// Kid-friendly "wheel of silliness" — flick the wheel to get a fun thing to do in
// the line. All queue-safe (no running off!). The wheel shows 8 slices picked
// fresh from this bigger pool each spin, so challenges keep changing.
const POOL = [
  { t: "Do a silly dance!", e: "💃", c: "#ff5da2" },
  { t: "Tell a joke!", e: "😂", c: "#2ec5ff" },
  { t: "Make a funny face!", e: "🤪", c: "#3ddc97" },
  { t: "Sing a Disney song!", e: "🎤", c: "#ffd23f" },
  { t: "Hop on one foot!", e: "🦩", c: "#b18cff" },
  { t: "Do your best lion roar!", e: "🦁", c: "#ff8a5b" },
  { t: "Strike a hero pose!", e: "🦸", c: "#ff5252" },
  { t: "Give a big high-five!", e: "🙌", c: "#56c2ff" },
  { t: "Wave like a royal!", e: "👑", c: "#ffb14e" },
  { t: "Do robot arms!", e: "🤖", c: "#7ad1ff" },
  { t: "Freeze like a statue!", e: "🗿", c: "#9ad17a" },
  { t: "Do a monkey impression!", e: "🐵", c: "#c79a6b" },
  { t: "Wiggle like jelly!", e: "🍮", c: "#ff9ec7" },
  { t: "Give a silly compliment!", e: "💖", c: "#ff6f91" },
  { t: "Pull your happiest smile!", e: "😁", c: "#ffd23f" },
  { t: "Do a tiny tap dance!", e: "🕺", c: "#8e7dff" },
  { t: "Whisper in a robot voice!", e: "🔈", c: "#5fd6ff" },
  { t: "Take a big silly bow!", e: "🙇", c: "#ff8aa0" },
  { t: "Flap like a bird!", e: "🐦", c: "#62d2a2" },
  { t: "Count to 10 super fast!", e: "🔟", c: "#ffba5a" },
  { t: "Blow a pretend kiss!", e: "😘", c: "#ff7eb6" },
  { t: "Big yawn and stretch!", e: "🥱", c: "#86c5ff" },
  { t: "Make a fish face!", e: "🐠", c: "#5fe0c0" },
  { t: "Pretend to be asleep!", e: "😴", c: "#a99bff" },
  { t: "Hum a happy tune!", e: "🎵", c: "#ffd05a" },
  { t: "Stand tall like a tree!", e: "🌳", c: "#7bd47b" },
  { t: "Give a big thumbs up!", e: "👍", c: "#ff9a5b" },
  { t: "Pretend to ride a horse!", e: "🐴", c: "#d2a679" },
  { t: "Do a little spin!", e: "🌀", c: "#6fd0ff" },
  { t: "Take a deep dragon breath!", e: "🐉", c: "#7ee08a" },
];

const SLICES = 8;
const SIZE = 360;

export function renderSpinner(root) {
  const wrap = el("div");
  wrap.appendChild(el("h2", { class: "screen-title", text: "Magic Wheel" }));
  wrap.appendChild(el("p", { class: "screen-sub", text: "👆 Flick the wheel to spin it!" }));

  const sw = el("div", { class: "spinner-wrap" });
  sw.appendChild(el("div", { class: "wheel-pointer", text: "🔻" }));
  const canvas = el("canvas", { id: "wheel", width: SIZE, height: SIZE });
  canvas.style.touchAction = "none"; // we handle the drag ourselves
  sw.appendChild(canvas);
  wrap.appendChild(sw);

  const result = el("div", { class: "spin-result", text: "" });
  wrap.appendChild(result);
  wrap.appendChild(el("button", { class: "btn secondary", style: "margin-top:16px", onclick: () => go("home") }, ["Back Home 🏰"]));
  root.appendChild(wrap);

  let displayed = chooseFresh("wheel", POOL, SLICES, (s) => s.t);
  drawWheel(canvas, displayed);

  let rotation = 0;        // current accumulated rotation in degrees
  let spinning = false;
  let dragging = false;
  let startAngle = 0;      // pointer angle at drag start
  let startRotation = 0;   // wheel rotation at drag start
  let samples = [];        // recent {t, a} for velocity

  const segAngle = 360 / SLICES;

  function centre() {
    const r = canvas.getBoundingClientRect();
    return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
  }
  function pointerAngle(ev) {
    const c = centre();
    return Math.atan2(ev.clientY - c.y, ev.clientX - c.x) * 180 / Math.PI;
  }
  function setRotation(deg) {
    rotation = deg;
    canvas.style.transform = `rotate(${deg}deg)`;
  }

  function onDown(ev) {
    if (spinning) return;
    dragging = true;
    canvas.setPointerCapture && canvas.setPointerCapture(ev.pointerId);
    canvas.style.transition = "none";
    startAngle = pointerAngle(ev);
    startRotation = rotation;
    samples = [{ t: performance.now(), a: startAngle }];
    result.textContent = "";
    ev.preventDefault();
  }
  function onMove(ev) {
    if (!dragging) return;
    const a = pointerAngle(ev);
    setRotation(startRotation + angleDelta(startAngle, a));
    samples.push({ t: performance.now(), a });
    if (samples.length > 6) samples.shift();
    ev.preventDefault();
  }
  function onUp(ev) {
    if (!dragging) return;
    dragging = false;
    const vel = velocity(); // deg/ms (signed)
    fling(vel);
    ev.preventDefault();
  }

  // Map a flick into a satisfying spin that lands on a fresh slice.
  function fling(vel) {
    spinning = true;
    // Fresh faces for this spin so challenges keep changing.
    displayed = chooseFresh("wheel", POOL, SLICES, (s) => s.t);
    drawWheel(canvas, displayed);

    const speed = Math.min(Math.abs(vel), 3);            // cap influence
    const turns = 3 + Math.round(speed * 2) + ((Math.random() * 2) | 0); // 3–9ish
    const dir = vel < 0 ? -1 : 1;                        // spin the way they flicked
    const seg = (Math.random() * SLICES) | 0;
    const targetMod = (360 - (seg * segAngle + segAngle / 2)) % 360;

    // Choose a final rotation in the flick direction that ends aligned on `seg`.
    let final;
    if (dir > 0) {
      const base = rotation + turns * 360;
      final = base + mod360(targetMod - base);
    } else {
      const base = rotation - turns * 360;
      final = base - mod360(base - targetMod);
    }

    const dur = 3200 + Math.min(1600, Math.abs(final - rotation));
    canvas.style.transition = `transform ${dur}ms cubic-bezier(0.17, 0.67, 0.2, 1)`;
    Sound.spin();
    setRotation(final);

    const done = () => {
      canvas.removeEventListener("transitionend", done);
      spinning = false;
      const s = displayed[seg];
      remember("wheel", [s.t], 8);
      Sound.win();
      confetti(24);
      result.textContent = `${s.e} ${s.t}`;
      speak(s.t);
    };
    canvas.addEventListener("transitionend", done);
    // Safety net in case transitionend doesn't fire.
    setTimeout(() => { if (spinning) done(); }, dur + 200);
  }

  function velocity() {
    if (samples.length < 2) return (Math.random() > 0.5 ? 1 : -1) * 1.2; // a tap → gentle spin
    const a = samples[0], b = samples[samples.length - 1];
    const dt = Math.max(1, b.t - a.t);
    const v = angleDelta(a.a, b.a) / dt;
    return Math.abs(v) < 0.05 ? (v >= 0 ? 1 : -1) * 0.8 : v; // ensure it actually spins
  }

  canvas.addEventListener("pointerdown", onDown);
  canvas.addEventListener("pointermove", onMove);
  canvas.addEventListener("pointerup", onUp);
  canvas.addEventListener("pointercancel", onUp);
}

// Smallest signed difference between two angles (handles the -180/180 wrap).
function angleDelta(from, to) {
  let d = to - from;
  while (d > 180) d -= 360;
  while (d < -180) d += 360;
  return d;
}
function mod360(x) { return ((x % 360) + 360) % 360; }

function drawWheel(canvas, segments) {
  const ctx = canvas.getContext("2d");
  const n = segments.length;
  const r = canvas.width / 2;
  const segAngle = (2 * Math.PI) / n;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  for (let i = 0; i < n; i++) {
    const start = i * segAngle - Math.PI / 2;
    const end = start + segAngle;
    ctx.beginPath();
    ctx.moveTo(r, r);
    ctx.arc(r, r, r - 6, start, end);
    ctx.closePath();
    ctx.fillStyle = segments[i].c;
    ctx.fill();
    ctx.strokeStyle = "rgba(255,255,255,0.6)";
    ctx.lineWidth = 3;
    ctx.stroke();
    ctx.save();
    ctx.translate(r, r);
    ctx.rotate(start + segAngle / 2);
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.font = "40px serif";
    ctx.fillText(segments[i].e, r * 0.62, 0);
    ctx.restore();
  }
  ctx.beginPath();
  ctx.arc(r, r, 34, 0, 2 * Math.PI);
  ctx.fillStyle = "#fff";
  ctx.fill();
  ctx.font = "34px serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("🏰", r, r + 1);
}
