import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { DonutSummary, SeriesChart } from "@/components/dashboard/charts";
import { OrderStatusBadge } from "@/components/order-status-badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  customers,
  earnings,
  entrepreneurEarningsBreakdown,
  products,
  recentOrders,
  revenueSeries,
} from "@/lib/mock-data";

import { EntrepreneurProductsTable } from "@/components/order-flow/EntrepreneurProductsTable";
import { EntrepreneurOrdersTable } from "@/components/order-flow/EntrepreneurOrdersTable";
import { EntrepreneurEarningsList } from "@/components/order-flow/EntrepreneurEarningsList";

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

export default async function EntrepreneurSectionPage({
  params,
}: {
  params: Promise<{ section: string }>;
}) {
  const { section } = await params;
  const title = sectionTitles[section] ?? "Seccion";
  const myEarnings = earnings.filter((e) => e.entrepreneurId === "ENT-001");
  const myWithdrawals = myEarnings.filter((e) => e.type === "retiro");

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
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {customers.map((c) => (
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
          <DonutSummary title="Resumen de ganancias" total="8,110.00" data={entrepreneurEarningsBreakdown} />
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
                {myWithdrawals.map((e) => (
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
                ))}
              </div>
            </CardContent>
          </Card>
          <Card className="shadow-sm">
            <CardContent className="pt-6">
              <p className="text-sm font-bold text-muted-foreground">Balance disponible</p>
              <p className="mt-2 text-3xl font-black text-primary">RD$ 4,600.00</p>
              <p className="mt-1 text-sm text-muted-foreground">Los retiros se procesan en 1-3 dias habiles.</p>
              <div className="mt-6 space-y-3">
                {[
                  { label: "Banco", value: "Banco Popular" },
                  { label: "Cuenta", value: "****4521" },
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
            data={revenueSeries}
            keys={[
              { key: "ventas", label: "Ventas", color: "#075BFF" },
              { key: "ganancias", label: "Ganancias (RD$)", color: "#20C997" },
            ]}
          />
          <div className="grid gap-6 xl:grid-cols-3">
            {[
              { label: "Total vendido este mes", value: "RD$ 24,560", sub: "vs RD$ 18,200 mes anterior" },
              { label: "Pedidos completados", value: "118", sub: "de 126 pedidos totales" },
              { label: "Tasa de conversion", value: "93.6%", sub: "promedio plataforma 87%" },
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
            {products.map((p) => (
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

      {/* ── MATERIALES ── */}
      {section === "materiales" && (
        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {[
            { title: "Guia de ventas por WhatsApp", desc: "Aprende a cerrar ventas efectivas por mensajes directos.", tag: "PDF" },
            { title: "Plantillas para Instagram", desc: "Imagenes y copies para promover tus productos en redes.", tag: "ZIP" },
            { title: "Video: Como usar el dashboard", desc: "Tutorial completo para emprendedores nuevos.", tag: "VIDEO" },
            { title: "Politicas de devolucion", desc: "Documenta las condiciones de cambio y devolucion.", tag: "PDF" },
            { title: "Estrategias de precio", desc: "Como fijar el precio correcto y maximizar tu ganancia.", tag: "PDF" },
            { title: "Guia de atencion al cliente", desc: "Manejo de quejas, seguimientos y fidelizacion.", tag: "PDF" },
          ].map((m) => (
            <Card key={m.title} className="shadow-sm">
              <CardContent className="pt-6">
                <span className="inline-block rounded-md bg-secondary px-3 py-1 text-xs font-black text-primary">{m.tag}</span>
                <p className="mt-4 font-black text-navy">{m.title}</p>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{m.desc}</p>
                <button className="mt-4 text-sm font-bold text-primary hover:underline">Descargar →</button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* ── MI PERFIL ── */}
      {section === "perfil" && (
        <div className="grid gap-6 xl:grid-cols-[0.55fr_1fr]">
          <Card className="shadow-sm">
            <CardContent className="pt-6 text-center">
              <div className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-gradient-to-br from-primary to-[#071a36] text-2xl font-black text-white">
                ER
              </div>
              <p className="mt-4 text-xl font-black text-navy">Emprendedor RD</p>
              <p className="mt-1 text-sm text-muted-foreground">emprendedor@linkeo.do</p>
              <div className="mt-4 inline-block rounded-full bg-amber-100 px-4 py-1.5 text-sm font-black text-amber-700">
                Nivel Oro ★
              </div>
              <div className="mt-6 grid grid-cols-3 gap-3 text-center border-t border-border pt-6">
                <div><p className="text-xl font-black text-navy">126</p><p className="mt-1 text-xs text-muted-foreground">Ventas</p></div>
                <div><p className="text-xl font-black text-navy">34</p><p className="mt-1 text-xs text-muted-foreground">Clientes</p></div>
                <div><p className="text-xl font-black text-navy">RD$24K</p><p className="mt-1 text-xs text-muted-foreground">Ganado</p></div>
              </div>
            </CardContent>
          </Card>
          <Card className="shadow-sm">
            <CardHeader><CardTitle>Datos del perfil</CardTitle></CardHeader>
            <CardContent className="space-y-0 divide-y divide-border">
              {[
                { label: "Nombre completo", value: "Emprendedor RD" },
                { label: "Correo electronico", value: "emprendedor@linkeo.do" },
                { label: "Telefono", value: "+1 (809) 555-1234" },
                { label: "Ciudad", value: "Santo Domingo, RD" },
                { label: "Nombre de tienda", value: "Tienda Linkeo RD" },
                { label: "Metodo de cobro", value: "Transferencia bancaria" },
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

      {/* ── CONFIGURACION ── */}
      {section === "configuracion" && (
        <div className="grid gap-6">
          {[
            {
              title: "Notificaciones",
              items: [
                { label: "Notificaciones por correo", on: true },
                { label: "Alertas de nuevo pedido", on: true },
                { label: "Resumen semanal", on: false },
              ],
            },
            {
              title: "Privacidad",
              items: [
                { label: "Perfil publico", on: true },
                { label: "Compartir estadisticas con Linkeo", on: false },
              ],
            },
            {
              title: "Pagos",
              items: [
                { label: "Retiro automatico al llegar a RD$5,000", on: false },
                { label: "Notificar cada pago recibido", on: true },
              ],
            },
          ].map((group) => (
            <Card key={group.title} className="shadow-sm">
              <CardHeader><CardTitle>{group.title}</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                {group.items.map((item) => (
                  <div key={item.label} className="flex items-center justify-between gap-4 rounded-lg border border-border p-4">
                    <p className="font-bold text-navy">{item.label}</p>
                    <span className={`rounded-full px-4 py-1 text-xs font-black ${item.on ? "bg-emerald-100 text-emerald-700" : "bg-secondary text-muted-foreground"}`}>
                      {item.on ? "Activado" : "Desactivado"}
                    </span>
                  </div>
                ))}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* ── AYUDA ── */}
      {section === "ayuda" && (
        <div className="grid gap-6">
          <div className="rounded-xl border border-primary/20 bg-gradient-to-br from-[#eef4ff] to-white p-8 text-center">
            <p className="text-3xl font-black text-navy">¿Como podemos ayudarte?</p>
            <p className="mt-2 text-muted-foreground">Nuestro equipo de soporte esta disponible 24/7</p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <button className="rounded-md bg-primary px-6 py-2.5 text-sm font-black text-white">Chat en vivo</button>
              <button className="rounded-md border border-border px-6 py-2.5 text-sm font-black text-navy">Enviar correo</button>
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {[
              { q: "Como solicitar un retiro?", a: "Ve a Mis retiros y selecciona el monto disponible para transferir a tu cuenta bancaria." },
              { q: "Cuanto tarda en llegar un pedido?", a: "Los pedidos se entregan en 1 a 3 dias habiles dependiendo de la zona." },
              { q: "Como agrego un nuevo cliente?", a: "Los clientes se agregan automaticamente al cerrar una venta con un nuevo contacto." },
              { q: "Que hago si un pedido fue cancelado?", a: "Contacta soporte desde esta seccion y te ayudamos a gestionar el reembolso o reenvio." },
            ].map((faq) => (
              <Card key={faq.q} className="shadow-sm">
                <CardContent className="pt-6">
                  <p className="font-black text-navy">{faq.q}</p>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">{faq.a}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

    </DashboardShell>
  );
}
