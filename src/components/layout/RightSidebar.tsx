"use client";

import { useNodes } from "@xyflow/react";
import { BlockCatalog } from "@/components/block-catalog/BlockCatalog";
import { PropertiesPanel } from "@/components/properties-panel/PropertiesPanel";

interface RightSidebarProps {
    activeTargetIp?: string | null;
}

export function RightSidebar({ activeTargetIp }: RightSidebarProps) {
    const nodes = useNodes();
    const selectedNode = nodes.find((n) => n.selected);

    return (
        <aside className="w-72 bg-white dark:bg-neutral-800 border-l border-neutral-200 dark:border-neutral-700 flex flex-col transition-colors duration-200 shrink-0">
            <header className="p-4 border-b border-neutral-200 dark:border-neutral-700 shrink-0">
                <h2 className="font-semibold text-sm text-neutral-900 dark:text-neutral-100 flex justify-between items-center">
                    {selectedNode ? (
                        <>
                            <span>Propriedades</span>
                            <span className="text-[10px] font-mono text-neutral-500 bg-neutral-100 dark:bg-neutral-800 px-1.5 py-0.5 rounded">
                                {selectedNode.type}
                            </span>
                        </>
                    ) : (
                        "Catálogo de Blocos"
                    )}
                </h2>
            </header>
            
            <div className="flex-1 py-4 text-xs text-neutral-500 dark:text-neutral-400 overflow-y-auto">
                {selectedNode ? (
                    <PropertiesPanel nodeId={selectedNode.id} activeTargetIp={activeTargetIp || null} />
                ) : (
                    <div className="px-4 h-full">
                        <BlockCatalog />
                    </div>
                )}
            </div>
        </aside>
    );
}