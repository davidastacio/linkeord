"use client";

import { use, useEffect, useState } from "react";
import { CheckCircle2, Circle, Clock, MapPin, Package, Phone, Truck } from "lucide-react";
import { recentOrders } from "@/lib/mock-data";
import { deliveryAgents } from "@/lib/mock";
import { supabase } from "@/lib/supabase";


const ALL_STEPS = [
  { key: "Pendiente", label: "Pedido recibido", icon: Package },
  { key: "Confirmado", label: "Confirmado", icon: CheckCircle2 },
  { key: "Solicitado a tienda", label: "Solicitado a tienda", icon: Package },
  { key: "Delivery asignado", label: "Delivery asignado", icon: Truck },
  { key: "Recogido", label: "Recogido en tienda", icon: Truck },
  { key: "En camino", label: "En camino", icon: Truck },
  { key: "Entregado", label: "Entregado", icon: CheckCircle2 },
];

const STATUS_ORDER = [
  "Pendiente",
  "Confirmado",
  "Solicitado a tienda",
  "Delivery asignado",
  "Recogido",
  "En camino",
  "Entregado",
  "Pagado",
];

function getStatusIndex(status: string) {
  const idx = STATUS_ORDER.indexOf(status);
  return idx === -1 ? 0 : idx;
}

