import { NextResponse } from "next/server";

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { ip, payload } = body;

        if (!ip || !payload) {
            return NextResponse.json({ error: "IP e payload são obrigatórios" }, { status: 400 });
        }

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000); // Limite de 10 segundos

        try {
            const response = await fetch(`http://${ip}/deploy`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
                signal: controller.signal
            });
            
            clearTimeout(timeoutId);

            if (!response.ok) {
                const text = await response.text();
                return NextResponse.json({ 
                    error: `ESP32 (${ip}) recusou o payload. HTTP ${response.status}: ${text}` 
                }, { status: response.status });
            }

            const data = await response.json().catch(() => ({ status: "ok" }));
            return NextResponse.json(data);
            
        } catch (fetchErr) {
            clearTimeout(timeoutId);
            
            if (fetchErr instanceof Error) {
                if (fetchErr.name === 'AbortError') {
                    return NextResponse.json({ error: `Timeout: O ESP32 (${ip}) demorou mais de 10s para responder.` }, { status: 504 });
                }
                return NextResponse.json({ error: `Falha de rede ao tentar contatar ESP32 (${ip}): ${fetchErr.message}` }, { status: 502 });
            }
            
            return NextResponse.json({ error: `Erro desconhecido de rede ao tentar contatar ESP32 (${ip}).` }, { status: 502 });
        }
    } catch (e) {
        const errorMessage = e instanceof Error ? e.message : "Erro desconhecido";
        return NextResponse.json({ error: `Erro interno no servidor Next.js: ${errorMessage}` }, { status: 500 });
    }
}