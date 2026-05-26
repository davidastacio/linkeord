"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { OrderStatusBadge } from "@/components/order-status-badge";
import { useOrderStorage } from "./store";
import { deliveryAgents } from "@/lib/mock";

export function EntrepreneurOrdersTable() {
  const { orders, currentUser } = useOrderStorage();
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const myOrders = orders.filter(
    (o: any) => currentUser ? o.entrepreneurId === currentUser.id : false
  );

  const getAgentName = (order: any) => {
    if (order.deliveryName) return order.deliveryName;
    const found = deliveryAgents.find(a => a.id === order.deliveryId);
    return found?.name ?? null;
  };

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

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[800px] text-sm text-left">
        <thead>
          <tr className="border-b border-border text-xs text-muted-foreground">
            <th className="py-3 font-black">Pedido</th>
            <th className="py-3 font-black">Cliente</th>
            <th className="py-3 font-black">Producto</th>
            <th className="py-3 font-black">Fecha</th>
            <th className="py-3 font-black">Estado</th>
            <th className="py-3 font-black">Delivery</th>
            <th className="py-3 font-black">Total</th>
            <th className="py-3 font-black">Ganancia</th>
            <th className="py-3 font-black">Tracking</th>
          </tr>
        </thead>
        <tbody>
          {myOrders.map((o: any) => {
            const agentName = getAgentName(o);
            const isDelivered = o.status === "Entregado" || o.status === "Pagado";
            return (
              <tr key={o.id} className="border-b border-border last:border-0 hover:bg-secondary/50">
                <td className="py-4 font-black text-primary">{o.id}</td>
                <td className="py-4 font-semibold text-navy">{o.customerName || o.customer || "—"}</td>
                <td className="py-4 text-muted-foreground">{o.productName || o.product || "—"}</td>
                <td className="py-4 text-muted-foreground">{o.date}</td>
                <td className="py-4"><OrderStatusBadge status={o.status as never} /></td>
                <td className="py-4 text-sm text-muted-foreground">
                  {agentName ?? <span className="text-xs italic text-muted-foreground/60">Sin asignar</span>}
                </td>
                <td className="py-4 font-bold text-navy">RD$ {Number(o.amount || 0).toLocaleString("en-US")}</td>
                <td className={`py-4 font-bold ${isDelivered ? "text-emerald-600" : "text-muted-foreground"}`}>
                  {isDelivered ? `RD$ ${Number(o.profit || 0).toLocaleString("en-US")}` : "—"}
                </td>
                <td className="py-4">
                  <button
                    onClick={() => copyTrackingLink(o.id)}
                    title="Copiar link de seguimiento"
                    className="flex items-center gap-1.5 rounded-md border border-border px-2.5 py-1 text-xs font-bold text-navy hover:bg-secondary hover:text-primary"
                  >
                    {copiedId === o.id ? (
                      <>
                        <Check className="h-3 w-3 text-emerald-600" />
                        <span className="text-emerald-600">Copiado</span>
                      </>
                    ) : (
                      <>
                        <Copy className="h-3 w-3" />
                        Copiar link
                      </>
                    )}
                  </button>
                </td>
              </tr>
            );
          })}
          {myOrders.length === 0 && (
            <tr>
              <td colSpan={9} className="py-8 text-center text-muted-foreground">
                No hay pedidos aun.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
