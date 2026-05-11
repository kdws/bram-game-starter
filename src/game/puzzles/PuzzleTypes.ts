import type { SkillId } from '../../learning/skills';

/**
 * Six puzzle kinds defined in docs/PUZZLE_GAMEPLAY_DESIGN.md §4.
 *
 *  - arcade_math:               Math Blaster-style fluency, Rattle Run gates
 *  - room_puzzle:               Zelda-style locks, switches, balance scales
 *  - brainteaser:               Layton-style story riddles
 *  - side_scroller_environmental: traversal puzzles (bridges, lifts, currents)
 *  - grid_logic:                Chip's Challenge-style tile rooms
 *  - repair_ritual:             chapter finales that synthesize learned skills
 */
export type PuzzleKind =
  | 'arcade_math'
  | 'room_puzzle'
  | 'brainteaser'
  | 'side_scroller_environmental'
  | 'grid_logic'
  | 'repair_ritual';

export type RepairTheme =
  | 'bridge'
  | 'clock'
  | 'path'
  | 'garden'
  | 'market'
  | 'lantern'
  | 'mirror'
  | 'other';

export type PuzzleChapter =
  | 'hands'
  | 'feet'
  | 'eyes'
  | 'voice'
  | 'heart'
  | 'finale'
  | 'lab';

export type Difficulty = 'tutorial' | 'easy' | 'medium' | 'hard' | 'optional';

/**
 * Three-tier hint ladder defined in §11. Hints are *additive* — level 2
 * does not replace level 1, it follows it. The scene/UI decides pacing.
 *
 *  - Level 1 (Nilo notices):  points without revealing
 *  - Level 2 (Bram explains): practical guidance
 *  - Level 3 (Owl scaffolds): structured strategy, still not the answer
 */
export interface PuzzleHint {
  level: 1 | 2 | 3;
  speaker: 'Nilo' | 'Bram' | 'Owl';
  text: string;
}

/**
 * Cosmetic / world-state rewards. No loot boxes, no gambling, no streak
 * pressure — see §12.
 */
export type PuzzleRewardKind =
  | 'life_spark'
  | 'shell'
  | 'sticker'
  | 'patch'
  | 'glow_color'
  | 'lore'
  | 'stamp';

export interface PuzzleReward {
  kind: PuzzleRewardKind;
  amount?: number;
  label?: string;
}

/**
 * Universal definition shape for every puzzle in the game.
 *
 * Concrete puzzle types (grid, arcade, brainteaser, …) extend this with
 * their own payloads. The shared fields are everything the game needs to
 * present, score, hint, and reward a puzzle independent of its mechanics.
 */
export interface PuzzleDef {
  id: string;
  title: string;
  kind: PuzzleKind;
  chapter?: PuzzleChapter;
  /** Skill IDs this puzzle should record attempts against, if any. */
  skillIds?: SkillId[];
  difficulty: Difficulty;
  /** Prompt shown to the player when the puzzle begins. */
  prompt: string;
  /** Microcopy on success. Often a tiny Bram / Nilo / Owl line. */
  successText: string;
  hints: PuzzleHint[];
  repairTheme: RepairTheme;
  reward?: PuzzleReward;
  /** Optional puzzles never block main story completion (see §13). */
  optional?: boolean;
}
