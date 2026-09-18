"use client";

import { useMemo, useState, useCallback, useEffect } from "react";
import {
  ReactFlow,
  Controls,
  Background,
  MiniMap,
  useNodesState,
  useEdgesState,
  Node,
  Edge,
  MarkerType,
  BackgroundVariant,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import dagre from "dagre";
import MilestoneNode from "./MilestoneNode";
import TopicDrawer, { SelectedTopic } from "./TopicDrawer";

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

const NODE_WIDTH = 380;
const NODE_HEIGHT = 280;

function getLayoutedElements(nodes: Node[], edges: Edge[]) {
  const dagreGraph = new dagre.graphlib.Graph();
  dagreGraph.setDefaultEdgeLabel(() => ({}));
  dagreGraph.setGraph({ rankdir: "TB", nodesep: 60, ranksep: 90 });

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

export default function RoadmapCanvas({
  milestones,
  onToggleComplete,
  isLoggedIn,
}: RoadmapCanvasProps) {
  const [selectedTopic, setSelectedTopic] = useState<SelectedTopic | null>(null);

  // Sync selected topic when topic completion changes
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
        animated: !isSourceCompleted,
        style: {
          stroke: isSourceCompleted ? "#10b981" : "#6366f1",
          strokeWidth: 3,
        },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: isSourceCompleted ? "#10b981" : "#6366f1",
        },
      });
    }

    return getLayoutedElements(rawNodes, rawEdges);
  }, [milestones]);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  // Update nodes whenever milestones prop changes
  useEffect(() => {
    const { nodes: updatedNodes, edges: updatedEdges } = getLayoutedElements(
      initialNodes,
      initialEdges
    );
    setNodes(updatedNodes);
    setEdges(updatedEdges);
  }, [initialNodes, initialEdges, setNodes, setEdges]);

  return (
    <div className="relative w-full h-[calc(100vh-4rem)] bg-zinc-950">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        minZoom={0.2}
        maxZoom={1.5}
        proOptions={{ hideAttribution: true }}
      >
        <Background variant={BackgroundVariant.Dots} gap={24} size={1.5} color="#27272a" />
        <Controls className="!bg-zinc-900 !border-zinc-800 !fill-zinc-400 !text-zinc-400 !rounded-xl overflow-hidden shadow-xl" />
        <MiniMap
          nodeStrokeColor="#6366f1"
          nodeColor="#18181b"
          maskColor="rgba(9, 9, 11, 0.75)"
          className="!bg-zinc-900 !border-zinc-800 !rounded-xl overflow-hidden shadow-xl"
        />
      </ReactFlow>

      {/* Topic Detail Sliding Drawer */}
      <TopicDrawer
        topic={selectedTopic}
        onClose={() => setSelectedTopic(null)}
        onToggleComplete={handleTopicDrawerComplete}
        isLoggedIn={isLoggedIn}
      />
    </div>
  );
}
