import { AudioManager } from './audio.js';

const canvas = document.getElementById('fur-canvas');
const ctx = canvas.getContext('2d');
const gameArea = document.getElementById('game-canvas-area');
const svgEl = document.getElementById('pig-structure-svg');
const btnSponge = document.getElementById('btn-sponge');
const btnHose = document.getElementById('btn-hose');
const btnDryer = document.getElementById('btn-dryer');
const duck = document.getElementById('duck-overlay');
const outfitLayer = document.getElementById('outfit-layer');
const dressupPanel = document.getElementById('dressup-panel');
const dressupCategories = document.getElementById('dressup-categories');
const dressupTray = document.getElementById('dressup-tray');
const removeAllBtn = document.getElementById('remove-all-btn');

const audio = new AudioManager();

const parts = {
  head: { id: 'g-head', cx: 180, cy: 140, r: 90, pivotX: 180, pivotY: 190, rotation: 0, parent: null },
  body: { id: 'g-body', cx: 180, cy: 260, r: 100, pivotX: 180, pivotY: 300, rotation: 0, parent: null },
  armL: { id: 'g-arm-l', cx: 90, cy: 220, r: 28, pivotX: 110, pivotY: 210, rotation: 0, parent: null },
  armR: { id: 'g-arm-r', cx: 270, cy: 220, r: 28, pivotX: 250, pivotY: 210, rotation: 0, parent: null },
  legL: { id: 'g-leg-l', cx: 120, cy: 360, r: 32, pivotX: 120, pivotY: 340, rotation: 0, parent: null },
  legR: { id: 'g-leg-r', cx: 240, cy: 360, r: 32, pivotX: 240, pivotY: 340, rotation: 0, parent: null },
  earL: { id: 'g-ear-l', cx: 100, cy: 80, r: 28, pivotX: 125, pivotY: 95, rotation: 0, parent: 'head' },
  earR: { id: 'g-ear-r', cx: 260, cy: 80, r: 28, pivotX: 235, pivotY: 95, rotation: 0, parent: 'head' },
  bow: { id: 'g-bow', cx: 180, cy: 65, r: 25, pivotX: 180, pivotY: 65, rotation: 0, parent: 'head' }
};

const config = {
  hairCount: 5200,
  hairLengthDry: 6,
  hairLengthWet: 12,
  baseColors: { r: 255, g: 240, b: 245 },
  dirtColors: [
    { r: 101, g: 67, b: 33 },
    { r: 85, g: 107, b: 47 },
    { r: 110, g: 100, b: 100 }
  ],
  maxParticles: 220
};

