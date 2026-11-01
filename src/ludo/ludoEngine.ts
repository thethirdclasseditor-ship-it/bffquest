export type LudoColor = 'red' | 'green' | 'yellow' | 'blue';
export type LudoGameMode = 'classic' | 'snake';
export type PlayerCount = 2 | 4;
export type TurnPhase = 'WAITING_FOR_ROLL' | 'WAITING_FOR_MOVE';

export interface ClassicLudoState {
  mode: 'classic';
  maxPlayers: PlayerCount;
  activeColors: LudoColor[];
  turnIndex: number;
  turnColor: LudoColor;
  phase: TurnPhase;
  diceValue: number | null;
  consecutiveSixes: number;
  lastAction: string;
  moveHistory: string[];
  finishOrder: LudoColor[];
  winnerColor: LudoColor | null;
  tokens: Record<LudoColor, [number, number, number, number]>;
  status?: 'waiting' | 'playing' | 'finished';
}

export interface SnakeBoardConfig {
  ladders: Record<number, number>;
  snakes: Record<number, number>;
}

export interface SnakeLudoState {
  mode: 'snake';
  maxPlayers: PlayerCount;
  activeColors: LudoColor[];
  turnIndex: number;
  turnColor: LudoColor;
  phase: TurnPhase;
  diceValue: number | null;
  consecutiveSixes: number;
  lastAction: string;
  moveHistory: string[];
  finishOrder: LudoColor[];
  winnerColor: LudoColor | null;
  positions: Record<LudoColor, number>;
  status?: 'waiting' | 'playing' | 'finished';
}

export type AnyLudoBoardState = ClassicLudoState | SnakeLudoState;

/**
 * Classic Ludo Constants
 * - 52 shared outer track squares (0..51)
 * - 4 starting squares: Red=0, Green=13, Yellow=26, Blue=39
 * - 4 star safe squares: 8, 21, 34, 47
 * - Total 8 safe squares on the outer track
 * - Token logical step:
 *    -1      = In Home Base
 *    0..50   = On shared outer track (relative to color's starting square)
 *    51..55  = Inside color's private 5-square home lane
 *    56      = Reached final Home triangle (exact roll required)
 */
export const ALL_LUDO_COLORS: LudoColor[] = ['red', 'green', 'yellow', 'blue'];

export const START_TRACK_INDEX: Record<LudoColor, number> = {
  red: 0,
  green: 13,
  yellow: 26,
  blue: 39,
};

export const SAFE_TRACK_INDICES: ReadonlySet<number> = new Set([
  0, 8, 13, 21, 26, 34, 39, 47,
]);

export const STAR_TRACK_INDICES: ReadonlySet<number> = new Set([8, 21, 34, 47]);

/**
 * 15x15 Grid Coordinates (row 0..14, col 0..14) for the 52-square clockwise outer track
 * Starting at Red's start square (index 0 -> row 6, col 1)
 */
export const OUTER_TRACK_COORDS: [number, number][] = [
  // Red bottom-left arm going right (0..4)
  [6, 1], [6, 2], [6, 3], [6, 4], [6, 5],
  // Going up left side of top arm (5..10)
  [5, 6], [4, 6], [3, 6], [2, 6], [1, 6], [0, 6],
  // Top turn (11..12)
  [0, 7], [0, 8],
  // Green top-right arm going down (13..17)
  [1, 8], [2, 8], [3, 8], [4, 8], [5, 8],
  // Going right along top of right arm (18..23)
  [6, 9], [6, 10], [6, 11], [6, 12], [6, 13], [6, 14],
  // Right turn (24..25)
  [7, 14], [8, 14],
  // Yellow bottom-right arm going left (26..30)
  [8, 13], [8, 12], [8, 11], [8, 10], [8, 9],
  // Going down right side of bottom arm (31..36)
  [9, 8], [10, 8], [11, 8], [12, 8], [13, 8], [14, 8],
  // Bottom turn (37..38)
  [14, 7], [14, 6],
  // Blue bottom-left arm going up (39..43)
  [13, 6], [12, 6], [11, 6], [10, 6], [9, 6],
  // Going left along bottom of left arm (44..49)
  [8, 5], [8, 4], [8, 3], [8, 2], [8, 1], [8, 0],
  // Left turn (50..51)
  [7, 0], [6, 0],
];

