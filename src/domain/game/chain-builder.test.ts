import { describe, it, expect } from 'vitest';
import { buildInitialChains, createTurnEntity } from './chain-builder';

describe('Chain Builder', () => {
  it('creates turn entity with defaults', () => {
    const turn = createTurnEntity('c0_t0', 0, 'p1');
    expect(turn.id).toBe('c0_t0');
    expect(turn.turnIndex).toBe(0);
    expect(turn.playerId).toBe('p1');
    expect(turn.phase).toBe('DESCRIBE');
    expect(turn.textContent).toBeNull();
    expect(turn.skipped).toBe(false);
  });

  it('builds initial chains for a game with starter prompts', () => {
    const playerOrder = ['p1', 'p2', 'p3'];
    const starterPrompts = ['Prompt 1', 'Prompt 2'];
    const chains = buildInitialChains({
      playerOrder,
      roundCount: 2,
      starterPrompts,
    });

    expect(chains).toHaveLength(2);
    expect(chains[0]!.starterPrompt).toBe('Prompt 1');
    expect(chains[1]!.starterPrompt).toBe('Prompt 2');
    expect(chains[0]!.turns).toHaveLength(1);
    expect(chains[0]!.turns[0]!.playerId).toBe('p1');
  });
});
