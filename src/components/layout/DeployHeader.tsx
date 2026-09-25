"use client";

import { useState } from "react";
import { useReactFlow } from "@xyflow/react";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { generateDistributedMesh } from "@/core/utils/meshParser";
import { deployMesh } from "@/core/services/esp32.service";
import { projectRepository } from "@/core/repositories/ProjectRepository";
import { useAuthStore } from "@/shared/store/authStore";

export function DeployHeader() {
    // Adicionado setNodes e setEdges para poder injetar a malha ao carregar
    const { getNodes, getEdges, setNodes, setEdges } = useReactFlow();
    const [isDeploying, setIsDeploying] = useState(false);

    // Conectando com o estado global de autenticação
    const user = useAuthStore((state) => state.user);
    const logout = useAuthStore((state) => state.logout);

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

    const handleSaveProject = async () => {
        if (!user) return;

        const nodes = getNodes();
        const edges = getEdges();

        try {
            await projectRepository.saveProject({
                id: `proj_${user}_default`,
                userId: user,
                name: "Malha Padrão",
                flowData: { nodes, edges },
                updatedAt: new Date().toISOString()
            });
            alert("Projeto salvo com sucesso no Repositório Local.");
        } catch (error) {
            alert("Erro ao salvar projeto no repositório.");
        }
    };

    const handleLoadProject = async () => {
        if (!user) return;

        try {
            const projects = await projectRepository.loadProjectsByUser(user);
            if (projects.length === 0) {
                alert("Nenhum projeto encontrado para este usuário.");
                return;
            }

            const latestProject = projects[0];
            setNodes(latestProject.flowData.nodes || []);
            setEdges(latestProject.flowData.edges || []);
            
        } catch (error) {
            alert("Erro ao recuperar projeto do repositório.");
        }
    };

    const handleExportJson = () => {
        const nodes = getNodes();
        const edges = getEdges();
        const deployments = generateDistributedMesh(nodes, edges);

        if (deployments.length === 0) {
            alert("A malha está vazia. Adicione e mapeie blocos antes de exportar.");
            return;
        }

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
        <header className="h-(--my-height) border-b border-neutral-200 dark:border-neutral-800 flex items-center px-6 justify-end bg-white dark:bg-neutral-900 transition-colors duration-200 shrink-0">
            <div className="flex items-center gap-4">
                
                {/* Badge do Usuário Logado */}
                {user && (
                    <span className="text-[10px] bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 px-2 py-0.5 rounded font-mono text-neutral-600 dark:text-neutral-400 mr-2 shadow-sm">
                        Engenheiro: {user}
                    </span>
                )}

                <ThemeToggle />
                
                {/* Grupo de Persistência Separado Visualmente */}
                <div className="flex items-center gap-2 border-r border-neutral-200 dark:border-neutral-700 pr-4">
                    <button 
                        onClick={handleSaveProject}
                        className="bg-neutral-200 hover:bg-neutral-300 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-neutral-800 dark:text-neutral-200 px-3 py-1.5 text-xs font-medium rounded shadow-sm transition-colors"
                    >
                        💾 Salvar
                    </button>
                    <button 
                        onClick={handleLoadProject}
                        className="bg-neutral-200 hover:bg-neutral-300 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-neutral-800 dark:text-neutral-200 px-3 py-1.5 text-xs font-medium rounded shadow-sm transition-colors"
                    >
                        📂 Carregar
                    </button>
                </div>
                
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
                    {isDeploying ? "Bloqueio Ativo: Injetando..." : "Injetar Malha"}
                </button>

                {/* Botão de Logout */}
                {user && (
                    <button 
                        onClick={logout}
                        className="text-xs text-red-600 hover:text-red-500 font-medium ml-2 transition-colors"
                    >
                        Sair
                    </button>
                )}
            </div>
        </header>
    );
}