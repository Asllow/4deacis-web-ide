import { Handle, Position } from "@xyflow/react";
import { BLOCK_SCHEMA } from "@/core/constants/schema";

export interface IFunctionBlockData extends Record<string, unknown> {
    label: string;
    blockType: string;
    config: Record<string, string | number>;
}

export function FunctionBlockNode({ data }: { data: IFunctionBlockData }) {
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

    return (
        <div className="flex flex-col min-w-40 font-sans text-xs drop-shadow-md select-none">
            
            <div className="bg-blue-50 dark:bg-sky-900 border border-neutral-800 dark:border-neutral-300 rounded-t flex flex-col">
                <div className="text-center font-bold border-b border-neutral-800 dark:border-neutral-300 py-1 bg-blue-100 dark:bg-sky-800 text-neutral-900 dark:text-neutral-50">
                    {data.label}
                </div>
                
                <div className="flex justify-between px-2 py-1.5 relative text-neutral-800 dark:text-neutral-100 font-medium min-h-6">
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

            <div className="h-3 bg-blue-50 dark:bg-sky-900 border-x border-neutral-800 dark:border-neutral-300 mx-2 -my-px relative z-10 transition-colors" />

            <div className="bg-blue-50 dark:bg-sky-900 border border-neutral-800 dark:border-neutral-300 rounded-b flex flex-col px-2 py-2 min-h-6">
                <div className="flex justify-between relative text-neutral-800 dark:text-neutral-100">
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