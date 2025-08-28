// apps/web/src/contexts/AuthContext.tsx
import { createContext, useState, useContext, useEffect, type ReactNode } from "react";
import api from "../services/api";

type AuthContextValue = {
    isAuthenticated: boolean;
    login: (email: string, password: string) => Promise<boolean>;
    logout: () => void;
    loading: boolean;
    error: string | null;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const token = localStorage.getItem("accessToken");
        if (token) setIsAuthenticated(true);
        setLoading(false);
    }, []);

    const login: AuthContextValue["login"] = async (email, password) => {
        setLoading(true);
        setError(null);
        try {
            const response = await api.post("/auth/login", { email, password });
            localStorage.setItem("accessToken", response.data.accessToken);
            localStorage.setItem("refreshToken", response.data.refreshToken);
            localStorage.setItem("userEmail", email);
            setIsAuthenticated(true);
            return true;
        } catch (err: any) {
            console.error("Login failed:", err);
            setError(err?.response?.data?.message || "Erro ao fazer login. Verifique suas credenciais.");
            setIsAuthenticated(false);
            return false;
        } finally {
            setLoading(false);
        }
    };

    const logout = () => {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("userEmail");
        setIsAuthenticated(false);
    };

    return (
        <AuthContext.Provider value={{ isAuthenticated, login, logout, loading, error }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = (): AuthContextValue => {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
    return ctx;
};
