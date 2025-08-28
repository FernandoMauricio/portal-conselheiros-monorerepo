import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

function Layout({ children }) {
  const { logout } = useAuth();

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-64 bg-gray-800 text-white flex flex-col">
        <div className="p-6 text-2xl font-bold border-b border-gray-700 senac-text-orange">
          Portal Conselheiros
        </div>
        <nav className="flex-1 px-4 py-6 space-y-2">
          <Link to="/" className="block py-2.5 px-4 rounded transition duration-200 hover:bg-gray-700">
            Dashboard
          </Link>
          <Link to="/conselheiros" className="block py-2.5 px-4 rounded transition duration-200 hover:bg-gray-700">
            Conselheiros
          </Link>
          <Link to="/reunioes" className="block py-2.5 px-4 rounded transition duration-200 hover:bg-gray-700">
            Reuniões
          </Link>
          <Link to="/dispositivos" className="block py-2.5 px-4 rounded transition duration-200 hover:bg-gray-700">
            Dispositivos
          </Link>
          {/* Add more navigation links as needed */}
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

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="flex justify-between items-center p-6 bg-white border-b border-gray-200 shadow-sm">
          <h1 className="text-3xl font-semibold text-gray-800">Bem-vindo(a), {localStorage.getItem("userEmail") || "Usuário"}!</h1>
          {/* User profile or notifications can go here */}
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100">
          {children}
        </main>
      </div>
    </div>
  );
}

export default Layout;