export const HOME_LANE_COORDS: Record<LudoColor, [number, number][]> = {
  red: [
    [7, 1], [7, 2], [7, 3], [7, 4], [7, 5], [7, 6],
  ],
  green: [
    [1, 7], [2, 7], [3, 7], [4, 7], [5, 7], [6, 7],
  ],
  yellow: [
    [7, 13], [7, 12], [7, 11], [7, 10], [7, 9], [7, 8],
  ],
  blue: [
    [13, 7], [12, 7], [11, 7], [10, 7], [9, 7], [8, 7],
  ],
};

export const BASE_TOKEN_COORDS: Record<LudoColor, [number, number][]> = {
  red: [
    [1.8, 1.8], [1.8, 3.8], [3.8, 1.8], [3.8, 3.8],
  ],
  green: [
    [1.8, 10.2], [1.8, 12.2], [3.8, 10.2], [3.8, 12.2],
  ],
  yellow: [
    [10.2, 10.2], [10.2, 12.2], [12.2, 10.2], [12.2, 12.2],
  ],
  blue: [
    [10.2, 1.8], [10.2, 3.8], [12.2, 1.8], [12.2, 3.8],
  ],
};

/**
 * Default Snake Ludo (Snakes & Ladders) Board Configuration (stored separately from engine logic)
 */
export const SNAKE_BOARD_DEFAULT_CONFIG: SnakeBoardConfig = {
  ladders: {
    3: 22,
    5: 8,
    11: 26,
    20: 29,
    27: 56,
    36: 44,
    51: 67,
    71: 91,
    80: 100,
  },
  snakes: {
    17: 4,
    19: 7,
    21: 9,
    43: 18,
    49: 30,
    62: 41,
    64: 60,
    87: 24,
    93: 73,
    95: 75,
    98: 79,
  },
};

export function validateSnakeBoardConfig(config: SnakeBoardConfig): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];
  const ladderStarts = new Set<number>();
  const snakeHeads = new Set<number>();

  for (const [bottomStr, top] of Object.entries(config.ladders)) {
    const bottom = Number(bottomStr);
    if (bottom < 2 || bottom > 99 || top < 2 || top > 100) {
      errors.push(`Ladder ${bottom}->${top} out of valid range.`);
    }
    if (top <= bottom) {
      errors.push(`Ladder ${bottom}->${top} must go up (top > bottom).`);
    }
    ladderStarts.add(bottom);
  }

  for (const [headStr, tail] of Object.entries(config.snakes)) {
    const head = Number(headStr);
    if (head < 2 || head > 99 || tail < 1 || tail > 99) {
      errors.push(`Snake ${head}->${tail} out of valid range.`);
    }
    if (tail >= head) {
      errors.push(`Snake ${head}->${tail} must go down (tail < head).`);
    }
    if (ladderStarts.has(head)) {
      errors.push(`Square ${head} cannot be both a snake head and a ladder bottom.`);
    }
    snakeHeads.add(head);
  }

  return { valid: errors.length === 0, errors };
}

export function getActiveColorsForPlayerCount(maxPlayers: PlayerCount): LudoColor[] {
  return maxPlayers === 2 ? ['red', 'yellow'] : ['red', 'green', 'yellow', 'blue'];
}

export function getGlobalTrackIndex(color: LudoColor, step: number): number | null {
  if (step < 0 || step > 50) return null;
  return (START_TRACK_INDEX[color] + step) % 52;
}

export function isTrackSquareSafe(globalTrackIndex: number): boolean {
  return SAFE_TRACK_INDICES.has(globalTrackIndex);
}

export function getClassicTokenGridCoord(
  color: LudoColor,
  step: number,
  tokenIndex: number
): [number, number] {
  if (step < 0) {
    return BASE_TOKEN_COORDS[color][tokenIndex] || BASE_TOKEN_COORDS[color][0];
  }
  if (step <= 50) {
    const globalIdx = getGlobalTrackIndex(color, step)!;
    return OUTER_TRACK_COORDS[globalIdx];
  }
  const homeIdx = Math.min(step - 51, 5);
  return HOME_LANE_COORDS[color][homeIdx];
}

/**
 * Snake Ludo 1..100 Serpentine Grid Coordinate Mapper
 * Square 1 = bottom-left (row 9, col 0)
 * Square 10 = bottom-right (row 9, col 9)
 * Square 11 = row 8, col 9 ... Square 20 = row 8, col 0
 * Square 100 = top-left (row 0, col 0)
 */
export function getSnakeSquareCoord(square: number): { row: number; col: number } {
  const clamped = Math.max(1, Math.min(100, square));
  const zeroBased = clamped - 1;
  const rowFromBottom = Math.floor(zeroBased / 10);
  const row = 9 - rowFromBottom;
  const offsetInRow = zeroBased % 10;
  const col = rowFromBottom % 2 === 0 ? offsetInRow : 9 - offsetInRow;
  return { row, col };
}

