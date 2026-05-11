import type { SkillId } from './skills';

export interface SkillMastery {
  attempts: number;
  correct: number;
  rating: number; // 0..1, deliberately simple for the prototype
}

const STORAGE_KEY = 'bram-local-mastery-v1';

export type MasteryState = Partial<Record<SkillId, SkillMastery>>;

export function loadMastery(): MasteryState {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '{}') as MasteryState;
  } catch {
    return {};
  }
}

export function saveMastery(state: MasteryState) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function recordAttempt(skillId: SkillId, correct: boolean): SkillMastery {
  const state = loadMastery();
  const current = state[skillId] ?? { attempts: 0, correct: 0, rating: 0.25 };
  const next: SkillMastery = {
    attempts: current.attempts + 1,
    correct: current.correct + (correct ? 1 : 0),
    rating: clamp(current.rating + (correct ? 0.08 : -0.05), 0, 1)
  };
  state[skillId] = next;
  saveMastery(state);
  return next;
}

export function pickSkillForPrototype(): SkillId {
  const state = loadMastery();
  const add = state['add-within-20']?.rating ?? 0.25;
  const sub = state['subtract-within-20']?.rating ?? 0.15;
  if (add > 0.65 && sub < 0.55) return 'subtract-within-20';
  if (add > 0.8) return 'missing-addend-10';
  return 'add-within-20';
}

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}
