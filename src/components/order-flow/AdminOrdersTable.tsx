"use client";

import { useState } from "react";
import { Check, Copy, Truck } from "lucide-react";
import { OrderStatusBadge } from "@/components/order-status-badge";
import { useOrderStorage } from "./store";
import { deliveryAgents } from "@/lib/mock";
import type { OrderStatus } from "@/lib/mock/types";

export function AdminOrdersTable() {
  const { orders, updateOrderStatus, assignDelivery } = useOrderStorage();
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
  const [mode, setMode] = useState<"status" | "delivery">("status");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const availableStatuses: OrderStatus[] = [
    "Pendiente",
    "Confirmado",
    "Solicitado a tienda",
    "Delivery asignado",
    "Recogido",
    "En camino",
    "Entregado",
    "Cancelado",
    "Pagado"
  ];

  const getTrackingUrl = (orderId: string) => {
    const id = orderId.replace("#", "");
    if (typeof window !== "undefined") {
      return `${window.location.origin}/track/${id}`;
    }
    return `/track/${id}`;
  };

  const copyTrackingLink = (orderId: string) => {
    const url = getTrackingUrl(orderId);
    navigator.clipboard.writeText(url).then(() => {
      setCopiedId(orderId);
      setTimeout(() => setCopiedId(null), 2000);
    });
  };

  const getAgentName = (deliveryId: string) => {
    const found = deliveryAgents.find(a => a.id === deliveryId);
    return found?.name ?? deliveryId;
  };

  return (
    <>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[920px] text-left text-sm">
          <thead className="text-xs text-muted-foreground">
            <tr className="border-b border-border">
              <th className="py-3 font-black">Pedido</th>
              <th className="py-3 font-black">Emprendedor</th>
              <th className="py-3 font-black">Cliente</th>
              <th className="py-3 font-black">Producto</th>
              <th className="py-3 font-black">Total</th>
              <th className="py-3 font-black">Delivery</th>
              <th className="py-3 font-black">Estado</th>
              <th className="py-3 font-black">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order: any) => (
              <tr key={order.id} className="border-b border-border last:border-0 hover:bg-secondary/50">
                <td className="py-4 font-black text-primary">{order.id}</td>
                <td className="py-4 font-semibold text-navy">{order.entrepreneur || order.entrepreneurName || "—"}</td>
                <td className="py-4 text-muted-foreground">{order.customerName || order.customer || "—"}</td>
                <td className="py-4 text-muted-foreground">{order.productName || order.product || "—"}</td>
                <td className="py-4 font-black text-navy">RD$ {Number(order.amount || 0).toLocaleString("en-US")}</td>
                <td className="py-4 text-sm text-muted-foreground">
                  {order.deliveryName ?? getAgentName(order.deliveryId) ?? "—"}
                </td>
                <td className="py-4">
                  <OrderStatusBadge status={order.status as never} />
                </td>
                <td className="py-4">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => { setSelectedOrder(order); setMode("status"); }}
                      className="rounded-md border border-border px-3 py-1 text-xs font-bold text-navy hover:bg-secondary"
                    >
                      Gestionar
                    </button>
                    <button
                      onClick={() => copyTrackingLink(order.id)}
                      title="Copiar link de tracking"
                      className="rounded-md border border-border p-1.5 text-muted-foreground hover:bg-secondary hover:text-primary"
                    >
                      {copiedId === order.id ? (
                        <Check className="h-3.5 w-3.5 text-emerald-600" />
                      ) : (
                        <Copy className="h-3.5 w-3.5" />
                      )}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-sm rounded-xl bg-white p-6 shadow-xl">
            <h2 className="text-xl font-black text-navy">Gestionar Pedido</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              ID: <strong className="text-navy">{selectedOrder.id}</strong>
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              Estado actual: <strong className="text-navy">{selectedOrder.status}</strong>
            </p>
            {selectedOrder.deliveryAddress && (
              <p className="mt-1 text-xs text-muted-foreground">
                📍 {selectedOrder.deliveryAddress}
              </p>
            )}

            {/* Tab selector */}
            <div className="mt-4 flex gap-2">
              <button
                onClick={() => setMode("status")}
                className={`flex-1 rounded-md py-1.5 text-sm font-bold transition-colors ${
                  mode === "status" ? "bg-primary text-white" : "border border-border text-navy hover:bg-secondary"
                }`}
              >
                Estado
              </button>
              <button
                onClick={() => setMode("delivery")}
                className={`flex-1 flex items-center justify-center gap-1.5 rounded-md py-1.5 text-sm font-bold transition-colors ${
                  mode === "delivery" ? "bg-primary text-white" : "border border-border text-navy hover:bg-secondary"
                }`}
              >
                <Truck className="h-3.5 w-3.5" /> Delivery
              </button>
            </div>

            {mode === "status" && (
              <div className="mt-4 space-y-2">
                <p className="text-sm font-bold text-navy">Cambiar Estado:</p>
                {availableStatuses.map(status => (
                  <button
                    key={status}
                    onClick={() => {
                      updateOrderStatus(selectedOrder.id, status);
                      setSelectedOrder(null);
                    }}
                    className={`w-full rounded-md border px-4 py-2 text-left text-sm font-bold transition-colors ${
                      selectedOrder.status === status
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border text-muted-foreground hover:bg-secondary hover:text-navy"
                    }`}
                  >
                    {status}
                  </button>
                ))}
              </div>
            )}

            {mode === "delivery" && (
              <div className="mt-4 space-y-2">
                <p className="text-sm font-bold text-navy">Asignar Delivery:</p>
                {deliveryAgents.map(agent => (
                  <button
                    key={agent.id}
                    onClick={() => {
                      assignDelivery(selectedOrder.id, agent.id, agent.name);
                      setSelectedOrder(null);
                    }}
                    className={`w-full rounded-md border px-4 py-2.5 text-left text-sm font-bold transition-colors ${
                      (selectedOrder.deliveryId === agent.id || selectedOrder.deliveryName === agent.name)
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border text-navy hover:bg-secondary"
                    }`}
                  >
                    <span className="font-black">{agent.name}</span>
                    <span className="ml-2 text-xs font-semibold text-muted-foreground">
                      {agent.zone} · {agent.rating}★ · {agent.deliveries} entregas
                    </span>
                  </button>
                ))}

                <div className="mt-3 rounded-md bg-secondary p-3">
                  <p className="text-xs text-muted-foreground">
                    🔗 Link de tracking:
                  </p>
                  <p className="mt-1 break-all text-xs font-bold text-primary">
                    {getTrackingUrl(selectedOrder.id)}
                  </p>
                  <button
                    onClick={() => copyTrackingLink(selectedOrder.id)}
                    className="mt-2 flex items-center gap-1.5 text-xs font-bold text-primary hover:underline"
                  >
                    <Copy className="h-3 w-3" />
                    {copiedId === selectedOrder.id ? "¡Copiado!" : "Copiar link"}
                  </button>
                </div>
              </div>
            )}

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setSelectedOrder(null)}
                className="w-full rounded-md bg-secondary px-4 py-2 text-sm font-bold text-navy hover:bg-secondary/80"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
