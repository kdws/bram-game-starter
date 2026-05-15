/**
 * Data definitions for Grid Puzzle Lab rooms.
 *
 * Each room is consumed by `GridPuzzleLabScene` via `scene.start('GridPuzzleLabScene', { roomId })`.
 * Adding a new room is: (1) author the map here, (2) add a menu button.
 * The scene class is reused — no new scene needed.
 */

import type { NumberedCell } from '../game/grid/GridTypes';

export interface PuzzleRoom {
  id: string;
  /** Title shown at the top of the scene. */
  title: string;
  /** ASCII map. See `GridPuzzleEngine` for the cell legend. */
  map: string;
  /** Optional value-tag overlay for numbered stones / sockets. */
  numbered?: Record<string, NumberedCell>;
  /** Which exit visual to use. Defaults to 'arch'. */
  gateVisual?: 'arch' | 'gate';
  /** Three layered hints that fire from the scene as events happen. */
  hints: {
    welcome: string;
    invalidPush?: string;
    firstUndo?: string;
    /** Fires the first time the player tries a wrong-number deposit. */
    numberMismatch?: string;
  };
  /** Lines shown on the success panel. */
  success: {
    title: string;
    niloLine: string;
    bramLine: string;
  };
}

const BROKEN_BRIDGE_MAP = `
##############
#B...........#
#.s.....o....#
#............#
#.s....bo....#
#............#
#.s.....o....#
#............#
#.s.....o...E#
##############
`;

// Twin push blocks — each guards its socket. The player must solve a
// symmetric pair of "push out of the way" moments. Same engine, harder
// spatial planning than Broken Bridge.
const STONE_GARDEN_MAP = `
##############
#B...........#
#.s.....o....#
#............#
#.s....bo....#
#............#
#.s....bo....#
#............#
#.s.....o...E#
##############
`;

