"use client";

import { use, useEffect, useState } from "react";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { OrderStatusBadge } from "@/components/order-status-badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { db } from "@/lib/firebase";
import { collection, onSnapshot, orderBy, query } from "firebase/firestore";
import { AdminOrdersTable } from "@/components/order-flow/AdminOrdersTable";
import { AdminProfilesTable } from "@/components/admin/AdminProfilesTable";

const sectionTitles: Record<string, string> = {
  emprendedores: "Gestión de emprendedores",
  clientes: "Gestión de clientes",
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
  configuracion: "Configuración general",
};

export default function AdminSectionPage({
  params,
}: {
  params: Promise<{ section: string }>;
}) {
  const { section } = use(params);
  const title = sectionTitles[section] ?? "Módulo administrativo";

  const [orders, setOrders] = useState<any[]>([]);
  const [profiles, setProfiles] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [earnings, setEarnings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);


  useEffect(() => {
    const unsubOrders = onSnapshot(
      query(collection(db, "orders"), orderBy("date", "desc")),
      (snap) => { setOrders(snap.docs.map((d) => ({ id: d.id, ...d.data() }))); setLoading(false); },
      () => setLoading(false)
    );
    const unsubProfiles = onSnapshot(collection(db, "profiles"), (snap) => {
      setProfiles(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });
    const unsubProducts = onSnapshot(
      query(collection(db, "products"), orderBy("created_at", "desc")),
      (snap) => { setProducts(snap.docs.map((d) => ({ id: d.id, ...d.data() }))); }
    );
    const unsubEarnings = onSnapshot(
      query(collection(db, "earnings"), orderBy("created_at", "desc")),
      (snap) => { setEarnings(snap.docs.map((d) => ({ id: d.id, ...d.data() }))); }
    );

    return () => {
      unsubOrders();
      unsubProfiles();
      unsubProducts();
      unsubEarnings();
    };
  }, []);

  if (loading) {
    return (
      <DashboardShell mode="admin" eyebrow="Módulo administrativo" title={title}>
        <div className="flex h-64 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      </DashboardShell>
    );
  }

  // Derive Client List
  const customerMap = new Map();
  orders.forEach((o) => {
    const key = o.customerPhone || o.customerEmail || "N/A";
    if (!customerMap.has(key)) {
      customerMap.set(key, {
        id: key,
        name: o.customerName || "Cliente",
        orders: 0,
        total: 0,
        status: "Activo"
      });
    }
    const current = customerMap.get(key);
    current.orders += 1;
    current.total += Number(o.amount || 0);
  });
  const liveCustomers = Array.from(customerMap.values());

  // Derive Suppliers (Proveedores) List
  const suppliersList = profiles.filter((p) => p.role === "proveedor").map((s) => {
    const supplierProductsCount = products.filter((p) => p.supplierId === s.id).length;
    const supplierOrdersCount = orders.filter((o) => o.supplierId === s.id && ["Pendiente", "Confirmado", "Solicitado a tienda"].includes(o.status)).length;
    return {
      id: s.id,
      name: s.full_name || s.store_name || "Tienda Proveedora",
      products: supplierProductsCount,
      pending: supplierOrdersCount,
      status: s.approved ? "Activo" : "Pendiente"
    };
  });

  // Derive Delivery List
  const deliveryTeamsList = profiles.filter((p) => p.role === "delivery").map((d) => {
    const deliveryOrdersCount = orders.filter((o) => o.deliveryId === d.id && o.status === "Entregado").length;
    return {
      id: d.id,
      name: d.full_name || "Delivery",
      deliveries: deliveryOrdersCount,
      rating: "5.0",
      status: "Activo"
    };
  });

  // Derive Payments to Entrepreneurs (Retiros de ganancias)
  const entrepreneurPayments = earnings.filter((e) => e.type === "retiro").map((e) => {
    const entrepreneurProfile = profiles.find((p) => p.id === e.entrepreneurId);
    return {
      id: e.id,
      label: `Retiro solicitado`,
      recipientId: entrepreneurProfile?.full_name || e.entrepreneurId || "Emprendedor",
      date: new Date(e.created_at || e.date).toLocaleDateString(),
      amount: Number(e.amount) || 0,
      status: "Completado"
    };
  });

  // Derive Payments to Suppliers (Cuentas por pagar)
  const supplierPaymentsList = orders.filter((o) => o.status === "Entregado").map((o) => {
    const supplierProfile = profiles.find((p) => p.id === o.supplierId);
    const costAmount = (Number(o.amount) || 0) - (Number(o.profit) || 0) - (Number(o.commission) || 0);
    return {
      id: `PAY-${o.id}`,
      label: `Pago por producto ${o.productName}`,
      recipientId: supplierProfile?.full_name || o.supplierId || "Proveedor",
      date: new Date(o.date || o.createdAt).toLocaleDateString(),
      amount: costAmount,
      status: "Pendiente"
    };
  });

  // Derive Commissions list
  const liveCommissions = orders.filter((o) => Number(o.commission) > 0).map((o) => ({
    id: `COM-${o.id}`,
    orderId: o.id,
    label: `Comisión por pedido`,
    amount: Number(o.commission) || 0,
    rate: Math.round(((Number(o.commission) || 0) / (Number(o.amount) || 1)) * 100),
    status: o.status === "Entregado" ? "Pagado" : "Pendiente"
  }));

  // Derive Financial Reports Summary
  const financialReportsList = [
    { label: "Total Ventas Recaudadas", value: `RD$ ${orders.reduce((s, o) => s + (Number(o.amount) || 0), 0).toLocaleString("en-US")}`, status: "Activo" },
    { label: "Comisiones Totales", value: `RD$ ${orders.reduce((s, o) => s + (Number(o.commission) || 0), 0).toLocaleString("en-US")}`, status: "Pagado" },
    { label: "Pagos Pendientes a Tiendas", value: `RD$ ${supplierPaymentsList.reduce((s, p) => s + p.amount, 0).toLocaleString("en-US")}`, status: "Pendiente" }
  ];

  return (
    <DashboardShell mode="admin" eyebrow="Módulo administrativo" title={title}>
      {/* ── EMPRENDEDORES ── */}
      {section === "emprendedores" && (
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>Solicitudes y Acceso de Emprendedores</CardTitle>
          </CardHeader>
          <CardContent>
            <AdminProfilesTable roleFilter="emprendedor" />
          </CardContent>
        </Card>
      )}

      {/* ── USUARIOS ── */}
      {section === "usuarios" && (
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>Gestión de Todos los Usuarios</CardTitle>
          </CardHeader>
          <CardContent>
            <AdminProfilesTable />
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
                    <th className="py-3 font-black">Cliente (Teléfono/Email)</th>
                    <th className="py-3 font-black">Pedidos Totales</th>
                    <th className="py-3 font-black">Gasto Total</th>
                    <th className="py-3 font-black">Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {liveCustomers.map((c) => (
                    <tr key={c.id} className="border-b border-border last:border-0">
                      <td className="py-4 font-black text-navy">{c.name} ({c.id})</td>
                      <td className="py-4 font-bold text-navy">{c.orders}</td>
                      <td className="py-4 font-bold text-emerald-600">RD$ {c.total.toLocaleString("en-US")}</td>
                      <td className="py-4"><OrderStatusBadge status={c.status} /></td>
                    </tr>
                  ))}
                  {liveCustomers.length === 0 && (
                    <tr>
                      <td colSpan={4} className="py-8 text-center text-muted-foreground">No hay clientes con pedidos registrados.</td>
                    </tr>
                  )}
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
            <CardTitle>Catálogo General</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[800px] text-sm text-left">
                <thead>
                  <tr className="border-b border-border text-xs text-muted-foreground">
                    <th className="py-3 font-black">Producto</th>
                    <th className="py-3 font-black">Categoría</th>
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
                      <td className="py-4 font-bold text-muted-foreground">RD$ {Number(p.cost || 0).toLocaleString("en-US")}</td>
                      <td className="py-4 font-bold text-navy">RD$ {Number(p.price || 0).toLocaleString("en-US")}</td>
                      <td className="py-4"><OrderStatusBadge status={(p.stock > 0 ? "Disponible" : "Agotado") as any} /></td>
                      <td className="py-4 font-bold text-navy">{p.sold || 0}</td>
                    </tr>
                  ))}
                  {products.length === 0 && (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-muted-foreground">No hay productos en el catálogo.</td>
                    </tr>
                  )}
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
        <div className="space-y-6">
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle>Proveedores</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {suppliersList.map((s) => (
                  <div key={s.id} className="rounded-lg border border-border p-5">
                    <div className="flex items-center justify-between gap-3">
                      <div className="grid h-11 w-11 place-items-center rounded-lg bg-primary/10 font-black text-primary text-sm">
                        {s.name.slice(0, 2).toUpperCase()}
                      </div>
                      <OrderStatusBadge status={s.status as any} />
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
                {suppliersList.length === 0 && (
                  <p className="col-span-full text-center py-8 text-muted-foreground">No hay tiendas proveedoras registradas.</p>
                )}
              </div>
            </CardContent>
          </Card>
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle>Solicitudes y Acceso de Proveedores (Tiendas)</CardTitle>
            </CardHeader>
            <CardContent>
              <AdminProfilesTable roleFilter="proveedor" />
            </CardContent>
          </Card>
        </div>
      )}

      {/* ── DELIVERYS ── */}
      {section === "deliverys" && (
        <div className="space-y-6">
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle>Equipos de Delivery</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {deliveryTeamsList.map((d) => (
                  <div key={d.id} className="rounded-lg border border-border p-5">
                    <div className="flex items-center justify-between gap-3">
                      <div className="grid h-11 w-11 place-items-center rounded-full bg-emerald-100 font-black text-emerald-700 text-sm">
                        {d.name.slice(0, 2).toUpperCase()}
                      </div>
                      <OrderStatusBadge status={d.status as any} />
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
                {deliveryTeamsList.length === 0 && (
                  <p className="col-span-full text-center py-8 text-muted-foreground">No hay repartidores registrados.</p>
                )}
              </div>
            </CardContent>
          </Card>
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle>Solicitudes y Acceso de Repartidores (Delivery)</CardTitle>
            </CardHeader>
            <CardContent>
              <AdminProfilesTable roleFilter="delivery" />
            </CardContent>
          </Card>
        </div>
      )}

      {/* ── PAGOS EMPRENDEDORES ── */}
      {section === "pagos-emprendedores" && (
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>Pagos a Emprendedores (Retiros)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {entrepreneurPayments.map((p) => (
                <div key={p.id} className="flex items-center justify-between gap-4 rounded-lg border border-border p-5">
                  <div>
                    <p className="font-black text-navy">{p.label} - {p.recipientId}</p>
                    <p className="mt-1 text-sm text-muted-foreground">{p.date}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-black text-navy">RD$ {p.amount.toLocaleString("en-US")}</p>
                    <div className="mt-1"><OrderStatusBadge status={p.status as any} /></div>
                  </div>
                </div>
              ))}
              {entrepreneurPayments.length === 0 && (
                <p className="text-center py-8 text-muted-foreground">No hay solicitudes de retiros.</p>
              )}
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
              {supplierPaymentsList.map((p) => (
                <div key={p.id} className="flex items-center justify-between gap-4 rounded-lg border border-border p-5">
                  <div>
                    <p className="font-black text-navy">{p.label} - {p.recipientId}</p>
                    <p className="mt-1 text-sm text-muted-foreground">{p.date}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-black text-navy">RD$ {p.amount.toLocaleString("en-US")}</p>
                    <div className="mt-1"><OrderStatusBadge status={p.status as any} /></div>
                  </div>
                </div>
              ))}
              {supplierPaymentsList.length === 0 && (
                <p className="text-center py-8 text-muted-foreground">No hay cuentas pendientes por pagar a tiendas.</p>
              )}
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
                  {liveCommissions.map((c) => (
                    <tr key={c.id} className="border-b border-border last:border-0">
                      <td className="py-4 font-black text-primary">{c.id}</td>
                      <td className="py-4 font-semibold text-navy">{c.orderId}</td>
                      <td className="py-4 text-muted-foreground">{c.label}</td>
                      <td className="py-4 font-bold text-emerald-600">RD$ {c.amount.toLocaleString("en-US")}</td>
                      <td className="py-4 font-bold text-navy">{c.rate}%</td>
                      <td className="py-4"><OrderStatusBadge status={c.status as any} /></td>
                    </tr>
                  ))}
                  {liveCommissions.length === 0 && (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-muted-foreground">No hay comisiones registradas todavía.</td>
                    </tr>
                  )}
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
              <CardTitle>Reportes Financieros (Basado en base de datos)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {financialReportsList.map((item) => (
                  <div key={item.label} className="flex items-center justify-between gap-4 rounded-lg bg-secondary p-4">
                    <div>
                      <p className="font-black text-navy">{item.label}</p>
                      <p className="mt-1 text-sm text-muted-foreground">{item.value}</p>
                    </div>
                    <OrderStatusBadge status={item.status as any} />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* ── SECCIONES GENERICAS / NO DEFINIDAS COMPLETAMENTE ── */}
      {["promociones", "notificaciones", "soporte", "roles-permisos", "configuracion"].includes(section) && (
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>{title}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-xl border border-primary/20 bg-gradient-to-br from-[#eef4ff] to-white p-8 text-center">
              <p className="text-2xl font-black text-navy">Módulo en construcción</p>
              <p className="mt-2 text-muted-foreground">
                La sección de {title.toLowerCase()} estará disponible próximamente con acciones reales de administración.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </DashboardShell>
  );
}