const wardrobe = {
  hats: {
    label: 'Kopf',
    part: 'head',
    items: [
      { id: 'hut-wide', trayLabel: 'Hut', svg: '<ellipse cx="180" cy="82" rx="64" ry="12" fill="#6b3f2a"/><path d="M132 82 L146 40 H214 L228 82 Z" fill="#8b5a3c"/><rect x="154" y="56" width="52" height="10" rx="5" fill="#ef4444"/>' },
      { id: 'crown', trayLabel: 'Krone', svg: '<path d="M126 88 L138 46 L162 68 L180 40 L198 68 L222 46 L234 88 Z" fill="#facc15" stroke="#eab308" stroke-width="4"/><circle cx="150" cy="60" r="6" fill="#60a5fa"/><circle cx="180" cy="50" r="6" fill="#f472b6"/><circle cx="210" cy="60" r="6" fill="#34d399"/>' },
      { id: 'cap', trayLabel: 'Cap', svg: '<path d="M132 90 C130 66 152 46 180 46 C208 46 232 66 228 90 Z" fill="#2563eb"/><path d="M180 90 C196 90 216 94 232 104 C214 108 194 110 172 108 Z" fill="#1d4ed8"/>' }
    ]
  },
  glasses: {
    label: 'Brillen',
    part: 'head',
    items: [
      { id: 'shades', trayLabel: 'Shades', svg: '<rect x="132" y="122" width="42" height="20" rx="10" fill="#111827"/><rect x="186" y="122" width="42" height="20" rx="10" fill="#111827"/><rect x="174" y="129" width="12" height="6" fill="#374151"/><path d="M132 130 L124 126" stroke="#374151" stroke-width="4"/><path d="M228 130 L236 126" stroke="#374151" stroke-width="4"/>' },
      { id: 'round', trayLabel: 'Rund', svg: '<circle cx="154" cy="132" r="16" fill="none" stroke="#1d4ed8" stroke-width="4"/><circle cx="206" cy="132" r="16" fill="none" stroke="#1d4ed8" stroke-width="4"/><path d="M170 132 H190" stroke="#1d4ed8" stroke-width="4"/><path d="M138 121 L128 114" stroke="#1d4ed8" stroke-width="3"/><path d="M222 121 L232 114" stroke="#1d4ed8" stroke-width="3"/>' },
      { id: 'goggles', trayLabel: 'Schutz', svg: '<rect x="124" y="118" width="112" height="30" rx="15" fill="#22d3ee" fill-opacity="0.35" stroke="#0891b2" stroke-width="4"/><circle cx="156" cy="133" r="12" fill="#67e8f9"/><circle cx="204" cy="133" r="12" fill="#67e8f9"/><path d="M124 133 H108 M236 133 H252" stroke="#0f766e" stroke-width="4"/>' }
    ]
  },
  scarves: {
    label: 'Schals',
    part: 'body',
    items: [
      { id: 'scarf-classic', trayLabel: 'Schal', svg: '<ellipse cx="180" cy="204" rx="54" ry="20" fill="#dc2626"/><path d="M158 214 L176 214 L168 286 L146 286 Z" fill="#ef4444"/><path d="M186 214 H204 L214 278 H192 Z" fill="#b91c1c"/>' },
      { id: 'bowtie', trayLabel: 'Schleife', svg: '<ellipse cx="154" cy="206" rx="24" ry="16" fill="#f472b6"/><ellipse cx="206" cy="206" rx="24" ry="16" fill="#f472b6"/><circle cx="180" cy="206" r="10" fill="#db2777"/>' },
      { id: 'rope', trayLabel: 'Kordel', svg: '<ellipse cx="180" cy="206" rx="52" ry="18" fill="none" stroke="#a16207" stroke-width="10"/><path d="M165 216 C168 236 156 258 168 284" stroke="#a16207" stroke-width="8" fill="none"/><path d="M196 216 C198 242 214 256 202 282" stroke="#a16207" stroke-width="8" fill="none"/>' }
    ]
  },
  tops: {
    label: 'Oberteile',
    part: 'body',
    items: [
      { id: 'shirt', trayLabel: 'Shirt', svg: '<path d="M106 228 L134 206 H226 L254 228 L238 324 H122 Z" fill="#38bdf8"/><rect x="168" y="206" width="24" height="32" fill="#e0f2fe"/>' },
      { id: 'vest', trayLabel: 'Weste', svg: '<path d="M120 224 L142 212 H218 L240 224 L226 330 H134 Z" fill="#f97316"/><path d="M178 212 V330" stroke="#fb923c" stroke-width="8"/><circle cx="180" cy="250" r="5" fill="#1f2937"/><circle cx="180" cy="278" r="5" fill="#1f2937"/>' },
      { id: 'kimono', trayLabel: 'Kimono', svg: '<path d="M108 224 L146 202 H214 L252 224 L238 334 H122 Z" fill="#a855f7"/><path d="M146 202 L182 274 L214 202" stroke="#f3e8ff" stroke-width="8" fill="none"/><rect x="172" y="258" width="16" height="72" fill="#7e22ce"/>' }
    ]
  },
  pants: {
    label: 'Hosen',
    part: 'body',
    items: [
      { id: 'jeans', trayLabel: 'Jeans', svg: '<path d="M132 304 H228 L220 392 H192 L184 340 H176 L168 392 H140 Z" fill="#2563eb"/><rect x="164" y="304" width="32" height="16" fill="#60a5fa"/>' },
      { id: 'shorts', trayLabel: 'Shorts', svg: '<path d="M128 306 H232 L226 358 H190 L184 336 H176 L170 358 H134 Z" fill="#f97316"/><rect x="160" y="306" width="40" height="12" fill="#fdba74"/>' },
      { id: 'striped', trayLabel: 'Gestreift', svg: '<path d="M130 306 H230 L224 380 H192 L184 344 H176 L168 380 H136 Z" fill="#f9a8d4"/><path d="M146 306 V380 M164 306 V380 M182 306 V380 M200 306 V380 M218 306 V380" stroke="#be185d" stroke-width="6"/>' }
    ]
  },
  shoes: {
    label: 'Schuhe',
    part: 'legs',
    items: [
      { id: 'sneakers', trayLabel: 'Sneaker', svg: '<path d="M82 396 H152 L166 418 H92 Z" fill="#ffffff" stroke="#2563eb" stroke-width="4"/><path d="M100 406 H150" stroke="#93c5fd" stroke-width="3"/>' },
      { id: 'boots', trayLabel: 'Stiefel', svg: '<path d="M92 372 H146 V416 H88 Z" fill="#7c3f00"/><rect x="88" y="408" width="62" height="12" rx="6" fill="#5b2d00"/>' },
      { id: 'ballet', trayLabel: 'Ballerina', svg: '<ellipse cx="124" cy="410" rx="38" ry="12" fill="#f9a8d4"/><path d="M94 410 C108 396 140 396 154 410" stroke="#ec4899" stroke-width="3" fill="none"/>' }
    ]
  }
};

