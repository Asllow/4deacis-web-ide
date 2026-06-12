"use client";

import { useState } from "react";
import { ReactFlowProvider } from "@xyflow/react";
import { FlowCanvas } from "@/components/application-canvas/FlowCanvas";
import { RightSidebar } from "@/components/layout/RightSidebar";
import { SystemModelSidebar } from "@/components/system-model/SystemModelSidebar";
import { DeployHeader } from "@/components/layout/DeployHeader";

export default function Home() {
    const [targetIp, setTargetIp] = useState<string | null>(null);

    return (
        <ReactFlowProvider>
            <main className="flex h-screen w-full bg-neutral-50 dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 overflow-hidden font-sans transition-colors duration-200">
                
                <SystemModelSidebar selectedIp={targetIp} onSelectIp={setTargetIp} />

                <section className="flex-1 bg-neutral-100 dark:bg-neutral-950 flex flex-col relative transition-colors duration-200">
                    <DeployHeader />
                    
                    <div className="flex-1 w-full h-full relative">
                        <FlowCanvas />
                    </div>
                </section>

                <RightSidebar activeTargetIp={targetIp} />

            </main>
        </ReactFlowProvider>
    );
}