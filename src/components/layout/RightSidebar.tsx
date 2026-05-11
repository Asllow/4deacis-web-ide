"use client";

import { useNodes } from "@xyflow/react";
import { BlockCatalog } from "@/components/block-catalog/BlockCatalog";
import { PropertiesPanel } from "@/components/properties-panel/PropertiesPanel";

export function RightSidebar() {
    const nodes = useNodes();
    const selectedNode = nodes.find((n) => n.selected);

    return (
        <aside className="w-72 bg-white dark:bg-neutral-800 border-l border-neutral-200 dark:border-neutral-700 flex flex-col transition-colors duration-200">
            <header className="p-4 border-b border-neutral-200 dark:border-neutral-700 shrink-0">
                <h2 className="font-semibold text-sm text-neutral-900 dark:text-neutral-100">
                    {selectedNode ? "Propriedades" : "Catálogo de Blocos"}
                </h2>
            </header>
            <div className="flex-1 py-4 text-xs text-neutral-500 dark:text-neutral-400 overflow-hidden">
                {selectedNode ? <PropertiesPanel nodeId={selectedNode.id} /> : <BlockCatalog />}
            </div>
        </aside>
    );
}