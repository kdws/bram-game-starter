export type RestorationStageId =
  | 'skeleton'
  | 'hands'
  | 'feet'
  | 'eyes'
  | 'voice'
  | 'heart'
  | 'human';

export interface RestorationStageDef {
  id: RestorationStageId;
  label: string;
  blurb: string;
}

export const RESTORATION_STAGES: RestorationStageDef[] = [
  { id: 'skeleton', label: 'Skeleton', blurb: 'The starting form.' },
  { id: 'hands',    label: 'Hands',    blurb: 'Grab, pull, balance.' },
  { id: 'feet',     label: 'Feet',     blurb: 'Walk softly, jump farther.' },
  { id: 'eyes',     label: 'Eyes',     blurb: 'See hidden numbers.' },
  { id: 'voice',    label: 'Voice',    blurb: 'Speak to neighbors.' },
  { id: 'heart',    label: 'Heart',    blurb: 'Care, share, remember.' },
  { id: 'human',    label: 'Human',    blurb: 'Almost-boy no more.' }
];

interface ProgressState {
  lifeSparksCollected: number;
  restoredStages: RestorationStageId[];
}

const STORAGE_KEY = 'bram-game-progress-v1';

function emptyState(): ProgressState {
  return { lifeSparksCollected: 0, restoredStages: [] };
}

function load(): ProgressState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return emptyState();
    const parsed = JSON.parse(raw);
    return {
      lifeSparksCollected: typeof parsed.lifeSparksCollected === 'number' ? parsed.lifeSparksCollected : 0,
      restoredStages: Array.isArray(parsed.restoredStages) ? parsed.restoredStages : []
    };
  } catch {
    return emptyState();
  }
}

function save(state: ProgressState) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // localStorage may be unavailable; ignore
  }
}

export const GameProgress = {
  get(): ProgressState {
    return load();
  },

  reset(): void {
    save(emptyState());
  },

  addLifeSpark(): number {
    const s = load();
    s.lifeSparksCollected += 1;
    save(s);
    return s.lifeSparksCollected;
  },

  lifeSparks(): number {
    return load().lifeSparksCollected;
  },

  spendLifeSparks(cost: number): boolean {
    const s = load();
    if (s.lifeSparksCollected < cost) return false;
    s.lifeSparksCollected -= cost;
    save(s);
    return true;
  },

  restoreStage(stage: RestorationStageId): void {
    const s = load();
    if (!s.restoredStages.includes(stage)) {
      s.restoredStages.push(stage);
      save(s);
    }
  },

  isRestored(stage: RestorationStageId): boolean {
    if (stage === 'skeleton') return true;
    return load().restoredStages.includes(stage);
  },

  currentStage(): RestorationStageId {
    const s = load();
    for (const stage of RESTORATION_STAGES) {
      if (stage.id === 'skeleton') continue;
      if (!s.restoredStages.includes(stage.id)) return stage.id;
    }
    return 'human';
  }
};
