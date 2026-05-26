"use client";

import { useEffect, useState } from "react";
import { CalendarDays, ShoppingBag, PackageCheck, Users, UserPlus, BadgeDollarSign, Store, Truck, CreditCard } from "lucide-react";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { DonutSummary, SeriesChart, TinyTrend } from "@/components/dashboard/charts";
import { MetricCard } from "@/components/metric-card";
import { OrderStatusBadge } from "@/components/order-status-badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/lib/supabase";
import Link from "next/link";

export default function AdminPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [profiles, setProfiles] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [earnings, setEarnings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const [ordersRes, profilesRes, productsRes, earningsRes] = await Promise.all([
        supabase.from("orders").select("*").order("date", { ascending: false }),
        supabase.from("profiles").select("*"),
        supabase.from("products").select("*"),
        supabase.from("earnings").select("*")
      ]);

      if (ordersRes.data) setOrders(ordersRes.data);
      if (profilesRes.data) setProfiles(profilesRes.data);
      if (productsRes.data) {
        const mappedProducts = productsRes.data.map((p: any) => ({
          ...p,
          supplierId: p.supplierid || p.supplierId,
        }));
        setProducts(mappedProducts);
      }
      if (earningsRes.data) setEarnings(earningsRes.data);
      setLoading(false);
    };

    fetchData();

    // Subscribe to realtime updates
    const channelName = `admin_realtime_${Math.random().toString(36).slice(2, 11)}`;
    const subscription = supabase
      .channel(channelName)
      .on("postgres_changes", { event: "*", schema: "public", table: "orders" }, () => fetchData())
      .on("postgres_changes", { event: "*", schema: "public", table: "profiles" }, () => fetchData())
      .on("postgres_changes", { event: "*", schema: "public", table: "products" }, () => fetchData())
      .on("postgres_changes", { event: "*", schema: "public", table: "earnings" }, () => fetchData())
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, []);

  if (loading) {
    return (
      <DashboardShell mode="admin" eyebrow="Cargando panel..." title="Panel Administrativo">
        <div className="flex h-64 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      </DashboardShell>
    );
  }

  // Calculate live statistics
  const totalSalesVal = orders.reduce((sum, o) => sum + (Number(o.amount) || 0), 0);
  const totalOrdersVal = orders.length;
  const activeEntrepreneursCount = profiles.filter((p) => p.role === "emprendedor" && p.approved).length;
  
  // Unique customers
  const customerMap = new Map();
  orders.forEach((o) => {
    if (o.customerPhone) {
      customerMap.set(o.customerPhone, o.customerName || "Cliente");
    } else if (o.customerEmail) {
      customerMap.set(o.customerEmail, o.customerName || "Cliente");
    }
  });
  const totalCustomersVal = customerMap.size || 1; // Fallback to 1 to avoid division by 0 in breakdowns

  const totalCommissionsVal = orders.reduce((sum, o) => sum + (Number(o.commission) || 0), 0);
  const totalProfitVal = orders.reduce((sum, o) => sum + (Number(o.profit) || 0), 0);
  const netEarningsVal = totalCommissionsVal + totalProfitVal;

  // Stats definition matching mockup design
  const stats = [
    {
      label: "Ventas totales",
      value: `RD$ ${totalSalesVal.toLocaleString("en-US")}`,
      trend: totalSalesVal > 0 ? "+100%" : "0%",
      icon: ShoppingBag,
      color: "blue" as const
    },
    {
      label: "Pedidos totales",
      value: totalOrdersVal.toString(),
      trend: totalOrdersVal > 0 ? "+100%" : "0%",
      icon: PackageCheck,
      color: "green" as const
    },
    {
      label: "Emprendedores activos",
      value: activeEntrepreneursCount.toString(),
      trend: activeEntrepreneursCount > 0 ? "+100%" : "0%",
      icon: Users,
      color: "purple" as const
    },
    {
      label: "Clientes registrados",
      value: totalCustomersVal.toString(),
      trend: totalCustomersVal > 0 ? "+100%" : "0%",
      icon: UserPlus,
      color: "orange" as const
    },
    {
      label: "Ganancias netas",
      value: `RD$ ${netEarningsVal.toLocaleString("en-US")}`,
      trend: netEarningsVal > 0 ? "+100%" : "0%",
      icon: BadgeDollarSign,
      color: "blue" as const
    }
  ];

  // Group orders by date for operations series chart
  const dateGroups: Record<string, { ventas: number; pedidos: number; ganancias: number }> = {};
  // Take last 7 days or group orders by date
  orders.slice(0, 30).reverse().forEach((order) => {
    const dateStr = order.date ? new Date(order.date).toLocaleDateString("es-DO", { day: "numeric", month: "short" }) : "Hoy";
    if (!dateGroups[dateStr]) {
      dateGroups[dateStr] = { ventas: 0, pedidos: 0, ganancias: 0 };
    }
    dateGroups[dateStr].ventas += Number(order.amount) || 0;
    dateGroups[dateStr].pedidos += 1;
    dateGroups[dateStr].ganancias += Number(order.commission) || 0;
  });

  const operationsSeriesData = Object.entries(dateGroups).map(([month, data]) => ({
    month,
    ventas: data.ventas,
    pedidos: data.pedidos,
    ganancias: data.ganancias
  }));

  // Donut Profit Breakdown
  const supplierPayments = orders.reduce((sum, o) => sum + ((Number(o.amount) || 0) - (Number(o.profit) || 0) - (Number(o.commission) || 0)), 0);
  const deliveryPayments = orders.length * 400; // Mock RD$ 400 per delivery
  const totalBreakdown = totalCommissionsVal + supplierPayments + deliveryPayments || 1;

  const adminProfitBreakdownData = [
    { name: "Comisión plataforma", value: Number(((totalCommissionsVal / totalBreakdown) * 100).toFixed(1)), amount: `RD$ ${totalCommissionsVal.toLocaleString("en-US")}`, color: "#20C997" },
    { name: "Deliverys", value: Number(((deliveryPayments / totalBreakdown) * 100).toFixed(1)), amount: `RD$ ${deliveryPayments.toLocaleString("en-US")}`, color: "#075BFF" },
    { name: "Tiendas proveedoras", value: Number(((supplierPayments / totalBreakdown) * 100).toFixed(1)), amount: `RD$ ${supplierPayments.toLocaleString("en-US")}`, color: "#7C4DFF" }
  ];

  // Dynamic Recent Activity Log
  const recentActivityData = orders.slice(0, 4).map((o) => ({
    title: "Pedido recibido",
    detail: `Pedido ${o.id} de ${o.customerName || "Cliente"} por RD$ ${(Number(o.amount) || 0).toLocaleString("en-US")}`,
    time: "Reciente",
    icon: ShoppingBag,
    color: "bg-cyan-50 text-cyan-600"
  }));

  // Fallback if no orders
  if (recentActivityData.length === 0) {
    recentActivityData.push({
      title: "Plataforma activa",
      detail: "Esperando nuevas transacciones.",
      time: "Ahora",
      icon: Store,
      color: "bg-blue-50 text-primary"
    });
  }

  // Entrepreneurs breakdown list
  const entrepreneursList = profiles.filter((p) => p.role === "emprendedor").slice(0, 4).map((e) => {
    const count = orders.filter((o) => o.entrepreneurId === e.id).length;
    return [e.full_name || "Sin nombre", `${count} ventas`, e.approved ? "Activo" : "Pendiente"];
  });

  // Customers list
  const customersList = Array.from(customerMap.entries()).slice(0, 4).map(([id, name]) => {
    const count = orders.filter((o) => o.customerPhone === id || o.customerEmail === id).length;
    return [name, `${count} pedidos`, "Activo"];
  });

  // Products list
  const productsList = products.slice(0, 4).map((p) => [p.name, p.category, p.stock > 0 ? "Disponible" : "Agotado"]);

  // Suppliers list
  const suppliersList = profiles.filter((p) => p.role === "proveedor").slice(0, 4).map((s) => {
    const count = products.filter((p) => p.supplierId === s.id).length;
    return [s.full_name || s.store_name || "Tienda", `${count} productos`, "Activo"];
  });

  // Deliveries list
  const deliveriesList = profiles.filter((p) => p.role === "delivery").slice(0, 4).map((d) => {
    const count = orders.filter((o) => o.deliveryId === d.id).length;
    return [d.full_name || "Delivery", `${count} entregas`, "Activo"];
  });

  return (
    <DashboardShell mode="admin" eyebrow="Resumen general de la plataforma" title="Panel Administrativo">
      <div className="mb-6 flex justify-end">
        <div className="inline-flex items-center gap-2 rounded-md border border-border bg-white px-4 py-2 text-sm font-bold text-navy shadow-sm">
          <CalendarDays className="h-4 w-4 text-primary" />
          En vivo (Tiempo real)
        </div>
      </div>

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-5">
        {stats.map((metric, index) => (
          <div key={metric.label}>
            <MetricCard {...metric} />
            <TinyTrend
              data={operationsSeriesData.length > 0 ? operationsSeriesData : [{ month: "Hoy", ventas: 0, pedidos: 0, ganancias: 0 }]}
              dataKey={index === 1 ? "pedidos" : index === 4 ? "ganancias" : "ventas"}
              color={index === 1 ? "#20C997" : index === 2 ? "#7C4DFF" : index === 3 ? "#F59E0B" : "#075BFF"}
            />
          </div>
        ))}
      </div>

      <div className="mt-6 grid gap-6 2xl:grid-cols-[1.45fr_0.9fr]">
        <SeriesChart
          title="Gráfico de ventas reales"
          data={operationsSeriesData.length > 0 ? operationsSeriesData : [{ month: "Sin datos", ventas: 0, pedidos: 0, ganancias: 0 }]}
          keys={[
            { key: "ventas", label: "Ventas (RD$)", color: "#075BFF" },
            { key: "pedidos", label: "Pedidos", color: "#20C997" },
            { key: "ganancias", label: "Ganancias (RD$)", color: "#7C4DFF" }
          ]}
        />
        <DonutSummary title="Distribución de ganancias" total={totalCommissionsVal.toLocaleString("en-US")} data={adminProfitBreakdownData} />
      </div>

      <div className="mt-6 grid gap-6 2xl:grid-cols-[1.45fr_0.9fr]">
        <Card className="shadow-sm">
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <CardTitle>Pedidos recientes</CardTitle>
            <Link href="/admin/pedidos" className="text-sm font-bold text-primary hover:underline">Ver todos</Link>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[860px] text-left text-sm">
                <thead className="text-xs text-muted-foreground">
                  <tr className="border-b border-border">
                    <th className="py-3 font-black">Pedido</th>
                    <th className="py-3 font-black">Emprendedor</th>
                    <th className="py-3 font-black">Cliente</th>
                    <th className="py-3 font-black">Producto</th>
                    <th className="py-3 font-black">Total</th>
                    <th className="py-3 font-black">Estado</th>
                    <th className="py-3 font-black">Fecha</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.slice(0, 5).map((order) => (
                    <tr key={order.id} className="border-b border-border last:border-0">
                      <td className="py-4 font-black text-primary">{order.id}</td>
                      <td className="py-4 font-semibold text-navy">
                        {profiles.find((p) => p.id === order.entrepreneurId)?.full_name || "Emprendedor"}
                      </td>
                      <td className="py-4 text-muted-foreground">{order.customerName}</td>
                      <td className="py-4 text-muted-foreground">{order.productName}</td>
                      <td className="py-4 font-black text-navy">RD$ {Number(order.amount || 0).toLocaleString("en-US")}</td>
                      <td className="py-4">
                        <OrderStatusBadge status={order.status} />
                      </td>
                      <td className="py-4 text-muted-foreground">{new Date(order.date || order.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                  {orders.length === 0 && (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-muted-foreground">No hay pedidos registrados en la plataforma.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <CardTitle>Actividad reciente</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            {recentActivityData.map((item, index) => {
              const Icon = item.icon;

              return (
                <div key={index} className="grid grid-cols-[44px_1fr_auto] gap-4">
                  <div className={`grid h-10 w-10 place-items-center rounded-md ${item.color}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-black text-navy">{item.title}</p>
                    <p className="mt-1 text-sm leading-6 text-muted-foreground">{item.detail}</p>
                  </div>
                  <p className="text-xs font-bold text-muted-foreground">{item.time}</p>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-2 2xl:grid-cols-3">
        <ManagementCard title="Gestión de emprendedores" rows={entrepreneursList} />
        <ManagementCard title="Gestión de clientes" rows={customersList} />
        <ManagementCard title="Productos" rows={productsList} />
        <ManagementCard title="Tiendas proveedoras" rows={suppliersList} />
        <ManagementCard title="Deliverys" rows={deliveriesList} />
      </div>
    </DashboardShell>
  );
}

function ManagementCard({ title, rows }: { title: string; rows: string[][] }) {
  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {rows.map(([name, meta, status]) => (
          <div key={`${title}-${name}`} className="flex items-center justify-between gap-4 rounded-lg border border-border p-4">
            <div>
              <p className="font-black text-navy">{name}</p>
              <p className="mt-1 text-sm text-muted-foreground">{meta}</p>
            </div>
            <OrderStatusBadge status={status as any} />
          </div>
        ))}
        {rows.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-4">No hay registros.</p>
        )}
      </CardContent>
    </Card>
  );
}
