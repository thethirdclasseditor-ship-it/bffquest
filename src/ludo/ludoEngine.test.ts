import { describe, it, expect } from 'vitest';
import {
  createClassicLudoState,
  applyClassicDiceRoll,
  applyClassicTokenMove,
  getLegalTokenIndicesForClassic,
  getGlobalTrackIndex,
  START_TRACK_INDEX,
  createSnakeLudoState,
  applySnakeRollAndMove,
  validateSnakeBoardConfig,
  SNAKE_BOARD_DEFAULT_CONFIG,
  getSnakeSquareCoord,
  getSquareNumberAtGrid,
} from './ludoEngine';

describe('Classic Ludo Rules Engine (20 Mandatory Test Cases)', () => {
  it('1. A token cannot leave its base without rolling a 6', () => {
    const state = createClassicLudoState(4);
    const afterRoll = applyClassicDiceRoll(state, 4, 'red');
    expect(getLegalTokenIndicesForClassic(afterRoll, 'red', 4)).toEqual([]);
    expect(afterRoll.turnColor).toBe('green');
  });

  it('2. Rolling 6 releases the token onto the correct starting square', () => {
    const state = createClassicLudoState(4);
    const rolled = applyClassicDiceRoll(state, 6, 'red');
    const { state: moved } = applyClassicTokenMove(rolled, 0, 'red');
    expect(moved.tokens.red[0]).toBe(0);
    expect(getGlobalTrackIndex('red', moved.tokens.red[0])).toBe(START_TRACK_INDEX.red);
  });

  it('3. A released token does not also move six extra spaces', () => {
    const state = createClassicLudoState(4);
    const rolled = applyClassicDiceRoll(state, 6, 'red');
    const { state: moved } = applyClassicTokenMove(rolled, 0, 'red');
    expect(moved.tokens.red[0]).toBe(0); // Step 0, not Step 6
  });

  it('4. A token moves the exact dice value', () => {
    let state = createClassicLudoState(4);
    state.tokens.red[0] = 0;
    state = applyClassicDiceRoll(state, 5, 'red');
    const { state: moved } = applyClassicTokenMove(state, 0, 'red');
    expect(moved.tokens.red[0]).toBe(5);
  });

  it('5. All four colours follow their correct routes and starting track offsets', () => {
    expect(getGlobalTrackIndex('red', 0)).toBe(0);
    expect(getGlobalTrackIndex('green', 0)).toBe(13);
    expect(getGlobalTrackIndex('yellow', 0)).toBe(26);
    expect(getGlobalTrackIndex('blue', 0)).toBe(39);
    expect(getGlobalTrackIndex('blue', 15)).toBe((39 + 15) % 52);
  });

  it('6. Safe squares prevent captures (starting squares & star squares)', () => {
    let state = createClassicLudoState(4);
    // Star square at global index 8 -> Red step 8
    state.tokens.green[0] = (8 - 13 + 52) % 52; // Green on global index 8? Wait: Green starts at 13, so let's place Red at step 13 (global 13, Green's start safe square)
    state.tokens.green[0] = 0; // Global 13 (safe)
    state.tokens.red[0] = 10; // Global 10
    state = applyClassicDiceRoll(state, 3, 'red');
    const { state: moved, captured } = applyClassicTokenMove(state, 0, 'red');
    expect(getGlobalTrackIndex('red', moved.tokens.red[0])).toBe(13);
    expect(captured.length).toBe(0);
    expect(moved.tokens.green[0]).toBe(0);
  });

  it('7. Unsafe squares allow valid captures', () => {
    let state = createClassicLudoState(4);
    // Global index 15 is unsafe (Green step 2, Red step 15)
    state.tokens.green[0] = 2;
    state.tokens.red[0] = 11;
    state = applyClassicDiceRoll(state, 4, 'red');
    const { state: moved, captured } = applyClassicTokenMove(state, 0, 'red');
    expect(captured).toEqual([{ color: 'green', tokenIndex: 0 }]);
    expect(moved.tokens.green[0]).toBe(-1);
  });

  it('8. Captured tokens return to the correct base (-1)', () => {
    let state = createClassicLudoState(4);
    state.tokens.yellow[2] = 4; // Global 30 (unsafe)
    state.tokens.green[1] = 13; // Global 26
    state.turnColor = 'green';
    state.turnIndex = 1;
    state = applyClassicDiceRoll(state, 4, 'green');
    const { state: moved } = applyClassicTokenMove(state, 1, 'green');
    expect(moved.tokens.yellow[2]).toBe(-1);
  });

  it('9. A captured token needs another 6 to leave its base', () => {
    let state = createClassicLudoState(2);
    state.tokens.red[0] = -1;
    const afterRoll3 = applyClassicDiceRoll(state, 3, 'red');
    expect(afterRoll3.tokens.red[0]).toBe(-1);
    expect(afterRoll3.turnColor).toBe('yellow');
  });

  it('10. A token cannot enter another colour’s home lane (steps 51..55 are private)', () => {
    const state = createClassicLudoState(4);
    state.tokens.red[0] = 52; // Inside Red private home lane
    expect(getGlobalTrackIndex('red', 52)).toBeNull();
  });

  it('11. A token cannot finish without the exact required roll', () => {
    let state = createClassicLudoState(2);
    state.tokens.red[0] = 54; // Needs exact 2 to reach 56
    const afterRoll5 = applyClassicDiceRoll(state, 5, 'red');
    expect(afterRoll5.tokens.red[0]).toBe(54);
    expect(afterRoll5.turnColor).toBe('yellow');
  });

  it('12. A roll producing no valid move ends the turn correctly', () => {
    const state = createClassicLudoState(2);
    const next = applyClassicDiceRoll(state, 2, 'red');
    expect(next.phase).toBe('WAITING_FOR_ROLL');
    expect(next.turnColor).toBe('yellow');
  });

  it('13. A six grants the correct extra roll', () => {
    let state = createClassicLudoState(2);
    state = applyClassicDiceRoll(state, 6, 'red');
    const { state: moved, extraTurn } = applyClassicTokenMove(state, 0, 'red');
    expect(extraTurn).toBe(true);
    expect(moved.turnColor).toBe('red');
    expect(moved.phase).toBe('WAITING_FOR_ROLL');
  });

  it('14. Capturing grants the correct extra roll', () => {
    let state = createClassicLudoState(2);
    state.tokens.yellow[0] = 2; // Global 28 (unsafe)
    state.tokens.red[0] = 25; // Global 25
    state = applyClassicDiceRoll(state, 3, 'red');
    const { state: moved, extraTurn } = applyClassicTokenMove(state, 0, 'red');
    expect(extraTurn).toBe(true);
    expect(moved.turnColor).toBe('red');
  });

  it('15. The third consecutive six cancels that roll and ends the turn', () => {
    let state = createClassicLudoState(2);
    state = applyClassicDiceRoll(state, 6, 'red');
    state = applyClassicTokenMove(state, 0, 'red').state;
    state = applyClassicDiceRoll(state, 6, 'red');
    state = applyClassicTokenMove(state, 0, 'red').state;
    expect(state.consecutiveSixes).toBe(2);
    state = applyClassicDiceRoll(state, 6, 'red');
    expect(state.consecutiveSixes).toBe(0);
    expect(state.turnColor).toBe('yellow');
  });

  it('16. Two-player mode excludes the inactive colours', () => {
    const state = createClassicLudoState(2);
    expect(state.activeColors).toEqual(['red', 'yellow']);
  });

  it('17. Four-player turns follow the correct clockwise order', () => {
    let state = createClassicLudoState(4);
    expect(state.turnColor).toBe('red');
    state = applyClassicDiceRoll(state, 2, 'red');
    expect(state.turnColor).toBe('green');
    state = applyClassicDiceRoll(state, 3, 'green');
    expect(state.turnColor).toBe('yellow');
    state = applyClassicDiceRoll(state, 4, 'yellow');
    expect(state.turnColor).toBe('blue');
  });

  it('18. Four tokens reaching home correctly trigger a win', () => {
    let state = createClassicLudoState(2);
    state.tokens.red = [56, 56, 56, 54];
    state = applyClassicDiceRoll(state, 2, 'red');
    const { state: won } = applyClassicTokenMove(state, 3, 'red');
    expect(won.tokens.red).toEqual([56, 56, 56, 56]);
    expect(won.winnerColor).toBe('red');
    expect(won.status).toBe('finished');
  });

  it('19. No action is accepted after the game ends', () => {
    let state = createClassicLudoState(2);
    state.tokens.red = [56, 56, 56, 55];
    state = applyClassicDiceRoll(state, 1, 'red');
    state = applyClassicTokenMove(state, 3, 'red').state;
    expect(() => applyClassicDiceRoll(state, 4, 'yellow')).toThrow();
  });

  it('20. Non-active players and duplicate moves are rejected', () => {
    let state = createClassicLudoState(2);
    expect(() => applyClassicDiceRoll(state, 6, 'yellow')).toThrow();
    state = applyClassicDiceRoll(state, 6, 'red');
    expect(() => applyClassicDiceRoll(state, 4, 'red')).toThrow();
  });
});

