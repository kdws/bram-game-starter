export interface Chapter {
  id: string;
  name: string;
  restoredPart: string;
  world: string;
  coreMode: 'rattle-run' | 'platform' | 'top-down';
  unlock: string;
}

export const chapters: Chapter[] = [
  {
    id: 'hands',
    name: 'Rattlewood Roll',
    restoredPart: 'Hands',
    world: 'Rattlewood',
    coreMode: 'rattle-run',
    unlock: 'Grab rails, carry quest objects, and pull levers.'
  },
  {
    id: 'feet',
    name: 'Hollow Hill Hop',
    restoredPart: 'Feet',
    world: 'Hollow Hills',
    coreMode: 'platform',
    unlock: 'Higher jumps, softer landings, and number-line bridges.'
  },
  {
    id: 'heart',
    name: 'Moonlit Market',
    restoredPart: 'Heart',
    world: 'Moonlit Market',
    coreMode: 'top-down',
    unlock: 'Kindness quests, exact-change puzzles, and one gentle mistake buffer.'
  }
];