export function getSquareNumberAtGrid(row: number, col: number): number {
  const rowFromBottom = 9 - row;
  const offsetInRow = rowFromBottom % 2 === 0 ? col : 9 - col;
  return rowFromBottom * 10 + offsetInRow + 1;
}

/* ============================================================================
 * CLASSIC LUDO PURE RULES ENGINE
 * ============================================================================ */
export function createClassicLudoState(maxPlayers: PlayerCount = 4): ClassicLudoState {
  const activeColors = getActiveColorsForPlayerCount(maxPlayers);
  return {
    mode: 'classic',
    maxPlayers,
    activeColors,
    turnIndex: 0,
    turnColor: activeColors[0],
    phase: 'WAITING_FOR_ROLL',
    diceValue: null,
    consecutiveSixes: 0,
    lastAction: 'Match ready to start.',
    moveHistory: [],
    finishOrder: [],
    winnerColor: null,
    tokens: {
      red: [-1, -1, -1, -1],
      green: [-1, -1, -1, -1],
      yellow: [-1, -1, -1, -1],
      blue: [-1, -1, -1, -1],
    },
    status: 'playing',
  };
}

export function getLegalTokenIndicesForClassic(
  state: ClassicLudoState,
  color: LudoColor = state.turnColor,
  diceValue: number | null = state.diceValue
): number[] {
  if (!diceValue || diceValue < 1 || diceValue > 6) return [];
  if (state.winnerColor || state.status === 'finished') return [];
  const tokens = state.tokens[color];
  const legal: number[] = [];

  for (let i = 0; i < 4; i++) {
    const step = tokens[i];
    if (step === -1) {
      if (diceValue === 6) legal.push(i);
    } else if (step >= 0 && step < 56) {
      if (step + diceValue <= 56) legal.push(i);
    }
  }
  return legal;
}

export function applyClassicDiceRoll(
  state: ClassicLudoState,
  diceValue: number,
  actingColor: LudoColor = state.turnColor
): ClassicLudoState {
  if (state.status === 'finished' || state.winnerColor) {
    throw new Error('Game has already ended.');
  }
  if (actingColor !== state.turnColor) {
    throw new Error('Not this player’s turn.');
  }
  if (state.phase !== 'WAITING_FOR_ROLL') {
    throw new Error('Dice already rolled for this turn.');
  }
  if (!Number.isInteger(diceValue) || diceValue < 1 || diceValue > 6) {
    throw new Error('Dice roll must be an integer between 1 and 6.');
  }

  const nextConsecutive = diceValue === 6 ? state.consecutiveSixes + 1 : 0;

  // Rule 3: 3rd consecutive six cancels the roll and ends the turn
  if (nextConsecutive >= 3) {
    const nextIdx = (state.turnIndex + 1) % state.activeColors.length;
    const nextColor = state.activeColors[nextIdx];
    const msg = `${actingColor.toUpperCase()} rolled three consecutive 6s! Turn cancelled.`;
    return {
      ...state,
      diceValue,
      consecutiveSixes: 0,
      turnIndex: nextIdx,
      turnColor: nextColor,
      phase: 'WAITING_FOR_ROLL',
      lastAction: msg,
      moveHistory: [...state.moveHistory.slice(-19), msg],
    };
  }

  const legalMoves = getLegalTokenIndicesForClassic(state, actingColor, diceValue);
  if (legalMoves.length === 0) {
    const nextIdx = (state.turnIndex + 1) % state.activeColors.length;
    const nextColor = state.activeColors[nextIdx];
    const msg = `${actingColor.toUpperCase()} rolled ${diceValue} (no legal moves).`;
    return {
      ...state,
      diceValue,
      consecutiveSixes: 0,
      turnIndex: nextIdx,
      turnColor: nextColor,
      phase: 'WAITING_FOR_ROLL',
      lastAction: msg,
      moveHistory: [...state.moveHistory.slice(-19), msg],
    };
  }

  return {
    ...state,
    diceValue,
    consecutiveSixes: nextConsecutive,
    phase: 'WAITING_FOR_MOVE',
    lastAction: `${actingColor.toUpperCase()} rolled ${diceValue}. Select a token to move.`,
  };
}