export default function TrackingPage({ params }: { params: Promise<{ orderId: string }> }) {
  const { orderId } = use(params);
  const [order, setOrder] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      const normalizedId = orderId.startsWith("#") ? orderId : `#${orderId}`;
      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .eq("id", normalizedId)
        .single();
      
      if (!error && data) {
        setOrder(data);
      } else {
        setOrder(null);
      }
      setLoading(false);
    };

    fetchOrder();

    const normalizedId = orderId.startsWith("#") ? orderId : `#${orderId}`;
    const subscription = supabase
      .channel(`order_tracking_${normalizedId}`)
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "orders", filter: `id=eq.${normalizedId}` },
        (payload) => {
          setOrder(payload.new);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, [orderId]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f7faff]">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="mt-4 text-muted-foreground">Buscando pedido...</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f7faff] p-4">
        <div className="w-full max-w-md rounded-2xl border border-border bg-white p-8 text-center shadow-sm">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-50">
            <Package className="h-8 w-8 text-red-400" />
          </div>
          <h1 className="mt-4 text-xl font-black text-navy">Pedido no encontrado</h1>
          <p className="mt-2 text-muted-foreground">
            El pedido <strong>#{orderId}</strong> no existe o fue eliminado.
          </p>
          <p className="mt-4 text-sm text-muted-foreground">
            Contacta a tu emprendedor o a soporte para más información.
          </p>
        </div>
      </div>
    );
  }

  const isCancelled = order.status === "Cancelado";
  const currentIdx = getStatusIndex(order.status);
  const agent = deliveryAgents.find(a => a.id === (order.deliveryId ?? ""));
  const agentName = order.deliveryName ?? agent?.name ?? null;
  const isDelivered = order.status === "Entregado" || order.status === "Pagado";

  // Steps to show (exclude "Pagado" from visual progress)
  const steps = ALL_STEPS;

  return (
    <div className="min-h-screen bg-[#f7faff]">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b border-border bg-white/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-xl items-center justify-between px-4 py-4">
          <div>
            <p className="text-xs font-black uppercase text-primary">Linkeo</p>
            <p className="text-sm font-bold text-navy">Seguimiento de pedido</p>
          </div>
          {!isCancelled && (
            <span className={`rounded-full px-4 py-1.5 text-xs font-black ${
              isDelivered
                ? "bg-emerald-100 text-emerald-700"
                : "bg-amber-100 text-amber-700"
            }`}>
              {order.status}
            </span>
          )}
        </div>
      </header>

      <main className="mx-auto max-w-xl px-4 py-6 space-y-5">

        {/* Order summary card */}
        <div className="rounded-2xl border border-border bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase text-muted-foreground">Número de pedido</p>
              <p className="mt-0.5 text-2xl font-black text-primary">{order.id}</p>
            </div>
            <div className="grid h-14 w-14 place-items-center rounded-xl bg-primary/10 text-primary">
              <Package className="h-7 w-7" />
            </div>
          </div>

          <div className="mt-4 space-y-2 divide-y divide-border">
            {order.product && (
              <div className="flex items-center justify-between py-2">
                <p className="text-sm text-muted-foreground">Producto</p>
                <p className="font-bold text-navy">{order.product}</p>
              </div>
            )}
            {order.estimatedArrival && !isDelivered && !isCancelled && (
              <div className="flex items-center justify-between py-2">
                <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  Estimado de llegada
                </div>
                <p className="font-bold text-navy">{order.estimatedArrival}</p>
              </div>
            )}
            {order.date && (
              <div className="flex items-center justify-between py-2">
                <p className="text-sm text-muted-foreground">Fecha del pedido</p>
                <p className="font-bold text-navy">{order.date}</p>
              </div>
            )}
          </div>
        </div>

        {/* Progress tracker */}
        {!isCancelled && (
          <div className="rounded-2xl border border-border bg-white p-5 shadow-sm">
            <p className="mb-5 text-sm font-black uppercase text-muted-foreground">Progreso del pedido</p>
            <div className="space-y-0">
              {steps.map((step, idx) => {
                const stepIdx = getStatusIndex(step.key);
                const done = stepIdx < currentIdx;
                const active = step.key === order.status || (order.status === "Pagado" && step.key === "Entregado");
                const pending = stepIdx > currentIdx;
                const Icon = step.icon;
                return (
                  <div key={step.key} className="flex items-start gap-4">
                    {/* Icon + connector */}
                    <div className="flex flex-col items-center">
                      <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 transition-colors ${
                        done
                          ? "border-emerald-500 bg-emerald-500 text-white"
                          : active
                          ? "border-primary bg-primary text-white shadow-md"
                          : "border-border bg-white text-muted-foreground"
                      }`}>
                        {done ? (
                          <CheckCircle2 className="h-4 w-4" />
                        ) : active ? (
                          <Icon className="h-4 w-4" />
                        ) : (
                          <Circle className="h-4 w-4" />
                        )}
                      </div>
                      {idx < steps.length - 1 && (
                        <div className={`my-1 h-8 w-0.5 ${done ? "bg-emerald-400" : "bg-border"}`} />
                      )}
                    </div>
                    {/* Label */}
                    <div className="pb-2 pt-1.5">
                      <p className={`text-sm font-bold ${
                        active ? "text-primary" : done ? "text-emerald-700" : "text-muted-foreground"
                      }`}>
                        {step.label}
                      </p>
                      {active && order.statusHistory && (() => {
                        const entry = [...(order.statusHistory ?? [])].reverse().find((h: any) => h.status === step.key);
                        if (!entry) return null;
                        return (
                          <p className="mt-0.5 text-xs text-muted-foreground">
                            {new Date(entry.timestamp).toLocaleString("es-DO", {
                              dateStyle: "short",
                              timeStyle: "short",
                            })}
                          </p>
                        );
                      })()}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Cancelled banner */}
        {isCancelled && (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-5">
            <p className="font-black text-red-700">Pedido cancelado</p>
            <p className="mt-1 text-sm text-red-600">
              {order.statusHistory?.find((h: any) => h.status === "Cancelado")?.note ||
                "Este pedido fue cancelado. Contacta al emprendedor para más detalles."}
            </p>
          </div>
        )}

        {/* Delivery info (shown when assigned) */}
        {agentName && !isCancelled && (
          <div className="rounded-2xl border border-border bg-white p-5 shadow-sm">
            <p className="mb-3 text-sm font-black uppercase text-muted-foreground">Tu delivery</p>
            <div className="flex items-center gap-4">
              <div className="grid h-14 w-14 place-items-center rounded-full bg-[#0e3d2f]/10 text-lg font-black text-[#0e3d2f]">
                {agentName.slice(0, 2).toUpperCase()}
              </div>
              <div>
                <p className="font-black text-navy">{agentName}</p>
                {agent && (
                  <>
                    <p className="text-sm text-muted-foreground">{agent.zone} · {agent.vehicle}</p>
                    <p className="text-sm text-muted-foreground">{agent.rating} ★ · {agent.deliveries} entregas</p>
                  </>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Delivery address */}
        {order.deliveryAddress && (
          <div className="rounded-2xl border border-border bg-white p-5 shadow-sm">
            <p className="mb-2 text-sm font-black uppercase text-muted-foreground">Dirección de entrega</p>
            <div className="flex items-start gap-3">
              <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
              <p className="text-navy">{order.deliveryAddress}</p>
            </div>
          </div>
        )}

        {/* Delivered banner */}
        {isDelivered && (
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5 text-center">
            <CheckCircle2 className="mx-auto h-10 w-10 text-emerald-500" />
            <p className="mt-3 text-lg font-black text-emerald-800">¡Tu pedido fue entregado!</p>
            <p className="mt-1 text-sm text-emerald-700">Gracias por comprar con Linkeo.</p>
          </div>
        )}

        {/* Support */}
        <div className="rounded-2xl border border-border bg-white p-5 shadow-sm text-center">
          <p className="text-sm font-bold text-navy">¿Problemas con tu pedido?</p>
          <p className="mt-1 text-xs text-muted-foreground">Nuestro equipo te ayuda 24/7.</p>
          <a
            href="mailto:soporte@linkeo.do"
            className="mt-3 inline-block rounded-md bg-primary px-6 py-2 text-sm font-black text-white hover:bg-primary/90"
          >
            Contactar soporte
          </a>
        </div>

        {/* Footer */}
        <p className="pb-4 text-center text-xs text-muted-foreground">
          Linkeo · {new Date().getFullYear()} · Todos los derechos reservados
        </p>
      </main>
    </div>
  );
}
