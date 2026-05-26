"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { BadgeDollarSign, ClipboardList, Store, ShoppingBag, Eye, Star } from "lucide-react";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { DonutSummary, SeriesChart, TinyTrend } from "@/components/dashboard/charts";
import { OrderStatusBadge } from "@/components/order-status-badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useOrderStorage } from "@/components/order-flow/store";

export default function ProviderDashboardPage() {
  const { orders, products, currentUser } = useOrderStorage();

  // Filter orders related to this provider's products.
  const mySupplierId = currentUser?.id;
  const isDemo = !mySupplierId;

  // Filter orders that have products belonging to this supplier
  const supplierOrders = orders.filter(
    (o) => isDemo ? o.supplierId === "SUP-001" : o.supplierId === mySupplierId
  );
  
  // Calculate stats
  const totalSales = supplierOrders.reduce(
    (sum, o) => sum + parseFloat(String(o.amount).replace(/[^0-9.-]+/g, "")),
    0
  );
  const pendingOrders = supplierOrders.filter((o) =>
    ["Pendiente", "Confirmado", "Solicitado a tienda"].includes(o.status)
  ).length;

  const myProducts = products.filter(
    (p) => isDemo ? p.supplierId === "SUP-001" : p.supplierId === mySupplierId
  );

  const stats = [
    {
      label: "Ventas Totales",
      value: `RD$ ${totalSales.toLocaleString("en-US")}`,
      trend: "+12.4% vs. mes anterior",
      icon: BadgeDollarSign,
      color: "#075BFF",
      dataKey: "ventas",
      featured: true,
    },
    {
      label: "Productos Activos",
      value: myProducts.length.toString(),
      trend: "En catálogo",
      icon: ClipboardList,
      color: "#20C997",
      dataKey: "clientes",
    },
    {
      label: "Pedidos Pendientes",
      value: pendingOrders.toString(),
      trend: "Por despachar",
      icon: ShoppingBag,
      color: "#F59E0B",
      dataKey: "pedidos",
    },
  ];

  return (
    <DashboardShell
      mode="provider"
      eyebrow="Resumen de tu tienda y productos"
      title={`¡Bienvenido, ${currentUser?.full_name || (isDemo ? "Proveedor Demo" : "Proveedor")}!`}
    >
      <div className="grid gap-5 md:grid-cols-3">
        {stats.map((metric) => (
          <Card key={metric.label} className={metric.featured ? "overflow-hidden border-0 bg-gradient-to-br from-[#075bff] via-[#123fe8] to-[#071a36] p-5 text-white shadow-premium" : "overflow-hidden border-[#e6eefb] bg-white p-5 shadow-premium"}>
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className={metric.featured ? "text-sm font-bold text-white/82" : "text-sm font-bold text-navy"}>{metric.label}</p>
                <p className={metric.featured ? "mt-4 text-2xl font-black text-white" : "mt-4 text-2xl font-black text-navy"}>{metric.value}</p>
                <p className={metric.featured ? "mt-3 flex items-center gap-1 text-sm font-bold text-emerald-200" : "mt-3 flex items-center gap-1 text-sm font-bold text-emerald-600"}>
                  {metric.trend}
                </p>
              </div>
              <div className={metric.featured ? "grid h-11 w-11 place-items-center rounded-full bg-white/12 text-white" : "grid h-12 w-12 place-items-center rounded-full bg-[#eef4ff]"} style={{ color: metric.color }}>
                <metric.icon className="h-5 w-5" aria-hidden="true" />
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1.6fr_1fr]">
        {/* Pending Orders Table */}
        <Card className="overflow-hidden border-[#e6eefb] bg-white shadow-premium">
          <CardHeader className="flex-row items-center justify-between space-y-0 border-b border-[#edf2fb] pb-5">
            <CardTitle>Pedidos Recientes</CardTitle>
            <Link href="/provider/mis-pedidos" className="text-sm font-bold text-primary hover:underline">
              Ver todos
            </Link>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[700px] text-left text-sm">
                <thead className="text-xs text-muted-foreground">
                  <tr className="border-b border-[#edf2fb] bg-[#fbfdff]">
                    <th className="px-6 py-4 font-black">Pedido</th>
                    <th className="px-4 py-4 font-black">Producto</th>
                    <th className="px-4 py-4 font-black">Emprendedor</th>
                    <th className="px-4 py-4 font-black">Estado</th>
                    <th className="px-6 py-4 font-black">Fecha</th>
                  </tr>
                </thead>
                <tbody>
                  {supplierOrders.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center text-muted-foreground">
                        No hay pedidos de tus productos todavía.
                      </td>
                    </tr>
                  ) : (
                    supplierOrders.slice(0, 5).map((order) => (
                      <tr key={order.id} className="border-b border-[#edf2fb] last:border-0 hover:bg-secondary/20">
                        <td className="px-6 py-4 font-black text-primary">{order.id}</td>
                        <td className="px-4 py-4 font-semibold text-navy">{order.product || order.productName}</td>
                        <td className="px-4 py-4 text-muted-foreground">{order.entrepreneur || "Emprendedor"}</td>
                        <td className="px-4 py-4">
                          <OrderStatusBadge status={order.status} />
                        </td>
                        <td className="px-6 py-4 text-muted-foreground">{order.date || new Date(order.createdAt).toLocaleDateString()}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Product Stock Card */}
        <Card className="border-[#e6eefb] shadow-premium">
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <CardTitle>Mis Productos Populares</CardTitle>
            <Link href="/provider/mis-productos" className="text-sm font-bold text-primary hover:underline">
              Gestionar catálogo
            </Link>
          </CardHeader>
          <CardContent className="space-y-5">
            {myProducts.slice(0, 4).map((p) => (
              <div key={p.id} className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="grid h-11 w-11 shrink-0 place-items-center rounded-md bg-[#eef4ff] text-sm font-black text-primary">
                    {p.name.slice(0, 1).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-black text-navy">{p.name}</p>
                    <p className="text-xs text-muted-foreground">Costo: RD$ {p.cost?.toLocaleString("en-US") || p.price - p.margin}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-sm font-black text-navy">Stock: {p.stock}</span>
                  <div className="mt-1">
                    <OrderStatusBadge status={p.stockLabel as any} />
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </DashboardShell>
  );
}