export function applyClassicTokenMove(
  state: ClassicLudoState,
  tokenIndex: number,
  actingColor: LudoColor = state.turnColor
): { state: ClassicLudoState; captured: { color: LudoColor; tokenIndex: number }[]; extraTurn: boolean } {
  if (state.status === 'finished' || state.winnerColor) {
    throw new Error('Game has already ended.');
  }
  if (actingColor !== state.turnColor) {
    throw new Error('Not this player’s turn.');
  }
  if (state.phase !== 'WAITING_FOR_MOVE' || !state.diceValue) {
    throw new Error('Must roll the dice before moving a token.');
  }
  if (tokenIndex < 0 || tokenIndex > 3) {
    throw new Error('Invalid token index.');
  }

  const dice = state.diceValue;
  const currentTokens = {
    red: [...state.tokens.red] as [number, number, number, number],
    green: [...state.tokens.green] as [number, number, number, number],
    yellow: [...state.tokens.yellow] as [number, number, number, number],
    blue: [...state.tokens.blue] as [number, number, number, number],
  };

  const curStep = currentTokens[actingColor][tokenIndex];
  let newStep = curStep;

  if (curStep === -1) {
    if (dice !== 6) {
      throw new Error('Cannot release token from base without rolling a 6.');
    }
    newStep = 0; // Appears on starting square; does NOT move 6 extra spaces
  } else if (curStep >= 0 && curStep < 56) {
    if (curStep + dice > 56) {
      throw new Error('Exact dice roll required to enter final home.');
    }
    newStep = curStep + dice;
  } else {
    throw new Error('Token is already in home.');
  }

  currentTokens[actingColor][tokenIndex] = newStep;

  // Check captures on unsafe shared outer track squares (0..50)
  const captured: { color: LudoColor; tokenIndex: number }[] = [];
  if (newStep >= 0 && newStep <= 50) {
    const targetGlobal = getGlobalTrackIndex(actingColor, newStep)!;
    if (!isTrackSquareSafe(targetGlobal)) {
      for (const otherColor of state.activeColors) {
        if (otherColor === actingColor) continue;
        for (let i = 0; i < 4; i++) {
          const otherStep = currentTokens[otherColor][i];
          if (otherStep >= 0 && otherStep <= 50) {
            const otherGlobal = getGlobalTrackIndex(otherColor, otherStep)!;
            if (otherGlobal === targetGlobal) {
              currentTokens[otherColor][i] = -1;
              captured.push({ color: otherColor, tokenIndex: i });
            }
          }
        }
      }
    }
  }

  const allHome = currentTokens[actingColor].every((s) => s === 56);
  const finishOrder = [...state.finishOrder];
  let winnerColor = state.winnerColor;
  let nextStatus: 'playing' | 'finished' = 'playing';

  if (allHome) {
    if (!finishOrder.includes(actingColor)) {
      finishOrder.push(actingColor);
    }
    winnerColor = winnerColor || actingColor;
    nextStatus = 'finished';
  }

  // Rule 3: Extra roll for rolling 6 or capturing opponent token (entering home 56 does NOT grant extra roll)
  const extraTurn = nextStatus === 'playing' && (dice === 6 || captured.length > 0);
  const nextTurnIndex = extraTurn
    ? state.turnIndex
    : (state.turnIndex + 1) % state.activeColors.length;
  const nextTurnColor = state.activeColors[nextTurnIndex];

  const msg = allHome
    ? `🏆 ${actingColor.toUpperCase()} brought all 4 tokens home and won!`
    : `${actingColor.toUpperCase()} moved token #${tokenIndex + 1}${
        captured.length > 0 ? ` and captured ${captured.length} token(s)!` : '.'
      }`;

  return {
    state: {
      ...state,
      tokens: currentTokens,
      turnIndex: nextTurnIndex,
      turnColor: nextTurnColor,
      phase: 'WAITING_FOR_ROLL',
      diceValue: null,
      consecutiveSixes: extraTurn ? state.consecutiveSixes : 0,
      finishOrder,
      winnerColor,
      status: nextStatus,
      lastAction: msg,
      moveHistory: [...state.moveHistory.slice(-19), msg],
    },
    captured,
    extraTurn,
  };
}

/* ============================================================================
 * SNAKE LUDO (SNAKES & LADDERS) PURE RULES ENGINE
 * ============================================================================ */
export function createSnakeLudoState(
  maxPlayers: PlayerCount = 4,
  initialSquare = 1
): SnakeLudoState {
  const activeColors = getActiveColorsForPlayerCount(maxPlayers);
  return {
    mode: 'snake',
    maxPlayers,
    activeColors,
    turnIndex: 0,
    turnColor: activeColors[0],
    phase: 'WAITING_FOR_ROLL',
    diceValue: null,
    consecutiveSixes: 0,
    lastAction: 'Snake Ludo match ready to start.',
    moveHistory: [],
    finishOrder: [],
    winnerColor: null,
    positions: {
      red: initialSquare,
      green: initialSquare,
      yellow: initialSquare,
      blue: initialSquare,
    },
    status: 'playing',
  };
}

