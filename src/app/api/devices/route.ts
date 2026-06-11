import { NextResponse } from "next/server";
import Bonjour from "bonjour-service";
import fs from "fs/promises";
import path from "path";

export const dynamic = "force-dynamic";

const REGISTRY_PATH = path.join(process.cwd(), "registry.json");

interface IDeviceRegistry {
    [mac: string]: {
        name: string;
        board: string;
        firstSeen: string;
    };
}

export interface IDiscoveredDevice {
    mac: string;
    board: string;
    ip: string;
    port: number;
    name: string;
    actualName: string;
    isNew: boolean;
    hasConflict: boolean;
}

async function getRegistry(): Promise<IDeviceRegistry> {
    try {
        const data = await fs.readFile(REGISTRY_PATH, "utf-8");
        return JSON.parse(data);
    } catch {
        return {};
    }
}

async function saveRegistry(registry: IDeviceRegistry): Promise<void> {
    await fs.writeFile(REGISTRY_PATH, JSON.stringify(registry, null, 4));
}

function generateDeviceName(board: string, registry: IDeviceRegistry): string {
    const prefix = board.replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
    
    let count = 0;
    for (const mac in registry) {
        if (registry[mac].name.startsWith(prefix)) {
            count++;
        }
    }
    
    const sequential = String(count + 1).padStart(4, "0");
    return `${prefix}-${sequential}`;
}

export async function GET() {
    const bonjour = new Bonjour();
    const registry = await getRegistry();
    const discovered: IDiscoveredDevice[] = [];
    let registryUpdated = false;

    return new Promise<NextResponse>((resolve) => {
        const browser = bonjour.find({ type: "http" });

        browser.on("up", (service) => {
            if (!service.txt || !service.txt.mac || !service.txt.board) return;

            const mac = service.txt.mac as string;
            const board = service.txt.board as string;
            const actualName = service.name || "";
            
            const rawAddrs = service.addresses || [];
            const strAddrs = rawAddrs.map((addr: string | { address?: string }) => {
                return typeof addr === "string" ? addr : (addr.address || "");
            });
            
            const ipv4 = strAddrs.find((addr: string) => addr.includes(".")) || strAddrs[0] || "";
            const port = service.port;

            let deviceName = "";
            let isNew = false;
            let hasConflict = false;
            const actualNameStr = String(actualName);

            if (registry[mac]) {
                deviceName = registry[mac].name;
                const safeActual = actualNameStr.trim().toLowerCase();
                const safeExpected = String(deviceName).trim().toLowerCase();
                isNew = false;
                hasConflict = safeActual !== safeExpected;
            } else {
                deviceName = generateDeviceName(board, registry);
                registry[mac] = {
                    name: deviceName,
                    board: board,
                    firstSeen: new Date().toISOString()
                };
                registryUpdated = true;
                isNew = true;
                hasConflict = false;
            }

            discovered.push({
                mac,
                board,
                ip: ipv4,
                port,
                name: deviceName,
                actualName: actualNameStr,
                isNew,
                hasConflict
            });
        });

        setTimeout(async () => {
            browser.stop();
            bonjour.destroy();

            if (registryUpdated) {
                await saveRegistry(registry);
            }

            const uniqueDevices = Array.from(
                new Map(discovered.map((item) => [item.mac, item])).values()
            );

            resolve(NextResponse.json({ devices: uniqueDevices }));
        }, 3000);
    });
}