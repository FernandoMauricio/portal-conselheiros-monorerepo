// apps/web/src/components/Layout.tsx
import { type ReactNode } from "react";
import { NavLink } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

type LayoutProps = {
    children: ReactNode;
};

export default function Layout({ children }: LayoutProps) {
    const { logout } = useAuth();
    const email = localStorage.getItem("userEmail") || "Usuário";

    const itemCls = ({ isActive }: { isActive: boolean; }) =>
        `block py-2.5 px-4 rounded transition duration-200 ${isActive ? "bg-gray-700" : "hover:bg-gray-700"
        }`;

    return (
        <div className="flex h-screen bg-gray-100">
            {/* Sidebar */}
            <div className="w-64 bg-gray-800 text-white flex flex-col">
                <div className="p-6 text-2xl font-bold border-b border-gray-700 senac-text-orange">
                    Portal Conselheiros
                </div>
                <nav className="flex-1 px-4 py-6 space-y-2">
                    <NavLink to="/" className={itemCls}>Dashboard</NavLink>
                    <NavLink to="/conselheiros" className={itemCls}>Conselheiros</NavLink>
                    <NavLink to="/reunioes" className={itemCls}>Reuniões</NavLink>
                    <NavLink to="/dispositivos" className={itemCls}>Dispositivos</NavLink>
                </nav>
                <div className="p-4 border-t border-gray-700">
                    <button
                        onClick={logout}
                        className="w-full bg-red-600 text-white py-2 px-4 rounded hover:bg-red-700 transition duration-200"
                    >
                        Sair
                    </button>
                </div>
            </div>

            {/* Main */}
            <div className="flex-1 flex flex-col overflow-hidden">
                <header className="flex justify-between items-center p-6 bg-white border-b border-gray-200 shadow-sm">
                    <h1 className="text-3xl font-semibold text-gray-800">
                        Bem-vindo(a), {email}!
                    </h1>
                </header>
                <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100">
                    {children}
                </main>
            </div>
        </div>
    );
}
