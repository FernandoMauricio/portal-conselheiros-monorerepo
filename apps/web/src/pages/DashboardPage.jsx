import React from "react";

function DashboardPage() {
  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Card 1 */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">Reuniões Agendadas</h2>
          <p className="text-gray-600 text-4xl font-bold">12</p>
        </div>

        {/* Card 2 */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">Conselheiros Ativos</h2>
          <p className="text-gray-600 text-4xl font-bold">85</p>
        </div>

        {/* Card 3 */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">Dispositivos Autorizados</h2>
          <p className="text-gray-600 text-4xl font-bold">5</p>
        </div>
      </div>

      <div className="mt-8 bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold text-gray-700 mb-4">Atividade Recente</h2>
        <ul>
          <li className="border-b border-gray-200 py-2">Reunião 


do Conselho de Tecnologia realizada em 15/08/2025.</li>
          <li className="border-b border-gray-200 py-2">Novo conselheiro "Ana Paula" adicionado.</li>
          <li className="py-2">Dispositivo "Tablet-003" autorizado.</li>
        </ul>
      </div>
    </div>
  );
}

export default DashboardPage;

