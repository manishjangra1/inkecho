'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { CANVAS_CONFIG, type CanvasTool } from '@/shared/config/canvas.config';
import type { Point, Stroke } from '../types/canvas.types';
import { renderLiveSegment, replayStrokes, renderStroke } from '../lib/stroke-renderer';
import { simplifyPoints } from '../lib/stroke-simplifier';
import { getNormalizedPointerPos } from '../lib/canvas-utils';
import { useCanvasUndoRedo } from './use-canvas-undo-redo';
import { useCanvasAutosave } from './use-canvas-autosave';
import { useCanvasExport } from './use-canvas-export';

export interface UseCanvasEngineOptions {
  readonly gameId?: string;
  readonly chainIndex?: number;
  readonly turnIndex?: number;
  readonly initialStrokes?: readonly Stroke[];
  readonly backgroundColor?: string;
  readonly onStrokeCompleted?: (stroke: Stroke) => void;
}

export function useCanvasEngine(options: UseCanvasEngineOptions = {}) {
  const {
    gameId = 'default_game',
    chainIndex = 0,
    turnIndex = 0,
    initialStrokes = [],
    backgroundColor = CANVAS_CONFIG.EXPORT.BACKGROUND_DARK,
    onStrokeCompleted,
  } = options;

  // Active Tool state
  const [tool, setTool] = useState<CanvasTool>(CANVAS_CONFIG.TOOLS.BRUSH);
  const [color, setColor] = useState<string>(CANVAS_CONFIG.BRUSH.DEFAULT_COLOR);
  const [brushSize, setBrushSize] = useState<number>(CANVAS_CONFIG.BRUSH.DEFAULT_SIZE);
  const [eraserSize, setEraserSize] = useState<number>(CANVAS_CONFIG.BRUSH.DEFAULT_ERASER_SIZE);
  const [isDrawing, setIsDrawing] = useState<boolean>(false);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const activeStrokePointsRef = useRef<Point[]>([]);
  const isPointerDownRef = useRef<boolean>(false);
  const primaryPointerIdRef = useRef<number | null>(null);

  // Undo / Redo Hook
  const { strokes, canUndo, canRedo, pushStroke, undo, redo, clearStrokes, setStrokes } =
    useCanvasUndoRedo({ initialStrokes });

  // Autosave Hook
  const { foundDraft, hasDraft, isSaved, clearDraft, dismissFoundDraft } = useCanvasAutosave({
    gameId,
    chainIndex,
    turnIndex,
    strokes,
  });

  // Export Hook
  const { exportDrawing, isExporting, exportError, clearExportError } = useCanvasExport();

  const currentSize = tool === CANVAS_CONFIG.TOOLS.ERASER ? eraserSize : brushSize;

  /**
   * Repaints all current strokes onto the canvas.
   */
  const redraw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const scale = canvas.width / CANVAS_CONFIG.DIMENSIONS.LOGICAL_WIDTH;

    replayStrokes(ctx, strokes, {
      width: canvas.width,
      height: canvas.height,
      backgroundColor,
      scale,
    });
  }, [strokes, backgroundColor]);

  // Handle high-DPI scaling and window resizing
  const updateCanvasDimensions = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !canvas.parentElement) return;

    const rect = canvas.parentElement.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;

    // Calculate aspect-ratio-bound logical dimensions with aspect-fit
    const maxWidth = rect.width;
    const maxHeight = rect.height;

    let displayWidth = maxWidth;
    let displayHeight = displayWidth / CANVAS_CONFIG.DIMENSIONS.ASPECT_RATIO;

    if (maxHeight > 0 && displayHeight > maxHeight) {
      displayHeight = maxHeight;
      displayWidth = displayHeight * CANVAS_CONFIG.DIMENSIONS.ASPECT_RATIO;
    }

    if (displayWidth <= 0 || displayHeight <= 0) return;

    canvas.width = Math.round(displayWidth * dpr);
    canvas.height = Math.round(displayHeight * dpr);

    canvas.style.width = `${Math.round(displayWidth)}px`;
    canvas.style.height = `${Math.round(displayHeight)}px`;

    redraw();
  }, [redraw]);

  useEffect(() => {
    updateCanvasDimensions();
    const resizeObserver = new ResizeObserver(() => {
      updateCanvasDimensions();
    });

    if (canvasRef.current?.parentElement) {
      resizeObserver.observe(canvasRef.current.parentElement);
    }

    return () => resizeObserver.disconnect();
  }, [updateCanvasDimensions]);

  // Redraw when strokes array or background changes
  useEffect(() => {
    redraw();
  }, [redraw]);

  /**
   * Pointer Down - Begins a new stroke.
   */
  const handlePointerDown = useCallback(
    (event: React.PointerEvent<HTMLCanvasElement>) => {
      // Primary pointer check to reject secondary palms/touches
      if (!event.isPrimary) return;

      const canvas = canvasRef.current;
      if (!canvas) return;

      canvas.setPointerCapture(event.pointerId);
      primaryPointerIdRef.current = event.pointerId;
      isPointerDownRef.current = true;
      setIsDrawing(true);

      const rect = canvas.getBoundingClientRect();
      const point = getNormalizedPointerPos(event.clientX, event.clientY, rect, event.pressure);

      activeStrokePointsRef.current = [point];

      // Draw initial tap point immediately
      const ctx = canvas.getContext('2d');
      if (ctx) {
        const scale = canvas.width / CANVAS_CONFIG.DIMENSIONS.LOGICAL_WIDTH;
        renderStroke(
          ctx,
          {
            id: 'live',
            tool,
            color,
            size: currentSize,
            points: [point],
            timestamp: Date.now(),
          },
          canvas.width,
          canvas.height,
          scale
        );
      }
    },
    [tool, color, currentSize]
  );

  /**
   * Pointer Move - Appends live point and renders incremental segment.
   */
  const handlePointerMove = useCallback(
    (event: React.PointerEvent<HTMLCanvasElement>) => {
      if (!isPointerDownRef.current) return;
      if (event.pointerId !== primaryPointerIdRef.current) return;

      const canvas = canvasRef.current;
      if (!canvas) return;

      const rect = canvas.getBoundingClientRect();
      const point = getNormalizedPointerPos(event.clientX, event.clientY, rect, event.pressure);

      const points = activeStrokePointsRef.current;
      const prevPoint = points[points.length - 1];

      if (prevPoint) {
        // Minimal distance threshold to prevent zero-length redundant points
        const distSq = Math.pow(point.x - prevPoint.x, 2) + Math.pow(point.y - prevPoint.y, 2);
        if (distSq > 0.000001) {
          points.push(point);

          const ctx = canvas.getContext('2d');
          if (ctx) {
            const scale = canvas.width / CANVAS_CONFIG.DIMENSIONS.LOGICAL_WIDTH;
            renderLiveSegment(
              ctx,
              prevPoint,
              point,
              { tool, color, size: currentSize },
              canvas.width,
              canvas.height,
              scale
            );
          }
        }
      }
    },
    [tool, color, currentSize]
  );

  /**
   * Pointer Up / End - Finalizes stroke and pushes to undo stack.
   */
  const handlePointerUp = useCallback(
    (event: React.PointerEvent<HTMLCanvasElement>) => {
      if (!isPointerDownRef.current) return;
      if (event.pointerId !== primaryPointerIdRef.current) return;

      const canvas = canvasRef.current;
      if (canvas && canvas.hasPointerCapture(event.pointerId)) {
        canvas.releasePointerCapture(event.pointerId);
      }

      isPointerDownRef.current = false;
      primaryPointerIdRef.current = null;
      setIsDrawing(false);

      const rawPoints = activeStrokePointsRef.current;
      if (rawPoints.length === 0) return;

      // Simplify points with Douglas-Peucker
      const simplified = simplifyPoints(rawPoints, 0.001);

      const newStroke: Stroke = {
        id: `stroke_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
        tool,
        color,
        size: currentSize,
        points: simplified,
        timestamp: Date.now(),
      };

      pushStroke(newStroke);
      if (onStrokeCompleted) {
        onStrokeCompleted(newStroke);
      }

      activeStrokePointsRef.current = [];
      redraw();
    },
    [tool, color, currentSize, pushStroke, onStrokeCompleted, redraw]
  );

  const handlePointerCancel = useCallback(
    (event: React.PointerEvent<HTMLCanvasElement>) => {
      handlePointerUp(event);
    },
    [handlePointerUp]
  );

  const restoreDraftStrokes = useCallback(() => {
    if (foundDraft) {
      setStrokes(foundDraft.strokes);
      dismissFoundDraft();
    }
  }, [foundDraft, setStrokes, dismissFoundDraft]);

  return {
    canvasRef,
    tool,
    setTool,
    color,
    setColor,
    brushSize,
    setBrushSize,
    eraserSize,
    setEraserSize,
    currentSize,
    strokes,
    isDrawing,
    canUndo,
    canRedo,
    undo,
    redo,
    clearStrokes,
    setStrokes,
    redraw,
    // Autosave
    hasDraft,
    foundDraft,
    isSaved,
    clearDraft,
    restoreDraftStrokes,
    dismissFoundDraft,
    // Export
    exportDrawing: (opts?: Parameters<typeof exportDrawing>[1]) =>
      exportDrawing(strokes, { backgroundColor, ...opts }),
    isExporting,
    exportError,
    clearExportError,
    // Event Handlers for <canvas>
    pointerHandlers: {
      onPointerDown: handlePointerDown,
      onPointerMove: handlePointerMove,
      onPointerUp: handlePointerUp,
      onPointerCancel: handlePointerCancel,
      onPointerLeave: handlePointerCancel,
    },
  };
}

export type CanvasEngine = ReturnType<typeof useCanvasEngine>;
