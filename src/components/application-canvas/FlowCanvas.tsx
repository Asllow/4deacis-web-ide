"use client";

import {
    ReactFlow,
    Background,
    Controls,
    MiniMap,
    addEdge,
    useNodesState,
    useEdgesState,
    type Connection,
    type Edge,
    type Node,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { useCallback, useState } from "react";
import { useTheme } from "next-themes";
import { FunctionBlockNode } from "./nodes/FunctionBlockNode";
import { useFlowDrop } from "@/hooks/useFlowDrop";
import { LuaEditorModal } from "./modals/LuaEditorModal";

const nodeTypes = {
    functionBlock: FunctionBlockNode,
};

export function FlowCanvas() {
    const { theme } = useTheme();
    
    const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
    const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
    const [editingNodeId, setEditingNodeId] = useState<string | null>(null);

    const onConnect = useCallback(
        (params: Connection | Edge) => {
            const { sourceHandle, targetHandle } = params;

            if (!sourceHandle || !targetHandle) return;

            const isSourceEvent = sourceHandle.startsWith("EV_");
            const isTargetEvent = targetHandle.startsWith("EV_");

            if (isSourceEvent !== isTargetEvent) {
                return; 
            }

            const edgeColor = isSourceEvent ? "#dc2626" : "#2563eb"; 

            const newEdge: Edge = {
                ...params,
                id: `e-${params.source}-${params.target}-${Date.now()}`,
                type: "smoothstep", 
                style: { 
                    stroke: edgeColor, 
                    strokeWidth: 2 
                },
            };

            setEdges((eds) => addEdge(newEdge, eds));
        },
        [setEdges]
    );

    const onNodeDoubleClick = useCallback((event: React.MouseEvent, node: Node) => {
        if (node.data.blockType === "Sandbox") {
            setEditingNodeId(node.id);
        }
    }, []);

    const { onDragOver, onDrop } = useFlowDrop(setNodes);

    const isDark = theme === "dark";

    return (
        <div className="w-full h-full relative" onDrop={onDrop} onDragOver={onDragOver}>
            <ReactFlow
                nodes={nodes}
                edges={edges}
                nodeTypes={nodeTypes}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
                onNodeDoubleClick={onNodeDoubleClick}
                proOptions={{ hideAttribution: true }}
                colorMode={theme as "light" | "dark" | "system"}
                deleteKeyCode={["Backspace", "Delete"]}
                elevateNodesOnSelect={true}
                fitView
            >
                <Background gap={16} size={1} />
                <Controls />
                <MiniMap 
                    zoomable 
                    pannable 
                    nodeColor={isDark ? "#38bdf8" : "#93c5fd"} 
                    maskColor={isDark ? "rgba(0, 0, 0, 0.7)" : "rgba(229, 231, 235, 0.6)"}
                    className="bg-neutral-100 dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-800 rounded-md"
                />
            </ReactFlow>

            {editingNodeId && (
                <LuaEditorModal 
                    nodeId={editingNodeId} 
                    onClose={() => setEditingNodeId(null)} 
                />
            )}
        </div>
    );
}