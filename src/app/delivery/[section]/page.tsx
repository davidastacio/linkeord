"use client";

import { use, useState, useEffect } from "react";
import { Check, MapPin, Phone, Package, Clock } from "lucide-react";
import { DeliveryShell } from "@/components/delivery/delivery-shell";
import { OrderStatusBadge } from "@/components/order-status-badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useOrderStorage } from "@/components/order-flow/store";
import { deliveryAgents } from "@/lib/mock";

// Statuses a delivery agent can advance to
const deliveryStatuses = [
  "Recogido",
  "En camino",
  "Entregado",
];

const sectionTitles: Record<string, string> = {
  pedidos: "Pedidos asignados",
  "en-camino": "En camino",
  historial: "Historial de entregas",
  ganancias: "Mis ganancias",
  perfil: "Mi perfil",
};

// Resolve active delivery agent from localStorage (set on /delivery)
function useCurrentAgent() {
  const [agentId, setAgentId] = useState<string | null>(null);

  useEffect(() => {
    // We store selectedAgent in sessionStorage from the selector page
    const stored = sessionStorage.getItem("linkeo_delivery_agent");
    // Fallback to DEL-001 for demo
    setAgentId(stored ?? "DEL-001");
  }, []);

  const agent = deliveryAgents.find(a => a.id === (agentId ?? "DEL-001")) ?? deliveryAgents[0];
  return agent;
}

