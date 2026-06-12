"use client";

import { useReactFlow, useNodes } from "@xyflow/react";
import { BLOCK_SCHEMA } from "@/core/constants/schema";
import type { ChangeEvent } from "react";
import type { IFunctionBlockData } from "@/components/application-canvas/nodes/FunctionBlockNode";

interface PropertiesPanelProps {
    nodeId: string;
    activeTargetIp: string | null;
}

export function PropertiesPanel({ nodeId, activeTargetIp }: PropertiesPanelProps) {
    const { updateNodeData } = useReactFlow();
    const nodes = useNodes();
    const node = nodes.find((n) => n.id === nodeId);

    if (!node) return null;

    const data = node.data as IFunctionBlockData;
    const schema = BLOCK_SCHEMA[data.blockType];

    const handleLabelChange = (e: ChangeEvent<HTMLInputElement>) => {
        updateNodeData(nodeId, { label: e.target.value });
    };

    const handleMapToActive = () => {
        if (activeTargetIp) {
            updateNodeData(nodeId, { targetIp: activeTargetIp });
        }
    };

    const handleUnmap = () => {
        updateNodeData(nodeId, { targetIp: undefined });
    };

    const handleConfigChange = (key: string, value: string | number) => {
        let finalValue = value;

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

            <div className="flex flex-col gap-2 p-3 bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800/30 rounded">
                <label className="font-bold text-[11px] uppercase tracking-wider text-blue-700 dark:text-blue-400 flex items-center justify-between">
                    <span>🌐 Mapeamento (Hardware)</span>
                    {!!data.targetIp && (
                        <button onClick={handleUnmap} className="text-red-500 hover:text-red-700 text-[9px] underline">
                            Desvincular
                        </button>
                    )}
                </label>
                
                <div className="flex flex-col gap-2 mt-1">
                    <div className="flex justify-between items-center text-xs">
                        <span className="text-neutral-600 dark:text-neutral-400">Status:</span>
                        {!!data.targetIp ? (
                            <span className="font-mono bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 px-1.5 py-0.5 rounded border border-green-200 dark:border-green-800">
                                {data.targetIp as string}
                            </span>
                        ) : (
                            <span className="text-amber-600 dark:text-amber-400 font-medium bg-amber-50 dark:bg-amber-900/20 px-1.5 py-0.5 rounded border border-amber-200 dark:border-amber-800">
                                Não Mapeado
                            </span>
                        )}
                    </div>

                    {(activeTargetIp && activeTargetIp !== (data.targetIp as string)) ? (
                        <button 
                            onClick={handleMapToActive}
                            className="w-full mt-1 bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium py-1.5 rounded shadow-sm transition-colors"
                        >
                            Vincular ao Alvo Ativo ({activeTargetIp})
                        </button>
                    ) : null}

                    {(!activeTargetIp && !data.targetIp) ? (
                        <p className="text-[10px] text-amber-600 dark:text-amber-500 mt-1 leading-tight">
                            Selecione um dispositivo na barra esquerda para mapear este bloco.
                        </p>
                    ) : null}
                </div>
            </div>

            {schema.config &&
                Object.entries(schema.config).map(([key, type]) => {
                    if (type === "string (hidden/modal)") return null;

                    const isNumber = type === "number";
                    const currentValue = data.config[key];
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