const slots = {
  hats: { x: 180, y: 44, size: 62 },
  glasses: { x: 180, y: 128, size: 56 },
  scarves: { x: 180, y: 198, size: 56 },
  tops: { x: 180, y: 264, size: 78 },
  pants: { x: 180, y: 338, size: 74 },
  shoes: { x: 180, y: 418, size: 62 }
};

let hairs = [];
let particles = [];
let pointer = { x: -100, y: -100, isDown: false };
let currentTool = 'sponge';
let stats = { dirt: 100, wetness: 0, soap: 0 };
let dirtPatches = [];
let time = 0;
let gameCompleted = false;
let dressupUnlocked = false;
let noseTaps = 0;
let lastNoseTap = 0;
let selectedCategory = 'hats';
let dragState = null;
const wornItems = Object.fromEntries(Object.keys(wardrobe).map((key) => [key, null]));

function renderTrayIcon(item) {
  return `<svg class="tray-icon" viewBox="0 0 360 500" aria-hidden="true">${item.svg}</svg>`;
}

function rotatePoint(x, y, ox, oy, deg) {
  const rad = (deg * Math.PI) / 180;
  const dx = x - ox;
  const dy = y - oy;
  return {
    x: ox + dx * Math.cos(rad) - dy * Math.sin(rad),
    y: oy + dx * Math.sin(rad) + dy * Math.cos(rad)
  };
}

function getWorldTransform(name) {
  const p = parts[name];
  if (!p.parent) {
    return {
      rotation: p.rotation,
      pivot: { x: p.pivotX, y: p.pivotY },
      center: rotatePoint(p.cx, p.cy, p.pivotX, p.pivotY, p.rotation)
    };
  }

  const parent = getWorldTransform(p.parent);
  const pivot = rotatePoint(p.pivotX, p.pivotY, parent.pivot.x, parent.pivot.y, parent.rotation);
  const centerInParent = rotatePoint(p.cx, p.cy, parent.pivot.x, parent.pivot.y, parent.rotation);
  const rotation = parent.rotation + p.rotation;
  const center = rotatePoint(centerInParent.x, centerInParent.y, pivot.x, pivot.y, p.rotation);

  return { rotation, pivot, center };
}

function dist(x1, y1, x2, y2) {
  return Math.hypot(x2 - x1, y2 - y1);
}

function isFaceZone(x, y) {
  return dist(x, y, 145, 120) < 18 || dist(x, y, 215, 120) < 18 || dist(x, y, 180, 150) < 42;
}

function resize() {
  const ratio = window.devicePixelRatio || 1;
  canvas.width = Math.floor(gameArea.clientWidth * ratio);
  canvas.height = Math.floor(gameArea.clientHeight * ratio);
  ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
}

function createDirtPatches() {
  dirtPatches = [];
  const count = 8 + Math.floor(Math.random() * 4);
  for (let i = 0; i < count; i++) {
    dirtPatches.push({
      x: 100 + Math.random() * 160,
      y: 100 + Math.random() * 250,
      radius: 35 + Math.random() * 50,
      type: Math.floor(Math.random() * config.dirtColors.length),
      intensity: 0.7 + Math.random() * 0.3
    });
  }
}

