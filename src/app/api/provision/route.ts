import { NextResponse } from "next/server";

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { ip, name } = body;

        if (!ip || !name) {
            return NextResponse.json({ error: "IP e nome são obrigatorios" }, { status: 400 });
        }

        const response = await fetch(`http://${ip}/provision`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ name }),
        });

        if (!response.ok) {
            return NextResponse.json({ error: "Falha na comunicação com ESP32" }, { status: response.status });
        }

        const data = await response.json();
        return NextResponse.json(data);
    } catch {
        return NextResponse.json({ error: "Erro interno no servidor proxy" }, { status: 500 });
    }
}