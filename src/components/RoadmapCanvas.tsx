"use client";

import { useMemo, useState, useEffect, useRef } from "react";
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
import { ZoomIn, ZoomOut, Maximize2, RotateCcw } from "lucide-react";

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

const NODE_WIDTH = 400;
const NODE_HEIGHT = 320;

function getLayoutedElements(nodes: Node[], edges: Edge[]) {
  const dagreGraph = new dagre.graphlib.Graph();
  dagreGraph.setDefaultEdgeLabel(() => ({}));
  dagreGraph.setGraph({ rankdir: "TB", nodesep: 70, ranksep: 100 });

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
  const reactFlowInstance = useReactFlow();

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
          stroke: isSourceCompleted ? "#10b981" : "#6366f1",
          strokeWidth: 3,
        },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: isSourceCompleted ? "#10b981" : "#6366f1",
          width: 20,
          height: 20,
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

  // Center on Step 1 initially without extreme shrink
  useEffect(() => {
    if (nodes.length > 0) {
      // Focus on first milestone with readable scale
      const firstNode = nodes[0];
      reactFlowInstance.setCenter(
        firstNode.position.x + NODE_WIDTH / 2,
        firstNode.position.y + 180,
        { zoom: 0.85, duration: 400 }
      );
    }
  }, [nodes.length, reactFlowInstance]);

  const handleResetToStart = () => {
    if (nodes.length > 0) {
      const firstNode = nodes[0];
      reactFlowInstance.setCenter(
        firstNode.position.x + NODE_WIDTH / 2,
        firstNode.position.y + 180,
        { zoom: 0.85, duration: 500 }
      );
    }
  };

  const handleFitAll = () => {
    reactFlowInstance.fitView({ padding: 0.2, duration: 500 });
  };

  return (
    <div className="relative w-full h-[calc(100vh-4.5rem)] bg-zinc-950">
      {/* Floating Canvas Controls & Info Bar */}
      <div className="absolute top-4 left-4 z-10 flex items-center gap-2 bg-zinc-900/90 backdrop-blur-md border border-zinc-800 rounded-xl p-1.5 shadow-2xl">
        <button
          onClick={handleResetToStart}
          title="Reset to Step 1"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-xs font-semibold text-white transition"
        >
          <RotateCcw className="h-3.5 w-3.5 text-indigo-400" />
          Focus Step 1
        </button>
        <button
          onClick={handleFitAll}
          title="Fit whole roadmap on screen"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-xs font-semibold text-white transition"
        >
          <Maximize2 className="h-3.5 w-3.5 text-purple-400" />
          Fit All
        </button>
        <div className="h-4 w-px bg-zinc-700 mx-1" />
        <button
          onClick={() => reactFlowInstance.zoomIn()}
          className="p-1.5 rounded-lg hover:bg-zinc-800 text-zinc-300 hover:text-white transition"
          title="Zoom In"
        >
          <ZoomIn className="h-4 w-4" />
        </button>
        <button
          onClick={() => reactFlowInstance.zoomOut()}
          className="p-1.5 rounded-lg hover:bg-zinc-800 text-zinc-300 hover:text-white transition"
          title="Zoom Out"
        >
          <ZoomOut className="h-4 w-4" />
        </button>
      </div>

      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        minZoom={0.3}
        maxZoom={1.5}
        proOptions={{ hideAttribution: true }}
      >
        <Background
          variant={BackgroundVariant.Dots}
          gap={28}
          size={1.5}
          color="#3f3f46"
          className="opacity-70"
        />
        <MiniMap
          nodeStrokeColor="#6366f1"
          nodeColor="#27272a"
          maskColor="rgba(9, 9, 11, 0.85)"
          className="!bg-zinc-900 !border-2 !border-zinc-800 !rounded-2xl overflow-hidden shadow-2xl !bottom-4 !right-4"
        />
      </ReactFlow>

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
