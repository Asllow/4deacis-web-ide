"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/shared/store/authStore";

export default function LoginPage() {
    const [username, setUsername] = useState("");
    const login = useAuthStore((state) => state.login);
    const router = useRouter();

    const handleAuthentication = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        
        const sanitizedUsername = username.trim();
        if (!sanitizedUsername) return;

        login(sanitizedUsername);
        router.push("/");
    };

    return (
        <main className="flex min-h-screen items-center justify-center bg-neutral-100 dark:bg-neutral-950 font-sans">
            <section className="w-full max-w-sm p-8 bg-white dark:bg-neutral-900 rounded shadow-md border border-neutral-200 dark:border-neutral-800">
                <header className="mb-8 text-center">
                    <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 tracking-tight">
                        4diac Web IDE
                    </h1>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                        Autenticação Obrigatória
                    </p>
                </header>

                <form onSubmit={handleAuthentication} className="flex flex-col gap-5">
                    <div className="flex flex-col gap-1.5">
                        <label htmlFor="username" className="text-xs font-bold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider">
                            Credencial de Engenheiro
                        </label>
                        <input
                            id="username"
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            placeholder="Insira seu identificador..."
                            className="w-full p-2.5 text-sm border border-neutral-300 dark:border-neutral-700 rounded bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                            required
                            autoComplete="off"
                        />
                    </div>
                    
                    <button
                        type="submit"
                        className="w-full mt-2 bg-blue-600 hover:bg-blue-500 text-white font-bold py-2.5 px-4 rounded transition-colors shadow-sm"
                    >
                        Acessar Ambiente
                    </button>
                </form>
            </section>
        </main>
    );
}