import { create } from "zustand";

interface IAuthState {
    user: string | null;
    login: (username: string) => void;
    logout: () => void;
}

export const useAuthStore = create<IAuthState>((set) => ({
    user: typeof window !== "undefined" ? localStorage.getItem("@4deacis/user") : null,
    
    login: (username: string) => {
        localStorage.setItem("@4deacis/user", username);
        set({ user: username });
    },
    
    logout: () => {
        localStorage.removeItem("@4deacis/user");
        set({ user: null });
    },
}));