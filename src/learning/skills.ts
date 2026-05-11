export type SkillId =
  | 'add-within-20'
  | 'subtract-within-20'
  | 'missing-addend-10'
  | 'coins-exact-amount'
  | 'tell-time-half-hour'
  | 'time-oclock'
  | 'time-half-hour'
  | 'time-words-half-past'
  | 'time-analog-to-digital-oclock'
  | 'time-quarter-hour';

export interface Skill {
  id: SkillId;
  label: string;
  chapter: 'Hands' | 'Feet' | 'Eyes' | 'Voice' | 'Heart';
  minAge: number;
}

export const skills: Record<SkillId, Skill> = {
  'add-within-20': { id: 'add-within-20', label: 'Addition within 20', chapter: 'Hands', minAge: 5 },
  'subtract-within-20': { id: 'subtract-within-20', label: 'Subtraction within 20', chapter: 'Feet', minAge: 6 },
  'missing-addend-10': { id: 'missing-addend-10', label: 'Make ten / missing addend', chapter: 'Eyes', minAge: 6 },
  'coins-exact-amount': { id: 'coins-exact-amount', label: 'Coins and exact amount', chapter: 'Heart', minAge: 6 },
  'tell-time-half-hour': { id: 'tell-time-half-hour', label: 'Tell time to half-hour', chapter: 'Voice', minAge: 6 },
  'time-oclock': { id: 'time-oclock', label: "Tell time: o'clock", chapter: 'Voice', minAge: 5 },
  'time-half-hour': { id: 'time-half-hour', label: 'Tell time: half-hour', chapter: 'Voice', minAge: 6 },
  'time-words-half-past': { id: 'time-words-half-past', label: 'Read "half past" words', chapter: 'Voice', minAge: 6 },
  'time-analog-to-digital-oclock': { id: 'time-analog-to-digital-oclock', label: 'Match analog → digital', chapter: 'Voice', minAge: 6 },
  'time-quarter-hour': { id: 'time-quarter-hour', label: 'Tell time: quarter-hour', chapter: 'Voice', minAge: 7 }
};
