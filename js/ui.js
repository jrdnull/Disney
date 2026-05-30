// Small UI helpers: element builder, toast, confetti.
export function el(tag, props = {}, children = []) {
  const node = document.createElement(tag);
  for (const [k, v] of Object.entries(props)) {
    if (k === "class") node.className = v;
    else if (k === "html") node.innerHTML = v;
    else if (k === "text") node.textContent = v;
    else if (k.startsWith("on") && typeof v === "function") {
      node.addEventListener(k.slice(2).toLowerCase(), v);
    } else if (v !== null && v !== undefined && v !== false) {
      node.setAttribute(k, v);
    }
  }
  (Array.isArray(children) ? children : [children]).forEach((c) => {
    if (c == null) return;
    node.appendChild(typeof c === "string" ? document.createTextNode(c) : c);
  });
  return node;
}

let toastTimer;
export function toast(msg) {
  const t = document.getElementById("toast");
  t.textContent = msg;
  t.hidden = false;
  requestAnimationFrame(() => t.classList.add("show"));
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    t.classList.remove("show");
    setTimeout(() => { t.hidden = true; }, 300);
  }, 1800);
}

const PARTICLES = ["✨", "⭐", "🎉", "🎊", "💫", "🌟", "❄️", "🎈"];
export function confetti(count = 28) {
  const layer = el("div", { id: "confetti" });
  document.body.appendChild(layer);
  for (let i = 0; i < count; i++) {
    const p = el("div", { text: PARTICLES[(Math.random() * PARTICLES.length) | 0] });
    const left = Math.random() * 100;
    const size = 18 + Math.random() * 26;
    const dur = 1400 + Math.random() * 1400;
    const delay = Math.random() * 300;
    p.style.cssText = `position:absolute;left:${left}vw;top:-10vh;font-size:${size}px;will-change:transform,opacity;`;
    layer.appendChild(p);
    p.animate(
      [
        { transform: `translateY(-10vh) rotate(0deg)`, opacity: 1 },
        { transform: `translateY(110vh) rotate(${Math.random() > 0.5 ? 360 : -360}deg)`, opacity: 0.9 },
      ],
      { duration: dur, delay, easing: "cubic-bezier(.3,.6,.5,1)", fill: "forwards" }
    );
  }
  setTimeout(() => layer.remove(), 3200);
}
