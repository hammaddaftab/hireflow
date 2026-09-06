"use client";

import { useState, useRef, useCallback } from "react";
import type { GroupNode, ViewportState } from "../types";

export interface UseCanvasViewportOptions {
  initialScale?: number;
  minScale?: number;
  maxScale?: number;
}

export function useCanvasViewport(options: UseCanvasViewportOptions = {}) {
  const { initialScale = 1, minScale = 0.4, maxScale = 2.2 } = options;

  const containerRef = useRef<HTMLDivElement>(null);
  const worldRef = useRef<HTMLDivElement>(null);

  const [viewport, setViewport] = useState<ViewportState>({
    x: 0,
    y: 0,
    scale: initialScale,
  });

  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  // Smoothly center on a specific node (offsets for inspector drawer if open)
  const centerOnNode = useCallback(
    (node: GroupNode, isDrawerOpen = false) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const drawerOffset = isDrawerOpen ? (rect.width > 640 ? 384 : 320) : 0;
      const availableWidth = Math.max(rect.width - drawerOffset, 200);

      const targetX = availableWidth / 2 - (node.x + node.width / 2) * viewport.scale;
      const targetY = rect.height / 2 - (node.y + node.height / 2) * viewport.scale;

      setViewport((prev) => ({
        ...prev,
        x: Math.round(targetX),
        y: Math.round(targetY),
      }));
    },
    [viewport.scale]
  );

  // Pan to world coordinate (used by minimap navigation)
  const navigateToWorldPoint = useCallback(
    (worldX: number, worldY: number, isDrawerOpen = false) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const drawerOffset = isDrawerOpen ? (rect.width > 640 ? 384 : 320) : 0;
      const availableWidth = Math.max(rect.width - drawerOffset, 200);

      const targetX = availableWidth / 2 - worldX * viewport.scale;
      const targetY = rect.height / 2 - worldY * viewport.scale;

      setViewport((prev) => ({
        ...prev,
        x: Math.round(targetX),
        y: Math.round(targetY),
      }));
    },
    [viewport.scale]
  );

  // Checks if node is too close to screen edges or hidden by drawer, and centers it
  const ensureNodeVisible = useCallback(
    (node: GroupNode, margin = 160, isDrawerOpen = false) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const drawerOffset = isDrawerOpen ? (rect.width > 640 ? 384 : 320) : 0;
      const availableWidth = Math.max(rect.width - drawerOffset, 200);

      const nodeLeft = node.x * viewport.scale + viewport.x;
      const nodeRight = (node.x + node.width) * viewport.scale + viewport.x;
      const nodeTop = node.y * viewport.scale + viewport.y;
      const nodeBottom = (node.y + node.height) * viewport.scale + viewport.y;

      const isOffLeft = nodeLeft < margin;
      const isOffRight = nodeRight > availableWidth - margin;
      const isOffTop = nodeTop < margin;
      const isOffBottom = nodeBottom > rect.height - margin;

      if (isOffLeft || isOffRight || isOffTop || isOffBottom) {
        centerOnNode(node, isDrawerOpen);
      }
    },
    [viewport, centerOnNode]
  );

  // Manual pan offset (used by D-pad or navigation buttons)
  const panBy = useCallback((dx: number, dy: number) => {
    setViewport((prev) => ({
      ...prev,
      x: prev.x + dx,
      y: prev.y + dy,
    }));
  }, []);

  const zoomIn = useCallback(() => {
    setViewport((prev) => {
      const nextScale = Math.min(prev.scale * 1.2, maxScale);
      if (!containerRef.current) return { ...prev, scale: nextScale };
      const rect = containerRef.current.getBoundingClientRect();
      const cx = rect.width / 2;
      const cy = rect.height / 2;
      const wx = (cx - prev.x) / prev.scale;
      const wy = (cy - prev.y) / prev.scale;
      return {
        x: Math.round(cx - wx * nextScale),
        y: Math.round(cy - wy * nextScale),
        scale: nextScale,
      };
    });
  }, [maxScale]);

  const zoomOut = useCallback(() => {
    setViewport((prev) => {
      const nextScale = Math.max(prev.scale / 1.2, minScale);
      if (!containerRef.current) return { ...prev, scale: nextScale };
      const rect = containerRef.current.getBoundingClientRect();
      const cx = rect.width / 2;
      const cy = rect.height / 2;
      const wx = (cx - prev.x) / prev.scale;
      const wy = (cy - prev.y) / prev.scale;
      return {
        x: Math.round(cx - wx * nextScale),
        y: Math.round(cy - wy * nextScale),
        scale: nextScale,
      };
    });
  }, [minScale]);

  // Fit all nodes into viewport
  const fitToView = useCallback(
    (nodes: GroupNode[], padding = 100, isDrawerOpen = false) => {
      if (!containerRef.current || nodes.length === 0) return;
      const rect = containerRef.current.getBoundingClientRect();
      const drawerOffset = isDrawerOpen ? (rect.width > 640 ? 384 : 320) : 0;
      const availableWidth = Math.max(rect.width - drawerOffset - padding * 2, 200);
      const availableHeight = Math.max(rect.height - padding * 2, 200);

      let minX = Infinity;
      let maxX = -Infinity;
      let minY = Infinity;
      let maxY = -Infinity;

      nodes.forEach((n) => {
        minX = Math.min(minX, n.x);
        maxX = Math.max(maxX, n.x + n.width);
        minY = Math.min(minY, n.y);
        maxY = Math.max(maxY, n.y + n.height);
      });

      const graphWidth = maxX - minX;
      const graphHeight = maxY - minY;

      const scaleX = availableWidth / graphWidth;
      const scaleY = availableHeight / graphHeight;
      const targetScale = Math.min(Math.max(Math.min(scaleX, scaleY), minScale), 1.2);

      const graphCenterX = minX + graphWidth / 2;
      const graphCenterY = minY + graphHeight / 2;

      const targetX = (rect.width - drawerOffset) / 2 - graphCenterX * targetScale;
      const targetY = rect.height / 2 - graphCenterY * targetScale;

      setViewport({
        x: Math.round(targetX),
        y: Math.round(targetY),
        scale: targetScale,
      });
    },
    [minScale]
  );

  // Mouse drag handlers (catches in-flight spring velocity seamlessly)
  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (e.button !== 0) return;

      // Sample live transform matrix if user interrupts an in-flight spring
      if (worldRef.current && typeof window !== "undefined") {
        const computed = window.getComputedStyle(worldRef.current).transform;
        if (computed && computed !== "none" && typeof DOMMatrixReadOnly !== "undefined") {
          try {
            const matrix = new DOMMatrixReadOnly(computed);
            const liveX = Math.round(matrix.m41);
            const liveY = Math.round(matrix.m42);
            setViewport((prev) => ({ ...prev, x: liveX, y: liveY }));
            dragStartRef.current = {
              x: e.clientX - liveX,
              y: e.clientY - liveY,
            };
            setIsDragging(true);
            return;
          } catch {
            // Fall through to default drag setup
          }
        }
      }

      setIsDragging(true);
      dragStartRef.current = {
        x: e.clientX - viewport.x,
        y: e.clientY - viewport.y,
      };
    },
    [viewport.x, viewport.y]
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!isDragging) return;
      setViewport((prev) => ({
        ...prev,
        x: e.clientX - dragStartRef.current.x,
        y: e.clientY - dragStartRef.current.y,
      }));
    },
    [isDragging]
  );

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Wheel zoom / pan handler
  const handleWheel = useCallback(
    (e: React.WheelEvent) => {
      e.preventDefault();

      if (e.ctrlKey || e.metaKey) {
        const zoomDelta = -e.deltaY * 0.002;
        setViewport((prev) => {
          const nextScale = Math.min(Math.max(prev.scale * (1 + zoomDelta), minScale), maxScale);
          if (!containerRef.current) return { ...prev, scale: nextScale };
          const rect = containerRef.current.getBoundingClientRect();
          const mouseX = e.clientX - rect.left;
          const mouseY = e.clientY - rect.top;
          const worldX = (mouseX - prev.x) / prev.scale;
          const worldY = (mouseY - prev.y) / prev.scale;
          return {
            x: Math.round(mouseX - worldX * nextScale),
            y: Math.round(mouseY - worldY * nextScale),
            scale: nextScale,
          };
        });
      } else {
        setViewport((prev) => ({
          ...prev,
          x: prev.x - e.deltaX,
          y: prev.y - e.deltaY,
        }));
      }
    },
    [minScale, maxScale]
  );

  return {
    containerRef,
    worldRef,
    viewport,
    setViewport,
    isDragging,
    centerOnNode,
    navigateToWorldPoint,
    ensureNodeVisible,
    panBy,
    zoomIn,
    zoomOut,
    fitToView,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    handleWheel,
  };
}
