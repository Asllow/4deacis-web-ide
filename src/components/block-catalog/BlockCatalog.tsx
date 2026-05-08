"use client";

import { BLOCK_SCHEMA } from "@/core/constants/schema";

export function BlockCatalog() {
    const onDragStart = (event: React.DragEvent, blockType: string) => {
        event.dataTransfer.setData("application/reactflow", blockType);
        event.dataTransfer.effectAllowed = "move";
    };

    const categories = Array.from(new Set(Object.values(BLOCK_SCHEMA).map((b) => b.category)));

    return (
        <div className="flex flex-col h-full overflow-y-auto">
            {categories.map((category) => (
                <div key={category} className="mb-4">
                    <h3 className="text-xs font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider mb-2 px-4">
                        {category}
                    </h3>
                    <div className="flex flex-col gap-2 px-2">
                        {Object.entries(BLOCK_SCHEMA)
                            .filter(([_, schema]) => schema.category === category)
                            .map(([blockType, schema]) => (
                                <div
                                    key={blockType}
                                    draggable
                                    onDragStart={(e) => onDragStart(e, blockType)}
                                    className="bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 p-2 rounded cursor-grab active:cursor-grabbing hover:border-blue-500 transition-colors shadow-sm"
                                >
                                    <div className="font-semibold text-neutral-800 dark:text-neutral-200 text-sm">
                                        {blockType}
                                    </div>
                                    <div className="text-xs text-neutral-500 dark:text-neutral-400 mt-1 line-clamp-2">
                                        {schema.description}
                                    </div>
                                </div>
                            ))}
                    </div>
                </div>
            ))}
        </div>
    );
}