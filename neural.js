const canvas = document.getElementById('neural-canvas');
const ctx = canvas.getContext('2d');

const LAYERS = [4, 6, 8, 6, 4];
const LAYER_LABELS = ['Input', 'Hidden', 'Hidden', 'Hidden', 'Output'];
const ACCENT = '79, 142, 247';

let nodes = [];
let pulses = [];

function resize() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  buildNetwork();
}

function buildNetwork() {
  nodes = [];
  const w = canvas.width;
  const h = canvas.height;
  const layerSpacing = w / (LAYERS.length + 1);

  for (let l = 0; l < LAYERS.length; l++) {
    const count = LAYERS[l];
    const x = layerSpacing * (l + 1);
    const nodeSpacing = h / (count + 1);
    for (let n = 0; n < count; n++) {
      nodes.push({
        layer: l,
        index: n,
        x: x + (Math.random() - 0.5) * 20,
        y: nodeSpacing * (n + 1) + (Math.random() - 0.5) * 20,
        baseX: x,
        baseY: nodeSpacing * (n + 1),
        phase: Math.random() * Math.PI * 2,
        active: 0
      });
    }
  }
}

function getLayer(l) {
  return nodes.filter(n => n.layer === l);
}

function spawnPulse() {
  const src = getLayer(0)[Math.floor(Math.random() * LAYERS[0])];
  if (src) pulses.push({ fromLayer: 0, fromIndex: src.index, progress: 0, speed: 0.012 + Math.random() * 0.008 });
}

let frame = 0;

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  for (let l = 0; l < LAYERS.length - 1; l++) {
    const from = getLayer(l);
    const to = getLayer(l + 1);
    for (const a of from) {
      for (const b of to) {
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.strokeStyle = `rgba(${ACCENT}, 0.07)`;
        ctx.lineWidth = 0.5;
        ctx.stroke();
      }
    }
  }

  for (let i = pulses.length - 1; i >= 0; i--) {
    const p = pulses[i];
    p.progress += p.speed;

    if (p.progress >= 1) {
      const nextLayer = p.fromLayer + 1;
      if (nextLayer < LAYERS.length) {
        const targets = getLayer(nextLayer);
        const picked = targets[Math.floor(Math.random() * targets.length)];
        if (picked) {
          picked.active = 1;
          pulses.push({ fromLayer: nextLayer, fromIndex: picked.index, progress: 0, speed: p.speed });
        }
      }
      pulses.splice(i, 1);
      continue;
    }

    const from = getLayer(p.fromLayer).find(n => n.index === p.fromIndex);
    if (!from) { pulses.splice(i, 1); continue; }
    const toLayer = getLayer(p.fromLayer + 1);
    if (!toLayer.length) { pulses.splice(i, 1); continue; }

    for (const to of toLayer) {
      const px = from.x + (to.x - from.x) * p.progress;
      const py = from.y + (to.y - from.y) * p.progress;
      ctx.beginPath();
      ctx.arc(px, py, 2, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${ACCENT}, ${0.6 * (1 - p.progress * 0.5)})`;
      ctx.fill();
    }
  }

  for (const node of nodes) {
    node.phase += 0.015;
    node.x = node.baseX + Math.sin(node.phase) * 4;
    node.y = node.baseY + Math.cos(node.phase * 0.7) * 4;

    if (node.active > 0) node.active -= 0.03;

    const glow = Math.max(0, node.active);
    const r = 3 + glow * 4;

    if (glow > 0) {
      const grad = ctx.createRadialGradient(node.x, node.y, 0, node.x, node.y, r * 3);
      grad.addColorStop(0, `rgba(${ACCENT}, ${0.4 * glow})`);
      grad.addColorStop(1, `rgba(${ACCENT}, 0)`);
      ctx.beginPath();
      ctx.arc(node.x, node.y, r * 3, 0, Math.PI * 2);
      ctx.fillStyle = grad;
      ctx.fill();
    }

    ctx.beginPath();
    ctx.arc(node.x, node.y, r, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(${ACCENT}, ${0.3 + glow * 0.6})`;
    ctx.fill();
  }

  // layer labels
  const layerSpacing = canvas.width / (LAYERS.length + 1);
  ctx.font = '11px JetBrains Mono, monospace';
  ctx.textAlign = 'center';
  for (let l = 0; l < LAYERS.length; l++) {
    const x = layerSpacing * (l + 1);
    ctx.fillStyle = `rgba(${ACCENT}, 0.25)`;
    ctx.fillText(LAYER_LABELS[l], x, canvas.height - 20);
  }

  frame++;
  if (frame % 40 === 0) spawnPulse();

  requestAnimationFrame(draw);
}

resize();
draw();
window.addEventListener('resize', resize);
