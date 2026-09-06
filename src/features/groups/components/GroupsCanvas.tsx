"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Maximize2,
  Minimize2,
  PanelRightClose,
  PanelRightOpen,
} from "lucide-react";
import { Tooltip } from "@/components/ui/Tooltip";
import type { GroupNode, GroupEdge } from "../types";
import { useCanvasViewport } from "../hooks/useCanvasViewport";
import { GroupNodeComponent } from "./GroupNodeComponent";
import { GroupEdgeComponent } from "./GroupEdgeComponent";
import { CanvasControls } from "./CanvasControls";
import { MinimapRadar } from "./MinimapRadar";
import { GroupBreadcrumb } from "./GroupBreadcrumb";
import { GroupDetailsDrawer } from "./GroupDetailsDrawer";

export interface GroupsCanvasProps {
  initialNodes: GroupNode[];
  initialEdges: GroupEdge[];
}

export function GroupsCanvas({
  initialNodes,
  initialEdges,
}: GroupsCanvasProps) {
  const [nodes, setNodes] = useState<GroupNode[]>(initialNodes);
  const [edges, setEdges] = useState<GroupEdge[]>(initialEdges);
  const [selectedNodeId, setSelectedNodeId] = useState<string>(
    initialNodes[0]?.id || "node-root"
  );
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [containerDimensions, setContainerDimensions] = useState({
    width: 1000,
    height: 700,
  });

  const hasMountedRef = useRef(false);

  const {
    containerRef,
    worldRef,
    viewport,
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
  } = useCanvasViewport();

  const selectedNode = nodes.find((n) => n.id === selectedNodeId) || nodes[0];

  // Measure container dimensions
  useEffect(() => {
    if (!containerRef.current) return;
    const el = containerRef.current;
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setContainerDimensions({
          width: entry.contentRect.width,
          height: entry.contentRect.height,
        });
      }
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, [containerRef]);

  // Ensure nodes always use strict 56x56 circular dimensions
  useEffect(() => {
    setNodes(initialNodes.map((n) => ({ ...n, width: 56, height: 56 })));
  }, [initialNodes]);

  // Initial fit on mount (instant snap without initial animation)
  useEffect(() => {
    const timer = setTimeout(() => {
      fitToView(nodes, 80, isDrawerOpen);
      setTimeout(() => {
        hasMountedRef.current = true;
      }, 50);
    }, 60);
    return () => clearTimeout(timer);
  }, [nodes, fitToView, isDrawerOpen]);

  // Toggle fullscreen mode
  const toggleFullscreen = useCallback(() => {
    setIsFullscreen((prev) => !prev);
  }, []);

  // Handle node selection with smooth spring auto-centering
  const handleSelectNode = useCallback(
    (node: GroupNode) => {
      setSelectedNodeId(node.id);
      centerOnNode(node, isDrawerOpen);
    },
    [centerOnNode, isDrawerOpen]
  );

  // Compute ancestor node IDs for active branch highlighting
  const getAncestorIds = useCallback(
    (nodeId: string): Set<string> => {
      const ancestors = new Set<string>();
      let curr = nodes.find((n) => n.id === nodeId);
      while (curr && curr.parentId) {
        ancestors.add(curr.parentId);
        curr = nodes.find((n) => n.id === curr!.parentId);
      }
      return ancestors;
    },
    [nodes]
  );

  const activeAncestorIds = getAncestorIds(selectedNodeId);

  // Keyboard navigation between nodes and viewport auto-move
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      if (e.key === "f" || e.key === "F") {
        e.preventDefault();
        toggleFullscreen();
        return;
      }

      if (e.key === "i" || e.key === "I") {
        e.preventDefault();
        setIsDrawerOpen((prev) => {
          const next = !prev;
          if (selectedNode) centerOnNode(selectedNode, next);
          return next;
        });
        return;
      }

      if (e.key === "Escape" && isFullscreen) {
        e.preventDefault();
        setIsFullscreen(false);
        return;
      }

      if (!selectedNode) return;

      if (e.key === "ArrowDown") {
        e.preventDefault();
        if (selectedNode.childrenIds.length > 0) {
          const firstChild = nodes.find((n) => n.id === selectedNode.childrenIds[0]);
          if (firstChild) {
            handleSelectNode(firstChild);
          }
        }
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        if (selectedNode.parentId) {
          const parent = nodes.find((n) => n.id === selectedNode.parentId);
          if (parent) {
            handleSelectNode(parent);
          }
        }
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        if (selectedNode.parentId) {
          const parent = nodes.find((n) => n.id === selectedNode.parentId);
          if (parent) {
            const siblingIndex = parent.childrenIds.indexOf(selectedNode.id);
            if (siblingIndex < parent.childrenIds.length - 1) {
              const nextSibling = nodes.find(
                (n) => n.id === parent.childrenIds[siblingIndex + 1]
              );
              if (nextSibling) {
                handleSelectNode(nextSibling);
              }
            }
          }
        } else if (selectedNode.childrenIds.length > 1) {
          const secondChild = nodes.find((n) => n.id === selectedNode.childrenIds[1]);
          if (secondChild) {
            handleSelectNode(secondChild);
          }
        }
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        if (selectedNode.parentId) {
          const parent = nodes.find((n) => n.id === selectedNode.parentId);
          if (parent) {
            const siblingIndex = parent.childrenIds.indexOf(selectedNode.id);
            if (siblingIndex > 0) {
              const prevSibling = nodes.find(
                (n) => n.id === parent.childrenIds[siblingIndex - 1]
              );
              if (prevSibling) {
                handleSelectNode(prevSibling);
              }
            }
          }
        }
      } else if (e.key === " " || e.code === "Space") {
        e.preventDefault();
        centerOnNode(selectedNode, isDrawerOpen);
      } else if (e.key === "0") {
        e.preventDefault();
        fitToView(nodes, 80, isDrawerOpen);
      } else if (e.key === "+" || e.key === "=") {
        e.preventDefault();
        zoomIn();
      } else if (e.key === "-") {
        e.preventDefault();
        zoomOut();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    selectedNode,
    nodes,
    handleSelectNode,
    centerOnNode,
    fitToView,
    zoomIn,
    zoomOut,
    toggleFullscreen,
    isFullscreen,
    isDrawerOpen,
  ]);

  // Minimap click to pan smoothly to world point
  const handleMinimapNavigate = (worldX: number, worldY: number) => {
    navigateToWorldPoint(worldX, worldY, isDrawerOpen);
  };

  // Add mock subgroup
  const handleAddSubgroup = (parentId: string) => {
    const parent = nodes.find((n) => n.id === parentId);
    if (!parent) return;

    const newId = `node-sub-${Date.now()}`;
    const siblingCount = parent.childrenIds.length;
    const offsetSpacing = 240;
    const newX = parent.x + (siblingCount === 0 ? 0 : siblingCount * offsetSpacing);
    const newY = parent.y + 240;

    const newNode: GroupNode = {
      id: newId,
      title: `Subgroup ${siblingCount + 1}`,
      subtitle: `Derived from ${parent.title}`,
      description: `Custom candidate sub-segment with refined filter criteria.`,
      badge: "Custom Group",
      status: "active",
      parentId: parent.id,
      childrenIds: [],
      x: newX,
      y: newY,
      width: 56,
      height: 56,
      candidateCount: 0,
      criteriaDescription: `Subset of ${parent.title} screening rules.`,
      candidates: [],
    };

    const newEdge: GroupEdge = {
      id: `edge-${parent.id}-${newId}`,
      sourceId: parent.id,
      targetId: newId,
    };

    setNodes((prev) => [
      ...prev.map((n) =>
        n.id === parent.id
          ? { ...n, childrenIds: [...n.childrenIds, newId] }
          : n
      ),
      newNode,
    ]);

    setEdges((prev) => [...prev, newEdge]);
    handleSelectNode(newNode);
  };

  return (
    <div
      className={`overflow-hidden bg-neutral-100/50 dark:bg-black select-none ${
        isFullscreen
          ? "fixed inset-0 z-50 w-screen h-screen rounded-none border-0 shadow-none"
          : "relative w-full h-[calc(100vh-8rem)] min-h-[550px] rounded-2xl border border-neutral-300 dark:border-neutral-800 shadow-md"
      }`}
    >
      {/* Canvas Viewport Area (Fixed dimensions avoid parent layout reflows) */}
      <div
        ref={containerRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
        className={`relative w-full h-full overflow-hidden select-none ${
          isDragging ? "cursor-grabbing" : "cursor-grab"
        }`}
        style={{
          backgroundImage:
            "radial-gradient(circle at 1px 1px, rgba(140, 140, 140, 0.2) 1px, transparent 0)",
          backgroundSize: "28px 28px",
        }}
      >
        {/* World Transform Layer with GNOME Spring Simulation */}
        <motion.div
          ref={worldRef}
          initial={false}
          animate={{
            x: viewport.x,
            y: viewport.y,
            scale: viewport.scale,
          }}
          transition={
            !hasMountedRef.current || isDragging
              ? { duration: 0 }
              : {
                  type: "spring",
                  stiffness: 350,
                  damping: 30,
                  mass: 1,
                }
          }
          className="absolute origin-top-left will-change-transform"
          style={{
            originX: 0,
            originY: 0,
            width: 2400,
            height: 1600,
          }}
        >
          {/* SVG Edges Layer */}
          <svg
            className="absolute inset-0 pointer-events-none"
            width={2400}
            height={1600}
          >
            {edges.map((edge) => {
              const source = nodes.find((n) => n.id === edge.sourceId);
              const target = nodes.find((n) => n.id === edge.targetId);
              if (!source || !target) return null;

              const isEdgeInActivePath =
                (edge.targetId === selectedNodeId &&
                  activeAncestorIds.has(edge.sourceId)) ||
                (activeAncestorIds.has(edge.sourceId) &&
                  activeAncestorIds.has(edge.targetId));

              return (
                <GroupEdgeComponent
                  key={edge.id}
                  edge={edge}
                  source={source}
                  target={target}
                  isActiveBranch={isEdgeInActivePath}
                />
              );
            })}
          </svg>

          {/* HTML Nodes Layer */}
          {nodes.map((node) => (
            <GroupNodeComponent
              key={node.id}
              node={node}
              isSelected={node.id === selectedNodeId}
              isAncestor={activeAncestorIds.has(node.id)}
              onSelect={handleSelectNode}
            />
          ))}
        </motion.div>

        {/* Floating Top Breadcrumb Bar */}
        <div className="absolute top-4 left-4 z-20 pointer-events-auto">
          {selectedNode && (
            <GroupBreadcrumb
              selectedNode={selectedNode}
              allNodes={nodes}
              onSelectNode={handleSelectNode}
            />
          )}
        </div>

        {/* Floating Top-Right Viewport Controls (Fullscreen & Inspector Toggle) */}
        <div className="absolute top-4 right-4 z-20 pointer-events-auto flex items-center gap-2">
          {/* Toggle Inspector Drawer */}
          <Tooltip content={isDrawerOpen ? "Hide Details Panel (I)" : "Show Details Panel (I)"} side="bottom">
            <button
              type="button"
              onClick={() => {
                const next = !isDrawerOpen;
                setIsDrawerOpen(next);
                if (selectedNode) centerOnNode(selectedNode, next);
              }}
              className="h-8 px-2.5 rounded-xl border border-neutral-300 dark:border-neutral-800 bg-neutral-100/90 dark:bg-[#0c0c0c]/90 text-neutral-800 dark:text-neutral-200 hover:bg-neutral-200 dark:hover:bg-neutral-800 flex items-center gap-1.5 text-xs font-mono font-medium backdrop-blur-md shadow-sm transition-colors duration-150 cursor-pointer"
            >
              {isDrawerOpen ? (
                <>
                  <PanelRightClose className="h-3.5 w-3.5 text-neutral-900 dark:text-white shrink-0" />
                  <span className="hidden sm:inline">Hide Details</span>
                </>
              ) : (
                <>
                  <PanelRightOpen className="h-3.5 w-3.5 text-neutral-500 dark:text-neutral-400 shrink-0" />
                  <span className="hidden sm:inline">Show Details</span>
                </>
              )}
            </button>
          </Tooltip>

          {/* Fullscreen Mode Toggle */}
          <Tooltip content={isFullscreen ? "Exit Fullscreen (Esc or F)" : "Fullscreen Mode (F)"} side="bottom">
            <button
              type="button"
              onClick={toggleFullscreen}
              className={`h-8 px-2.5 rounded-xl border flex items-center gap-1.5 text-xs font-mono font-medium backdrop-blur-md shadow-sm transition-colors duration-150 cursor-pointer ${
                isFullscreen
                  ? "bg-neutral-950 text-white dark:bg-white dark:text-black border-neutral-950 dark:border-white shadow-md"
                  : "bg-neutral-100/90 dark:bg-[#0c0c0c]/90 text-neutral-800 dark:text-neutral-200 hover:bg-neutral-200 dark:hover:bg-neutral-800 border-neutral-300 dark:border-neutral-800"
              }`}
            >
              {isFullscreen ? (
                <>
                  <Minimize2 className="h-3.5 w-3.5 shrink-0" />
                  <span className="hidden sm:inline">Exit Fullscreen</span>
                </>
              ) : (
                <>
                  <Maximize2 className="h-3.5 w-3.5 shrink-0" />
                  <span className="hidden sm:inline">Fullscreen</span>
                </>
              )}
            </button>
          </Tooltip>
        </div>

        {/* Floating Bottom Canvas Controls & D-Pad */}
        <div className="absolute bottom-4 left-4 z-20 pointer-events-auto">
          <CanvasControls
            scale={viewport.scale}
            onZoomIn={zoomIn}
            onZoomOut={zoomOut}
            onFitToView={() => fitToView(nodes, 80, isDrawerOpen)}
            onCenterSelected={() => selectedNode && centerOnNode(selectedNode, isDrawerOpen)}
            onPan={panBy}
          />
        </div>

        {/* Floating Bottom-Right Minimap Radar */}
        <div className="absolute bottom-4 right-4 z-20 pointer-events-auto hidden md:block">
          <MinimapRadar
            nodes={nodes}
            edges={edges}
            viewport={viewport}
            selectedNodeId={selectedNodeId}
            containerDimensions={containerDimensions}
            onNavigateToWorldPoint={handleMinimapNavigate}
            isDragging={isDragging}
          />
        </div>

        {/* Right-edge Docked Handle to reveal Details Drawer when closed */}
        {!isDrawerOpen && selectedNode && (
          <button
            type="button"
            onClick={() => {
              setIsDrawerOpen(true);
              centerOnNode(selectedNode, true);
            }}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-20 flex items-center gap-2 rounded-l-xl bg-neutral-100/95 dark:bg-[#0c0c0c]/95 border-l-2 border-y border-l-neutral-900 dark:border-l-white border-neutral-300 dark:border-neutral-800 px-2.5 py-3 shadow-md hover:bg-neutral-200 dark:hover:bg-neutral-800 transition-colors duration-150 cursor-pointer group font-mono"
            title="Open Details (I)"
            aria-label="Open Details"
          >
            <PanelRightOpen className="h-4 w-4 text-neutral-900 dark:text-white shrink-0 group-hover:scale-110 transition-transform duration-150" />
            <div className="hidden sm:flex flex-col items-start text-left">
              <span className="text-[11px] font-bold text-neutral-900 dark:text-white">Details</span>
              <span className="text-[10px] text-neutral-500 dark:text-neutral-400">
                {selectedNode.candidateCount} Cand.
              </span>
            </div>
          </button>
        )}

        {/* Slide-out / Right-docked Details Drawer (Absolute positioning avoids reflow) */}
        <AnimatePresence>
          {isDrawerOpen && selectedNode && (
            <GroupDetailsDrawer
              key="group-details-drawer"
              node={selectedNode}
              allNodes={nodes}
              onClose={() => {
                setIsDrawerOpen(false);
                centerOnNode(selectedNode, false);
              }}
              onCenterNode={() => centerOnNode(selectedNode, isDrawerOpen)}
              onSelectNode={handleSelectNode}
              onAddSubgroup={handleAddSubgroup}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