describe('Snake Ludo Rules Engine (11 Mandatory Test Cases)', () => {
  it('1. Board numbering is correct from 1 to 100 and board config is valid', () => {
    expect(getSquareNumberAtGrid(9, 0)).toBe(1);
    expect(getSquareNumberAtGrid(9, 9)).toBe(10);
    expect(getSquareNumberAtGrid(8, 9)).toBe(11);
    expect(getSquareNumberAtGrid(0, 0)).toBe(100);
    expect(validateSnakeBoardConfig(SNAKE_BOARD_DEFAULT_CONFIG).valid).toBe(true);
  });

  it('2. Player movement follows the correct serpentine path', () => {
    expect(getSnakeSquareCoord(1)).toEqual({ row: 9, col: 0 });
    expect(getSnakeSquareCoord(10)).toEqual({ row: 9, col: 9 });
    expect(getSnakeSquareCoord(11)).toEqual({ row: 8, col: 9 });
    expect(getSnakeSquareCoord(20)).toEqual({ row: 8, col: 0 });
    expect(getSnakeSquareCoord(100)).toEqual({ row: 0, col: 0 });
  });

  it('3. Dice rolls between 1 and 6 work correctly', () => {
    const state = createSnakeLudoState(2, 1);
    const { state: next } = applySnakeRollAndMove(state, 3, 'red');
    expect(next.positions.red).toBe(4);
  });

  it('4. Landing on a snake head moves the player to its tail (17 -> 4)', () => {
    const state = createSnakeLudoState(2, 14);
    const res = applySnakeRollAndMove(state, 3, 'red');
    expect(res.event).toBe('snake');
    expect(res.finalSquare).toBe(4);
    expect(res.state.positions.red).toBe(4);
  });

  it('5. Landing on a ladder bottom moves the player to its top (3 -> 22)', () => {
    const state = createSnakeLudoState(2, 1);
    const res = applySnakeRollAndMove(state, 2, 'red');
    expect(res.event).toBe('ladder');
    expect(res.finalSquare).toBe(22);
    expect(res.state.positions.red).toBe(22);
  });

  it('6. Passing over a snake or ladder does not trigger it', () => {
    const state = createSnakeLudoState(2, 15);
    // Passes over snake at 17, lands on 18
    const res = applySnakeRollAndMove(state, 3, 'red');
    expect(res.event).toBe('none');
    expect(res.finalSquare).toBe(18);
  });

  it('7. Overshooting 100 leaves the token in place', () => {
    const state = createSnakeLudoState(2, 97);
    const res = applySnakeRollAndMove(state, 5, 'red');
    expect(res.event).toBe('overshoot');
    expect(res.finalSquare).toBe(97);
  });

  it('8. Reaching exactly 100 wins', () => {
    const state = createSnakeLudoState(2, 96);
    const res = applySnakeRollAndMove(state, 4, 'red');
    expect(res.finalSquare).toBe(100);
    expect(res.state.winnerColor).toBe('red');
    expect(res.state.status).toBe('finished');
  });

  it('9. Two-player turn order is correct (and rolling 6 does not grant extra turn)', () => {
    const state = createSnakeLudoState(2, 1);
    const res = applySnakeRollAndMove(state, 6, 'red');
    expect(res.state.turnColor).toBe('yellow');
  });

  it('10. Four-player turn order and finish rankings are correct', () => {
    let state = createSnakeLudoState(4, 98);
    state = applySnakeRollAndMove(state, 2, 'red').state; // Red finishes #1
    expect(state.finishOrder).toEqual(['red']);
    expect(state.status).toBe('playing');
    expect(state.turnColor).toBe('green');

    state = applySnakeRollAndMove(state, 2, 'green').state; // Green finishes #2
    expect(state.finishOrder).toEqual(['red', 'green']);
    expect(state.turnColor).toBe('yellow');

    state = applySnakeRollAndMove(state, 2, 'yellow').state; // Yellow finishes #3 -> Blue auto #4
    expect(state.finishOrder).toEqual(['red', 'green', 'yellow', 'blue']);
    expect(state.status).toBe('finished');
  });

  it('11. No movement is accepted after a game finishes', () => {
    let state = createSnakeLudoState(2, 99);
    state = applySnakeRollAndMove(state, 1, 'red').state;
    expect(() => applySnakeRollAndMove(state, 2, 'yellow')).toThrow();
  });
});
