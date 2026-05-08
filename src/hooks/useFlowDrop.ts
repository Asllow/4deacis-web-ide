"use client";

import { useReactFlow, type Node, type XYPosition } from "@xyflow/react";
import { useCallback, type Dispatch, type SetStateAction } from "react";
import { BLOCK_SCHEMA } from "@/core/constants/schema";
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
                    if (type === "number") {
                        initialConfig[key] = key.startsWith("num_") ? 1 : 0;
                    } else if (type === "string (hidden/modal)") {
                        initialConfig[key] = "";
                    } else if (type === "string") {
                        initialConfig[key] = "";
                    }
                });
            }

            if (schema.config.num_in) {
                initialConfig.num_in = initialConfig.num_in || 1;
            }

            if (schema.config.num_out) {
                initialConfig.num_out = initialConfig.num_out || 1;
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