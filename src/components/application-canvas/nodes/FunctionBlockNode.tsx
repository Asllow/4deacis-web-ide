import { Handle, Position } from "@xyflow/react";
import { BLOCK_SCHEMA } from "@/core/constants/schema";

export interface IFunctionBlockData extends Record<string, unknown> {
    label: string;
    blockType: string;
    config: Record<string, string | number>;
}

export function FunctionBlockNode({ data, selected }: { data: IFunctionBlockData; selected?: boolean }) {
    const schema = BLOCK_SCHEMA[data.blockType];

    if (!schema) {
        return <div className="p-2 bg-red-500 text-white rounded">Schema Invalido</div>;
    }

    const resolveDynamicPorts = (basePorts: string[], dynamicCount: string | number | undefined, prefix: string) => {
        const count = Number(dynamicCount);
        if (!isNaN(count) && count >= 0) {
            return Array.from({ length: count }, (_, i) => `${prefix}${i}`);
        }
        return basePorts.filter((p) => !p.includes("..."));
    };

    const dataInPorts = resolveDynamicPorts(schema.data_in, data.config.num_in, "IN_");
    const dataOutPorts = resolveDynamicPorts(schema.data_out, data.config.num_out, "OUT_");

    const borderClass = selected 
        ? "border-amber-500 dark:border-amber-400" 
        : "border-neutral-400 dark:border-neutral-600";

    return (
        <div className="flex flex-col min-w-40 font-sans text-xs drop-shadow-md select-none transition-shadow">
            
            <div className={`bg-neutral-100 dark:bg-neutral-800 border ${borderClass} rounded-t flex flex-col transition-colors`}>
                
                <div className={`text-center border-b ${borderClass} py-1 bg-neutral-200 dark:bg-neutral-700 transition-colors flex flex-col items-center justify-center`}>
                    <span className="text-[9px] uppercase tracking-wider text-neutral-500 dark:text-neutral-400 font-bold -mb-0.5">
                        {data.blockType}
                    </span>
                    <span className="font-bold text-neutral-900 dark:text-neutral-100 text-xs px-2 truncate max-w-full">
                        {data.label}
                    </span>
                </div>
                
                <div className="flex justify-between px-2 py-1.5 relative text-neutral-700 dark:text-neutral-300 font-medium min-h-6">
                    <div className="flex flex-col gap-1.5">
                        {schema.events_in.map((evt) => (
                            <div key={`ev-in-${evt}`} className="flex items-center relative">
                                <Handle type="target" position={Position.Left} id={`EV_IN_${evt}`} className="w-2 h-2 rounded-none bg-red-600 border-neutral-800 dark:border-neutral-300 -ml-3" />
                                <span>{evt}</span>
                            </div>
                        ))}
                    </div>
                    <div className="flex flex-col gap-1.5 items-end">
                        {schema.events_out.map((evt) => (
                            <div key={`ev-out-${evt}`} className="flex items-center relative">
                                <span>{evt}</span>
                                <Handle type="source" position={Position.Right} id={`EV_OUT_${evt}`} className="w-2 h-2 rounded-none bg-red-600 border-neutral-800 dark:border-neutral-300 -mr-3" />
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className={`h-3 bg-neutral-100 dark:bg-neutral-800 border-x ${borderClass} mx-2 -my-px relative z-10 transition-colors`} />

            <div className={`bg-neutral-100 dark:bg-neutral-800 border ${borderClass} rounded-b flex flex-col px-2 py-2 min-h-6 transition-colors`}>
                <div className="flex justify-between relative text-neutral-700 dark:text-neutral-300">
                    <div className="flex flex-col gap-1.5">
                        {dataInPorts.map((dt) => (
                            <div key={`dt-in-${dt}`} className="flex items-center relative">
                                <Handle type="target" position={Position.Left} id={`DT_IN_${dt}`} className="w-2 h-2 rounded-none bg-blue-600 border-neutral-800 dark:border-neutral-300 -ml-3" />
                                <span>{dt}</span>
                            </div>
                        ))}
                    </div>
                    <div className="flex flex-col gap-1.5 items-end">
                        {dataOutPorts.map((dt) => (
                            <div key={`dt-out-${dt}`} className="flex items-center relative">
                                <span>{dt}</span>
                                <Handle type="source" position={Position.Right} id={`DT_OUT_${dt}`} className="w-2 h-2 rounded-none bg-blue-600 border-neutral-800 dark:border-neutral-300 -mr-3" />
                            </div>
                        ))}
                    </div>
                </div>
            </div>

        </div>
    );
}