"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { provisionDevice } from "@/core/services/esp32.service";
import type { IDiscoveredDevice } from "@/app/api/devices/route";

interface ITrackedDevice extends IDiscoveredDevice {
    lastSeen: number;
}

interface ISystemModelSidebarProps {
    selectedIp: string | null;
    onSelectIp: (ip: string | null) => void;
}

export function SystemModelSidebar({ selectedIp, onSelectIp }: ISystemModelSidebarProps) {
    const [trackedDevices, setTrackedDevices] = useState<Map<string, ITrackedDevice>>(new Map());
    const [rebootingDevices, setRebootingDevices] = useState<Map<string, IDiscoveredDevice>>(new Map());

    // Referências mutáveis para evitar re-renderizações e loops no useCallback
    const provisionAttempts = useRef<Map<string, number>>(new Map());
    const selectedIpRef = useRef(selectedIp);
    const onSelectIpRef = useRef(onSelectIp);

    useEffect(() => {
        selectedIpRef.current = selectedIp;
        onSelectIpRef.current = onSelectIp;
    }, [selectedIp, onSelectIp]);

    const handleProvision = useCallback(async (device: IDiscoveredDevice) => {
        provisionAttempts.current.set(device.mac, Date.now());

        setRebootingDevices(prev => {
            const next = new Map(prev);
            next.set(device.mac, device);
            return next;
        });

        try {
            await provisionDevice(device.ip, device.name);
        } catch {
            // Falha silenciosa visualmente, tratada pelo log se necessário
        }

        setTimeout(() => {
            setRebootingDevices(prev => {
                const next = new Map(prev);
                next.delete(device.mac);
                return next;
            });
        }, 15000);
    }, []);

    const scanNetwork = useCallback(async () => {
        try {
            const res = await fetch("/api/devices");
            const data = await res.json();
            const fetchedDevices: IDiscoveredDevice[] = data.devices || [];
            const now = Date.now();

            setTrackedDevices(prev => {
                const next = new Map(prev);
                
                fetchedDevices.forEach(dev => {
                    next.set(dev.mac, { ...dev, lastSeen: now });
                });

                for (const [mac, dev] of next.entries()) {
                    if (now - dev.lastSeen > 10000) {
                        next.delete(mac);
                        // Se o dispositivo que sumiu era o selecionado, desmarcamos via Ref
                        if (selectedIpRef.current === dev.ip) {
                            onSelectIpRef.current(null);
                        }
                    }
                }

                return next;
            });

            setRebootingDevices(prev => {
                const next = new Map(prev);
                let changed = false;
                
                fetchedDevices.forEach(dev => {
                    if (next.has(dev.mac) && !dev.hasConflict && !dev.isNew) {
                        next.delete(dev.mac);
                        changed = true;
                    }
                });
                
                return changed ? next : prev;
            });

            fetchedDevices.forEach(dev => {
                if (dev.isNew && !rebootingDevices.has(dev.mac)) {
                    const lastAttempt = provisionAttempts.current.get(dev.mac) || 0;
                    if (now - lastAttempt > 30000) {
                        handleProvision(dev);
                    }
                }
            });

        } catch {
            setTrackedDevices(new Map()); // Limpa em caso de erro catastrófico na rede
        }
    }, [handleProvision, rebootingDevices]);

    // Smart Polling: Garante que não haverá sobreposição de requisições
    useEffect(() => {
        let isMounted = true;
        let timeoutId: NodeJS.Timeout;

        const poll = async () => {
            await scanNetwork();
            if (isMounted) {
                // Aguarda 3 segundos APÓS a requisição anterior terminar
                timeoutId = setTimeout(poll, 3000);
            }
        };

        poll(); // Dispara a primeira vez

        return () => {
            isMounted = false;
            clearTimeout(timeoutId);
        };
    }, [scanNetwork]);

    const handleSelectDevice = (ip: string) => {
        onSelectIp(selectedIp === ip ? null : ip);
    };

    const displayList = useMemo(() => {
        const list: IDiscoveredDevice[] = [];
        const processedMacs = new Set<string>();

        rebootingDevices.forEach(dev => {
            list.push(dev);
            processedMacs.add(dev.mac);
        });

        trackedDevices.forEach(dev => {
            if (!processedMacs.has(dev.mac)) {
                list.push(dev);
            }
        });

        return list;
    }, [rebootingDevices, trackedDevices]);

    return (
        <aside className="w-64 bg-white dark:bg-neutral-800 border-r border-neutral-200 dark:border-neutral-700 flex flex-col transition-colors duration-200 shrink-0">
            <header className="p-4 border-b border-neutral-200 dark:border-neutral-700 flex justify-between items-center bg-neutral-50 dark:bg-neutral-900 shrink-0">
                <h2 className="font-semibold text-sm text-neutral-900 dark:text-neutral-100">
                    Dispositivos
                </h2>
            </header>
            
            <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
                {displayList.length === 0 && (
                    <div className="flex flex-col items-center justify-center text-center mt-8 gap-3">
                        <div className="w-8 h-8 rounded-full border-2 border-neutral-300 border-t-blue-500 animate-spin"></div>
                        <p className="text-xs text-neutral-500 dark:text-neutral-400">
                            Aguardando ESP32 na rede...
                        </p>
                    </div>
                )}

                {displayList.map((dev) => {
                    const isRebooting = rebootingDevices.has(dev.mac);
                    const isSelected = selectedIp === dev.ip;

                    return (
                        <div 
                            key={dev.mac} 
                            onClick={() => !isRebooting && !dev.hasConflict && !dev.isNew && handleSelectDevice(dev.ip)}
                            className={`flex flex-col p-3 rounded border text-xs transition-all ${
                                isRebooting 
                                    ? "border-amber-400 bg-amber-50 dark:bg-amber-900/20 opacity-70 cursor-wait shadow-inner" 
                                    : isSelected
                                        ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20 cursor-default shadow-sm ring-1 ring-blue-500"
                                        : "border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 hover:border-blue-300 dark:hover:border-blue-700 cursor-pointer shadow-sm hover:shadow"
                            }`}
                        >
                            <div className="flex justify-between items-start mb-2">
                                <span className={`font-bold ${isRebooting ? 'text-amber-800 dark:text-amber-200' : 'text-neutral-800 dark:text-neutral-100'}`}>
                                    {dev.name}
                                </span>
                                <span className="text-[10px] bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 px-1.5 py-0.5 rounded text-neutral-600 dark:text-neutral-300 uppercase">
                                    {dev.board}
                                </span>
                            </div>
                            
                            <div className="text-neutral-500 dark:text-neutral-400 font-mono text-[10px] mb-2 flex flex-col gap-0.5">
                                <span>IP: {isRebooting ? '...' : dev.ip}</span>
                                <span>MAC: {dev.mac}</span>
                            </div>

                            <div className="mt-1 pt-2 border-t border-neutral-200 dark:border-neutral-700">
                                {isRebooting ? (
                                    <span className="text-amber-600 dark:text-amber-400 font-medium text-[10px] flex items-center gap-1">
                                        <div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></div>
                                        {dev.isNew ? "Batizando Placa..." : "Sincronizando Nome..."}
                                    </span>
                                ) : dev.hasConflict ? (
                                    <div className="flex flex-col gap-2">
                                        <div className="flex flex-col gap-1 text-[10px] text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 p-1.5 rounded border border-amber-200 dark:border-amber-800/50">
                                            <span className="font-semibold">⚠️ Conflito Detectado</span>
                                            <span className="truncate">Rede: <b>{dev.actualName}</b></span>
                                            <span className="truncate">Local: <b>{dev.name}</b></span>
                                        </div>
                                        <button
                                            onClick={(e) => { e.stopPropagation(); handleProvision(dev); }}
                                            className="w-full bg-amber-500 hover:bg-amber-600 text-white font-medium py-1.5 rounded transition-colors shadow-sm"
                                        >
                                            Corrigir Identidade
                                        </button>
                                    </div>
                                ) : (
                                    <div className="flex justify-between items-center">
                                        <span className="text-green-600 dark:text-green-400 font-medium text-[10px] flex items-center gap-1">
                                            <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
                                            Online & Pronto
                                        </span>
                                        {isSelected && (
                                            <span className="text-blue-600 dark:text-blue-400 font-medium text-[10px]">
                                                Alvo Ativo
                                            </span>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </aside>
    );
}