function spawnHairs() {
  hairs = [];
  let attempts = 0;
  const keys = Object.keys(parts);

  while (hairs.length < config.hairCount && attempts < 160000) {
    attempts++;
    const wx = Math.random() * gameArea.clientWidth;
    const wy = Math.random() * gameArea.clientHeight;
    if (isFaceZone(wx, wy)) continue;

    let attached = null;
    for (const key of keys) {
      const p = parts[key];
      if (dist(wx, wy, p.cx, p.cy) < p.r) {
        attached = key;
        break;
      }
    }

    if (!attached) continue;

    const p = parts[attached];
    const normalAngle = Math.atan2(wy - p.cy, wx - p.cx);
    let dirtLevel = 0;
    let dirtType = 0;

    for (const patch of dirtPatches) {
      const d = dist(wx, wy, patch.x, patch.y);
      if (d < patch.radius) {
        const factor = (1 - d / patch.radius) * patch.intensity;
        if (factor > dirtLevel) {
          dirtLevel = factor;
          dirtType = patch.type;
        }
      }
    }

    dirtLevel = Math.max(0, Math.min(1, dirtLevel + (Math.random() - 0.5) * 0.2));
    const curlNoise = (Math.random() - 0.5) * 2.5;

    hairs.push({
      part: attached,
      localFromPivotX: wx - p.pivotX,
      localFromPivotY: wy - p.pivotY,
      x: wx,
      y: wy,
      normalAngle,
      currentAngle: normalAngle + curlNoise,
      curlOffset: curlNoise,
      dirt: dirtLevel,
      dirtType,
      wet: 0,
      soap: 0
    });
  }
}

function updateAnimation() {
  time += 0.05;
  parts.head.rotation = Math.sin(time * 0.5) * 5;
  parts.armL.rotation = Math.sin(time * 0.8) * 10;
  parts.armR.rotation = Math.cos(time * 0.7) * 10;
  const twitch = Math.random() > 0.985 ? 12 : 0;
  const headRot = parts.head.rotation;
  parts.earL.rotation = Math.sin(time * 1.2) * 5 + twitch;
  parts.earR.rotation = Math.cos(time * 1.1) * 5 - twitch;
  parts.bow.rotation = Math.sin(time * 0.6) * 3;

  const breatheScale = 1 + Math.sin(time * 0.3) * 0.02;

  Object.entries(parts).forEach(([name, p]) => {
    const el = document.getElementById(p.id);
    if (!el) return;
    let rotation = p.rotation;
    if (name === 'earL' || name === 'earR' || name === 'bow') rotation += headRot;
    el.style.transform = `rotate(${rotation}deg)`;
    if (name === 'body') el.style.transform += ` scale(${breatheScale})`;
  });

  const outfitTransformMap = {
    head: ['outfit-head'],
    body: ['outfit-body'],
    legL: ['outfit-leg-l'],
    legR: ['outfit-leg-r']
  };

  Object.entries(outfitTransformMap).forEach(([partName, ids]) => {
    const partEl = document.getElementById(parts[partName].id);
    ids.forEach((id) => {
      const outfitEl = document.getElementById(id);
      if (outfitEl && partEl) outfitEl.style.transform = partEl.style.transform;
    });
  });

  for (const hair of hairs) {
    const t = getWorldTransform(hair.part);
    const localX = hair.localFromPivotX;
    const localY = hair.localFromPivotY;
    const rad = (t.rotation * Math.PI) / 180;
    hair.x = t.pivot.x + localX * Math.cos(rad) - localY * Math.sin(rad);
    hair.y = t.pivot.y + localX * Math.sin(rad) + localY * Math.cos(rad);
    hair.dynamicNormal = hair.normalAngle + rad;
  }

  if (duck) {
    duck.style.left = `${16 + Math.sin(time * 0.5) * 3}px`;
  }
}

function spawnParticle(x, y, type, amount = 1) {
  if (particles.length >= config.maxParticles) return;
  const allowed = Math.min(amount, config.maxParticles - particles.length);
  for (let i = 0; i < allowed; i++) {
    let vx = (Math.random() - 0.5) * 1.2;
    let vy = -1.2 - Math.random();
    if (type === 'water') {
      vx = (Math.random() - 0.5) * 2.2;
      vy = 3 + Math.random() * 3;
    }
    if (type === 'steam') {
      vx = (Math.random() - 0.5) * 0.8;
      vy = -1 - Math.random() * 1.2;
    }
    particles.push({
      x: x + (Math.random() - 0.5) * 10,
      y: y + (Math.random() - 0.5) * 10,
      vx,
      vy,
      life: 1,
      type,
      size: type === 'heart' ? 8 : type === 'star' ? 7 : 3 + Math.random() * 2,
      rotation: Math.random() * Math.PI * 2,
      rotSpeed: (Math.random() - 0.5) * 0.15
    });
  }
}

