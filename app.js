const yesBtn = document.getElementById("yesBtn");
const noBtn = document.getElementById("noBtn");
const success = document.getElementById("success");
const canvas = document.getElementById("confetti");
const ctx = canvas ? canvas.getContext("2d") : null;

/* ✅ Always start hidden and clean */
if (success) success.hidden = true;

function fitCanvas() {
  if (!canvas || !ctx) return;
  const dpr = Math.max(1, window.devicePixelRatio || 1);
  canvas.width = Math.floor(canvas.clientWidth * dpr);
  canvas.height = Math.floor(canvas.clientHeight * dpr);
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, canvas.clientWidth, canvas.clientHeight);
}
window.addEventListener("resize", fitCanvas);
fitCanvas();

/* --- NO button dodge --- */
let floating = false;

function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
}

function makeNoFloat() {
  if (!noBtn) return;
  if (floating) return;
  floating = true;
  noBtn.classList.add("is-floating");

  const row = noBtn.parentElement;
  const rowRect = row.getBoundingClientRect();
  const btnRect = noBtn.getBoundingClientRect();

  noBtn.style.left = `${(rowRect.width - btnRect.width) / 2}px`;
  noBtn.style.top = `0px`;
}

function moveNoSomewhere() {
  if (!noBtn) return;

  const row = noBtn.parentElement;
  const rowRect = row.getBoundingClientRect();
  const btnRect = noBtn.getBoundingClientRect();

  const pad = 6;
  const maxX = Math.max(pad, rowRect.width - btnRect.width - pad);
  const maxY = Math.max(0, rowRect.height - btnRect.height - pad);

  const x = Math.random() * maxX;
  const y = Math.random() * (maxY + 10);

  noBtn.style.transition = "left .16s ease, top .16s ease, transform .16s ease";
  noBtn.style.left = `${clamp(x, pad, maxX)}px`;
  noBtn.style.top = `${clamp(y, 0, maxY)}px`;
  noBtn.style.transform = `rotate(${(Math.random() * 12 - 6).toFixed(1)}deg)`;
}

function dodge() {
  makeNoFloat();
  moveNoSomewhere();
}

if (noBtn) {
  noBtn.addEventListener("mouseenter", dodge);
  noBtn.addEventListener(
    "touchstart",
    (e) => {
      e.preventDefault();
      dodge();
    },
    { passive: false }
  );
  noBtn.addEventListener("click", (e) => {
    e.preventDefault();
    dodge();
  });
}

/* --- YES: show success + confetti --- */
let confettiRunning = false;
let pieces = [];
let rafId = null;

function rand(min, max) {
  return Math.random() * (max - min) + min;
}

function stopConfetti() {
  confettiRunning = false;
  if (rafId) cancelAnimationFrame(rafId);
  rafId = null;

  if (canvas && ctx) {
    ctx.clearRect(0, 0, canvas.clientWidth, canvas.clientHeight);
  }
}

function launchConfetti(durationMs = 2200) {
  if (!canvas || !ctx) return;

  stopConfetti(); // ✅ prevents any leftover drawing
  fitCanvas();

  const w = canvas.clientWidth;
  const h = canvas.clientHeight;

  pieces = Array.from({ length: 170 }).map(() => ({
    x: rand(0, w),
    y: rand(-h, 0),
    r: rand(3, 7),
    vx: rand(-1.2, 1.2),
    vy: rand(2.4, 4.6),
    rot: rand(0, Math.PI),
    vr: rand(-0.2, 0.2),
    shape: Math.random() > 0.5 ? "rect" : "heart",
    colorIndex: Math.floor(rand(0, 6)),
  }));

  const colors = ["#ff4fa3", "#ff8cc6", "#ffd166", "#7bdff2", "#b388ff", "#ff6b6b"];

  const start = performance.now();
  confettiRunning = true;

  function draw(now) {
    if (!confettiRunning) return;

    const t = now - start;
    ctx.clearRect(0, 0, w, h);

    pieces.forEach((p) => {
      p.x += p.vx;
      p.y += p.vy;
      p.rot += p.vr;

      if (p.y > h + 20) p.y = rand(-80, -10);
      if (p.x < -20) p.x = w + 10;
      if (p.x > w + 20) p.x = -10;

      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);

      ctx.fillStyle = colors[p.colorIndex];

      if (p.shape === "rect") {
        ctx.fillRect(-p.r, -p.r, p.r * 2, p.r * 2);
      } else {
        const s = p.r;
        ctx.beginPath();
        ctx.moveTo(0, s * 0.6);
        ctx.bezierCurveTo(s, -s * 0.2, s * 1.2, s * 1.2, 0, s * 1.6);
        ctx.bezierCurveTo(-s * 1.2, s * 1.2, -s, -s * 0.2, 0, s * 0.6);
        ctx.fill();
      }

      ctx.restore();
    });

    if (t < durationMs) {
      rafId = requestAnimationFrame(draw);
    } else {
      stopConfetti();
    }
  }

  rafId = requestAnimationFrame(draw);
}

if (yesBtn) {
  yesBtn.addEventListener("click", () => {
    if (success) success.hidden = false; // ✅ only show after click
    launchConfetti();

    if (noBtn) {
      noBtn.disabled = true;
      noBtn.style.opacity = "0.6";
      noBtn.style.cursor = "not-allowed";
    }

    yesBtn.disabled = true;
    yesBtn.textContent = "YES!! 💞";
  });
}
