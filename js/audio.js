// Tiny Web Audio sound effects + optional read-aloud (helps young / non-reading kids).
import { Store } from "./state.js";

let ctx;
function ac() {
  if (!ctx) {
    try { ctx = new (window.AudioContext || window.webkitAudioContext)(); }
    catch (e) { ctx = null; }
  }
  return ctx;
}

function tone(freq, dur, type = "sine", when = 0, gain = 0.15) {
  const a = ac();
  if (!a || !Store.sound) return;
  const t0 = a.currentTime + when;
  const osc = a.createOscillator();
  const g = a.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t0);
  g.gain.setValueAtTime(gain, t0);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  osc.connect(g).connect(a.destination);
  osc.start(t0);
  osc.stop(t0 + dur);
}

export const Sound = {
  // Resume audio on first user gesture (mobile requirement)
  unlock() { const a = ac(); if (a && a.state === "suspended") a.resume(); },
  correct() {
    tone(523, 0.12, "triangle", 0);
    tone(659, 0.12, "triangle", 0.1);
    tone(784, 0.2, "triangle", 0.2);
  },
  wrong() { tone(200, 0.25, "sawtooth", 0, 0.12); },
  tap() { tone(440, 0.06, "square", 0, 0.08); },
  win() {
    [523, 659, 784, 1046].forEach((f, i) => tone(f, 0.18, "triangle", i * 0.12));
  },
  coin() { tone(880, 0.08, "square", 0); tone(1320, 0.12, "square", 0.07); },
  spin() {
    for (let i = 0; i < 10; i++) tone(300 + i * 40, 0.05, "square", i * 0.08, 0.05);
  },
};

// Read text aloud using the browser (great for ages 5-7)
export function speak(text) {
  if (!Store.sound || !("speechSynthesis" in window)) return;
  try {
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.rate = 0.95;
    u.pitch = 1.15;
    window.speechSynthesis.speak(u);
  } catch (e) { /* ignore */ }
}
