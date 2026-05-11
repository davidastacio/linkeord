"use client";

import { useOrderStorage } from "./store";

export function EntrepreneurEarningsList() {
  const { localEarnings } = useOrderStorage();
  const myEarnings = localEarnings.filter((e: any) => e.entrepreneurId === "ENT-001");

  return (
    <div className="space-y-3">
      {myEarnings.map((e: any) => (
        <div key={e.id} className="flex items-center justify-between gap-4 rounded-lg border border-border p-4">
          <div>
            <p className="font-black text-navy">{e.label}</p>
            <p className="mt-1 text-sm text-muted-foreground">{e.orderId} · {e.date}</p>
          </div>
          <div className="text-right">
            <p className="font-black text-emerald-600">RD$ {e.amount.toLocaleString("en-US")}</p>
            <p className="mt-1 text-xs font-bold uppercase text-muted-foreground">{e.type}</p>
          </div>
        </div>
      ))}
      {myEarnings.length === 0 && (
        <p className="py-4 text-center text-sm text-muted-foreground">No tienes ganancias registradas.</p>
      )}
    </div>
  );
}
