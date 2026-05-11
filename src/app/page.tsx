import { ReactFlowProvider } from "@xyflow/react";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { FlowCanvas } from "@/components/application-canvas/FlowCanvas";
import { RightSidebar } from "@/components/layout/RightSidebar";

export default function Home() {
    return (
        <ReactFlowProvider>
            <main className="flex h-screen w-full bg-neutral-50 dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 overflow-hidden font-sans transition-colors duration-200">
                
                <aside className="w-64 bg-white dark:bg-neutral-800 border-r border-neutral-200 dark:border-neutral-700 flex flex-col transition-colors duration-200">
                    <header className="p-4 border-b border-neutral-200 dark:border-neutral-700">
                        <h2 className="font-semibold text-sm">Modelo do Sistema</h2>
                    </header>
                    <div className="flex-1 p-4 text-xs text-neutral-500 dark:text-neutral-400">
                        <p>Buscando dispositivos ESP32...</p>
                    </div>
                </aside>

                <section className="flex-1 bg-neutral-100 dark:bg-neutral-950 flex flex-col relative transition-colors duration-200">
                    <header className="h-14 border-b border-neutral-200 dark:border-neutral-800 flex items-center px-6 justify-between bg-white dark:bg-neutral-900 transition-colors duration-200 shrink-0">
                        <h1 className="font-semibold text-sm text-neutral-700 dark:text-neutral-300">4diac Web IDE</h1>
                        
                        <div className="flex items-center gap-4">
                            <ThemeToggle />
                            <button className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-1.5 text-xs font-medium rounded shadow transition-colors">
                                Injetar Malha
                            </button>
                        </div>
                    </header>
                    
                    <div className="flex-1 w-full h-full relative">
                        <FlowCanvas />
                    </div>
                </section>

                <RightSidebar />

            </main>
        </ReactFlowProvider>
    );
}