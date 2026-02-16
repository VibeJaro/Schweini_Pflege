import { AudioManager } from './audio.js';

const canvas = document.getElementById('fur-canvas');
const ctx = canvas.getContext('2d');
const gameArea = document.getElementById('game-canvas-area');
const svgEl = document.getElementById('pig-structure-svg');
const btnSponge = document.getElementById('btn-sponge');
const btnHose = document.getElementById('btn-hose');
const btnDryer = document.getElementById('btn-dryer');
const duck = document.getElementById('duck-overlay');

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

let hairs = [];
let particles = [];
let pointer = { x: -100, y: -100, isDown: false };
let currentTool = 'sponge';
let stats = { dirt: 100, wetness: 0, soap: 0 };
let dirtPatches = [];
let time = 0;
let gameCompleted = false;
let noseTaps = 0;
let lastNoseTap = 0;

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
    document.getElementById('restart-btn').style.display = 'block';

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
    e.preventDefault();
    audio.init();
    pointer.isDown = true;
    updatePointerFromEvent(e);
  });

  gameArea.addEventListener('pointermove', (e) => {
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

    if (pointer.isDown && d < 48) {
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

  if (pointer.isDown && interacted > 0) {
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

function init() {
  resize();
  createDirtPatches();
  spawnHairs();
  attachPointerHandlers();

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
