/**
 * Data definitions for Grid Puzzle Lab rooms.
 *
 * Each room is consumed by `GridPuzzleLabScene` via `scene.start('GridPuzzleLabScene', { roomId })`.
 * Adding a new room is: (1) author the map here, (2) add a menu button.
 * The scene class is reused — no new scene needed.
 */

export interface PuzzleRoom {
  id: string;
  /** Title shown at the top of the scene. */
  title: string;
  /** ASCII map. See `GridPuzzleEngine` for the cell legend. */
  map: string;
  /** Three layered hints that fire from the scene as events happen. */
  hints: {
    welcome: string;
    invalidPush?: string;
    firstUndo?: string;
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
};

export const DEFAULT_ROOM_ID = 'broken_bridge';
