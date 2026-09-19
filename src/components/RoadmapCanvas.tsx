"use client";

import { useMemo, useState, useEffect, useCallback } from "react";
import {
  ReactFlow,
  Controls,
  Background,
  MiniMap,
  useNodesState,
  useEdgesState,
  useReactFlow,
  ReactFlowProvider,
  Node,
  Edge,
  MarkerType,
  BackgroundVariant,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import dagre from "dagre";
import MilestoneNode from "./MilestoneNode";
import TopicDrawer, { SelectedTopic } from "./TopicDrawer";
import { ZoomIn, ZoomOut, Maximize2, ChevronLeft, ChevronRight, Compass } from "lucide-react";
import { useTheme } from "@/context/ThemeContext";

interface MilestoneData {
  id: string;
  order: number;
  title: string;
  description: string | null;
  level: "Beginner" | "Intermediate" | "Advanced";
  topics: Array<{
    id: string;
    title: string;
    description: string | null;
    resources: any[];
    isCompleted: boolean;
  }>;
  isCompleted: boolean;
}

interface RoadmapCanvasProps {
  milestones: MilestoneData[];
  onToggleComplete: (topicId: string, newState: boolean) => Promise<void>;
  isLoggedIn: boolean;
}

const nodeTypes: any = {
  milestoneNode: MilestoneNode,
};

const NODE_WIDTH = 390;
const NODE_HEIGHT = 300;

function getLayoutedElements(nodes: Node[], edges: Edge[]) {
  const dagreGraph = new dagre.graphlib.Graph();
  dagreGraph.setDefaultEdgeLabel(() => ({}));
  dagreGraph.setGraph({ rankdir: "TB", nodesep: 60, ranksep: 100 });

  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, { width: NODE_WIDTH, height: NODE_HEIGHT });
  });

  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  dagre.layout(dagreGraph);

  const layoutedNodes = nodes.map((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);
    return {
      ...node,
      position: {
        x: nodeWithPosition.x - NODE_WIDTH / 2,
        y: nodeWithPosition.y - NODE_HEIGHT / 2,
      },
    };
  });

  return { nodes: layoutedNodes, edges };
}

