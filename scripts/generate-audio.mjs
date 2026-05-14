/**
 * Generates placeholder WAV files for BRAM's audio layer v0.1.
 *
 * These are programmatically-synthesized cozy sound effects — no
 * copyrighted material or third-party packs. Pure sine/triangle
 * waves + light noise + envelopes.
 *
 * Run with:  node scripts/generate-audio.mjs
 *
 * Output: public/assets/audio/sfx/*.wav and music/*.wav
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

const SR = 22050;
const SFX_DIR  = path.join(ROOT, 'public/assets/audio/sfx');
const MUSIC_DIR = path.join(ROOT, 'public/assets/audio/music');
fs.mkdirSync(SFX_DIR, { recursive: true });
fs.mkdirSync(MUSIC_DIR, { recursive: true });

// ─── WAV writer ─────────────────────────────────────────────────────────────

function writeWav(filepath, samples) {
  const n = samples.length;
  const buf = Buffer.alloc(44 + n * 2);
  let o = 0;
  buf.write('RIFF', o);                       o += 4;
  buf.writeUInt32LE(36 + n * 2, o);           o += 4;
  buf.write('WAVE', o);                       o += 4;
  buf.write('fmt ', o);                       o += 4;
  buf.writeUInt32LE(16, o);                   o += 4;
  buf.writeUInt16LE(1, o);                    o += 2; // PCM
  buf.writeUInt16LE(1, o);                    o += 2; // mono
  buf.writeUInt32LE(SR, o);                   o += 4;
  buf.writeUInt32LE(SR * 2, o);               o += 4;
  buf.writeUInt16LE(2, o);                    o += 2;
  buf.writeUInt16LE(16, o);                   o += 2;
  buf.write('data', o);                       o += 4;
  buf.writeUInt32LE(n * 2, o);                o += 4;
  for (let i = 0; i < n; i++) {
    const s = Math.max(-1, Math.min(1, samples[i]));
    buf.writeInt16LE(Math.round(s * 32767), o);
    o += 2;
  }
  fs.writeFileSync(filepath, buf);
}

// ─── synth primitives ───────────────────────────────────────────────────────

function silence(durationS) {
  return new Float32Array(Math.floor(durationS * SR));
}

function add(target, source, offsetSamples = 0, gain = 1) {
  for (let i = 0; i < source.length; i++) {
    const idx = i + offsetSamples;
    if (idx < target.length) target[idx] += source[i] * gain;
  }
}

function sine(freq, durationS, amp = 0.5) {
  const out = new Float32Array(Math.floor(durationS * SR));
  for (let i = 0; i < out.length; i++) {
    out[i] = amp * Math.sin(2 * Math.PI * freq * i / SR);
  }
  return out;
}

function sineSweep(freqStart, freqEnd, durationS, amp = 0.5) {
  const out = new Float32Array(Math.floor(durationS * SR));
  let phase = 0;
  for (let i = 0; i < out.length; i++) {
    const t = i / out.length;
    const f = freqStart + (freqEnd - freqStart) * t;
    phase += 2 * Math.PI * f / SR;
    out[i] = amp * Math.sin(phase);
  }
  return out;
}

function triangle(freq, durationS, amp = 0.4) {
  const out = new Float32Array(Math.floor(durationS * SR));
  for (let i = 0; i < out.length; i++) {
    const phase = (freq * i / SR) % 1;
    const v = phase < 0.5 ? (phase * 4 - 1) : (3 - phase * 4);
    out[i] = amp * v;
  }
  return out;
}

function noise(durationS, amp = 0.3) {
  const out = new Float32Array(Math.floor(durationS * SR));
  for (let i = 0; i < out.length; i++) {
    out[i] = amp * (Math.random() * 2 - 1);
  }
  return out;
}

/** Apply an attack-decay envelope to a buffer in place. */
function envelope(buf, attackS = 0.005, decayS = 0.1) {
  const n = buf.length;
  const attack = Math.max(1, Math.floor(attackS * SR));
  const decayStart = Math.max(attack, n - Math.floor(decayS * SR));
  for (let i = 0; i < attack; i++) buf[i] *= i / attack;
  for (let i = decayStart; i < n; i++) {
    buf[i] *= 1 - (i - decayStart) / (n - decayStart);
  }
  return buf;
}

