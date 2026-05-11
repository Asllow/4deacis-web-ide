"use client";

import { useReactFlow, type Node, type XYPosition } from "@xyflow/react";
import { useCallback, type Dispatch, type SetStateAction } from "react";
import { BLOCK_SCHEMA } from "@/core/constants/schema";
import { getSmartDefault } from "@/core/constants/defaults";
import type { IFunctionBlockData } from "@/components/application-canvas/nodes/FunctionBlockNode";

export function useFlowDrop(setNodes: Dispatch<SetStateAction<Node[]>>) {
    const { screenToFlowPosition } = useReactFlow();

    const onDragOver = useCallback((event: React.DragEvent) => {
        event.preventDefault();
        event.dataTransfer.dropEffect = "move";
    }, []);

    const onDrop = useCallback(
        (event: React.DragEvent) => {
            event.preventDefault();

            const blockType = event.dataTransfer.getData("application/reactflow");

            if (!blockType || !(blockType in BLOCK_SCHEMA)) {
                return;
            }

            const schema = BLOCK_SCHEMA[blockType];
            
            const position: XYPosition = screenToFlowPosition({
                x: event.clientX,
                y: event.clientY,
            });

            const initialConfig: Record<string, string | number> = {};
            
            if (schema.config) {
                Object.entries(schema.config).forEach(([key, type]) => {
                    initialConfig[key] = getSmartDefault(key, type);
                });
            }

            const newNode: Node<IFunctionBlockData> = {
                id: `${blockType}-${Date.now()}`,
                type: "functionBlock",
                position,
                data: {
                    label: `${blockType}_${Math.floor(Math.random() * 1000)}`,
                    blockType,
                    config: initialConfig
                },
            };

            setNodes((nds) => [...nds, newNode]);
        },
        [screenToFlowPosition, setNodes]
    );

    return { onDragOver, onDrop };
}