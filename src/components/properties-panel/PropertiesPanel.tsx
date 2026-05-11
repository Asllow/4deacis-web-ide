"use client";

import { useReactFlow, useNodes } from "@xyflow/react";
import { BLOCK_SCHEMA } from "@/core/constants/schema";
import type { ChangeEvent } from "react";
import type { IFunctionBlockData } from "@/components/application-canvas/nodes/FunctionBlockNode";

export function PropertiesPanel({ nodeId }: { nodeId: string }) {
    const { updateNodeData } = useReactFlow();
    const nodes = useNodes();
    const node = nodes.find((n) => n.id === nodeId);

    if (!node) return null;

    const data = node.data as IFunctionBlockData;
    const schema = BLOCK_SCHEMA[data.blockType];

    const handleLabelChange = (e: ChangeEvent<HTMLInputElement>) => {
        updateNodeData(nodeId, { label: e.target.value });
    };

    const handleConfigChange = (key: string, value: string | number) => {
        let finalValue = value;

        // Validação estrita: portas dinâmicas não podem ser <= 0
        if (key === "num_in" || key === "num_out") {
            const num = Number(finalValue);
            if (num < 1) finalValue = 1;
        }

        updateNodeData(nodeId, {
            config: {
                ...data.config,
                [key]: finalValue,
            },
        });
    };

    return (
        <div className="flex flex-col h-full overflow-y-auto px-4 gap-4 pb-4">
            <div className="flex flex-col gap-1">
                <label className="font-semibold text-neutral-700 dark:text-neutral-300">
                    ID da Instância
                </label>
                <input
                    type="text"
                    value={data.label}
                    onChange={handleLabelChange}
                    className="border border-neutral-300 dark:border-neutral-600 rounded bg-white dark:bg-neutral-900 px-2 py-1 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-amber-500 transition-shadow"
                />
            </div>

            {schema.config &&
                Object.entries(schema.config).map(([key, type]) => {
                    if (type === "string (hidden/modal)") return null;

                    const isNumber = type === "number";
                    const currentValue = data.config[key];
                    
                    // Se for 0, deixa o input vazio para o placeholder brilhar e evitar o bug "022"
                    const displayValue = isNumber && currentValue === 0 ? "" : (currentValue ?? "");

                    return (
                        <div key={key} className="flex flex-col gap-1">
                            <label className="font-semibold text-neutral-700 dark:text-neutral-300">
                                {key}
                            </label>
                            <input
                                type={isNumber ? "number" : "text"}
                                value={displayValue}
                                placeholder={isNumber ? "0" : ""}
                                onChange={(e) => {
                                    const val = e.target.value;
                                    handleConfigChange(
                                        key,
                                        isNumber ? (val === "" ? 0 : Number(val)) : val
                                    );
                                }}
                                className="border border-neutral-300 dark:border-neutral-600 rounded bg-white dark:bg-neutral-900 px-2 py-1 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-amber-500 transition-shadow"
                            />
                        </div>
                    );
                })}
        </div>
    );
}