export const PUZZLE_ROOMS: Record<string, PuzzleRoom> = {
  broken_bridge: {
    id: 'broken_bridge',
    title: 'Puzzle Lab: Broken Bridge',
    map: BROKEN_BRIDGE_MAP,
    hints: {
      welcome:      'Collect stones, repair sockets, and push blocks out of the way.',
      invalidPush:  'Blocks need empty space behind them.',
      firstUndo:    'Good — one step back is part of solving.',
    },
    success: {
      title:    'The bridge holds.',
      niloLine: '"It stayed."',
      bramLine: '"Just enough."',
    },
  },

  stone_garden: {
    id: 'stone_garden',
    title: 'Puzzle Lab: Stone Garden',
    map: STONE_GARDEN_MAP,
    hints: {
      welcome:     'Twin boulders guard the path. Plan each push carefully.',
      invalidPush: 'Blocks need empty space behind them.',
      firstUndo:   'Good — patience is part of the garden.',
    },
    success: {
      title:    'The garden remembers.',
      niloLine: '"You set them right."',
      bramLine: '"It took patience."',
    },
  },

  // Make 10 (v0.5) — first real arithmetic-teaching room. Sockets all
  // value 10 with acceptMode 'sum_pair'; player must pair stones whose
  // values sum to 10 (1+9, 2+8, 3+7, 4+6). Filling consumes BOTH stones.
  make_10: {
    id: 'make_10',
    title: 'Puzzle Lab: Make 10',
    map: `
##############
#B...........#
#.s...s.o....#
#............#
#.s...s.o....#
#............#
#.s...s.o....#
#............#
#.s...s.o..E#
##############
`,
    numbered: {
      // Left column stones — one half of each pair
      '2,2': { kind: 'stone',  value: 1 },
      '2,4': { kind: 'stone',  value: 2 },
      '2,6': { kind: 'stone',  value: 3 },
      '2,8': { kind: 'stone',  value: 4 },
      // Middle column stones — the partner that completes 10
      '6,2': { kind: 'stone',  value: 9 },
      '6,4': { kind: 'stone',  value: 8 },
      '6,6': { kind: 'stone',  value: 7 },
      '6,8': { kind: 'stone',  value: 6 },
      // Sockets — all value 10, all sum_pair acceptors
      '8,2': { kind: 'socket', value: 10, acceptMode: 'sum_pair' },
      '8,4': { kind: 'socket', value: 10, acceptMode: 'sum_pair' },
      '8,6': { kind: 'socket', value: 10, acceptMode: 'sum_pair' },
      '8,8': { kind: 'socket', value: 10, acceptMode: 'sum_pair' },
    },
    gateVisual: 'gate',
    hints: {
      welcome:        'Each socket wants two stones that add up to 10.',
      firstUndo:      'Good — undo lets you put a stone back and try again.',
      numberMismatch: 'Those two stones don\'t add to 10. Try a different pair.',
    },
    success: {
      title:    'All four pairs make 10.',
      niloLine: '"You see how numbers fit."',
      bramLine: '"One plus the other, every time."',
    },
  },

  // Number Gate (v0.4) — uses the P0 number stones + numbered sockets +
  // alt gate visual. Each socket needs the matching numbered stone; the
  // wrong one bumps with a reject flash.
  number_gate: {
    id: 'number_gate',
    title: 'Puzzle Lab: Number Gate',
    map: `
##############
#B...........#
#.s.....o....#
#............#
#.s.....o....#
#............#
#.s.....o....#
#............#
#.s.....o...E#
##############
`,
    numbered: {
      // Stones (left column) — order is intentionally scrambled so the
      // player has to read the numbers, not just walk down the list.
      '2,2': { kind: 'stone',  value: 3 },
      '2,4': { kind: 'stone',  value: 5 },
      '2,6': { kind: 'stone',  value: 1 },
      '2,8': { kind: 'stone',  value: 4 },
      // Sockets (right column) — paired by number, not by row.
      '8,2': { kind: 'socket', value: 1 },
      '8,4': { kind: 'socket', value: 4 },
      '8,6': { kind: 'socket', value: 3 },
      '8,8': { kind: 'socket', value: 5 },
    },
    gateVisual: 'gate',
    hints: {
      welcome:        'Match each stone to its number. The gate opens when all four fit.',
      firstUndo:      'Good — sometimes you have to count again.',
      numberMismatch: 'That socket needs a different number.',
    },
    success: {
      title:    'The numbers line up.',
      niloLine: '"Each one belongs."',
      bramLine: '"I counted right."',
    },
  },

  // ─── Math ladder (v0.6) — three sum_pair variants that warm up to and
  // extend the Make 10 mechanic. All share the same grid shape as Make 10
  // so players read the layout once and focus on the numbers.
  // ──────────────────────────────────────────────────────────────────────

  make_5: {
    id: 'make_5',
    title: 'Puzzle Lab: Make 5',
    map: `
##############
#B...........#
#.s...s.o....#
#............#
#.s...s.o....#
#............#
#.s...s.o....#
#............#
#.s...s.o..E#
##############
`,
    numbered: {
      // Left column 1..4
      '2,2': { kind: 'stone',  value: 1 },
      '2,4': { kind: 'stone',  value: 2 },
      '2,6': { kind: 'stone',  value: 3 },
      '2,8': { kind: 'stone',  value: 4 },
      // Middle column mirrored so each row pairs to 5
      '6,2': { kind: 'stone',  value: 4 },
      '6,4': { kind: 'stone',  value: 3 },
      '6,6': { kind: 'stone',  value: 2 },
      '6,8': { kind: 'stone',  value: 1 },
      '8,2': { kind: 'socket', value: 5, acceptMode: 'sum_pair' },
      '8,4': { kind: 'socket', value: 5, acceptMode: 'sum_pair' },
      '8,6': { kind: 'socket', value: 5, acceptMode: 'sum_pair' },
      '8,8': { kind: 'socket', value: 5, acceptMode: 'sum_pair' },
    },
    gateVisual: 'gate',
    hints: {
      welcome:        'Each socket wants two stones that add up to 5.',
      firstUndo:      'Good — undo lets you put a stone back and try again.',
      numberMismatch: "Those two stones don't add to 5. Try a different pair.",
    },
    success: {
      title:    'Five every time.',
      niloLine: '"Small sums still count."',
      bramLine: '"One and four. Two and three."',
    },
  },

  doubles: {
    id: 'doubles',
    title: 'Puzzle Lab: Doubles',
    map: `
##############
#B...........#
#.s...s.o....#
#............#
#.s...s.o....#
#............#
#.s...s.o....#
#............#
#.s...s.o..E#
##############
`,
    numbered: {
      // Two of each: 1, 2, 3, 4 — left and middle columns mirror.
      '2,2': { kind: 'stone',  value: 1 },
      '2,4': { kind: 'stone',  value: 2 },
      '2,6': { kind: 'stone',  value: 3 },
      '2,8': { kind: 'stone',  value: 4 },
      '6,2': { kind: 'stone',  value: 1 },
      '6,4': { kind: 'stone',  value: 2 },
      '6,6': { kind: 'stone',  value: 3 },
      '6,8': { kind: 'stone',  value: 4 },
      // Sockets ascend by 2 — the doubled value of each stone pair.
      '8,2': { kind: 'socket', value: 2, acceptMode: 'sum_pair' },
      '8,4': { kind: 'socket', value: 4, acceptMode: 'sum_pair' },
      '8,6': { kind: 'socket', value: 6, acceptMode: 'sum_pair' },
      '8,8': { kind: 'socket', value: 8, acceptMode: 'sum_pair' },
    },
    gateVisual: 'gate',
    hints: {
      welcome:        'Each socket wants two matching stones — a number plus itself.',
      firstUndo:      'Good — try pairing stones that look alike.',
      numberMismatch: "These don't pair up here. Look for two stones with the same value.",
    },
    success: {
      title:    'Each one, twice.',
      niloLine: '"Twins find each other."',
      bramLine: '"Double makes it whole."',
    },
  },

  // Make 20 with carries — pairs all cross the 10s boundary.
  make_20: {
    id: 'make_20',
    title: 'Puzzle Lab: Make 20',
    map: `
##############
#B...........#
#.s...s.o....#
#............#
#.s...s.o....#
#............#
#.s...s.o....#
#............#
#.s...s.o..E#
##############
`,
    numbered: {
      // Left column: teens — each is "ten and a bit".
      '2,2': { kind: 'stone',  value: 11 },
      '2,4': { kind: 'stone',  value: 12 },
      '2,6': { kind: 'stone',  value: 13 },
      '2,8': { kind: 'stone',  value: 14 },
      // Middle column: the "bit you'd need to bridge to 20".
      '6,2': { kind: 'stone',  value: 9 },
      '6,4': { kind: 'stone',  value: 8 },
      '6,6': { kind: 'stone',  value: 7 },
      '6,8': { kind: 'stone',  value: 6 },
      '8,2': { kind: 'socket', value: 20, acceptMode: 'sum_pair' },
      '8,4': { kind: 'socket', value: 20, acceptMode: 'sum_pair' },
      '8,6': { kind: 'socket', value: 20, acceptMode: 'sum_pair' },
      '8,8': { kind: 'socket', value: 20, acceptMode: 'sum_pair' },
    },
    gateVisual: 'gate',
    hints: {
      welcome:        'Each socket wants two stones that add up to 20. Think tens.',
      firstUndo:      'Good — try thinking of 13 as ten and three.',
      numberMismatch: "Those two stones don't reach 20 yet. Try a bigger partner.",
    },
    success: {
      title:    'All four reach twenty.',
      niloLine: '"You crossed the ten."',
      bramLine: "\"Ten and ten — that's all it ever was.\"",
    },
  },
};

export const DEFAULT_ROOM_ID = 'broken_bridge';
