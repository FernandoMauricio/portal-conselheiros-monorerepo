// apps/web/src/pages/DashboardPage.tsx
import { useEffect, useState } from "react";
import api from "../services/api";

type Metrics = {
    reunioes: number;
    conselheiros: number;
    dispositivos: number;
    atividade: { id: string; texto: string; }[];
};

export default function DashboardPage() {
    const [m, setM] = useState < Metrics | null > (null);

    useEffect(() => {
        (async () => {
            // Tenta pegar métricas reais (ver rota no passo 3)
            try {
                const { data } = await api.get < Metrics > ("/stats");
                setM(data);
            } catch {
                // fallback opcional
                setM({
                    reunioes: 0,
                    conselheiros: 0,
                    dispositivos: 0,
                    atividade: [],
                });
            }
        })();
    }, []);

  return (
      <div className="mx-auto max-w-6xl p-6 space-y-6">
          <div className="flex items-center justify-between">
              <h1 className="text-2xl font-semibold">Dashboard</h1>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
              <StatCard title="Reuniões Agendadas" value={m?.reunioes ?? "..."} />
              <StatCard title="Conselheiros Ativos" value={m?.conselheiros ?? "..."} />
              <StatCard title="Dispositivos Autorizados" value={m?.dispositivos ?? "..."} />
      </div>

          <div className="rounded-2xl border bg-white p-4 shadow-sm">
              <h2 className="mb-3 text-lg font-medium">Atividade Recente</h2>
              <ul className="list-disc pl-5 space-y-1">
                  {(m?.atividade ?? []).map((a) => (
                      <li key={a.id} className="text-sm text-slate-700">
                          {a.texto}
                      </li>
                  ))}
                  {!m?.atividade?.length && (
                      <li className="text-sm text-slate-500">Sem atividades ainda.</li>
                  )}
        </ul>
      </div>
    </div>
  );
}

function StatCard({ title, value }: { title: string; value: number | string; }) {
    return (
        <div className="rounded-2xl border bg-white p-4 shadow-sm">
            <div className="text-sm text-slate-500">{title}</div>
            <div className="mt-2 text-3xl font-semibold">{value}</div>
        </div>
    );
}
