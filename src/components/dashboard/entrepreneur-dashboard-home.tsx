"use client";

import { ArrowUp, CheckCircle2, Circle, Eye, PackageCheck, ShoppingBag, Star, UserPlus } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { DonutSummary, SeriesChart, TinyTrend } from "@/components/dashboard/charts";
import { OrderStatusBadge } from "@/components/order-status-badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  entrepreneurEarningsBreakdown,
  products,
  revenueSeries,
  tinySalesSeries
} from "@/lib/mock-data";
import { useOrderStorage } from "@/components/order-flow/store";

export function EntrepreneurDashboardHome() {
  const { orders, localEarnings, currentUser } = useOrderStorage();

  // Calculate real stats
  const totalEarned = localEarnings.reduce((acc, curr) => acc + (curr.type === "venta" ? curr.amount : 0), 0);
  const deliveredOrders = orders.filter(o => o.status === "Entregado").length;
  
  // Real customers from orders
  const customerMap = new Map();
  orders.forEach(order => {
    customerMap.set(order.customerEmail, true);
  });
  const uniqueCustomers = customerMap.size;

  const stats = [
    {
      label: "Ganancias totales",
      value: `RD$ ${totalEarned.toLocaleString("en-US")}`,
      trend: totalEarned > 0 ? "100%" : "0%",
      icon: Eye,
      color: "#ffffff",
      dataKey: "ventas",
      featured: true
    },
    {
      label: "Ventas totales",
      value: orders.length.toString(),
      trend: orders.length > 0 ? "100%" : "0%",
      icon: ShoppingBag,
      color: "#075BFF",
      dataKey: "ventas"
    },
    {
      label: "Pedidos entregados",
      value: deliveredOrders.toString(),
      trend: deliveredOrders > 0 ? "100%" : "0%",
      icon: PackageCheck,
      color: "#20C997",
      dataKey: "pedidos"
    },
    {
      label: "Clientes registrados",
      value: uniqueCustomers.toString(),
      trend: uniqueCustomers > 0 ? "100%" : "0%",
      icon: UserPlus,
      color: "#7C4DFF",
      dataKey: "clientes"
    }
  ];

  const recentOrders = orders.slice(0, 5);

  return (
    <DashboardShell mode="dashboard" eyebrow="Resumen de tu negocio." title={`¡Bienvenido, ${currentUser?.full_name?.split(" ")[0] || "Emprendedor"}!`}>
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        {stats.map((metric) => (
          <PremiumStatCard key={metric.label} {...metric} />
        ))}
      </div>

      <div className="mt-6 grid gap-6 2xl:grid-cols-[1.7fr_1fr]">
        <Card className="overflow-hidden border-[#e6eefb] bg-white shadow-premium">
          <CardHeader className="flex-row items-center justify-between space-y-0 border-b border-[#edf2fb] pb-5">
            <CardTitle>Ventas recientes</CardTitle>
            <a href="/dashboard/mis-pedidos" className="text-sm font-bold text-primary hover:underline cursor-pointer">Ver todos</a>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[820px] text-left text-sm">
                <thead className="text-xs text-muted-foreground">
                  <tr className="border-b border-[#edf2fb] bg-[#fbfdff]">
                    <th className="px-6 py-4 font-black">Pedido</th>
                    <th className="px-4 py-4 font-black">Cliente</th>
                    <th className="px-4 py-4 font-black">Producto</th>
                    <th className="px-4 py-4 font-black">Fecha</th>
                    <th className="px-4 py-4 font-black">Estado</th>
                    <th className="px-6 py-4 font-black">Ganancia</th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center text-muted-foreground">
                        No tienes pedidos recientes. ¡Empieza a vender ahora!
                      </td>
                    </tr>
                  ) : (
                    recentOrders.map((order) => (
                      <tr key={order.id} className="border-b border-[#edf2fb] last:border-0">
                        <td className="px-6 py-4 font-black text-primary">{order.id}</td>
                        <td className="px-4 py-4 font-semibold text-navy">{order.customerName}</td>
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-3">
                            <ProductThumb name={order.productName || "P"} />
                            <span className="font-semibold text-navy/85">{order.productName}</span>
                          </div>
                        </td>
                        <td className="px-4 py-4 text-muted-foreground">{new Date(order.createdAt).toLocaleDateString()}</td>
                        <td className="px-4 py-4">
                          <OrderStatusBadge status={order.status} />
                        </td>
                        <td className="px-6 py-4 font-black text-navy">RD$ {order.profit?.toLocaleString("en-US")}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        <DonutSummary 
          title="Resumen de ganancias" 
          total={totalEarned.toLocaleString("en-US")} 
          data={totalEarned > 0 ? entrepreneurEarningsBreakdown : []} 
        />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-2 2xl:grid-cols-[0.95fr_1fr_0.72fr]">
        <Card className="border-[#e6eefb] shadow-premium">
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <CardTitle>Productos recomendados</CardTitle>
            <a href="/dashboard/mis-productos" className="text-sm font-bold text-primary hover:underline">Ver catalogo</a>
          </CardHeader>
          <CardContent className="space-y-5">
            {products.slice(0, 3).map((product) => (
              <div key={product.id} className="grid grid-cols-[48px_1fr_auto] items-center gap-4">
                <ProductThumb name={product.name} />
                <div>
                  <p className="font-black text-navy">{product.name}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{product.category}</p>
                  <div className="mt-3 h-2 rounded-full bg-[#e8eef8]">
                    <div className="h-2 rounded-full bg-primary shadow-[0_6px_16px_rgba(7,91,255,0.25)]" style={{ width: `${product.share || 10}%` }} />
                  </div>
                </div>
                <p className="font-black text-navy">{product.share || 10}%</p>
              </div>
            ))}
          </CardContent>
        </Card>

        <SeriesChart
          title="Rendimiento"
          data={totalEarned > 0 ? revenueSeries : []}
          height="h-64"
          keys={[
            { key: "ventas", label: "Ventas", color: "#075BFF" },
            { key: "ganancias", label: "Ganancias (RD$)", color: "#20C997" }
          ]}
        />

        <Card className="overflow-hidden border-[#071a36] bg-[#071a36] text-white shadow-premium">
          <CardHeader>
            <CardTitle className="text-white">Tu siguiente nivel</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-black text-amber-300">Nivel Bronce</p>
                <p className="mt-3 text-sm text-white/82">{orders.length * 10} / 500 XP</p>
              </div>
              <div className="grid h-14 w-14 place-items-center rounded-full bg-amber-400 text-white shadow-soft">
                <Star className="h-7 w-7 fill-white" aria-hidden="true" />
              </div>
            </div>
            <div className="mt-5 h-2 rounded-full bg-white/20">
              <div className="h-2 rounded-full bg-amber-300" style={{ width: `${Math.min((orders.length * 10 / 500) * 100, 100)}%` }} />
            </div>
            <div className="mt-7 space-y-4">
              {[
                { label: "Realiza tu primera venta", done: orders.length > 0, progress: orders.length > 0 ? "1/1" : "0/1" },
                { label: "Completa 5 pedidos", done: deliveredOrders >= 5, progress: `${Math.min(deliveredOrders, 5)}/5` },
                { label: "Invita a un amigo", done: false, progress: "0/1" }
              ].map((task) => (
                <div key={task.label} className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3 text-sm">
                    {task.done ? <CheckCircle2 className="h-5 w-5 text-emerald-300" /> : <Circle className="h-5 w-5 text-white/60" />}
                    <span>{task.label}</span>
                  </div>
                  <span className="text-sm font-black">{task.progress}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardShell>
  );
}

function PremiumStatCard({
  label,
  value,
  trend,
  icon: Icon,
  color,
  dataKey,
  featured = false
}: {
  label: string;
  value: string;
  trend: string;
  icon: LucideIcon;
  color: string;
  dataKey: string;
  featured?: boolean;
}) {
  return (
    <Card className={featured ? "overflow-hidden border-0 bg-gradient-to-br from-[#075bff] via-[#123fe8] to-[#071a36] p-5 text-white shadow-premium" : "overflow-hidden border-[#e6eefb] bg-white p-5 shadow-premium"}>
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className={featured ? "text-sm font-bold text-white/82" : "text-sm font-bold text-navy"}>{label}</p>
          <p className={featured ? "mt-4 text-2xl font-black text-white" : "mt-4 text-2xl font-black text-navy"}>{value}</p>
          <p className={featured ? "mt-3 flex items-center gap-1 text-sm font-bold text-emerald-200" : "mt-3 flex items-center gap-1 text-sm font-bold text-emerald-600"}>
            <ArrowUp className="h-4 w-4" aria-hidden="true" />
            {trend} <span className={featured ? "font-medium text-white/78" : "font-medium text-muted-foreground"}>vs. mes anterior</span>
          </p>
        </div>
        <div className={featured ? "grid h-11 w-11 place-items-center rounded-full bg-white/12 text-white" : "grid h-12 w-12 place-items-center rounded-full bg-[#eef4ff]"} style={{ color }}>
          <Icon className="h-5 w-5" aria-hidden="true" />
        </div>
      </div>
      <TinyTrend data={tinySalesSeries} dataKey={dataKey} color={color === "#ffffff" ? "#ffffff" : color} />
    </Card>
  );
}

function ProductThumb({ name }: { name: string }) {
  return (
    <div className="grid h-11 w-11 shrink-0 place-items-center rounded-md bg-gradient-to-br from-[#f7fbff] to-[#dfeaff] text-sm font-black text-primary shadow-sm">
      {name.slice(0, 1)}
    </div>
  );
}
