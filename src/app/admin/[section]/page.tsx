import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { OrderStatusBadge } from "@/components/order-status-badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  commissions,
  customers,
  deliveryTeams,
  entrepreneurs,
  financialReports,
  payments,
  products,
  recentOrders,
  suppliers,
} from "@/lib/mock-data";

import { AdminOrdersTable } from "@/components/order-flow/AdminOrdersTable";

const sectionTitles: Record<string, string> = {
  emprendedores: "Gestion de emprendedores",
  clientes: "Gestion de clientes",
  productos: "Productos",
  pedidos: "Pedidos",
  "tiendas-proveedoras": "Tiendas proveedoras",
  deliverys: "Deliverys",
  "pagos-emprendedores": "Pagos a emprendedores",
  "pagos-tiendas": "Pagos a tiendas",
  comisiones: "Comisiones",
  "reportes-financieros": "Reportes financieros",
  promociones: "Promociones",
  notificaciones: "Notificaciones",
  soporte: "Soporte",
  usuarios: "Usuarios",
  "roles-permisos": "Roles y permisos",
  configuracion: "Configuracion general",
};

export default async function AdminSectionPage({
  params,
}: {
  params: Promise<{ section: string }>;
}) {
  const { section } = await params;
  const title = sectionTitles[section] ?? "Modulo administrativo";

  return (
    <DashboardShell mode="admin" eyebrow="Modulo administrativo" title={title}>
      {/* ── EMPRENDEDORES ── */}
      {section === "emprendedores" && (
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>Listado de Emprendedores</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[700px] text-sm text-left">
                <thead>
                  <tr className="border-b border-border text-xs text-muted-foreground">
                    <th className="py-3 font-black">Emprendedor</th>
                    <th className="py-3 font-black">Tienda</th>
                    <th className="py-3 font-black">Nivel</th>
                    <th className="py-3 font-black">Ventas</th>
                    <th className="py-3 font-black">Pedidos</th>
                    <th className="py-3 font-black">Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {entrepreneurs.map((e) => (
                    <tr key={e.id} className="border-b border-border last:border-0">
                      <td className="py-4 font-black text-navy">{e.name}</td>
                      <td className="py-4 text-muted-foreground">{e.store}</td>
                      <td className="py-4 font-bold text-navy">{e.level}</td>
                      <td className="py-4 font-bold text-emerald-600">RD$ {e.sales.toLocaleString("en-US")}</td>
                      <td className="py-4 font-bold text-navy">{e.orders}</td>
                      <td className="py-4"><OrderStatusBadge status={e.status} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ── CLIENTES ── */}
      {section === "clientes" && (
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>Listado de Clientes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[700px] text-sm text-left">
                <thead>
                  <tr className="border-b border-border text-xs text-muted-foreground">
                    <th className="py-3 font-black">Cliente</th>
                    <th className="py-3 font-black">Pedidos Totales</th>
                    <th className="py-3 font-black">Gasto Total</th>
                    <th className="py-3 font-black">Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {customers.map((c) => (
                    <tr key={c.id} className="border-b border-border last:border-0">
                      <td className="py-4 font-black text-navy">{c.name}</td>
                      <td className="py-4 font-bold text-navy">{c.orders}</td>
                      <td className="py-4 font-bold text-emerald-600">RD$ {c.total.toLocaleString("en-US")}</td>
                      <td className="py-4"><OrderStatusBadge status={c.status} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ── PRODUCTOS ── */}
      {section === "productos" && (
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>Catalogo General</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[800px] text-sm text-left">
                <thead>
                  <tr className="border-b border-border text-xs text-muted-foreground">
                    <th className="py-3 font-black">Producto</th>
                    <th className="py-3 font-black">Categoria</th>
                    <th className="py-3 font-black">Costo</th>
                    <th className="py-3 font-black">Precio Venta</th>
                    <th className="py-3 font-black">Stock</th>
                    <th className="py-3 font-black">Vendidos</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((p) => (
                    <tr key={p.id} className="border-b border-border last:border-0">
                      <td className="py-4 font-black text-navy">{p.name}</td>
                      <td className="py-4 text-muted-foreground">{p.category}</td>
                      <td className="py-4 font-bold text-muted-foreground">RD$ {p.cost.toLocaleString("en-US")}</td>
                      <td className="py-4 font-bold text-navy">RD$ {p.price.toLocaleString("en-US")}</td>
                      <td className="py-4"><OrderStatusBadge status={p.stockLabel as never} /></td>
                      <td className="py-4 font-bold text-navy">{p.sold}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ── PEDIDOS ── */}
      {section === "pedidos" && (
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>Todos los Pedidos</CardTitle>
          </CardHeader>
          <CardContent>
            <AdminOrdersTable />
          </CardContent>
        </Card>
      )}

      {/* ── TIENDAS PROVEEDORAS ── */}
      {section === "tiendas-proveedoras" && (
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>Proveedores</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {suppliers.map((s) => (
                <div key={s.id} className="rounded-lg border border-border p-5">
                  <div className="flex items-center justify-between gap-3">
                    <div className="grid h-11 w-11 place-items-center rounded-lg bg-primary/10 font-black text-primary text-sm">
                      {s.name.slice(0, 2).toUpperCase()}
                    </div>
                    <OrderStatusBadge status={s.status} />
                  </div>
                  <p className="mt-4 font-black text-navy">{s.name}</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {s.products} productos activos
                  </p>
                  <p className="mt-1 text-sm font-semibold text-orange-600">
                    {s.pending} pedidos pendientes
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* ── DELIVERYS ── */}
      {section === "deliverys" && (
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>Equipos de Delivery</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {deliveryTeams.map((d) => (
                <div key={d.id} className="rounded-lg border border-border p-5">
                  <div className="flex items-center justify-between gap-3">
                    <div className="grid h-11 w-11 place-items-center rounded-full bg-emerald-100 font-black text-emerald-700 text-sm">
                      {d.name.slice(0, 2).toUpperCase()}
                    </div>
                    <OrderStatusBadge status={d.status} />
                  </div>
                  <p className="mt-4 font-black text-navy">{d.name}</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {d.deliveries} entregas completadas
                  </p>
                  <p className="mt-1 text-sm font-semibold text-amber-500">
                    Rating: {d.rating} ★
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* ── PAGOS EMPRENDEDORES ── */}
      {section === "pagos-emprendedores" && (
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>Pagos a Emprendedores</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {payments.filter((p) => p.recipientType === "emprendedor").map((p) => (
                <div key={p.id} className="flex items-center justify-between gap-4 rounded-lg border border-border p-5">
                  <div>
                    <p className="font-black text-navy">{p.label} - {p.recipientId}</p>
                    <p className="mt-1 text-sm text-muted-foreground">{p.date}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-black text-navy">RD$ {p.amount.toLocaleString("en-US")}</p>
                    <div className="mt-1"><OrderStatusBadge status={p.status} /></div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* ── PAGOS TIENDAS ── */}
      {section === "pagos-tiendas" && (
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>Cuentas por Pagar a Proveedores</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {payments.filter((p) => p.recipientType === "tienda").map((p) => (
                <div key={p.id} className="flex items-center justify-between gap-4 rounded-lg border border-border p-5">
                  <div>
                    <p className="font-black text-navy">{p.label} - {p.recipientId}</p>
                    <p className="mt-1 text-sm text-muted-foreground">{p.date}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-black text-navy">RD$ {p.amount.toLocaleString("en-US")}</p>
                    <div className="mt-1"><OrderStatusBadge status={p.status} /></div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* ── COMISIONES ── */}
      {section === "comisiones" && (
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>Comisiones de Plataforma</CardTitle>
          </CardHeader>
          <CardContent>
             <div className="overflow-x-auto">
              <table className="w-full min-w-[700px] text-sm text-left">
                <thead>
                  <tr className="border-b border-border text-xs text-muted-foreground">
                    <th className="py-3 font-black">ID</th>
                    <th className="py-3 font-black">Pedido</th>
                    <th className="py-3 font-black">Concepto</th>
                    <th className="py-3 font-black">Monto</th>
                    <th className="py-3 font-black">Tasa (%)</th>
                    <th className="py-3 font-black">Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {commissions.map((c) => (
                    <tr key={c.id} className="border-b border-border last:border-0">
                      <td className="py-4 font-black text-primary">{c.id}</td>
                      <td className="py-4 font-semibold text-navy">{c.orderId}</td>
                      <td className="py-4 text-muted-foreground">{c.label}</td>
                      <td className="py-4 font-bold text-emerald-600">RD$ {c.amount.toLocaleString("en-US")}</td>
                      <td className="py-4 font-bold text-navy">{c.rate}%</td>
                      <td className="py-4"><OrderStatusBadge status={c.status} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ── REPORTES FINANCIEROS ── */}
      {section === "reportes-financieros" && (
        <div className="grid gap-6 xl:grid-cols-[1fr_0.75fr]">
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle>Reportes Financieros (Muestra)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {financialReports.map((item) => (
                  <div key={item.label} className="flex items-center justify-between gap-4 rounded-lg bg-secondary p-4">
                    <div>
                      <p className="font-black text-navy">{item.label}</p>
                      <p className="mt-1 text-sm text-muted-foreground">{item.value}</p>
                    </div>
                    <OrderStatusBadge status={item.status as never} />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* ── SECCIONES GENERICAS / NO DEFINIDAS COMPLETAMENTE ── */}
      {["promociones", "notificaciones", "soporte", "usuarios", "roles-permisos", "configuracion"].includes(section) && (
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>{title}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-xl border border-primary/20 bg-gradient-to-br from-[#eef4ff] to-white p-8 text-center">
              <p className="text-2xl font-black text-navy">Modulo en construccion</p>
              <p className="mt-2 text-muted-foreground">
                La seccion de {title.toLowerCase()} estara disponible proximamente con acciones reales de administracion.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </DashboardShell>
  );
}