function drawHeart(x, y, size, alpha) {
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.translate(x, y);
  ctx.fillStyle = 'rgb(255,105,180)';
  ctx.beginPath();
  ctx.moveTo(0, -size / 2);
  ctx.bezierCurveTo(size / 2, -size, size, -size / 3, 0, size);
  ctx.bezierCurveTo(-size, -size / 3, -size / 2, -size, 0, -size / 2);
  ctx.fill();
  ctx.restore();
}

function drawStar(x, y, size, rotation, alpha) {
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.translate(x, y);
  ctx.rotate(rotation);
  ctx.fillStyle = 'rgb(255,215,0)';
  ctx.beginPath();
  for (let i = 0; i < 5; i++) {
    const a = (i * 4 * Math.PI) / 5 - Math.PI / 2;
    const px = Math.cos(a) * size;
    const py = Math.sin(a) * size;
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

function updateParticles() {
  for (let i = 0; i < particles.length; i++) {
    const p = particles[i];
    p.x += p.vx;
    p.y += p.vy;
    p.life -= 0.035;
    p.rotation += p.rotSpeed;

    if (p.type === 'bubble') {
      ctx.fillStyle = `rgba(255,255,255,${p.life})`;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
    } else if (p.type === 'water') {
      ctx.fillStyle = `rgba(56,189,248,${p.life})`;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
    } else if (p.type === 'steam') {
      ctx.fillStyle = `rgba(255,255,255,${p.life * 0.45})`;
      ctx.fillRect(p.x, p.y, 2, 6);
    } else if (p.type === 'heart') {
      drawHeart(p.x, p.y, p.size, p.life);
    } else if (p.type === 'star') {
      drawStar(p.x, p.y, p.size, p.rotation, p.life);
    }

    if (p.life <= 0) {
      particles.splice(i, 1);
      i--;
    }
  }
}

function updateToolUI(tool) {
  currentTool = tool;
  btnSponge.classList.remove('active');
  btnHose.classList.remove('active');
  btnDryer.classList.remove('active');
  const statusText = document.getElementById('status-text');
  const status = document.getElementById('status-container');

  if (tool === 'sponge') {
    btnSponge.classList.add('active');
    statusText.textContent = 'Einseifen!';
    status.style.color = '#db2777';
  } else if (tool === 'hose') {
    btnHose.classList.add('active');
    statusText.textContent = 'Abspülen!';
    status.style.color = '#0284c7';
  } else {
    btnDryer.classList.add('active');
    statusText.textContent = 'Föhnen!';
    status.style.color = '#ca8a04';
  }
}

function renderWornItems() {
  if (!outfitLayer) return;
  const hats = wornItems.hats ? `<g class="outfit-item" data-category="hats">${wornItems.hats.svg}</g>` : '';
  const glasses = wornItems.glasses ? `<g class="outfit-item" data-category="glasses">${wornItems.glasses.svg}</g>` : '';
  const scarves = wornItems.scarves ? `<g class="outfit-item" data-category="scarves">${wornItems.scarves.svg}</g>` : '';
  const tops = wornItems.tops ? `<g class="outfit-item" data-category="tops">${wornItems.tops.svg}</g>` : '';
  const pants = wornItems.pants ? `<g class="outfit-item" data-category="pants">${wornItems.pants.svg}</g>` : '';
  const shoes = wornItems.shoes ? `<g class="outfit-item" data-category="shoes">${wornItems.shoes.svg}</g>` : '';

  outfitLayer.innerHTML = `
    <g id="outfit-head" transform-origin="180 190">${hats}${glasses}</g>
    <g id="outfit-body" transform-origin="180 300">${scarves}${tops}${pants}</g>
    <g id="outfit-leg-l" transform-origin="120 340">${shoes}</g>
    <g id="outfit-leg-r" transform-origin="240 340"><g transform="translate(120 0)">${shoes}</g></g>
  `;
  refreshTray();
}

function equipItem(category, itemId) {
  wornItems[category] = wardrobe[category].items.find((item) => item.id === itemId) || null;
  renderWornItems();
}

function cycleCategory(category) {
  const set = wardrobe[category].items;
  const current = wornItems[category]?.id;
  const index = current ? set.findIndex((item) => item.id === current) : -1;
  const next = set[(index + 1) % set.length];
  equipItem(category, next.id);
}

function removeAllOutfit() {
  const elements = [...outfitLayer.querySelectorAll('.outfit-item')];
  elements.forEach((el) => {
    const dx = `${(Math.random() - 0.5) * 420}px`;
    const dy = `${-130 - Math.random() * 240}px`;
    const rot = `${(Math.random() - 0.5) * 540}deg`;
    el.style.setProperty('--dx', dx);
    el.style.setProperty('--dy', dy);
    el.style.setProperty('--rot', rot);
    el.classList.add('fly-away');
  });

  setTimeout(() => {
    Object.keys(wornItems).forEach((category) => { wornItems[category] = null; });
    renderWornItems();
  }, 640);
}

function getSlotFromPoint(clientX, clientY) {
  const rect = gameArea.getBoundingClientRect();
  const x = clientX - rect.left;
  const y = clientY - rect.top;
  return Object.entries(slots).find(([, slot]) => dist(x, y, slot.x, slot.y) <= slot.size * 0.45)?.[0] || null;
}

function onTrayPointerDown(e) {
  const item = e.currentTarget;
  dragState = {
    category: item.dataset.category,
    itemId: item.dataset.itemId,
    clone: document.createElement('div')
  };
  dragState.clone.className = 'drag-clone';
  dragState.clone.innerHTML = item.innerHTML;
  document.body.appendChild(dragState.clone);
  dragState.clone.style.left = `${e.clientX}px`;
  dragState.clone.style.top = `${e.clientY}px`;
  item.setPointerCapture(e.pointerId);
}

function onTrayPointerMove(e) {
  if (!dragState) return;
  dragState.clone.style.left = `${e.clientX}px`;
  dragState.clone.style.top = `${e.clientY}px`;
}

function finishDrag(clientX, clientY, fallbackCategory, fallbackItemId) {
  if (!dragState) {
    equipItem(fallbackCategory, fallbackItemId);
    return;
  }

  const slotHit = getSlotFromPoint(clientX, clientY);
  if (slotHit === dragState.category) {
    equipItem(dragState.category, dragState.itemId);
  }

  dragState.clone.remove();
  dragState = null;
}

function onTrayPointerUp(e) {
  const item = e.currentTarget;
  finishDrag(e.clientX, e.clientY, item.dataset.category, item.dataset.itemId);
}

function refreshTray() {
  if (!dressupTray) return;
  dressupTray.innerHTML = '';
  wardrobe[selectedCategory].items.forEach((item) => {
    const btn = document.createElement('button');
    btn.className = 'tray-item';
    if (wornItems[selectedCategory]?.id === item.id) btn.classList.add('current');
    btn.innerHTML = renderTrayIcon(item);
    btn.setAttribute('aria-label', item.trayLabel);
    btn.dataset.category = selectedCategory;
    btn.dataset.itemId = item.id;
    btn.addEventListener('pointerdown', onTrayPointerDown);
    btn.addEventListener('pointermove', onTrayPointerMove);
    btn.addEventListener('pointerup', onTrayPointerUp);
    btn.addEventListener('pointercancel', () => finishDrag(-999, -999, selectedCategory, item.id));
    btn.addEventListener('click', () => equipItem(selectedCategory, item.id));
    dressupTray.appendChild(btn);
  });
}

function renderCategories() {
  if (!dressupCategories) return;
  dressupCategories.innerHTML = '';
  Object.entries(wardrobe).forEach(([key, data]) => {
    const btn = document.createElement('button');
    btn.className = `dressup-cat-btn${key === selectedCategory ? ' active' : ''}`;
    btn.textContent = data.label;
    btn.addEventListener('click', () => {
      selectedCategory = key;
      renderCategories();
      refreshTray();
    });
    dressupCategories.appendChild(btn);
  });
}

function unlockDressupMode() {
  if (dressupUnlocked) return;
  dressupUnlocked = true;
  document.body.classList.add('dressup-mode');
  dressupPanel.classList.add('active');
  const statusText = document.getElementById('status-text');
  statusText.textContent = 'Anzieh-Party!';
  renderCategories();
  refreshTray();
}

function updateUI() {
  const progress = Math.floor((1 - stats.dirt) * 100);
  const statusText = document.getElementById('status-text');
  document.getElementById('progress-bar').style.width = `${progress}%`;

  const stars = progress >= 100 && stats.wetness < 0.1 ? 3 : progress >= 70 ? 2 : progress >= 30 ? 1 : 0;
  document.querySelectorAll('#game-stars .star').forEach((star, i) => {
    star.classList.toggle('active', i < stars);
  });

  if (stats.dirt > 0.1) {
    if (currentTool !== 'sponge' && Math.random() > 0.95) statusText.textContent = 'Noch einseifen!';
  } else if (stats.soap > 0.1) {
    if (currentTool !== 'hose' && Math.random() > 0.95) statusText.textContent = 'Schaum abspülen!';
  } else if (stats.wetness > 0.2) {
    if (currentTool !== 'dryer' && Math.random() > 0.95) statusText.textContent = 'Trocknen!';
  } else if (!gameCompleted) {
    gameCompleted = true;
    statusText.textContent = 'Kuschelweich!';
    audio.playHappy();
    unlockDressupMode();

    const currentScore = Math.floor((1 - stats.dirt) * 100) - Math.floor(stats.wetness * 20);
    const highScore = Number(localStorage.getItem('schweini-highscore') || 0);
    if (currentScore > highScore) {
      localStorage.setItem('schweini-highscore', String(currentScore));
      document.getElementById('high-score').textContent = `Best: ${currentScore}!`;
    }
    spawnParticle(180, 210, 'star', 20);
    spawnParticle(190, 180, 'heart', 14);
  }
}

function updatePointerFromEvent(e) {
  const rect = canvas.getBoundingClientRect();
  pointer.x = e.clientX - rect.left;
  pointer.y = e.clientY - rect.top;
}

function attachPointerHandlers() {
  gameArea.addEventListener('pointerdown', (e) => {
    if (dressupUnlocked) return;
    e.preventDefault();
    audio.init();
    pointer.isDown = true;
    updatePointerFromEvent(e);
  });

  gameArea.addEventListener('pointermove', (e) => {
    if (dressupUnlocked) return;
    e.preventDefault();
    updatePointerFromEvent(e);
    pointer.isDown = (e.buttons & 1) === 1 || e.pointerType === 'touch';
  });

  ['pointerup', 'pointercancel', 'pointerleave'].forEach((evt) => {
    gameArea.addEventListener(evt, () => {
      pointer.isDown = false;
      audio.syncTool(currentTool, false);
    });
  });
}

function handleEasterEgg() {
  const noseArea = document.querySelector('[transform="translate(180, 170)"]');
  if (!noseArea) return;
  noseArea.style.cursor = 'pointer';
  noseArea.addEventListener('click', () => {
    const now = Date.now();
    if (now - lastNoseTap < 500) {
      noseTaps++;
      if (noseTaps >= 3) {
        noseTaps = 0;
        alert('🎉 Geheim-Feature: Schweini ist extraglücklich! +50 Punkte!');
        stats.dirt = Math.max(0, stats.dirt - 0.5);
      }
    } else {
      noseTaps = 1;
    }
    lastNoseTap = now;
  });
}

function loop() {
  ctx.clearRect(0, 0, gameArea.clientWidth, gameArea.clientHeight);
  updateAnimation();

  let totalDirt = 0;
  let totalWet = 0;
  let totalSoap = 0;
  let interacted = 0;

  for (const hair of hairs) {
    const dx = pointer.x - hair.x;
    const dy = pointer.y - hair.y;
    const d = Math.hypot(dx, dy);

    if (!dressupUnlocked && pointer.isDown && d < 48) {
      interacted++;
      if (currentTool === 'sponge') {
        hair.dirt = Math.max(0, hair.dirt - 0.045);
        hair.soap = Math.min(1, hair.soap + 0.06);
        hair.wet = Math.min(1, hair.wet + 0.015);
      } else if (currentTool === 'hose') {
        hair.soap = Math.max(0, hair.soap - 0.11);
        hair.wet = Math.min(1, hair.wet + 0.08);
      } else {
        hair.wet = Math.max(0, hair.wet - 0.055);
        hair.soap = Math.max(0, hair.soap - 0.08);
      }
    }

    const heaviness = Math.max(hair.wet, hair.soap);
    const dryAngle = hair.dynamicNormal + hair.curlOffset;
    const wetAngle = Math.PI / 2;
    const weight = heaviness > 0.1 ? Math.min(1, heaviness * 1.5) : 0;
    const targetAngle = dryAngle * (1 - weight) + wetAngle * weight;
    hair.currentAngle += (targetAngle - hair.currentAngle) * 0.22;

    const len = config.hairLengthDry * (1 - heaviness) + config.hairLengthWet * heaviness;
    const thickness = heaviness > 0.5 ? 2 : 3.2;

    const base = config.baseColors;
    const dirtC = config.dirtColors[hair.dirtType];
    let r = base.r * (1 - hair.dirt) + dirtC.r * hair.dirt;
    let g = base.g * (1 - hair.dirt) + dirtC.g * hair.dirt;
    let b = base.b * (1 - hair.dirt) + dirtC.b * hair.dirt;

    if (hair.soap > 0) {
      r = r * (1 - hair.soap) + 255 * hair.soap;
      g = g * (1 - hair.soap) + 255 * hair.soap;
      b = b * (1 - hair.soap) + 255 * hair.soap;
    }
    if (hair.wet > 0) {
      const wetFactor = 0.6 * (1 - hair.soap);
      r *= 1 - hair.wet * wetFactor;
      g *= 1 - hair.wet * wetFactor;
      b *= 1 - hair.wet * wetFactor;
    }

    ctx.beginPath();
    ctx.moveTo(hair.x, hair.y);
    ctx.lineTo(hair.x + Math.cos(hair.currentAngle) * len, hair.y + Math.sin(hair.currentAngle) * len);
    ctx.strokeStyle = `rgb(${Math.floor(r)},${Math.floor(g)},${Math.floor(b)})`;
    ctx.lineWidth = thickness;
    ctx.lineCap = 'round';
    ctx.stroke();

    totalDirt += hair.dirt;
    totalWet += hair.wet;
    totalSoap += hair.soap;
  }

  if (!dressupUnlocked && pointer.isDown && interacted > 0) {
    audio.syncTool(currentTool, true);
    if (currentTool === 'sponge') {
      spawnParticle(pointer.x, pointer.y, 'bubble', 2);
      if (Math.random() > 0.7) spawnParticle(pointer.x, pointer.y, 'heart', 1);
      audio.playBubble();
    } else if (currentTool === 'hose') {
      spawnParticle(pointer.x, pointer.y, 'water', 3);
    } else {
      spawnParticle(pointer.x, pointer.y, 'steam', 2);
      if (Math.random() > 0.75) spawnParticle(pointer.x, pointer.y, 'star', 1);
    }
  } else {
    audio.syncTool(currentTool, false);
  }

  updateParticles();

  const hairCount = hairs.length;
  if (hairCount > 0) {
    stats.dirt = totalDirt / hairCount;
    stats.wetness = totalWet / hairCount;
    stats.soap = totalSoap / hairCount;
  } else {
    stats = { dirt: 1, wetness: 0, soap: 0 };
  }

  svgEl.style.filter = `brightness(${100 - stats.wetness * 40}%)`;
  updateUI();
  requestAnimationFrame(loop);
}

function initDressupHandlers() {
  gameArea.addEventListener('click', (e) => {
    if (!dressupUnlocked) return;
    const category = getSlotFromPoint(e.clientX, e.clientY);
    if (category) cycleCategory(category);
  });

  removeAllBtn.addEventListener('click', () => {
    audio.init();
    removeAllOutfit();
  });
}

function init() {
  resize();
  createDirtPatches();
  spawnHairs();
  attachPointerHandlers();
  initDressupHandlers();

  btnSponge.addEventListener('click', () => { audio.init(); updateToolUI('sponge'); });
  btnHose.addEventListener('click', () => { audio.init(); updateToolUI('hose'); });
  btnDryer.addEventListener('click', () => { audio.init(); updateToolUI('dryer'); });

  if (duck) {
    duck.addEventListener('click', (e) => {
      e.stopPropagation();
      audio.init();
      audio.playQuack();
      spawnParticle(40, 320, 'heart', 4);
      duck.style.transform = 'translateY(-6px) scale(1.07)';
      setTimeout(() => { duck.style.transform = ''; }, 150);
    });
  }

  let attempts = parseInt(localStorage.getItem('schweini-attempts') || '1', 10);
  document.getElementById('attempt-count').textContent = `Versuch: ${attempts}`;
  const highScore = localStorage.getItem('schweini-highscore');
  if (highScore) document.getElementById('high-score').textContent = `Best: ${highScore}`;

  document.getElementById('restart-btn').addEventListener('click', () => {
    localStorage.setItem('schweini-attempts', String(attempts + 1));
    location.reload();
  });

  window.addEventListener('resize', () => {
    window.requestAnimationFrame(resize);
  });

  handleEasterEgg();
  updateToolUI('sponge');
  loop();
}

function initStartScreen() {
  const startScreen = document.getElementById('start-screen');
  const startBtn = document.getElementById('start-btn');
  startScreen.style.display = 'flex';
  startBtn.addEventListener('click', () => {
    startScreen.style.display = 'none';
    audio.init();
  });
}

window.addEventListener('load', () => {
  initStartScreen();
  init();
});