function CanvasInner({
  milestones,
  onToggleComplete,
  isLoggedIn,
}: RoadmapCanvasProps) {
  const [selectedTopic, setSelectedTopic] = useState<SelectedTopic | null>(null);
  const [activeStepIndex, setActiveStepIndex] = useState<number>(0);
  const reactFlowInstance = useReactFlow();
  const { theme } = useTheme();

  const handleTopicDrawerComplete = async (topicId: string, newState: boolean) => {
    await onToggleComplete(topicId, newState);
    if (selectedTopic && selectedTopic.id === topicId) {
      setSelectedTopic({ ...selectedTopic, isCompleted: newState });
    }
  };

  const { nodes: initialNodes, edges: initialEdges } = useMemo(() => {
    const rawNodes: Node[] = milestones.map((m) => ({
      id: m.id,
      type: "milestoneNode",
      position: { x: 0, y: 0 },
      data: {
        milestoneId: m.id,
        order: m.order,
        title: m.title,
        description: m.description,
        level: m.level,
        topics: m.topics,
        isCompleted: m.isCompleted,
        onSelectTopic: (topic: SelectedTopic) => setSelectedTopic(topic),
      },
    }));

    const rawEdges: Edge[] = [];
    for (let i = 0; i < milestones.length - 1; i++) {
      const source = milestones[i].id;
      const target = milestones[i + 1].id;
      const isSourceCompleted = milestones[i].isCompleted;

      rawEdges.push({
        id: `e-${source}-${target}`,
        source,
        target,
        type: "smoothstep",
        animated: true,
        style: {
          stroke: isSourceCompleted ? "#10b981" : "#818cf8",
          strokeWidth: 3,
        },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: isSourceCompleted ? "#10b981" : "#818cf8",
          width: 18,
          height: 18,
        },
      });
    }

    return getLayoutedElements(rawNodes, rawEdges);
  }, [milestones]);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  useEffect(() => {
    const { nodes: updatedNodes, edges: updatedEdges } = getLayoutedElements(
      initialNodes,
      initialEdges
    );
    setNodes(updatedNodes);
    setEdges(updatedEdges);
  }, [initialNodes, initialEdges, setNodes, setEdges]);

  // Focus directly on a step at crisp 1.0 zoom (eliminates needing to zoom manually)
  const focusOnStep = useCallback(
    (index: number) => {
      if (index >= 0 && index < nodes.length) {
        setActiveStepIndex(index);
        const targetNode = nodes[index];
        reactFlowInstance.setCenter(
          targetNode.position.x + NODE_WIDTH / 2,
          targetNode.position.y + 150,
          { zoom: 1.0, duration: 600 }
        );
      }
    },
    [nodes, reactFlowInstance]
  );

  // Focus Step 1 on initial load
  useEffect(() => {
    if (nodes.length > 0) {
      focusOnStep(0);
    }
  }, [nodes.length, focusOnStep]);

  const handleNextStep = () => {
    if (activeStepIndex < milestones.length - 1) {
      focusOnStep(activeStepIndex + 1);
    }
  };

  const handlePrevStep = () => {
    if (activeStepIndex > 0) {
      focusOnStep(activeStepIndex - 1);
    }
  };

  return (
    <div className="relative w-full h-[calc(100vh-8.5rem)] bg-[var(--bg-primary)]">
      {/* 🧭 STEP-BY-STEP FOCUS NAVIGATOR (The Zoom Alternative!) */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 max-w-3xl w-[92%] sm:w-auto flex items-center justify-between gap-2 p-1.5 rounded-2xl bg-[var(--bg-surface)]/95 backdrop-blur-xl border border-[var(--border-color)] shadow-lg">
        <button
          onClick={handlePrevStep}
          disabled={activeStepIndex === 0}
          className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold text-[var(--text-primary)] hover:bg-[var(--bg-subtle)] disabled:opacity-30 disabled:cursor-not-allowed transition shrink-0"
        >
          <ChevronLeft className="h-4 w-4" />
          <span className="hidden sm:inline">Prev</span>
        </button>

        {/* Milestone Steps Scroller */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5 px-1 max-w-[450px]">
          {milestones.map((m, idx) => (
            <button
              key={m.id}
              onClick={() => focusOnStep(idx)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                activeStepIndex === idx
                  ? "bg-indigo-600 text-white shadow-sm shadow-indigo-600/30 scale-105"
                  : "bg-[var(--bg-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
              }`}
            >
              #{m.order} {m.title.split(" ")[0]}
            </button>
          ))}
        </div>

        <button
          onClick={handleNextStep}
          disabled={activeStepIndex === milestones.length - 1}
          className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold text-[var(--text-primary)] hover:bg-[var(--bg-subtle)] disabled:opacity-30 disabled:cursor-not-allowed transition shrink-0"
        >
          <span className="hidden sm:inline">Next</span>
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      {/* Floating Canvas Camera Actions */}
      <div className="absolute bottom-6 left-6 z-10 flex items-center gap-1.5 bg-[var(--bg-surface)]/90 backdrop-blur-md border border-[var(--border-color)] rounded-2xl p-1.5 shadow-md">
        <button
          onClick={() => focusOnStep(0)}
          className="px-3 py-1.5 rounded-xl text-xs font-bold text-[var(--text-primary)] hover:bg-[var(--bg-subtle)] transition"
          title="Return to Step 1"
        >
          Step 1
        </button>
        <button
          onClick={() => reactFlowInstance.fitView({ padding: 0.2, duration: 400 })}
          className="p-2 rounded-xl text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-subtle)] transition"
          title="Fit All Milestones"
        >
          <Maximize2 className="h-4 w-4" />
        </button>
        <div className="h-4 w-px bg-[var(--border-color)] mx-0.5" />
        <button
          onClick={() => reactFlowInstance.zoomIn()}
          className="p-2 rounded-xl text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-subtle)] transition"
          title="Zoom In"
        >
          <ZoomIn className="h-4 w-4" />
        </button>
        <button
          onClick={() => reactFlowInstance.zoomOut()}
          className="p-2 rounded-xl text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-subtle)] transition"
          title="Zoom Out"
        >
          <ZoomOut className="h-4 w-4" />
        </button>
      </div>

      <div className="w-full h-full min-h-[620px] relative">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          nodeTypes={nodeTypes}
          minZoom={0.3}
          maxZoom={1.5}
          proOptions={{ hideAttribution: true }}
          style={{ width: "100%", height: "100%" }}
          className="w-full h-full"
        >
        <Background
          variant={BackgroundVariant.Dots}
          gap={28}
          size={1.5}
          color={theme === "dark" ? "#2a3048" : "#cfc9e2"}
          className="opacity-70"
        />
        <MiniMap
          nodeStrokeColor="#6366f1"
          nodeColor={theme === "dark" ? "#191c2c" : "#ffffff"}
          maskColor={theme === "dark" ? "rgba(9, 10, 16, 0.85)" : "rgba(248, 247, 252, 0.85)"}
          className="!bg-[var(--bg-surface)] !border-2 !border-[var(--border-color)] !rounded-2xl overflow-hidden shadow-md !bottom-6 !right-6"
        />
      </ReactFlow>
    </div>

      {/* Topic Detail Drawer */}
      <TopicDrawer
        topic={selectedTopic}
        onClose={() => setSelectedTopic(null)}
        onToggleComplete={handleTopicDrawerComplete}
        isLoggedIn={isLoggedIn}
      />
    </div>
  );
}

export default function RoadmapCanvas(props: RoadmapCanvasProps) {
  return (
    <ReactFlowProvider>
      <CanvasInner {...props} />
    </ReactFlowProvider>
  );
}