function getNextUnfinishedSnakeTurnIndex(
  activeColors: LudoColor[],
  finishOrder: LudoColor[],
  currentIndex: number
): number {
  let idx = currentIndex;
  for (let i = 0; i < activeColors.length; i++) {
    idx = (idx + 1) % activeColors.length;
    if (!finishOrder.includes(activeColors[idx])) {
      return idx;
    }
  }
  return currentIndex;
}

export function applySnakeRollAndMove(
  state: SnakeLudoState,
  diceValue: number,
  actingColor: LudoColor = state.turnColor,
  boardConfig: SnakeBoardConfig = SNAKE_BOARD_DEFAULT_CONFIG
): {
  state: SnakeLudoState;
  fromSquare: number;
  landedSquare: number;
  finalSquare: number;
  event: 'none' | 'ladder' | 'snake' | 'overshoot';
} {
  if (state.status === 'finished') {
    throw new Error('Snake Ludo match has already finished.');
  }
  if (actingColor !== state.turnColor) {
    throw new Error('Not this player’s turn.');
  }
  if (state.finishOrder.includes(actingColor)) {
    throw new Error('This player has already finished at square 100.');
  }
  if (!Number.isInteger(diceValue) || diceValue < 1 || diceValue > 6) {
    throw new Error('Dice value must be between 1 and 6.');
  }

  const fromSquare = state.positions[actingColor];
  let landedSquare = fromSquare;
  let finalSquare = fromSquare;
  let event: 'none' | 'ladder' | 'snake' | 'overshoot' = 'none';

  if (fromSquare + diceValue > 100) {
    event = 'overshoot';
  } else {
    landedSquare = fromSquare + diceValue;
    finalSquare = landedSquare;
    if (boardConfig.ladders[landedSquare] !== undefined) {
      finalSquare = boardConfig.ladders[landedSquare];
      event = 'ladder';
    } else if (boardConfig.snakes[landedSquare] !== undefined) {
      finalSquare = boardConfig.snakes[landedSquare];
      event = 'snake';
    }
  }

  const nextPositions = {
    ...state.positions,
    [actingColor]: finalSquare,
  };

  const nextFinishOrder = [...state.finishOrder];
  let winnerColor = state.winnerColor;
  let nextStatus: 'playing' | 'finished' = 'playing';

  if (finalSquare === 100) {
    if (!nextFinishOrder.includes(actingColor)) {
      nextFinishOrder.push(actingColor);
    }
    winnerColor = winnerColor || actingColor;

    if (
      state.activeColors.length === 2 ||
      nextFinishOrder.length >= state.activeColors.length - 1
    ) {
      for (const c of state.activeColors) {
        if (!nextFinishOrder.includes(c)) {
          nextFinishOrder.push(c);
        }
      }
      nextStatus = 'finished';
    }
  }

  const nextTurnIndex =
    nextStatus === 'playing'
      ? getNextUnfinishedSnakeTurnIndex(state.activeColors, nextFinishOrder, state.turnIndex)
      : state.turnIndex;
  const nextTurnColor = state.activeColors[nextTurnIndex];

  const msg =
    event === 'overshoot'
      ? `${actingColor.toUpperCase()} rolled ${diceValue} at ${fromSquare} (overshot 100).`
      : event === 'ladder'
      ? `${actingColor.toUpperCase()} rolled ${diceValue} → ${landedSquare} 🪜 climbed ladder to ${finalSquare}!`
      : event === 'snake'
      ? `${actingColor.toUpperCase()} rolled ${diceValue} → ${landedSquare} 🐍 slid down to ${finalSquare}!`
      : `${actingColor.toUpperCase()} rolled ${diceValue} → Square ${finalSquare}.`;

  return {
    state: {
      ...state,
      positions: nextPositions,
      turnIndex: nextTurnIndex,
      turnColor: nextTurnColor,
      phase: 'WAITING_FOR_ROLL',
      diceValue: null,
      finishOrder: nextFinishOrder,
      winnerColor,
      status: nextStatus,
      lastAction: msg,
      moveHistory: [...state.moveHistory.slice(-19), msg],
    },
    fromSquare,
    landedSquare,
    finalSquare,
    event,
  };
}
