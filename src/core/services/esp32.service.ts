export async function provisionDevice(ip: string, newName: string): Promise<{ status: string; message?: string }> {
    const response = await fetch(`/api/provision`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ ip, name: newName }),
    });

    if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || `HTTP Status: ${response.status}`);
    }

    return response.json();
}

export async function deployMesh(ip: string, meshPayload: Record<string, unknown>): Promise<{ status: string }> {
    const response = await fetch(`/api/deploy`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ ip, payload: meshPayload }),
    });

    if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || `Falha HTTP Status: ${response.status}`);
    }

    return response.json();
}