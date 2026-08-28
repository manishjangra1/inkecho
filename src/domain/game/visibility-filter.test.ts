import { describe, it, expect } from 'vitest';
import {
  filterChainsForViewer,
  getActivePlayerPromptContext,
} from './visibility-filter';
import type { GameChainEntity } from './chain-builder';

describe('Visibility Filter', () => {
  const mockChains: GameChainEntity[] = [
    {
      chainIndex: 0,
      starterPrompt: 'A secret robot',
      turns: [
        {
          id: '0_0',
          turnIndex: 0,
          playerId: 'p1',
          phase: 'DESCRIBE',
          textContent: 'A funny robot making coffee',
          drawingUrl: null,
          drawingPublicId: null,
          submittedAt: new Date(),
          skipped: false,
          autoSubmitted: false,
        },
        {
          id: '0_1',
          turnIndex: 1,
          playerId: 'p2',
          phase: 'DRAW',
          textContent: null,
          drawingUrl: 'https://cloudinary.com/draw1.webp',
          drawingPublicId: 'draw1',
          submittedAt: new Date(),
          skipped: false,
          autoSubmitted: false,
        },
      ],
    },
  ];

  it('hides starter prompts and others submissions during IN_PROGRESS', () => {
    const filtered = filterChainsForViewer(mockChains, 'p3', 'IN_PROGRESS', 0, 1);
    expect(filtered[0]!.starterPrompt).toBeNull();
    // p3 should not see p1's text or p2's drawing
    expect(filtered[0]!.turns[0]!.textContent).toBeNull();
    expect(filtered[0]!.turns[1]!.drawingUrl).toBeNull();
  });

  it('reveals everything during REVEAL status', () => {
    const filtered = filterChainsForViewer(mockChains, 'p3', 'REVEAL', 0, 1);
    expect(filtered[0]!.starterPrompt).toBe('A secret robot');
    expect(filtered[0]!.turns[0]!.textContent).toBe('A funny robot making coffee');
    expect(filtered[0]!.turns[1]!.drawingUrl).toBe('https://cloudinary.com/draw1.webp');
  });

  it('provides prompt context for active player', () => {
    // Turn 0: returns starter prompt
    const turn0Ctx = getActivePlayerPromptContext(mockChains, 0, 0, 'p1', 'p1');
    expect(turn0Ctx?.type).toBe('STARTER_PROMPT');
    expect(turn0Ctx?.text).toBe('A secret robot');

    // Turn 1 (Draw): returns prior description
    const turn1Ctx = getActivePlayerPromptContext(mockChains, 0, 1, 'p2', 'p2');
    expect(turn1Ctx?.type).toBe('DESCRIPTION');
    expect(turn1Ctx?.text).toBe('A funny robot making coffee');

    // Non-active player gets null context
    const spectatorCtx = getActivePlayerPromptContext(mockChains, 0, 1, 'p2', 'p3');
    expect(spectatorCtx).toBeNull();
  });
});
