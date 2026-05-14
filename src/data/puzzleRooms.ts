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
};

export const DEFAULT_ROOM_ID = 'broken_bridge';
