"use client";

import { useEffect, useState } from "react";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { DonutSummary, SeriesChart } from "@/components/dashboard/charts";
import { OrderStatusBadge } from "@/components/order-status-badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Truck, Edit, Save, X } from "lucide-react";

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
  estadisticas: "Estadísticas",
  promociones: "Promociones",
  materiales: "Materiales",
  perfil: "Mi perfil",
  configuracion: "Configuración",
  ayuda: "Ayuda",
};

export function EntrepreneurDashboardContent({ section }: { section: string }) {
  const title = sectionTitles[section] ?? "Sección";
  const { orders, localEarnings, currentUser, products, updateProfile } = useOrderStorage();
  const [isEditing, setIsEditing] = useState(false);
  
  const myWithdrawals = localEarnings.filter((e) => e.type === "retiro");
  
  // Calculate real stats
  const totalEarned = localEarnings.filter(curr => curr.type === "venta").reduce((acc, curr) => acc + Number(curr.amount), 0);
  const totalWithdrawals = localEarnings.filter(curr => curr.type === "retiro").reduce((acc, curr) => acc + Number(curr.amount), 0);
  const availableBalance = totalEarned - Math.abs(totalWithdrawals);

  // Real customers from orders
  const customerMap = new Map();
  orders.forEach(order => {
    const key = order.customerPhone || order.customerEmail || "N/A";
    if (!customerMap.has(key)) {
      customerMap.set(key, {
        id: key,
        name: order.customerName || "Cliente",
        email: order.customerEmail || "",
        orders: 0,
        total: 0,
        status: "Activo"
      });
    }
    const c = customerMap.get(key);
    c.orders += 1;
    c.total += parseFloat(String(order.amount).replace(/[^0-9.-]+/g, "")) || 0;
  });
  const myCustomers = Array.from(customerMap.values());

  // Dynamic earnings breakdown
  const salesEarnings = localEarnings.filter((item) => item.type === "venta").reduce((sum, item) => sum + Number(item.amount), 0);
  const bonusEarnings = localEarnings.filter((item) => item.type === "bono").reduce((sum, item) => sum + Number(item.amount), 0);
  const withdrawalEarnings = localEarnings.filter((item) => item.type === "retiro").reduce((sum, item) => sum + Number(item.amount), 0);
  const earningsBase = salesEarnings + bonusEarnings + Math.abs(withdrawalEarnings) || 1;

  const entrepreneurEarningsBreakdownData = [
    { name: "Ganancia por ventas", value: Number(((salesEarnings / earningsBase) * 100).toFixed(1)), amount: `RD$ ${salesEarnings.toLocaleString("en-US")}`, color: "#20C997" },
    { name: "Bonos y promociones", value: Number(((bonusEarnings / earningsBase) * 100).toFixed(1)), amount: `RD$ ${bonusEarnings.toLocaleString("en-US")}`, color: "#075BFF" },
    { name: "Retiros", value: Number(((Math.abs(withdrawalEarnings) / earningsBase) * 100).toFixed(1)), amount: `RD$ ${Math.abs(withdrawalEarnings).toLocaleString("en-US")}`, color: "#7C4DFF" }
  ];

  // Dynamic time series for performance chart
  const performanceGroups: Record<string, { ventas: number; ganancias: number }> = {};
  orders.slice(0, 30).reverse().forEach((o) => {
    const day = o.date ? new Date(o.date).toLocaleDateString("es-DO", { day: "numeric", month: "short" }) : "Hoy";
    if (!performanceGroups[day]) {
      performanceGroups[day] = { ventas: 0, ganancias: 0 };
    }
    performanceGroups[day].ventas += Number(o.amount) || 0;
    performanceGroups[day].ganancias += Number(o.profit) || 0;
  });

  const revenueSeriesData = Object.entries(performanceGroups).map(([month, data]) => ({
    month,
    ventas: data.ventas,
    ganancias: data.ganancias
  }));

  return (
    <DashboardShell mode="dashboard" eyebrow={title} title={title}>

      {/* ── MIS PRODUCTOS ── */}
      {section === "mis-productos" && (
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>Catálogo de productos disponibles</CardTitle>
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
                <p className="text-muted-foreground">Aún no tienes clientes. ¡Empieza a vender para verlos aquí!</p>
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
            data={totalEarned > 0 ? entrepreneurEarningsBreakdownData : []} 
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
                        <p className="text-xl font-black text-navy">RD$ {Number(e.amount).toLocaleString("en-US")}</p>
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
              <p className="mt-1 text-sm text-muted-foreground">Los retiros se procesan en 1-3 días hábiles.</p>
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
            data={revenueSeriesData.length > 0 ? revenueSeriesData : [{ month: "Sin datos", ventas: 0, ganancias: 0 }]}
            keys={[
              { key: "ventas", label: "Ventas", color: "#075BFF" },
              { key: "ganancias", label: "Ganancias (RD$)", color: "#20C997" },
            ]}
          />
          <div className="grid gap-6 xl:grid-cols-3">
            {[
              { label: "Total ganado", value: `RD$ ${totalEarned.toLocaleString("en-US")}`, sub: "histórico total" },
              { label: "Pedidos realizados", value: orders.length.toString(), sub: "de todos los tiempos" },
              { label: "Clientes únicos", value: myCustomers.length.toString(), sub: "contactos registrados" },
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
            <p className="mt-1 text-2xl font-black text-navy">Impulsa tus ventas con estos artículos</p>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {products.slice(0, 6).map((p) => (
              <Card key={p.id} className="shadow-sm">
                <CardContent className="pt-6">
                  <div className={`mb-4 grid h-14 w-14 place-items-center rounded-xl text-2xl font-black bg-blue-50 text-blue-600`}>
                    {p.name.slice(0, 1)}
                  </div>
                  <p className="font-black text-navy">{p.name}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{p.category} · Demanda {p.demand || "Media"}</p>
                  <div className="mt-4 flex items-center justify-between">
                    <span className="font-black text-primary">RD$ {Number(p.price || 0).toLocaleString("en-US")}</span>
                    <span className="text-sm font-bold text-emerald-600">+RD$ {Number(p.margin || 0).toLocaleString("en-US")}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
            {products.length === 0 && (
              <p className="col-span-full text-center py-8 text-muted-foreground">No hay productos en catálogo para promocionar.</p>
            )}
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
          {isEditing ? (
            <ProfileEditForm currentUser={currentUser} updateProfile={updateProfile} onCancel={() => setIsEditing(false)} />
          ) : (
            <Card className="shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between space-y-0">
                <CardTitle>Datos del perfil</CardTitle>
                <button
                  onClick={() => setIsEditing(true)}
                  className="inline-flex items-center gap-1.5 rounded-md border border-border bg-white px-3 py-1.5 text-xs font-black text-navy shadow-sm hover:bg-slate-50 transition"
                >
                  <Edit className="h-3.5 w-3.5 text-primary" /> Editar Perfil
                </button>
              </CardHeader>
              <CardContent className="space-y-0 divide-y divide-border">
                {[
                  { label: "Nombre completo", value: currentUser?.full_name || "..." },
                  { label: "Correo electrónico", value: currentUser?.email || "..." },
                  { label: "Teléfono", value: currentUser?.phone || "No registrado" },
                  { label: "Ciudad", value: currentUser?.city || "No registrada" },
                  { label: "Nombre de tienda", value: currentUser?.store_name || "Mi Tienda Linkeo" },
                  { label: "Método de cobro", value: currentUser?.payment_method || "Transferencia bancaria" },
                ].map((f) => (
                  <div key={f.label} className="grid grid-cols-[160px_1fr] items-center gap-4 py-4">
                    <p className="text-sm font-bold text-muted-foreground">{f.label}</p>
                    <p className="font-black text-navy">{f.value}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* ── CONFIGURACION ── */}
      {section === "configuracion" && (
        <SettingsForm currentUser={currentUser} updateProfile={updateProfile} />
      )}

      {/* Default cases for other sections */}
      {["materiales", "ayuda"].includes(section) && (
        <div className="py-12 text-center text-muted-foreground">
          Contenido de {title} en desarrollo...
        </div>
      )}

    </DashboardShell>
  );
}

function SettingsForm({ currentUser, updateProfile }: { currentUser: any; updateProfile: (fields: any) => Promise<void> }) {
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("");
  const [storeName, setStoreName] = useState("");
  const [bankName, setBankName] = useState("");
  const [bankAccount, setBankAccount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("Transferencia bancaria");
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (currentUser) {
      setFullName(currentUser.full_name || "");
      setPhone(currentUser.phone || "");
      setCity(currentUser.city || "");
      setStoreName(currentUser.store_name || "");
      setBankName(currentUser.bank_name || "Banco Popular");
      setBankAccount(currentUser.bank_account || "");
      setPaymentMethod(currentUser.payment_method || "Transferencia bancaria");
    }
  }, [currentUser]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccess(false);
    await updateProfile({
      full_name: fullName,
      phone,
      city,
      store_name: storeName,
      bank_name: bankName,
      bank_account: bankAccount,
      payment_method: paymentMethod
    });
    setSaving(false);
    setSuccess(true);
    setTimeout(() => setSuccess(false), 3000);
  };

  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle>Configuración de la Cuenta</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {success && (
            <div className="rounded-lg bg-emerald-50 p-4 text-sm font-bold text-emerald-700 border border-emerald-100">
              ¡Configuración guardada exitosamente!
            </div>
          )}

          <div className="grid gap-6 md:grid-cols-2">
            {/* Datos Personales */}
            <div className="space-y-4">
              <h3 className="text-sm font-black uppercase text-muted-foreground">Datos Personales</h3>
              <div>
                <label className="mb-1 block text-xs font-bold text-navy">Nombre Completo</label>
                <input
                  required
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full rounded-md border border-border px-3 py-2 text-sm bg-white"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-bold text-navy">Teléfono</label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Ej. 809-555-0199"
                  className="w-full rounded-md border border-border px-3 py-2 text-sm bg-white"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-bold text-navy">Ciudad</label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="Ej. Santo Domingo"
                  className="w-full rounded-md border border-border px-3 py-2 text-sm bg-white"
                />
              </div>
            </div>

            {/* Datos de Tienda y Banco */}
            <div className="space-y-4">
              <h3 className="text-sm font-black uppercase text-muted-foreground">Negocio y Cobros</h3>
              <div>
                <label className="mb-1 block text-xs font-bold text-navy">Nombre de tu Tienda</label>
                <input
                  type="text"
                  value={storeName}
                  onChange={(e) => setStoreName(e.target.value)}
                  placeholder="Ej. Mi Tienda Linkeo"
                  className="w-full rounded-md border border-border px-3 py-2 text-sm bg-white"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-bold text-navy">Banco</label>
                <select
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                  className="w-full rounded-md border border-border px-3 py-2 text-sm bg-white"
                >
                  <option value="Banco Popular">Banco Popular Dominicano</option>
                  <option value="Banco de Reservas">Banreservas</option>
                  <option value="Banco BHD">Banco BHD</option>
                  <option value="Asociación Popular">Asociación Popular (APAP)</option>
                  <option value="Banco Scotiabank">Scotiabank</option>
                </select>
              </div>
              <div>
                <label className="mb-1 block text-xs font-bold text-navy">Número de Cuenta</label>
                <input
                  type="text"
                  value={bankAccount}
                  onChange={(e) => setBankAccount(e.target.value)}
                  placeholder="Ej. 799123456"
                  className="w-full rounded-md border border-border px-3 py-2 text-sm bg-white font-mono"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end border-t border-border pt-4">
            <button
              type="submit"
              disabled={saving}
              className="rounded-lg bg-primary px-6 py-2.5 text-sm font-black text-white hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              {saving ? "Guardando..." : "Guardar Configuración"}
            </button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

function ProfileEditForm({ currentUser, updateProfile, onCancel }: { currentUser: any; updateProfile: (fields: any) => Promise<void>; onCancel: () => void }) {
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("");
  const [storeName, setStoreName] = useState("");
  const [bankName, setBankName] = useState("");
  const [bankAccount, setBankAccount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("Transferencia bancaria");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (currentUser) {
      setFullName(currentUser.full_name || "");
      setPhone(currentUser.phone || "");
      setCity(currentUser.city || "");
      setStoreName(currentUser.store_name || "");
      setBankName(currentUser.bank_name || "Banco Popular");
      setBankAccount(currentUser.bank_account || "");
      setPaymentMethod(currentUser.payment_method || "Transferencia bancaria");
    }
  }, [currentUser]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    await updateProfile({
      full_name: fullName,
      phone,
      city,
      store_name: storeName,
      bank_name: bankName,
      bank_account: bankAccount,
      payment_method: paymentMethod
    });
    setSaving(false);
    onCancel();
  };

  return (
    <Card className="shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <CardTitle>Editar Datos del Perfil</CardTitle>
        <button
          type="button"
          onClick={onCancel}
          className="inline-flex items-center gap-1 h-8 px-2 rounded-md border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 transition"
        >
          <X className="h-3.5 w-3.5" /> Cancelar
        </button>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-bold text-navy">Nombre Completo</label>
              <input
                required
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full rounded-md border border-border px-3 py-2 text-sm bg-white"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-bold text-navy">Teléfono</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Ej. 809-555-0199"
                className="w-full rounded-md border border-border px-3 py-2 text-sm bg-white"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-bold text-navy">Ciudad</label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="Ej. Santo Domingo"
                className="w-full rounded-md border border-border px-3 py-2 text-sm bg-white"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-bold text-navy">Nombre de tu Tienda</label>
              <input
                type="text"
                value={storeName}
                onChange={(e) => setStoreName(e.target.value)}
                placeholder="Ej. Mi Tienda Linkeo"
                className="w-full rounded-md border border-border px-3 py-2 text-sm bg-white"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-bold text-navy">Banco</label>
              <select
                value={bankName}
                onChange={(e) => setBankName(e.target.value)}
                className="w-full rounded-md border border-border px-3 py-2 text-sm bg-white"
              >
                <option value="Banco Popular">Banco Popular Dominicano</option>
                <option value="Banco de Reservas">Banreservas</option>
                <option value="Banco BHD">Banco BHD</option>
                <option value="Asociación Popular">Asociación Popular (APAP)</option>
                <option value="Banco Scotiabank">Scotiabank</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-bold text-navy">Número de Cuenta</label>
              <input
                type="text"
                value={bankAccount}
                onChange={(e) => setBankAccount(e.target.value)}
                placeholder="Ej. 799123456"
                className="w-full rounded-md border border-border px-3 py-2 text-sm bg-white font-mono"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 border-t border-border pt-4">
            <button
              type="button"
              onClick={onCancel}
              className="rounded-lg border border-border px-4 py-2 text-sm font-bold text-slate-700 hover:bg-slate-50 transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              className="rounded-lg bg-primary px-5 py-2 text-sm font-black text-white hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center gap-1.5"
            >
              <Save className="h-4 w-4" /> {saving ? "Guardando..." : "Guardar Cambios"}
            </button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

