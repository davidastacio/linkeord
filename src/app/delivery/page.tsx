"use client";

import { useState } from "react";
import Link from "next/link";
import { CheckCircle2, ClipboardList, Truck, History, ChevronRight } from "lucide-react";
import { DeliveryShell } from "@/components/delivery/delivery-shell";
import { OrderStatusBadge } from "@/components/order-status-badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { deliveryAgents } from "@/lib/mock";
import { recentOrders } from "@/lib/mock-data";

export default function DeliveryIndexPage() {
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null);

  const agent = selectedAgent
    ? deliveryAgents.find(a => a.id === selectedAgent)
    : null;

  // Orders assigned to this agent (use localStorage-persisted orders in real scenario,
  // here we seed from mock for demo)
  const myOrders = recentOrders.filter(o => o.deliveryId === selectedAgent);
  const activeOrders = myOrders.filter(o =>
    ["Delivery asignado", "Recogido", "En camino"].includes(o.status)
  );
  const doneOrders = myOrders.filter(o =>
    ["Entregado", "Pagado"].includes(o.status)
  );

  if (!selectedAgent) {
    return (
      <div className="min-h-screen bg-[#f4f9f7] flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="mb-8 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#0e3d2f] text-white">
              <Truck className="h-8 w-8" />
            </div>
            <h1 className="mt-4 text-2xl font-black text-navy">Panel Delivery</h1>
            <p className="mt-2 text-muted-foreground">Selecciona tu perfil para continuar</p>
          </div>
          <div className="space-y-3">
            {deliveryAgents.map(agent => (
              <button
                key={agent.id}
                onClick={() => setSelectedAgent(agent.id)}
                className="flex w-full items-center justify-between rounded-xl border border-border bg-white p-5 text-left shadow-sm transition hover:border-[#0e3d2f]/30 hover:shadow-md"
              >
                <div className="flex items-center gap-4">
                  <div className="grid h-12 w-12 place-items-center rounded-full bg-[#0e3d2f]/10 text-sm font-black text-[#0e3d2f]">
                    {agent.name.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-black text-navy">{agent.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {agent.zone} · {agent.vehicle} · {agent.rating}★
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {agent.deliveries} entregas totales
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <OrderStatusBadge status={agent.status as never} />
                  <ChevronRight className="h-5 w-5 text-muted-foreground" />
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <DeliveryShell
      title="Dashboard"
      eyebrow="Panel Delivery"
      agentName={agent!.name}
    >
      {/* Summary Metrics */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4 mb-6">
        {[
          { label: "Pedidos activos", value: activeOrders.length, icon: ClipboardList, color: "bg-amber-50 text-amber-700" },
          { label: "Entregados hoy", value: doneOrders.length, icon: CheckCircle2, color: "bg-emerald-50 text-emerald-700" },
          { label: "Entregas totales", value: agent!.deliveries, icon: History, color: "bg-blue-50 text-blue-700" },
          { label: "Ganancias acumuladas", value: `RD$ ${agent!.earnings.toLocaleString("en-US")}`, icon: Truck, color: "bg-purple-50 text-purple-700" },
        ].map(m => (
          <Card key={m.label} className="shadow-sm">
            <CardContent className="flex items-center gap-4 pt-5 pb-5">
              <div className={`grid h-12 w-12 shrink-0 place-items-center rounded-xl ${m.color}`}>
                <m.icon className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm font-bold text-muted-foreground">{m.label}</p>
                <p className="text-2xl font-black text-navy">{m.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Active Orders */}
      <Card className="shadow-sm mb-6">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Pedidos activos</CardTitle>
          <Link href="/delivery/pedidos" className="text-sm font-bold text-primary hover:underline">
            Ver todos →
          </Link>
        </CardHeader>
        <CardContent>
          {activeOrders.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground">
              No tienes pedidos asignados en este momento.
            </div>
          ) : (
            <div className="space-y-3">
              {activeOrders.map(order => (
                <div key={order.id} className="flex items-center justify-between rounded-lg border border-border p-4">
                  <div>
                    <p className="font-black text-primary">{order.id}</p>
                    <p className="text-sm text-muted-foreground">{order.deliveryAddress || "Dirección no disponible"}</p>
                  </div>
                  <OrderStatusBadge status={order.status as never} />
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Switch agent */}
      <div className="text-center">
        <button
          onClick={() => setSelectedAgent(null)}
          className="text-sm font-bold text-muted-foreground hover:text-primary hover:underline"
        >
          Cambiar de perfil
        </button>
      </div>
    </DeliveryShell>
  );
}
