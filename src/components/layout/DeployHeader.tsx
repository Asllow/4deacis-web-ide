"use client";

import { useState } from "react";
import { useReactFlow } from "@xyflow/react";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { generateDistributedMesh } from "@/core/utils/meshParser";
import { deployMesh } from "@/core/services/esp32.service";

export function DeployHeader() {
    const { getNodes, getEdges } = useReactFlow();
    const [isDeploying, setIsDeploying] = useState(false);

    const downloadJsonFile = (data: unknown, filename: string) => {
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    const handleExportJson = () => {
        const nodes = getNodes();
        const edges = getEdges();
        const deployments = generateDistributedMesh(nodes, edges);

        if (deployments.length === 0) {
            alert("A malha está vazia. Adicione e mapeie blocos antes de exportar.");
            return;
        }

        // Exporta um arquivo para cada ESP32 mapeado
        deployments.forEach((dep) => {
            const safeIp = dep.ip.replace(/\./g, "_");
            downloadJsonFile(dep.payload, `mesh_${safeIp}.json`);
        });
    };

    const handleDeploy = async () => {
        const nodes = getNodes();
        const edges = getEdges();

        const unmappedNodes = nodes.filter(n => !n.data?.targetIp);
        if (unmappedNodes.length > 0) {
            alert(`Operação abortada: Existem ${unmappedNodes.length} blocos sem mapeamento. Mapeie todos os blocos físicos antes de injetar.`);
            return;
        }

        const deployments = generateDistributedMesh(nodes, edges);

        if (deployments.length === 0) {
            alert("Malha vazia ou sem dispositivos válidos.");
            return;
        }

        console.log("=== PAYLOADS GERADOS PARA DEPLOY ===");
        deployments.forEach(dep => {
            console.log(`Destino: ${dep.ip}`);
            console.log(JSON.stringify(dep.payload, null, 2));
        });
        console.log("====================================");

        setIsDeploying(true);
        
        try {
            await Promise.all(
                deployments.map(dep => deployMesh(dep.ip, dep.payload))
            );

            alert(`Sucesso Crítico: Malha distribuída injetada de forma atômica em ${deployments.length} dispositivo(s). Planta operante.`);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : "Falha desconhecida de hardware ou rede.";
            alert(`⚠️ FALHA CRÍTICA DE DEPLOY ⚠️\nO sistema abortou o sincronismo para evitar atuação cega.\n\n📋 DIAGNÓSTICO DO MOTOR:\n${errorMessage}`);
        } finally {
            setIsDeploying(false);
        }
    };

    return (
        <header className="h-14 border-b border-neutral-200 dark:border-neutral-800 flex items-center px-6 justify-between bg-white dark:bg-neutral-900 transition-colors duration-200 shrink-0">
            <h1 className="font-semibold text-sm text-neutral-700 dark:text-neutral-300">
                4diac Web IDE - Modo Distribuído
            </h1>
            
            <div className="flex items-center gap-4">
                <ThemeToggle />
                
                <button 
                    onClick={handleExportJson}
                    className="bg-neutral-200 hover:bg-neutral-300 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-neutral-800 dark:text-neutral-200 px-4 py-1.5 text-xs font-medium rounded shadow-sm transition-colors"
                >
                    Exportar JSON
                </button>

                <button 
                    onClick={handleDeploy}
                    disabled={isDeploying}
                    className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-1.5 text-xs font-medium rounded shadow transition-colors disabled:opacity-50 disabled:cursor-wait"
                >
                    {isDeploying ? "Bloqueio Ativo: Injetando..." : "Injetar Malha Distribuída"}
                </button>
            </div>
        </header>
    );
}