/** Exponential decay envelope (bell-like). */
function expDecay(buf, attackS = 0.005, decayRate = 5) {
  const attack = Math.max(1, Math.floor(attackS * SR));
  for (let i = 0; i < attack; i++) buf[i] *= i / attack;
  for (let i = attack; i < buf.length; i++) {
    const t = (i - attack) / SR;
    buf[i] *= Math.exp(-decayRate * t);
  }
  return buf;
}

/** Tremolo: amplitude modulation at LFO rate, 0..1 depth. */
function tremolo(buf, lfoHz, depth = 0.3) {
  for (let i = 0; i < buf.length; i++) {
    const lfo = 1 - depth + depth * Math.sin(2 * Math.PI * lfoHz * i / SR);
    buf[i] *= lfo;
  }
  return buf;
}

function mix(...layers) {
  const maxLen = Math.max(...layers.map(b => b.length));
  const out = new Float32Array(maxLen);
  for (const layer of layers) add(out, layer);
  // gentle soft-limit
  for (let i = 0; i < out.length; i++) {
    out[i] = Math.tanh(out[i] * 1.2) * 0.9;
  }
  return out;
}

// ─── recipes ────────────────────────────────────────────────────────────────

function uiClick() {
  // very short click — high mid + tiny noise burst
  return expDecay(
    mix(sine(1200, 0.06, 0.3), noise(0.06, 0.08)),
    0.001, 80
  );
}

function uiHover() {
  return expDecay(sine(1700, 0.04, 0.18), 0.001, 120);
}

function pickupStone() {
  // bright two-tone chime, perfect fifth
  return expDecay(
    mix(
      sine(1318, 0.45, 0.32),         // E6
      sine(1568, 0.45, 0.24),         // G6
      sine(2637, 0.30, 0.10)          // E7 overtone
    ),
    0.003, 6
  );
}

function repairSocket() {
  // warm bell — fundamental + 2nd + 3rd harmonics
  return expDecay(
    mix(
      sine(587, 0.55, 0.40),          // D5
      sine(1174, 0.40, 0.18),
      sine(1760, 0.30, 0.07)
    ),
    0.003, 4
  );
}

function repairComplete() {
  const a = expDecay(mix(sine(523, 0.7, 0.4), sine(1046, 0.5, 0.15)), 0.003, 3.5);
  const b = expDecay(mix(sine(659, 0.5, 0.36), sine(1318, 0.4, 0.12)), 0.005, 3.5);
  const out = new Float32Array(Math.floor(1.0 * SR));
  add(out, a, 0);
  add(out, b, Math.floor(0.18 * SR));
  return out;
}

function blockPush() {
  // low thump — filtered noise + low sine
  const sub = expDecay(sine(95, 0.32, 0.5), 0.003, 9);
  const grain = expDecay(noise(0.22, 0.22), 0.002, 14);
  return mix(sub, grain);
}

function invalidBump() {
  // soft dull thud
  const body = expDecay(sine(180, 0.16, 0.5), 0.002, 18);
  const bite = expDecay(noise(0.06, 0.12), 0.001, 35);
  return mix(body, bite);
}

function undo() {
  // descending swoosh
  return expDecay(
    mix(
      sineSweep(900, 380, 0.28, 0.35),
      sineSweep(450, 190, 0.28, 0.18)
    ),
    0.003, 7
  );
}

function reset() {
  // small chime
  return expDecay(
    mix(sine(660, 0.42, 0.34), sine(1320, 0.32, 0.12)),
    0.003, 5
  );
}

function portalOpen() {
  // low rising hum
  return envelope(
    mix(
      sineSweep(110, 220, 0.9, 0.32),
      sineSweep(220, 440, 0.9, 0.18),
      sineSweep(440, 880, 0.9, 0.06)
    ),
    0.05, 0.18
  );
}

function bramFallApart() {
  // rattle — multiple low ticks
  const out = new Float32Array(Math.floor(0.7 * SR));
  for (let k = 0; k < 8; k++) {
    const tickOffset = Math.floor((k * 0.06 + Math.random() * 0.03) * SR);
    const f = 140 + Math.random() * 90;
    const tick = expDecay(
      mix(sine(f, 0.07, 0.28), noise(0.05, 0.1)),
      0.001, 30
    );
    add(out, tick, tickOffset);
  }
  return out;
}

