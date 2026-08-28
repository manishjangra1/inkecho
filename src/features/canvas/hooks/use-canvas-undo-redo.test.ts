// @vitest-environment jsdom
import { describe, it, expect, beforeEach } from 'vitest';
import React, { act } from 'react';
import { createRoot } from 'react-dom/client';
import { useCanvasUndoRedo } from './use-canvas-undo-redo';
import type { Stroke } from '../types/canvas.types';

// Simple lightweight hook test harness
function renderHook<T>(hookFn: () => T) {
  const result = {} as { current: T };

  function TestComponent() {
    result.current = hookFn();
    return null;
  }

  const container = document.createElement('div');
  const root = createRoot(container);

  act(() => {
    root.render(React.createElement(TestComponent));
  });

  return { result };
}

describe('useCanvasUndoRedo', () => {
  beforeEach(() => {
    // Enable React act environment for jsdom testing
    (globalThis as unknown as { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
  });

  const dummyStroke: Stroke = {
    id: 's1',
    tool: 'brush',
    color: '#FFFFFF',
    size: 4,
    points: [{ x: 0.1, y: 0.1, pressure: 0.5 }],
    timestamp: 100,
  };

  const dummyStroke2: Stroke = {
    id: 's2',
    tool: 'brush',
    color: '#EF4444',
    size: 8,
    points: [{ x: 0.2, y: 0.2, pressure: 0.5 }],
    timestamp: 200,
  };

  it('initializes with empty strokes and disabled undo/redo', () => {
    const { result } = renderHook(() => useCanvasUndoRedo());
    expect(result.current.strokes).toEqual([]);
    expect(result.current.canUndo).toBe(false);
    expect(result.current.canRedo).toBe(false);
  });

  it('pushes strokes and enables undo', () => {
    const { result } = renderHook(() => useCanvasUndoRedo());

    act(() => {
      result.current.pushStroke(dummyStroke);
    });

    expect(result.current.strokes).toHaveLength(1);
    expect(result.current.canUndo).toBe(true);
    expect(result.current.canRedo).toBe(false);
  });

  it('performs undo and redo cycles', () => {
    const { result } = renderHook(() => useCanvasUndoRedo());

    act(() => {
      result.current.pushStroke(dummyStroke);
      result.current.pushStroke(dummyStroke2);
    });

    expect(result.current.strokes).toHaveLength(2);

    // Undo second stroke
    act(() => {
      result.current.undo();
    });

    expect(result.current.strokes).toHaveLength(1);
    expect(result.current.strokes[0]?.id).toBe('s1');
    expect(result.current.canRedo).toBe(true);

    // Redo
    act(() => {
      result.current.redo();
    });

    expect(result.current.strokes).toHaveLength(2);
    expect(result.current.strokes[1]?.id).toBe('s2');
    expect(result.current.canRedo).toBe(false);
  });

  it('clears redo stack when new stroke is drawn after undo', () => {
    const { result } = renderHook(() => useCanvasUndoRedo());

    act(() => {
      result.current.pushStroke(dummyStroke);
      result.current.pushStroke(dummyStroke2);
      result.current.undo();
    });

    expect(result.current.canRedo).toBe(true);

    const newStroke: Stroke = {
      id: 's3',
      tool: 'brush',
      color: '#22C55E',
      size: 4,
      points: [{ x: 0.3, y: 0.3, pressure: 0.5 }],
      timestamp: 300,
    };

    act(() => {
      result.current.pushStroke(newStroke);
    });

    expect(result.current.strokes).toHaveLength(2);
    expect(result.current.canRedo).toBe(false);
  });
});
