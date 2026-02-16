export class AudioManager {
  constructor() {
    this.ctx = null;
    this.initialized = false;
    this.lastFx = new Map();
    this.continuous = { hose: null, dryer: null };
  }

  init() {
    if (!this.initialized) {
      this.ctx = new (window.AudioContext || window.webkitAudioContext)();
      this.initialized = true;
    }
    if (this.ctx.state === 'suspended') this.ctx.resume();
  }

  canPlay(key, intervalMs) {
    const now = performance.now();
    const last = this.lastFx.get(key) || 0;
    if (now - last < intervalMs) return false;
    this.lastFx.set(key, now);
    return true;
  }

  playQuack() {
    if (!this.ctx || !this.canPlay('quack', 150)) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(300, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(200, this.ctx.currentTime + 0.15);
    gain.gain.setValueAtTime(0.2, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.2);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.2);
  }

  playBubble() {
    if (!this.ctx || !this.canPlay('bubble', 80)) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.type = 'sine';
    osc.frequency.setValueAtTime(850 + Math.random() * 300, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(1200 + Math.random() * 150, this.ctx.currentTime + 0.1);
    gain.gain.setValueAtTime(0.1, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.12);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.12);
  }

  playHappy() {
    if (!this.ctx || !this.canPlay('happy', 500)) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(523, this.ctx.currentTime);
    osc.frequency.setValueAtTime(659, this.ctx.currentTime + 0.1);
    osc.frequency.setValueAtTime(784, this.ctx.currentTime + 0.2);
    gain.gain.setValueAtTime(0.09, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.35);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.35);
  }

  startContinuous(type) {
    if (!this.ctx || this.continuous[type]) return;
    const bufferSize = this.ctx.sampleRate * 0.4;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) data[i] = (Math.random() * 2 - 1) * (type === 'dryer' ? 0.35 : 0.25);

    const src = this.ctx.createBufferSource();
    src.buffer = buffer;
    src.loop = true;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = type === 'dryer' ? 900 : 2200;

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.0001, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(type === 'dryer' ? 0.18 : 0.14, this.ctx.currentTime + 0.06);

    src.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);

    src.start();
    this.continuous[type] = { src, gain };
  }

  stopContinuous(type) {
    const node = this.continuous[type];
    if (!this.ctx || !node) return;
    node.gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 0.08);
    node.src.stop(this.ctx.currentTime + 0.1);
    this.continuous[type] = null;
  }

  syncTool(tool, isActive) {
    if (!isActive) {
      this.stopContinuous('hose');
      this.stopContinuous('dryer');
      return;
    }
    if (tool === 'hose') {
      this.startContinuous('hose');
      this.stopContinuous('dryer');
    } else if (tool === 'dryer') {
      this.startContinuous('dryer');
      this.stopContinuous('hose');
    } else {
      this.stopContinuous('hose');
      this.stopContinuous('dryer');
    }
  }
}
