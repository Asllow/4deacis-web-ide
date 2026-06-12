import type { Node, Edge } from "@xyflow/react";

export interface IBlockPayload {
    id: string;
    type: string;
    config: Record<string, unknown>;
}

export interface IConnectionPayload {
    source: string;
    target: string;
}

export interface IDeployPayload {
    ip: string;
    payload: {
        network_name: string;
        blocks: IBlockPayload[];
        connections: IConnectionPayload[];
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
                connections: []
            });
        }

        const rawConfig = node.data?.config ? { ...(node.data.config as Record<string, unknown>) } : {};
        const cleanConfig: Record<string, unknown> = {};

        for (const [key, value] of Object.entries(rawConfig)) {
            if (value !== null && value !== undefined && value !== "") {
                cleanConfig[key] = value;
            }
        }
        
        if (node.data?.blockType === "Sandbox" && typeof cleanConfig.script === "string") {
            cleanConfig.script_b64 = btoa(unescape(encodeURIComponent(cleanConfig.script)));
            delete cleanConfig.script;
        }

        deployments.get(targetIp)!.blocks.push({
            id: node.id,
            type: (node.data?.blockType as string) || "Unknown",
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
        
        const sanitizePort = (handle: string) => {
            const port = handle.includes("-") ? handle.split("-").pop() || handle : handle;
            return port.replace(/^(EV_IN_|EV_OUT_|DT_IN_|DT_OUT_)/, "");
        };

        const srcPort = sanitizePort(rawSrc);
        const dstPort = sanitizePort(rawDst);
        
        const isEvent = rawSrc.includes("EV_") || rawSrc.includes("event") || edge.type === "event";

        if (srcIp === dstIp) {
            deployments.get(srcIp)!.connections.push({
                source: `${edge.source}.${srcPort}`,
                target: `${edge.target}.${dstPort}`
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

            deployments.get(srcIp)!.connections.push({
                source: `${edge.source}.${srcPort}`,
                target: `${pubId}.IN`
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

            deployments.get(dstIp)!.connections.push({
                source: `${subId}.OUT`,
                target: `${edge.target}.${dstPort}`
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