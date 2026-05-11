import { CalendarDays } from "lucide-react";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { DonutSummary, SeriesChart, TinyTrend } from "@/components/dashboard/charts";
import { MetricCard } from "@/components/metric-card";
import { OrderStatusBadge } from "@/components/order-status-badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  adminMetrics,
  adminPages,
  adminProfitBreakdown,
  customers,
  deliveryTeams,
  entrepreneurs,
  financialReports,
  operationsSeries,
  products,
  recentActivity,
  recentOrders,
  suppliers,
  tinySalesSeries
} from "@/lib/mock-data";

export default function AdminPage() {
  return (
    <DashboardShell mode="admin" eyebrow="Resumen general de la plataforma" title="Panel Administrativo">
      <div className="mb-6 flex justify-end">
        <div className="inline-flex items-center gap-2 rounded-md border border-border bg-white px-4 py-2 text-sm font-bold text-navy shadow-sm">
          <CalendarDays className="h-4 w-4 text-primary" />
          24 May - 31 May, 2024
        </div>
      </div>

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-5">
        {adminMetrics.map((metric, index) => (
          <div key={metric.label}>
            <MetricCard {...metric} />
            <TinyTrend
              data={tinySalesSeries}
              dataKey={index === 2 ? "clientes" : index === 1 ? "pedidos" : "ventas"}
              color={index === 1 ? "#20C997" : index === 3 ? "#F59E0B" : index === 2 ? "#7C4DFF" : "#075BFF"}
            />
          </div>
        ))}
      </div>

      <div className="mt-6 grid gap-6 2xl:grid-cols-[1.45fr_0.9fr]">
        <SeriesChart
          title="Grafico de ventas"
          data={operationsSeries}
          keys={[
            { key: "ventas", label: "Ventas (RD$)", color: "#075BFF" },
            { key: "pedidos", label: "Pedidos", color: "#20C997" },
            { key: "ganancias", label: "Ganancias (RD$)", color: "#7C4DFF" }
          ]}
        />
        <DonutSummary title="Distribucion de ganancias" total="248,670.00" data={adminProfitBreakdown} />
      </div>

      <div className="mt-6 grid gap-6 2xl:grid-cols-[1.45fr_0.9fr]">
        <Card className="shadow-sm">
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <CardTitle>Pedidos recientes</CardTitle>
            <span className="text-sm font-bold text-primary">Ver todos</span>
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
                  {recentOrders.map((order) => (
                    <tr key={order.id} className="border-b border-border last:border-0">
                      <td className="py-4 font-black text-primary">{order.id}</td>
                      <td className="py-4 font-semibold text-navy">{order.entrepreneur}</td>
                      <td className="py-4 text-muted-foreground">{order.customer}</td>
                      <td className="py-4 text-muted-foreground">{order.product}</td>
                      <td className="py-4 font-black text-navy">{order.amount}</td>
                      <td className="py-4">
                        <OrderStatusBadge status={order.status} />
                      </td>
                      <td className="py-4 text-muted-foreground">{order.date}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <CardTitle>Actividad reciente</CardTitle>
            <span className="text-sm font-bold text-primary">Ver todas</span>
          </CardHeader>
          <CardContent className="space-y-5">
            {recentActivity.map((item) => {
              const Icon = item.icon;

              return (
                <div key={item.title} className="grid grid-cols-[44px_1fr_auto] gap-4">
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
        <ManagementCard title="Gestion de emprendedores" rows={entrepreneurs.map((item) => [item.name, item.store, item.status])} />
        <ManagementCard title="Gestion de clientes" rows={customers.map((item) => [item.name, `${item.orders} pedidos`, item.status])} />
        <ManagementCard title="Productos" rows={products.slice(0, 4).map((item) => [item.name, item.category, item.stockLabel])} />
        <ManagementCard title="Tiendas proveedoras" rows={suppliers.map((item) => [item.name, `${item.products} productos`, item.status])} />
        <ManagementCard title="Deliverys" rows={deliveryTeams.map((item) => [item.name, `${item.deliveries} entregas`, item.status])} />
        <ManagementCard title="Finanzas y comisiones" rows={financialReports.map((item) => [item.label, item.value, item.status])} />
      </div>

      <Card className="mt-6 shadow-sm">
        <CardHeader>
          <CardTitle>Modulos administrativos</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
          {adminPages.map((page) => (
            <div key={page} className="rounded-lg border border-border bg-white p-4">
              <p className="font-black text-navy">{page}</p>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">Modulo demo sin backend todavia.</p>
            </div>
          ))}
        </CardContent>
      </Card>
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
            <OrderStatusBadge status={status} />
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
