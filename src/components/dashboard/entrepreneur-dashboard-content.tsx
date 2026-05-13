"use client";

import { useEffect, useState } from "react";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { DonutSummary, SeriesChart } from "@/components/dashboard/charts";
import { OrderStatusBadge } from "@/components/order-status-badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Truck } from "lucide-react";
import { products, revenueSeries, entrepreneurEarningsBreakdown } from "@/lib/mock-data";

import { EntrepreneurProductsTable } from "@/components/order-flow/EntrepreneurProductsTable";
import { EntrepreneurOrdersTable } from "@/components/order-flow/EntrepreneurOrdersTable";
import { EntrepreneurEarningsList } from "@/components/order-flow/EntrepreneurEarningsList";
import { useOrderStorage } from "@/components/order-flow/store";

const sectionTitles: Record<string, string> = {
  "mis-productos": "Mis productos",
  "mis-pedidos": "Mis pedidos",
  "mis-clientes": "Mis clientes",
  "mis-ganancias": "Mis ganancias",
  "mis-retiros": "Mis retiros",
  estadisticas: "Estadisticas",
  promociones: "Promociones",
  materiales: "Materiales",
  perfil: "Mi perfil",
  configuracion: "Configuracion",
  ayuda: "Ayuda",
};

export function EntrepreneurDashboardContent({ section }: { section: string }) {
  const title = sectionTitles[section] ?? "Seccion";
  const { orders, localEarnings, currentUser } = useOrderStorage();
  
  const myWithdrawals = localEarnings.filter((e) => e.type === "retiro");
  
  // Calculate real stats
  const totalEarned = localEarnings.reduce((acc, curr) => acc + (curr.type === "venta" ? curr.amount : 0), 0);
  const totalWithdrawals = localEarnings.reduce((acc, curr) => acc + (curr.type === "retiro" ? curr.amount : 0), 0);
  const availableBalance = totalEarned - totalWithdrawals;

  // Real customers from orders
  const customerMap = new Map();
  orders.forEach(order => {
    if (!customerMap.has(order.customerEmail)) {
      customerMap.set(order.customerEmail, {
        id: order.customerEmail,
        name: order.customerName,
        email: order.customerEmail,
        orders: 0,
        total: 0,
        status: "Activo"
      });
    }
    const c = customerMap.get(order.customerEmail);
    c.orders += 1;
    c.total += parseFloat(String(order.total).replace(/[^0-9.-]+/g, ""));
  });
  const myCustomers = Array.from(customerMap.values());

  return (
    <DashboardShell mode="dashboard" eyebrow={title} title={title}>

      {/* ── MIS PRODUCTOS ── */}
      {section === "mis-productos" && (
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>Catalogo de productos disponibles</CardTitle>
          </CardHeader>
          <CardContent>
            <EntrepreneurProductsTable products={products} />
          </CardContent>
        </Card>
      )}

      {/* ── MIS PEDIDOS ── */}
      {section === "mis-pedidos" && (
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>Mis pedidos</CardTitle>
          </CardHeader>
          <CardContent>
            <EntrepreneurOrdersTable />
          </CardContent>
        </Card>
      )}

      {/* ── MIS CLIENTES ── */}
      {section === "mis-clientes" && (
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>Mis clientes</CardTitle>
          </CardHeader>
          <CardContent>
            {myCustomers.length === 0 ? (
              <div className="py-12 text-center">
                <p className="text-muted-foreground">Aun no tienes clientes. ¡Empieza a vender para verlos aqui!</p>
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {myCustomers.map((c) => (
                  <div key={c.id} className="rounded-lg border border-border p-5">
                    <div className="flex items-center justify-between gap-3">
                      <div className="grid h-11 w-11 place-items-center rounded-full bg-secondary text-sm font-black text-primary">
                        {c.name.slice(0, 2).toUpperCase()}
                      </div>
                      <OrderStatusBadge status={c.status} />
                    </div>
                    <p className="mt-4 font-black text-navy">{c.name}</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {c.orders} pedidos · RD$ {c.total.toLocaleString("en-US")}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* ── MIS GANANCIAS ── */}
      {section === "mis-ganancias" && (
        <div className="grid gap-6 xl:grid-cols-[1fr_0.65fr]">
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle>Historial de ganancias</CardTitle>
            </CardHeader>
            <CardContent>
              <EntrepreneurEarningsList />
            </CardContent>
          </Card>
          <DonutSummary 
            title="Resumen de ganancias" 
            total={totalEarned.toLocaleString("en-US")} 
            data={totalEarned > 0 ? entrepreneurEarningsBreakdown : []} 
          />
        </div>
      )}

      {/* ── MIS RETIROS ── */}
      {section === "mis-retiros" && (
        <div className="grid gap-6 xl:grid-cols-[1fr_0.6fr]">
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle>Solicitudes de retiro</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {myWithdrawals.length === 0 ? (
                  <p className="text-center py-8 text-muted-foreground">No tienes solicitudes de retiro pendientes.</p>
                ) : (
                  myWithdrawals.map((e) => (
                    <div key={e.id} className="flex items-center justify-between gap-4 rounded-lg border border-border p-5">
                      <div>
                        <p className="font-black text-navy">{e.label}</p>
                        <p className="mt-1 text-sm text-muted-foreground">Pedido {e.orderId} · {e.date}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xl font-black text-navy">RD$ {e.amount.toLocaleString("en-US")}</p>
                        <div className="mt-1"><OrderStatusBadge status="Pendiente" /></div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
          <Card className="shadow-sm">
            <CardContent className="pt-6">
              <p className="text-sm font-bold text-muted-foreground">Balance disponible</p>
              <p className="mt-2 text-3xl font-black text-primary">RD$ {availableBalance.toLocaleString("en-US")}</p>
              <p className="mt-1 text-sm text-muted-foreground">Los retiros se procesan en 1-3 dias habiles.</p>
              <div className="mt-6 space-y-3">
                {[
                  { label: "Banco", value: currentUser?.bank_name || "No configurado" },
                  { label: "Cuenta", value: currentUser?.bank_account || "No configurada" },
                  { label: "Tipo", value: "Cuenta de ahorros" },
                ].map((f) => (
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

      {/* ── ESTADISTICAS ── */}
      {section === "estadisticas" && (
        <div className="grid gap-6">
          <SeriesChart
            title="Ventas y ganancias del mes"
            data={totalEarned > 0 ? revenueSeries : []}
            keys={[
              { key: "ventas", label: "Ventas", color: "#075BFF" },
              { key: "ganancias", label: "Ganancias (RD$)", color: "#20C997" },
            ]}
          />
          <div className="grid gap-6 xl:grid-cols-3">
            {[
              { label: "Total ganado", value: `RD$ ${totalEarned.toLocaleString("en-US")}`, sub: "historico total" },
              { label: "Pedidos realizados", value: orders.length.toString(), sub: "de todos los tiempos" },
              { label: "Clientes unicos", value: myCustomers.length.toString(), sub: "contactos registrados" },
            ].map((stat) => (
              <Card key={stat.label} className="shadow-sm">
                <CardContent className="pt-6">
                  <p className="text-sm font-bold text-muted-foreground">{stat.label}</p>
                  <p className="mt-2 text-3xl font-black text-navy">{stat.value}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{stat.sub}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* ── PROMOCIONES ── */}
      {section === "promociones" && (
        <div className="grid gap-6">
          <div className="rounded-xl border border-primary/20 bg-gradient-to-br from-[#eef4ff] to-[#f7fbff] p-6">
            <p className="text-xs font-black uppercase text-primary">Recomendados esta semana</p>
            <p className="mt-1 text-2xl font-black text-navy">Impulsa tus ventas con estos articulos</p>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {products.slice(0, 6).map((p) => (
              <Card key={p.id} className="shadow-sm">
                <CardContent className="pt-6">
                  <div className={`mb-4 grid h-14 w-14 place-items-center rounded-xl text-2xl font-black ${p.accent}`}>
                    {p.name.slice(0, 1)}
                  </div>
                  <p className="font-black text-navy">{p.name}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{p.category} · Demanda {p.demand}</p>
                  <div className="mt-4 flex items-center justify-between">
                    <span className="font-black text-primary">RD$ {p.price.toLocaleString("en-US")}</span>
                    <span className="text-sm font-bold text-emerald-600">+RD$ {p.margin.toLocaleString("en-US")}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* ── MI PERFIL ── */}
      {section === "perfil" && (
        <div className="grid gap-6 xl:grid-cols-[0.55fr_1fr]">
          <Card className="shadow-sm">
            <CardContent className="pt-6 text-center">
              <div className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-gradient-to-br from-primary to-[#071a36] text-2xl font-black text-white">
                {currentUser?.full_name?.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2) || "??"}
              </div>
              <p className="mt-4 text-xl font-black text-navy">{currentUser?.full_name || "Cargando..."}</p>
              <p className="mt-1 text-sm text-muted-foreground">{currentUser?.email || "..."}</p>
              <div className="mt-4 inline-block rounded-full bg-amber-100 px-4 py-1.5 text-sm font-black text-amber-700">
                Nivel Bronce
              </div>
              <div className="mt-6 grid grid-cols-3 gap-3 text-center border-t border-border pt-6">
                <div><p className="text-xl font-black text-navy">{orders.length}</p><p className="mt-1 text-xs text-muted-foreground">Ventas</p></div>
                <div><p className="text-xl font-black text-navy">{myCustomers.length}</p><p className="mt-1 text-xs text-muted-foreground">Clientes</p></div>
                <div><p className="text-xl font-black text-navy">{Math.round(totalEarned/1000)}K</p><p className="mt-1 text-xs text-muted-foreground">Ganado</p></div>
              </div>
            </CardContent>
          </Card>
          <Card className="shadow-sm">
            <CardHeader><CardTitle>Datos del perfil</CardTitle></CardHeader>
            <CardContent className="space-y-0 divide-y divide-border">
              {[
                { label: "Nombre completo", value: currentUser?.full_name || "..." },
                { label: "Correo electronico", value: currentUser?.email || "..." },
                { label: "Telefono", value: currentUser?.phone || "No registrado" },
                { label: "Ciudad", value: currentUser?.city || "No registrada" },
                { label: "Nombre de tienda", value: currentUser?.store_name || "Mi Tienda Linkeo" },
                { label: "Metodo de cobro", value: currentUser?.payment_method || "Transferencia bancaria" },
              ].map((f) => (
                <div key={f.label} className="grid grid-cols-[160px_1fr] items-center gap-4 py-4">
                  <p className="text-sm font-bold text-muted-foreground">{f.label}</p>
                  <p className="font-black text-navy">{f.value}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Default cases for other sections omitted for brevity or kept as is */}
      {["materiales", "configuracion", "ayuda"].includes(section) && (
        <div className="py-12 text-center text-muted-foreground">
          Contenido de {title} en desarrollo...
        </div>
      )}

    </DashboardShell>
  );
}
