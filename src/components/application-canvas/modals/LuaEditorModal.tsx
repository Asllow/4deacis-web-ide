"use client";

import Editor, { type OnMount, type Monaco } from "@monaco-editor/react";
import { useState, useEffect, useCallback, useRef } from "react";
import { useTheme } from "next-themes";
import { useReactFlow, useNodes } from "@xyflow/react";
import type { IFunctionBlockData } from "../nodes/FunctionBlockNode";
import luaparse from "luaparse";

interface Props {
    nodeId: string;
    onClose: () => void;
}

interface IMonacoMarker {
    message: string;
    severity: number;
    startLineNumber: number;
    startColumn: number;
    endLineNumber: number;
    endColumn: number;
}

export function LuaEditorModal({ nodeId, onClose }: Props) {
    const { updateNodeData } = useReactFlow();
    const nodes = useNodes();
    const node = nodes.find((n) => n.id === nodeId);
    const data = node?.data as IFunctionBlockData | undefined;
    
    const { theme } = useTheme();
    
    const monacoRef = useRef<Monaco | null>(null);

    const getInitialCode = () => {
        try {
            const b64 = data?.config?.script_b64 as string | undefined;
            return b64 ? atob(b64) : "-- Escreva seu script Lua aqui\n\nfunction process(in0)\n    return in0 * 2\nend";
        } catch {
            return "";
        }
    };

    const [code, setCode] = useState(getInitialCode());

    const validateLua = useCallback((currentCode: string, monacoInstance: Monaco) => {
        if (!monacoInstance) return;

        const model = monacoInstance.editor.getModels()[0];
        if (!model) return;

        const markers: IMonacoMarker[] = [];
        
        try {
            luaparse.parse(currentCode);
        } catch (err: unknown) {
            const parseErr = err as Error & { line?: number; column?: number };
            const line = parseErr.line || 1;
            
            // Pede ao Monaco a coluna máxima (final) da linha onde o erro ocorreu
            const maxCol = model.getLineMaxColumn(line);
            
            markers.push({
                message: parseErr.message ? parseErr.message.replace(/\[\d+:\d+\]\s/, "") : "Syntax Error",
                severity: monacoInstance.MarkerSeverity.Error,
                startLineNumber: line,
                startColumn: 1,
                endLineNumber: line,
                endColumn: maxCol,
            });
        }

        monacoInstance.editor.setModelMarkers(model, "lua", markers);
    }, []);

    const handleEditorDidMount: OnMount = (editor, monaco) => {
        monacoRef.current = monaco;
        validateLua(code, monaco);
    };

    useEffect(() => {
        if (monacoRef.current) {
            validateLua(code, monacoRef.current);
        }
    }, [code, validateLua]);

    const handleSave = () => {
        if (!data) return;
        
        const base64Code = btoa(code || "");
        
        updateNodeData(nodeId, {
            config: {
                ...data.config,
                script_b64: base64Code,
            },
        });
        onClose();
    };

    if (!data) return null;

    return (
        <div className="absolute inset-0 z-50 flex flex-col bg-white dark:bg-neutral-950 animate-in fade-in duration-200">
            
            <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 shrink-0">
                <div>
                    <h2 className="text-lg font-bold text-neutral-800 dark:text-neutral-100">
                        Editor Lua - Sandbox
                    </h2>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400">
                        Instância: <span className="font-mono text-amber-600 dark:text-amber-400">{data.label}</span>
                    </p>
                </div>
                <div className="flex gap-3">
                    <button 
                        onClick={onClose}
                        className="px-4 py-2 text-sm font-medium text-neutral-600 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-800 rounded transition-colors"
                    >
                        Cancelar
                    </button>
                    <button 
                        onClick={handleSave}
                        className="px-4 py-2 text-sm font-medium bg-blue-600 hover:bg-blue-500 text-white rounded shadow transition-colors"
                    >
                        Salvar Script
                    </button>
                </div>
            </div>

            <div className="flex-1 w-full relative">
                <Editor
                    height="100%"
                    defaultLanguage="lua"
                    theme={theme === "dark" ? "vs-dark" : "light"}
                    value={code}
                    onChange={(value) => setCode(value || "")}
                    onMount={handleEditorDidMount}
                    options={{
                        minimap: { enabled: true },
                        fontSize: 14,
                        fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
                        padding: { top: 16 },
                        smoothScrolling: true,
                        overviewRulerLanes: 0,
                        hideCursorInOverviewRuler: true,
                        overviewRulerBorder: false,
                        scrollbar: {
                            verticalScrollbarSize: 12,
                            horizontalScrollbarSize: 12,
                            verticalSliderSize: 6,
                            horizontalSliderSize: 6,
                            useShadows: false,
                        },
                    }}
                />
            </div>
            
        </div>
    );
}