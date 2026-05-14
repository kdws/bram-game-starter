import Phaser from 'phaser';
import { AUDIO_CATEGORY, AudioKeys, type AudioCategory } from './AudioKeys';

/**
 * Lightweight static audio manager for BRAM.
 *
 * Goals:
 * - Safe `play()` / `loop()` / `stop()` that no-op gracefully if a file
 *   is missing or audio is unavailable.
 * - Three independent volume buses: master, sfx, music.
 * - Mute toggle.
 * - All settings persisted to localStorage.
 *
 * Usage:
 *   AudioManager.init(this.game);        // once, in BootScene
 *   AudioManager.play(AudioKeys.UI_CLICK);
 *   AudioManager.loop(AudioKeys.AMBIENT_RATTLEWOOD);
 *
 * The manager is a static class — there's only one in flight per game.
 */

const LS = {
  MUTED:  'bram.audio.muted',
  MASTER: 'bram.audio.masterVolume',
  SFX:    'bram.audio.sfxVolume',
  MUSIC:  'bram.audio.musicVolume',
};

type AnySound = Phaser.Sound.BaseSound;

interface PlayOptions {
  volume?: number;
  rate?: number;
  detune?: number;
}

export class AudioManager {
  private static game: Phaser.Game | null = null;
  /** Active loop instances tracked by key so we can stop them. */
  private static loops: Map<string, AnySound> = new Map();

  // ─── settings ───────────────────────────────────────────────────────────
  private static muted = false;
  private static masterVolume = 0.7;
  private static sfxVolume    = 1.0;
  private static musicVolume  = 0.55;

  /** Call once from BootScene.create(). */
  static init(game: Phaser.Game) {
    AudioManager.game = game;
    AudioManager.loadPersisted();
  }

  // ─── one-shot SFX ──────────────────────────────────────────────────────

  /** Play a one-shot sound. No-ops cleanly if file missing / muted. */
  static play(key: string, options: PlayOptions = {}): void {
    if (!AudioManager.canPlay(key)) return;

    const config: Phaser.Types.Sound.SoundConfig = {
      volume: AudioManager.resolveVolume(key, options.volume),
      rate:   options.rate,
      detune: options.detune,
    };

    try {
      AudioManager.game!.sound.play(key, config);
    } catch {
      // Cache exists check passed but playback failed (e.g. decode error).
      // Stay silent — no console spam.
    }
  }

  // ─── loops (music / ambient) ───────────────────────────────────────────

  /** Start a looping sound. If it's already looping, do nothing. */
  static loop(key: string, options: PlayOptions = {}): void {
    if (!AudioManager.canPlay(key)) return;

    const existing = AudioManager.loops.get(key);
    if (existing && existing.isPlaying) return;

    const config: Phaser.Types.Sound.SoundConfig = {
      loop: true,
      volume: AudioManager.resolveVolume(key, options.volume),
    };

    try {
      // Reuse the cached instance if present, else add a new one.
      let snd = existing;
      if (!snd) {
        snd = AudioManager.game!.sound.add(key, config);
        AudioManager.loops.set(key, snd);
      }
      snd.play(config);
    } catch {
      // ignore
    }
  }

  /** Stop a sound (works for both one-shots and tracked loops). */
  static stop(key: string): void {
    const snd = AudioManager.loops.get(key);
    if (snd && snd.isPlaying) {
      try { snd.stop(); } catch { /* ignore */ }
    }
    // Also stop any one-shot instances of this key.
    const mgr = AudioManager.game?.sound;
    if (mgr && typeof (mgr as { stopByKey?: (k: string) => void }).stopByKey === 'function') {
      try { (mgr as { stopByKey: (k: string) => void }).stopByKey(key); }
      catch { /* ignore */ }
    }
  }

  static stopAll(): void {
    if (!AudioManager.game?.sound) return;
    try { AudioManager.game.sound.stopAll(); } catch { /* ignore */ }
    AudioManager.loops.clear();
  }

  // ─── mute / volume ─────────────────────────────────────────────────────

  static isMuted(): boolean { return AudioManager.muted; }

  static setMuted(muted: boolean): void {
    AudioManager.muted = muted;
    if (muted) AudioManager.stopAll();
    AudioManager.persist();
  }

  static toggleMute(): boolean {
    AudioManager.setMuted(!AudioManager.muted);
    return AudioManager.muted;
  }

  static getMasterVolume(): number { return AudioManager.masterVolume; }
  static getSfxVolume():    number { return AudioManager.sfxVolume;    }
  static getMusicVolume():  number { return AudioManager.musicVolume;  }

  static setMasterVolume(v: number): void {
    AudioManager.masterVolume = AudioManager.clamp01(v);
    AudioManager.persist();
  }
  static setSfxVolume(v: number): void {
    AudioManager.sfxVolume = AudioManager.clamp01(v);
    AudioManager.persist();
  }
  static setMusicVolume(v: number): void {
    AudioManager.musicVolume = AudioManager.clamp01(v);
    AudioManager.persist();
    // Apply to active music loops in real time
    for (const [key, snd] of AudioManager.loops.entries()) {
      if (AUDIO_CATEGORY[key] !== 'music') continue;
      if (snd && 'setVolume' in snd) {
        try { (snd as Phaser.Sound.WebAudioSound).setVolume(AudioManager.resolveVolume(key, 1)); }
        catch { /* ignore */ }
      }
    }
  }

  // ─── internals ─────────────────────────────────────────────────────────

  private static canPlay(key: string): boolean {
    if (AudioManager.muted)         return false;
    if (!AudioManager.game?.sound)  return false;
    if (!AudioManager.game.cache?.audio?.exists(key)) return false;
    return true;
  }

  private static resolveVolume(key: string, perCallVol?: number): number {
    const cat: AudioCategory = AUDIO_CATEGORY[key] ?? 'sfx';
    const busVol = cat === 'music' ? AudioManager.musicVolume : AudioManager.sfxVolume;
    return AudioManager.clamp01((perCallVol ?? 1) * busVol * AudioManager.masterVolume);
  }

  private static clamp01(v: number): number {
    if (!Number.isFinite(v)) return 0;
    return Math.max(0, Math.min(1, v));
  }

  private static persist(): void {
    try {
      localStorage.setItem(LS.MUTED,  String(AudioManager.muted));
      localStorage.setItem(LS.MASTER, String(AudioManager.masterVolume));
      localStorage.setItem(LS.SFX,    String(AudioManager.sfxVolume));
      localStorage.setItem(LS.MUSIC,  String(AudioManager.musicVolume));
    } catch { /* storage may be unavailable; that's fine */ }
  }

  private static loadPersisted(): void {
    try {
      const m   = localStorage.getItem(LS.MUTED);
      const mv  = localStorage.getItem(LS.MASTER);
      const sfx = localStorage.getItem(LS.SFX);
      const mus = localStorage.getItem(LS.MUSIC);
      if (m  !== null) AudioManager.muted        = m === 'true';
      if (mv !== null) AudioManager.masterVolume = AudioManager.clamp01(parseFloat(mv));
      if (sfx !== null) AudioManager.sfxVolume   = AudioManager.clamp01(parseFloat(sfx));
      if (mus !== null) AudioManager.musicVolume = AudioManager.clamp01(parseFloat(mus));
    } catch { /* ignore */ }
  }
}

// Re-export for convenience
export { AudioKeys };