function bramReassemble() {
  // ascending arpeggio
  const out = new Float32Array(Math.floor(0.6 * SR));
  const notes = [440, 554, 659, 880];
  notes.forEach((f, i) => {
    const off = Math.floor(i * 0.12 * SR);
    const tone = expDecay(
      mix(sine(f, 0.25, 0.32), sine(f * 2, 0.20, 0.10)),
      0.003, 6
    );
    add(out, tone, off);
  });
  return out;
}

function successWarm() {
  // major arpeggio with bell overtones — warm celebratory sting
  const out = new Float32Array(Math.floor(1.2 * SR));
  const notes = [523, 659, 784, 1047];     // C5 E5 G5 C6
  notes.forEach((f, i) => {
    const off = Math.floor(i * 0.16 * SR);
    const tone = expDecay(
      mix(
        sine(f,   0.7, 0.32),
        sine(f*2, 0.5, 0.10),
        sine(f*3, 0.3, 0.04)
      ),
      0.005, 2.5
    );
    add(out, tone, off);
  });
  return out;
}

function niloEnergyPulse() {
  // soft humming pulse
  return envelope(
    tremolo(
      mix(
        sine(261, 0.55, 0.34),       // C4
        sine(523, 0.55, 0.14),
        sine(784, 0.55, 0.06)
      ),
      6, 0.35
    ),
    0.05, 0.1
  );
}

function ambientRattlewoodLoop() {
  // 4-second cozy drone pad, designed to loop seamlessly
  const durS = 4.0;
  const out = new Float32Array(Math.floor(durS * SR));
  // Three layered drones at A2 / A3 / E4
  const layers = [
    { f: 110, amp: 0.22 },
    { f: 220, amp: 0.14 },
    { f: 330, amp: 0.08 }, // slight detune to fill harmonic space
  ];
  for (const { f, amp } of layers) {
    for (let i = 0; i < out.length; i++) {
      // base + slow tremolo around 0.4 Hz so the pad breathes
      const lfo = 0.85 + 0.15 * Math.sin(2 * Math.PI * 0.4 * i / SR);
      out[i] += amp * lfo * Math.sin(2 * Math.PI * f * i / SR);
    }
  }
  // Cross-fade the first / last 200ms with each other so the loop point
  // is seamless. We do this by overlapping the start into the tail.
  const xfadeN = Math.floor(0.2 * SR);
  for (let i = 0; i < xfadeN; i++) {
    const fadeOut = 1 - i / xfadeN;
    const fadeIn  = i / xfadeN;
    const a = out[i] * fadeIn;
    const b = out[out.length - xfadeN + i] * fadeOut;
    out[i] = a + b;
  }
  // Trim the tail (now duplicated into head)
  return out.slice(0, out.length - xfadeN);
}

// ─── run ────────────────────────────────────────────────────────────────────

const recipes = [
  // SFX
  ['sfx',   'ui_click.wav',          uiClick],
  ['sfx',   'ui_hover.wav',          uiHover],
  ['sfx',   'pickup_stone.wav',      pickupStone],
  ['sfx',   'repair_socket.wav',     repairSocket],
  ['sfx',   'repair_complete.wav',   repairComplete],
  ['sfx',   'block_push.wav',        blockPush],
  ['sfx',   'invalid_bump.wav',      invalidBump],
  ['sfx',   'undo.wav',              undo],
  ['sfx',   'reset.wav',             reset],
  ['sfx',   'portal_open.wav',       portalOpen],
  ['sfx',   'bram_fall_apart.wav',   bramFallApart],
  ['sfx',   'bram_reassemble.wav',   bramReassemble],
  ['sfx',   'success_warm.wav',      successWarm],
  ['sfx',   'nilo_energy_pulse.wav', niloEnergyPulse],
  // Music / ambient
  ['music', 'ambient_rattlewood_loop.wav', ambientRattlewoodLoop],
];

console.log(`Generating ${recipes.length} audio files at ${SR}Hz, 16-bit mono WAV…`);
for (const [category, filename, recipe] of recipes) {
  const dir = category === 'sfx' ? SFX_DIR : MUSIC_DIR;
  const filepath = path.join(dir, filename);
  const samples = recipe();
  writeWav(filepath, samples);
  const kb = (samples.length * 2 / 1024).toFixed(1);
  console.log(`  ${category}/${filename}  ${samples.length} samples  ${kb} KB`);
}
console.log('Done.');
