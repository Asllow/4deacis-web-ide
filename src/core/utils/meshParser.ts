import type { Node, Edge } from "@xyflow/react";

export interface IBlockPayload {
    id: string;
    type: string;
    config: Record<string, unknown>;
}

export interface IConnectionPayload {
    src: string;
    src_port: string;
    dst: string;
    dst_port: string;
}

export interface IDeployPayload {
    ip: string;
    payload: {
        network_name: string;
        blocks: IBlockPayload[];
        event_connections: IConnectionPayload[];
        data_connections: IConnectionPayload[];
    };
}

export function generateDistributedMesh(nodes: Node[], edges: Edge[], networkName: string = "TCC_Network"): IDeployPayload[] {
    const deployments = new Map<string, IDeployPayload['payload']>();
    let udpPortAllocator = 60000;

    nodes.forEach(node => {
        const targetIp = (node.data?.targetIp as string) || "UNMAPPED";
        
        if (!deployments.has(targetIp)) {
            deployments.set(targetIp, {
                network_name: networkName,
                blocks: [],
                event_connections: [],
                data_connections: []
            });
        }

        const rawConfig = node.data?.config ? { ...(node.data.config as Record<string, unknown>) } : {};
        const cleanConfig: Record<string, unknown> = {};

        // Sanitização Rigorosa: Remove nulos, undefined e strings vazias
        for (const [key, value] of Object.entries(rawConfig)) {
            if (value !== null && value !== undefined && value !== "") {
                cleanConfig[key] = value;
            }
        }
        
        if (node.type === "Sandbox" && typeof cleanConfig.script === "string") {
            cleanConfig.script_b64 = btoa(unescape(encodeURIComponent(cleanConfig.script)));
            delete cleanConfig.script;
        }

        deployments.get(targetIp)!.blocks.push({
            id: node.id,
            type: node.type || "Unknown",
            config: cleanConfig
        });
    });

    edges.forEach(edge => {
        const srcNode = nodes.find(n => n.id === edge.source);
        const dstNode = nodes.find(n => n.id === edge.target);
        
        if (!srcNode || !dstNode) return;

        const srcIp = (srcNode.data?.targetIp as string) || "UNMAPPED";
        const dstIp = (dstNode.data?.targetIp as string) || "UNMAPPED";

        const rawSrc = String(edge.sourceHandle || "");
        const rawDst = String(edge.targetHandle || "");
        const srcPort = rawSrc.split("-").slice(1).join("-") || rawSrc;
        const dstPort = rawDst.split("-").slice(1).join("-") || rawDst;
        
        const isEvent = rawSrc.includes("event") || edge.type === "event";
        const connType = isEvent ? 'event_connections' : 'data_connections';

        if (srcIp === dstIp) {
            deployments.get(srcIp)![connType].push({
                src: edge.source,
                src_port: srcPort,
                dst: edge.target,
                dst_port: dstPort
            });
        } else {
            const currentUdpPort = udpPortAllocator++;
            const pubId = `PUB_${edge.id}`;
            const subId = `SUB_${edge.id}`;

            deployments.get(srcIp)!.blocks.push({
                id: pubId,
                type: isEvent ? "EventPublisher" : "DataPublisher",
                config: { 
                    ip_dest: dstIp, 
                    port: currentUdpPort, 
                    network_id: edge.id 
                }
            });

            deployments.get(srcIp)![connType].push({
                src: edge.source,
                src_port: srcPort,
                dst: pubId,
                dst_port: "IN"
            });

            deployments.get(dstIp)!.blocks.push({
                id: subId,
                type: isEvent ? "EventSubscriber" : "DataSubscriber",
                config: { 
                    listen_ip: "0.0.0.0", 
                    port: currentUdpPort, 
                    network_id: edge.id 
                }
            });

            deployments.get(dstIp)![connType].push({
                src: subId,
                src_port: "OUT",
                dst: edge.target,
                dst_port: dstPort
            });
        }
    });

    const results: IDeployPayload[] = [];
    deployments.forEach((payload, ip) => {
        if (ip !== "UNMAPPED") {
            results.push({ ip, payload });
        }
    });

    return results;
}