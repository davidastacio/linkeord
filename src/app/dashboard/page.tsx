import { ArrowUp, CheckCircle2, Circle, Eye, PackageCheck, ShoppingBag, Star, UserPlus } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { DonutSummary, SeriesChart, TinyTrend } from "@/components/dashboard/charts";
import { OrderStatusBadge } from "@/components/order-status-badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  entrepreneurEarningsBreakdown,
  products,
  recentOrders,
  revenueSeries,
  tinySalesSeries
} from "@/lib/mock-data";

const stats = [
  {
    label: "Ganancias totales",
    value: "RD$ 24,560.00",
    trend: "18.5%",
    icon: Eye,
    color: "#ffffff",
    dataKey: "ventas",
    featured: true
  },
  {
    label: "Ventas del mes",
    value: "126",
    trend: "22%",
    icon: ShoppingBag,
    color: "#075BFF",
    dataKey: "ventas"
  },
  {
    label: "Pedidos entregados",
    value: "118",
    trend: "20%",
    icon: PackageCheck,
    color: "#20C997",
    dataKey: "pedidos"
  },
  {
    label: "Clientes nuevos",
    value: "34",
    trend: "13%",
    icon: UserPlus,
    color: "#7C4DFF",
    dataKey: "clientes"
  }
];

const activity = [
  { title: "Pedido entregado", detail: "#4589 - Perfume Victoria 100ml", time: "Hace 8 min", tone: "bg-emerald-50 text-emerald-600" },
  { title: "Nueva comision", detail: "RD$ 420.00 agregados a tu balance", time: "Hace 24 min", tone: "bg-blue-50 text-primary" },
  { title: "Producto destacado", detail: "Reloj Naviforce NF9197 subio 25%", time: "Hace 1 h", tone: "bg-violet-50 text-violet-600" }
];

export default function DashboardPage() {
  return (
    <DashboardShell mode="dashboard" eyebrow="Aqui tienes un resumen de tu negocio." title="Bienvenido, Emprendedor!">
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        {stats.map((metric) => (
          <PremiumStatCard key={metric.label} {...metric} />
        ))}
      </div>

      <div className="mt-6 grid gap-6 2xl:grid-cols-[1.7fr_1fr]">
        <Card className="overflow-hidden border-[#e6eefb] bg-white shadow-premium">
          <CardHeader className="flex-row items-center justify-between space-y-0 border-b border-[#edf2fb] pb-5">
            <CardTitle>Ventas recientes</CardTitle>
            <span className="text-sm font-bold text-primary">Ver todos</span>
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
                  {recentOrders.map((order) => (
                    <tr key={order.id} className="border-b border-[#edf2fb] last:border-0">
                      <td className="px-6 py-4 font-black text-primary">{order.id}</td>
                      <td className="px-4 py-4 font-semibold text-navy">{order.customer}</td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-3">
                          <ProductThumb name={order.product} />
                          <span className="font-semibold text-navy/85">{order.product}</span>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-muted-foreground">{order.date}</td>
                      <td className="px-4 py-4">
                        <OrderStatusBadge status={order.status} />
                      </td>
                      <td className="px-6 py-4 font-black text-navy">{order.profit}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        <DonutSummary title="Resumen de ganancias" total="24,560.00" data={entrepreneurEarningsBreakdown} />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-2 2xl:grid-cols-[0.95fr_1fr_0.72fr]">
        <Card className="border-[#e6eefb] shadow-premium">
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <CardTitle>Productos mas vendidos</CardTitle>
            <span className="text-sm font-bold text-primary">Ver todos</span>
          </CardHeader>
          <CardContent className="space-y-5">
            {products.slice(0, 3).map((product) => (
              <div key={product.id} className="grid grid-cols-[48px_1fr_auto] items-center gap-4">
                <ProductThumb name={product.name} />
                <div>
                  <p className="font-black text-navy">{product.name}</p>
                  <p className="mt-1 text-sm text-muted-foreground">Ventas: {product.sold}</p>
                  <div className="mt-3 h-2 rounded-full bg-[#e8eef8]">
                    <div className="h-2 rounded-full bg-primary shadow-[0_6px_16px_rgba(7,91,255,0.25)]" style={{ width: `${product.share}%` }} />
                  </div>
                </div>
                <p className="font-black text-navy">{product.share}%</p>
              </div>
            ))}
          </CardContent>
        </Card>

        <SeriesChart
          title="Rendimiento"
          data={revenueSeries}
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
                <p className="font-black text-amber-300">Nivel Oro</p>
                <p className="mt-3 text-sm text-white/82">1,250 / 2,000 XP</p>
              </div>
              <div className="grid h-14 w-14 place-items-center rounded-full bg-amber-400 text-white shadow-soft">
                <Star className="h-7 w-7 fill-white" aria-hidden="true" />
              </div>
            </div>
            <div className="mt-5 h-2 rounded-full bg-white/20">
              <div className="h-2 w-[63%] rounded-full bg-amber-300" />
            </div>
            <div className="mt-7 space-y-4">
              {[
                ["Completa 20 ventas este mes", true, "20/20"],
                ["Invita a 5 emprendedores", true, "5/5"],
                ["Activa 3 promociones", false, "1/3"]
              ].map(([label, done, progress]) => (
                <div key={label as string} className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3 text-sm">
                    {done ? <CheckCircle2 className="h-5 w-5 text-emerald-300" /> : <Circle className="h-5 w-5 text-white/60" />}
                    <span>{label}</span>
                  </div>
                  <span className="text-sm font-black">{progress}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6 border-[#e6eefb] shadow-premium">
        <CardHeader>
          <CardTitle>Actividad reciente</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-3">
          {activity.map((item) => (
            <div key={item.title} className="rounded-lg border border-[#edf2fb] bg-[#fbfdff] p-4">
              <div className={`mb-4 grid h-10 w-10 place-items-center rounded-md ${item.tone}`}>
                <ArrowUp className="h-5 w-5" aria-hidden="true" />
              </div>
              <p className="font-black text-navy">{item.title}</p>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">{item.detail}</p>
              <p className="mt-3 text-xs font-bold text-primary">{item.time}</p>
            </div>
          ))}
        </CardContent>
      </Card>
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