export default function DeliverySectionPage({ params }: { params: Promise<{ section: string }> }) {
  const { section } = use(params);
  const title = sectionTitles[section] ?? "Delivery";
  const agent = useCurrentAgent();
  const { orders, updateOrderStatus } = useOrderStorage();
  const [actionOrder, setActionOrder] = useState<any | null>(null);

  // Filter orders for this agent
  const myOrders = orders.filter((o: any) => o.deliveryId === agent.id);
  const activeOrders = myOrders.filter((o: any) =>
    ["Delivery asignado", "Recogido", "En camino"].includes(o.status)
  );
  const doneOrders = myOrders.filter((o: any) =>
    ["Entregado", "Pagado"].includes(o.status)
  );
  const inTransit = myOrders.filter((o: any) => o.status === "En camino");

  // Per-delivery earnings: RD$200 base per delivered order
  const deliveryEarnings = doneOrders.map((o: any) => ({
    orderId: o.id,
    amount: 200,
    date: o.date,
    status: o.status,
  }));
  const totalDeliveryEarnings = deliveryEarnings.length * 200;

  return (
    <DeliveryShell title={title} eyebrow="Panel Delivery" agentName={agent.name}>

      {/* ── PEDIDOS ASIGNADOS ── */}
      {section === "pedidos" && (
        <div className="space-y-4">
          {activeOrders.length === 0 ? (
            <Card className="shadow-sm">
              <CardContent className="py-12 text-center text-muted-foreground">
                No tienes pedidos asignados en este momento.
              </CardContent>
            </Card>
          ) : (
            activeOrders.map((order: any) => (
              <Card key={order.id} className="shadow-sm">
                <CardContent className="pt-5 pb-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <p className="text-lg font-black text-primary">{order.id}</p>
                        <OrderStatusBadge status={order.status as never} />
                      </div>
                      <p className="mt-1 text-sm font-bold text-navy">{order.product}</p>

                      <div className="mt-4 space-y-2">
                        <div className="flex items-start gap-2 text-sm">
                          <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
                          <div>
                            <p className="text-xs font-bold uppercase text-amber-600">Recoger en</p>
                            <p className="text-muted-foreground">{order.pickupAddress || "Dirección no disponible"}</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-2 text-sm">
                          <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                          <div>
                            <p className="text-xs font-bold uppercase text-primary">Entregar en</p>
                            <p className="text-muted-foreground">{order.deliveryAddress || "Dirección no disponible"}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Phone className="h-4 w-4 shrink-0 text-emerald-600" />
                          <p className="font-bold text-navy">{order.customerPhone || "Sin teléfono"}</p>
                        </div>
                        {order.estimatedArrival && (
                          <div className="flex items-center gap-2 text-sm">
                            <Clock className="h-4 w-4 shrink-0 text-muted-foreground" />
                            <p className="text-muted-foreground">Estimado: {order.estimatedArrival}</p>
                          </div>
                        )}
                        {order.notes && (
                          <div className="rounded-md bg-amber-50 px-3 py-2 text-sm text-amber-800">
                            📝 {order.notes}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground">Total</p>
                      <p className="font-black text-navy">{order.amount}</p>
                      <p className="text-xs text-emerald-600 font-bold mt-0.5">+RD$ 200 ganancia</p>
                    </div>
                  </div>

                  {/* Action buttons */}
                  <div className="mt-5 flex flex-wrap gap-2 border-t border-border pt-4">
                    {deliveryStatuses.map(s => {
                      const isCurrent = order.status === s;
                      const isPast = deliveryStatuses.indexOf(s) < deliveryStatuses.indexOf(order.status);
                      return (
                        <button
                          key={s}
                          disabled={isCurrent || isPast}
                          onClick={() => updateOrderStatus(order.id, s)}
                          className={`flex items-center gap-1.5 rounded-md px-4 py-2 text-sm font-bold transition-colors ${
                            isCurrent
                              ? "bg-primary/10 text-primary cursor-default"
                              : isPast
                              ? "bg-secondary text-muted-foreground/50 cursor-not-allowed line-through"
                              : "bg-[#0e3d2f] text-white hover:bg-[#0e3d2f]/90"
                          }`}
                        >
                          {(isCurrent || isPast) && <Check className="h-3.5 w-3.5" />}
                          {s}
                        </button>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}

      {/* ── EN CAMINO ── */}
      {section === "en-camino" && (
        <div className="space-y-4">
          {inTransit.length === 0 ? (
            <Card className="shadow-sm">
              <CardContent className="py-12 text-center text-muted-foreground">
                No tienes pedidos en camino ahora mismo.
              </CardContent>
            </Card>
          ) : (
            inTransit.map((order: any) => (
              <Card key={order.id} className="shadow-sm border-[#0e3d2f]/20">
                <CardContent className="pt-5 pb-5">
                  <div className="flex items-center gap-3 mb-3">
                    <p className="text-lg font-black text-primary">{order.id}</p>
                    <OrderStatusBadge status="En camino" />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-start gap-2 text-sm">
                      <MapPin className="mt-0.5 h-4 w-4 text-primary" />
                      <p className="text-muted-foreground">{order.deliveryAddress || "—"}</p>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="h-4 w-4 text-emerald-600" />
                      <a href={`tel:${order.customerPhone}`} className="font-bold text-emerald-700 hover:underline">
                        {order.customerPhone || "Sin teléfono"}
                      </a>
                    </div>
                    {order.estimatedArrival && (
                      <div className="flex items-center gap-2 text-sm">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <p className="text-muted-foreground">ETA: {order.estimatedArrival}</p>
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => updateOrderStatus(order.id, "Entregado")}
                    className="mt-4 w-full rounded-md bg-emerald-600 py-2.5 text-sm font-black text-white hover:bg-emerald-700"
                  >
                    ✓ Marcar como entregado
                  </button>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}

      {/* ── HISTORIAL ── */}
      {section === "historial" && (
        <Card className="shadow-sm">
          <CardHeader><CardTitle>Historial de entregas</CardTitle></CardHeader>
          <CardContent>
            {doneOrders.length === 0 ? (
              <p className="py-8 text-center text-muted-foreground">Sin entregas completadas.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[600px] text-sm text-left">
                  <thead>
                    <tr className="border-b border-border text-xs text-muted-foreground">
                      <th className="py-3 font-black">Pedido</th>
                      <th className="py-3 font-black">Dirección</th>
                      <th className="py-3 font-black">Fecha</th>
                      <th className="py-3 font-black">Estado</th>
                      <th className="py-3 font-black">Ganancia</th>
                    </tr>
                  </thead>
                  <tbody>
                    {doneOrders.map((o: any) => (
                      <tr key={o.id} className="border-b border-border last:border-0">
                        <td className="py-3 font-black text-primary">{o.id}</td>
                        <td className="py-3 text-muted-foreground max-w-[200px] truncate">{o.deliveryAddress || "—"}</td>
                        <td className="py-3 text-muted-foreground">{o.date}</td>
                        <td className="py-3"><OrderStatusBadge status={o.status as never} /></td>
                        <td className="py-3 font-bold text-emerald-600">+RD$ 200</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* ── GANANCIAS ── */}
      {section === "ganancias" && (
        <div className="grid gap-6 xl:grid-cols-[1fr_0.55fr]">
          <Card className="shadow-sm">
            <CardHeader><CardTitle>Historial de ganancias por entrega</CardTitle></CardHeader>
            <CardContent>
              {deliveryEarnings.length === 0 ? (
                <p className="py-8 text-center text-muted-foreground">Sin ganancias registradas.</p>
              ) : (
                <div className="space-y-3">
                  {deliveryEarnings.map(e => (
                    <div key={e.orderId} className="flex items-center justify-between rounded-lg border border-border p-4">
                      <div>
                        <p className="font-black text-navy">Entrega {e.orderId}</p>
                        <p className="text-sm text-muted-foreground">{e.date}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xl font-black text-emerald-600">+RD$ 200</p>
                        <OrderStatusBadge status={e.status as never} />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
          <Card className="shadow-sm">
            <CardContent className="pt-6">
              <p className="text-sm font-bold text-muted-foreground">Total acumulado</p>
              <p className="mt-2 text-4xl font-black text-emerald-600">
                RD$ {(agent.earnings + totalDeliveryEarnings).toLocaleString("en-US")}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                {agent.deliveries + doneOrders.length} entregas totales
              </p>
              <div className="mt-6 space-y-3">
                {[
                  { label: "Esta sesión", value: `RD$ ${totalDeliveryEarnings.toLocaleString("en-US")}` },
                  { label: "Histórico previo", value: `RD$ ${agent.earnings.toLocaleString("en-US")}` },
                  { label: "Rating actual", value: `${agent.rating} ★` },
                ].map(f => (
                  <div key={f.label} className="flex items-center justify-between rounded-lg bg-secondary p-3">
                    <p className="text-sm font-bold text-muted-foreground">{f.label}</p>
                    <p className="font-black text-navy">{f.value}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* ── PERFIL ── */}
      {section === "perfil" && (
        <div className="grid gap-6 xl:grid-cols-[0.5fr_1fr]">
          <Card className="shadow-sm">
            <CardContent className="pt-6 text-center">
              <div className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-[#0e3d2f] text-2xl font-black text-white">
                {agent.name.slice(0, 2).toUpperCase()}
              </div>
              <p className="mt-4 text-xl font-black text-navy">{agent.name}</p>
              <p className="mt-1 text-sm text-muted-foreground">{agent.phone}</p>
              <div className="mt-4 inline-block rounded-full bg-emerald-100 px-4 py-1.5 text-sm font-black text-emerald-700">
                {agent.zone}
              </div>
              <div className="mt-6 grid grid-cols-3 gap-3 border-t border-border pt-6 text-center">
                <div><p className="text-xl font-black text-navy">{agent.deliveries}</p><p className="mt-1 text-xs text-muted-foreground">Entregas</p></div>
                <div><p className="text-xl font-black text-navy">{agent.rating}★</p><p className="mt-1 text-xs text-muted-foreground">Rating</p></div>
                <div><p className="text-xl font-black text-navy">{agent.vehicle}</p><p className="mt-1 text-xs text-muted-foreground">Vehículo</p></div>
              </div>
            </CardContent>
          </Card>
          <Card className="shadow-sm">
            <CardHeader><CardTitle>Datos del perfil</CardTitle></CardHeader>
            <CardContent className="space-y-0 divide-y divide-border">
              {[
                { label: "Nombre completo", value: agent.name },
                { label: "Teléfono", value: agent.phone },
                { label: "Zona de cobertura", value: agent.zone },
                { label: "Vehículo", value: agent.vehicle },
                { label: "ID de agente", value: agent.id },
                { label: "Estado", value: agent.status },
              ].map(f => (
                <div key={f.label} className="grid grid-cols-[160px_1fr] items-center gap-4 py-4">
                  <p className="text-sm font-bold text-muted-foreground">{f.label}</p>
                  <p className="font-black text-navy">{f.value}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      )}

    </DeliveryShell>
  );
}
