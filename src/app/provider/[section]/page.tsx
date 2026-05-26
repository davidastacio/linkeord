"use client";

import { use, useState, useEffect } from "react";
import { Plus, Check, Circle, Store, ClipboardList, WalletCards, ShoppingBag, Upload, Image as ImageIcon, Video, Save, ShieldAlert } from "lucide-react";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { OrderStatusBadge } from "@/components/order-status-badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useOrderStorage } from "@/components/order-flow/store";

const sectionTitles: Record<string, string> = {
  "mis-productos": "Mis Productos",
  "mis-pedidos": "Mis Pedidos",
  "mis-ganancias": "Mis Ganancias",
  perfil: "Mi Perfil",
  configuracion: "Configuración",
  ayuda: "Ayuda",
};

// Calculate pricing logic based on user's exact specification
export function calculatePlatformPrices(costVal: number) {
  const cost = Number(costVal) || 0;
  let percent = 30; // default for <= 1000
  if (cost > 3000) {
    percent = 8;
  } else if (cost > 2000) {
    percent = 15;
  } else if (cost > 1000) {
    percent = 20;
  }

  const platformProfit = cost * (percent / 100);
  const shipping = 400;
  const finalPrice = cost + platformProfit + shipping;

  return {
    percent,
    platformProfit,
    shipping,
    finalPrice,
  };
}

// Preset mock image choices for ease of select during demo
const MOCK_IMAGES = [
  { label: "Zapatos Deportivos", url: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&q=80" },
  { label: "Reloj Elegante", url: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&q=80" },
  { label: "Perfume Francés", url: "https://images.unsplash.com/photo-1594035910387-fea47794261f?w=400&q=80" },
  { label: "Auriculares Bluetooth", url: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&q=80" },
  { label: "Termo de Acero", url: "https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=400&q=80" },
];

export default function ProviderSectionPage({ params }: { params: Promise<{ section: string }> }) {
  const { section } = use(params);
  const title = sectionTitles[section] ?? "Proveedor";
  const { orders, products, currentUser, addProduct, updateOrderStatus, updateProfile, addOrderMedia } = useOrderStorage();

  const mySupplierId = currentUser?.id || "SUP-001";

  // Filter products and orders
  const myProducts = products.filter(
    (p) => p.supplierId === mySupplierId || p.supplierId === "SUP-001"
  );
  const myOrders = orders.filter(
    (o) => o.supplierId === mySupplierId || o.supplierId === "SUP-001"
  );

  // Form state for adding products
  const [showAddForm, setShowAddForm] = useState(false);
  const [name, setName] = useState("");
  const [category, setCategory] = useState("Moda");
  const [sku, setSku] = useState("");
  const [imageUrl, setImageUrl] = useState(MOCK_IMAGES[0].url);
  const [customImageUrl, setCustomImageUrl] = useState("");
  const [costInput, setCostInput] = useState("");
  const [stockInput, setStockInput] = useState("50");
  const [demand, setDemand] = useState<"Alta" | "Media" | "Baja">("Alta");

  // Form state for settings
  const [shopName, setShopName] = useState("");
  const [shopPhone, setShopPhone] = useState("");
  const [shopAddress, setShopAddress] = useState("");
  const [bankName, setBankName] = useState("");
  const [bankAccount, setBankAccount] = useState("");
  const [showSaveSuccess, setShowSaveSuccess] = useState(false);

  // Form state for uploading order media
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [mediaUrlInput, setMediaUrlInput] = useState("");
  const [mediaType, setMediaType] = useState<"photo" | "video">("photo");

  // Load configuration settings values from current profile
  useEffect(() => {
    if (currentUser) {
      setShopName(currentUser.full_name || currentUser.store_name || "");
      setShopPhone(currentUser.phone || "");
      setShopAddress(currentUser.city || "");
      setBankName(currentUser.bank_name || "Banco Popular");
      setBankAccount(currentUser.bank_account || "");
    }
  }, [currentUser]);

  // Autogenerate SKU when name or category changes
  useEffect(() => {
    if (name) {
      const cleanName = name.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 4);
      const cleanCategory = category.toUpperCase().slice(0, 3);
      const randomPart = Math.floor(100 + Math.random() * 900);
      setSku(`SKU-${cleanCategory}-${cleanName}-${randomPart}`);
    } else {
      setSku("");
    }
  }, [name, category]);

  // Calculate preview prices
  const parsedCost = parseFloat(costInput) || 0;
  const pricing = calculatePlatformPrices(parsedCost);

  const handleAddProductSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || parsedCost <= 0) return;

    const finalImage = customImageUrl.trim() || imageUrl;

    const newProd = {
      id: `PRD-${Math.floor(100000 + Math.random() * 900000)}`,
      name,
      sku: sku || `SKU-GEN-${Math.floor(100000 + Math.random() * 900000)}`,
      image: finalImage,
      category,
      supplierId: mySupplierId,
      price: pricing.finalPrice,
      cost: parsedCost,
      margin: Math.round(pricing.platformProfit), // Platform profit/commission representation
      demand,
      stock: parseInt(stockInput) || 10,
      stockLabel: "Disponible",
      sold: 0,
      share: 0,
      accent: "bg-blue-50 text-blue-600",
    };

    addProduct(newProd);

    // Reset fields
    setName("");
    setSku("");
    setCostInput("");
    setStockInput("50");
    setCustomImageUrl("");
    setShowAddForm(false);
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateProfile({
      full_name: shopName,
      phone: shopPhone,
      city: shopAddress,
      bank_name: bankName,
      bank_account: bankAccount,
    });
    setShowSaveSuccess(true);
    setTimeout(() => setShowSaveSuccess(false), 3000);
  };

  const handleAddMediaSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrderId || !mediaUrlInput) return;

    addOrderMedia(selectedOrderId, mediaUrlInput, mediaType);
    setMediaUrlInput("");
    setSelectedOrderId(null);
  };

  return (
    <DashboardShell mode="provider" eyebrow={title} title={title}>
      {/* ── MIS PRODUCTOS ── */}
      {section === "mis-productos" && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-black text-navy">Catálogo de Productos</h2>
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-black text-white hover:bg-primary/90"
            >
              <Plus className="h-4 w-4" />
              Subir Producto
            </button>
          </div>

          {showAddForm && (
            <Card className="shadow-lg border-primary/20 bg-gradient-to-br from-white to-[#f7fbff]">
              <CardHeader>
                <CardTitle>Cargar Nuevo Producto</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleAddProductSubmit} className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-3">
                    <div className="sm:col-span-2">
                      <label className="mb-1 block text-sm font-bold text-navy">Nombre del Producto</label>
                      <input
                        required
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Ej. Perfume Paris Premium 100ml"
                        className="w-full rounded-md border border-border px-3 py-2 text-sm bg-white"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-sm font-bold text-navy">Código SKU (Identificador)</label>
                      <input
                        required
                        type="text"
                        value={sku}
                        onChange={(e) => setSku(e.target.value)}
                        placeholder="Ej. SKU-PERF-PARI-901"
                        className="w-full rounded-md border border-border px-3 py-2 text-sm bg-white font-mono"
                      />
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-3">
                    <div>
                      <label className="mb-1 block text-sm font-bold text-navy">Categoría</label>
                      <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className="w-full rounded-md border border-border px-3 py-2 text-sm bg-white"
                      >
                        <option value="Moda">Moda & Calzado</option>
                        <option value="Hogar">Hogar & Cocina</option>
                        <option value="Electronica">Electrónica & Tech</option>
                        <option value="Belleza">Belleza & Cuidado</option>
                        <option value="Juguetes">Juguetes & Niños</option>
                      </select>
                    </div>
                    <div>
                      <label className="mb-1 block text-sm font-bold text-navy">Costo Base (RD$)</label>
                      <input
                        required
                        type="number"
                        min="1"
                        value={costInput}
                        onChange={(e) => setCostInput(e.target.value)}
                        placeholder="Costo para el emprendedor"
                        className="w-full rounded-md border border-border px-3 py-2 text-sm bg-white"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-sm font-bold text-navy">Stock Inicial</label>
                      <input
                        required
                        type="number"
                        min="1"
                        value={stockInput}
                        onChange={(e) => setStockInput(e.target.value)}
                        className="w-full rounded-md border border-border px-3 py-2 text-sm bg-white"
                      />
                    </div>
                  </div>

                  {/* Image Selector UI */}
                  <div>
                    <label className="mb-2 block text-sm font-bold text-navy">Imagen del Producto</label>
                    <div className="grid gap-3 sm:grid-cols-5 mb-3">
                      {MOCK_IMAGES.map((img) => (
                        <div
                          key={img.url}
                          onClick={() => {
                            setImageUrl(img.url);
                            setCustomImageUrl("");
                          }}
                          className={`cursor-pointer rounded-lg border-2 p-1 transition ${
                            imageUrl === img.url && !customImageUrl ? "border-primary bg-primary/5" : "border-border hover:border-blue-200"
                          }`}
                        >
                          <img src={img.url} alt={img.label} className="h-16 w-full rounded object-cover" />
                          <p className="text-[10px] text-center mt-1 truncate font-semibold">{img.label}</p>
                        </div>
                      ))}
                    </div>
                    <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
                      <div className="flex gap-2 items-center w-full sm:w-auto">
                        <span className="text-xs font-bold text-muted-foreground whitespace-nowrap">O pega URL:</span>
                        <input
                          type="text"
                          value={customImageUrl}
                          onChange={(e) => {
                            setCustomImageUrl(e.target.value);
                            setImageUrl("");
                          }}
                          placeholder="https://ejemplo.com/imagen.jpg"
                          className="flex-1 rounded-md border border-border px-3 py-1.5 text-xs bg-white w-48"
                        />
                      </div>
                      <div className="flex gap-2 items-center w-full sm:w-auto">
                        <span className="text-xs font-bold text-navy whitespace-nowrap">O sube desde dispositivo:</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              const reader = new FileReader();
                              reader.onloadend = () => {
                                setCustomImageUrl(reader.result as string);
                                setImageUrl("");
                              };
                              reader.readAsDataURL(file);
                            }
                          }}
                          className="text-xs border border-dashed border-border rounded-md px-2 py-1.5 bg-white cursor-pointer"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Realtime Simulator based on User's specified margins */}
                  {parsedCost > 0 && (
                    <div className="rounded-lg border border-blue-100 bg-[#edf5ff] p-4 text-sm text-navy">
                      <h4 className="font-black mb-2 text-primary">Simulación de Precios en Catálogo</h4>
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-1.5">
                          <div className="flex justify-between">
                            <span>Costo base del proveedor:</span>
                            <span className="font-bold">RD$ {parsedCost.toLocaleString("en-US")}</span>
                          </div>
                          <div className="flex justify-between text-muted-foreground">
                            <span>Envío fijo automático:</span>
                            <span>RD$ {pricing.shipping.toLocaleString("en-US")}</span>
                          </div>
                          <div className="flex justify-between text-muted-foreground">
                            <span>Ganancia de plataforma:</span>
                            <span>RD$ {pricing.platformProfit.toLocaleString("en-US")}</span>
                          </div>
                          <div className="mt-2 border-t border-blue-200 pt-2 flex justify-between font-black text-lg text-primary">
                            <span>Precio en catálogo:</span>
                            <span>RD$ {pricing.finalPrice.toLocaleString("en-US")}</span>
                          </div>
                        </div>
                        <div className="flex items-center justify-center p-2 bg-white rounded-lg border border-blue-100/50">
                          <div className="text-center">
                            <p className="text-xs text-muted-foreground">Vista Previa Imagen</p>
                            <img src={customImageUrl || imageUrl} alt="Preview" className="h-20 w-24 object-cover rounded mt-2 mx-auto shadow-sm" />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="flex justify-end gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowAddForm(false)}
                      className="rounded-md border border-border px-4 py-2 text-sm font-bold text-muted-foreground hover:bg-secondary"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="rounded-md bg-primary px-4 py-2 text-sm font-black text-white hover:bg-primary/90"
                    >
                      Guardar y Publicar
                    </button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          <Card className="shadow-sm">
            <CardContent className="pt-6">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[800px] text-sm text-left">
                  <thead>
                    <tr className="border-b border-border text-xs text-muted-foreground">
                      <th className="py-3 font-black">Imagen</th>
                      <th className="py-3 font-black">Producto</th>
                      <th className="py-3 font-black">SKU</th>
                      <th className="py-3 font-black">Categoría</th>
                      <th className="py-3 font-black">Costo Base</th>
                      <th className="py-3 font-black">Envío</th>
                      <th className="py-3 font-black">Precio Catálogo</th>
                      <th className="py-3 font-black">Stock</th>
                    </tr>
                  </thead>
                  <tbody>
                    {myProducts.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="py-12 text-center text-muted-foreground">
                          Aún no has agregado productos. ¡Sube uno nuevo para empezar!
                        </td>
                      </tr>
                    ) : (
                      myProducts.map((p) => (
                        <tr key={p.id} className="border-b border-border last:border-0 hover:bg-secondary/40">
                          <td className="py-2">
                            <img
                              src={p.image || "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=100&q=80"}
                              alt={p.name}
                              className="h-10 w-12 rounded object-cover shadow-sm border border-border"
                            />
                          </td>
                          <td className="py-4 font-black text-navy">{p.name}</td>
                          <td className="py-4 font-mono text-xs text-muted-foreground">{p.sku || "N/A"}</td>
                          <td className="py-4 text-muted-foreground">{p.category}</td>
                          <td className="py-4 font-bold text-navy">RD$ {(p.cost || p.price - p.margin - 400).toLocaleString("en-US")}</td>
                          <td className="py-4 text-muted-foreground">RD$ 400</td>
                          <td className="py-4 font-black text-primary">RD$ {p.price.toLocaleString("en-US")}</td>
                          <td className="py-4 font-bold text-navy">{p.stock}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* ── MIS PEDIDOS ── */}
      {section === "mis-pedidos" && (
        <div className="space-y-6">
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle>Pedidos Recibidos</CardTitle>
            </CardHeader>
            <CardContent>
              {myOrders.length === 0 ? (
                <div className="py-12 text-center text-muted-foreground">
                  Aún no has recibido pedidos para tus productos.
                </div>
              ) : (
                <div className="space-y-4">
                  {myOrders.map((o) => (
                    <div key={o.id} className="flex flex-col gap-4 rounded-lg border border-border p-5 bg-white">
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div>
                          <div className="flex items-center gap-3">
                            <span className="font-black text-primary">{o.id}</span>
                            <OrderStatusBadge status={o.status} />
                          </div>
                          <p className="mt-2 font-bold text-navy">{o.product || o.productName}</p>
                          <p className="text-xs text-muted-foreground">
                            Cantidad: {o.quantity || 1} · Fecha: {o.date || new Date(o.createdAt).toLocaleDateString()}
                          </p>
                          <p className="text-sm text-navy font-semibold mt-1">Dirección: {o.deliveryAddress || "N/A"}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-bold text-muted-foreground">Tu pago neto:</p>
                          <p className="text-xl font-black text-emerald-600">RD$ {(o.cost || o.amount - o.profit - 550).toLocaleString("en-US")}</p>
                        </div>
                      </div>

                      {/* Attached media display */}
                      {o.media && o.media.length > 0 && (
                        <div className="border-t border-border pt-3">
                          <p className="text-xs font-bold text-navy mb-2">Archivos adjuntos (evidencia/guía):</p>
                          <div className="flex flex-wrap gap-3">
                            {o.media.map((item: any, idx: number) => (
                              <div key={idx} className="relative group rounded border border-border overflow-hidden bg-secondary">
                                {item.type === "photo" ? (
                                  <img src={item.url} alt="Evidencia" className="h-16 w-20 object-cover" />
                                ) : (
                                  <div className="h-16 w-20 flex flex-col items-center justify-center text-primary">
                                    <Video className="h-6 w-6" />
                                    <span className="text-[9px] font-bold">Video</span>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Action tools */}
                      <div className="border-t border-border pt-3 flex flex-wrap gap-2 justify-between items-center">
                        <button
                          onClick={() => setSelectedOrderId(o.id)}
                          className="flex items-center gap-1.5 rounded bg-secondary px-3 py-1.5 text-xs font-bold text-navy hover:bg-border"
                        >
                          <Upload className="h-3.5 w-3.5" />
                          Adjuntar Foto/Video
                        </button>

                        {o.status === "Pendiente" && (
                          <button
                            onClick={() => updateOrderStatus(o.id, "Confirmado")}
                            className="rounded-md bg-emerald-600 px-4 py-1.5 text-xs font-black text-white hover:bg-emerald-700"
                          >
                            Confirmar Disponibilidad
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Media upload modal */}
          {selectedOrderId && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
              <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
                <h3 className="text-lg font-black text-navy">Adjuntar Evidencia a Pedido</h3>
                <p className="text-xs text-muted-foreground mt-1">Pedido: <strong className="text-primary">{selectedOrderId}</strong></p>

                <form onSubmit={handleAddMediaSubmit} className="mt-4 space-y-4">
                  <div>
                    <label className="mb-1 block text-sm font-bold text-navy">Tipo de Archivo</label>
                    <div className="flex gap-4">
                      <label className="flex items-center gap-2 text-sm font-bold text-navy cursor-pointer">
                        <input type="radio" checked={mediaType === "photo"} onChange={() => setMediaType("photo")} className="h-4 w-4" />
                        Foto / Imagen
                      </label>
                      <label className="flex items-center gap-2 text-sm font-bold text-navy cursor-pointer">
                        <input type="radio" checked={mediaType === "video"} onChange={() => setMediaType("video")} className="h-4 w-4" />
                        Video
                      </label>
                    </div>
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-bold text-navy">URL del Archivo (Foto o Video)</label>
                    <input
                      required
                      type="text"
                      value={mediaUrlInput}
                      onChange={(e) => setMediaUrlInput(e.target.value)}
                      placeholder="Pega URL de imagen o video"
                      className="w-full rounded-md border border-border px-3 py-2 text-sm bg-white"
                    />
                    <div className="mt-2 grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setMediaUrlInput("https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=400&q=80")}
                        className="rounded border border-border p-1.5 text-[10px] text-center font-bold hover:bg-secondary"
                      >
                        Usar Foto de Empaque
                      </button>
                      <button
                        type="button"
                        onClick={() => setMediaUrlInput("https://www.w3schools.com/html/mov_bbb.mp4")}
                        className="rounded border border-border p-1.5 text-[10px] text-center font-bold hover:bg-secondary"
                      >
                        Usar Video de Demo
                      </button>
                    </div>
                  </div>

                  <div className="flex justify-end gap-3 pt-3">
                    <button
                      type="button"
                      onClick={() => setSelectedOrderId(null)}
                      className="rounded border border-border px-3 py-1.5 text-sm font-bold text-muted-foreground hover:bg-secondary"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="rounded bg-primary px-4 py-1.5 text-sm font-black text-white hover:bg-primary/90"
                    >
                      Adjuntar
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── MIS GANANCIAS ── */}
      {section === "mis-ganancias" && (
        <div className="grid gap-6 xl:grid-cols-[1fr_0.6fr]">
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle>Historial de Pagos y Liquidaciones</CardTitle>
            </CardHeader>
            <CardContent>
              {myOrders.length === 0 ? (
                <p className="py-8 text-center text-muted-foreground">Sin transacciones registradas.</p>
              ) : (
                <div className="space-y-4">
                  {myOrders.map((o) => (
                    <div key={o.id} className="flex items-center justify-between rounded-lg border border-border p-4">
                      <div>
                        <p className="font-black text-navy">Producto despachado - Pedido {o.id}</p>
                        <p className="text-sm text-muted-foreground">{o.date || new Date(o.createdAt).toLocaleDateString()}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xl font-black text-emerald-600">+RD$ {(o.cost || o.amount - o.profit - 550).toLocaleString("en-US")}</p>
                        <OrderStatusBadge status={o.status} />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="shadow-sm">
            <CardContent className="pt-6">
              <p className="text-sm font-bold text-muted-foreground">Balance Acumulado</p>
              <p className="mt-2 text-4xl font-black text-primary">
                RD$ {myOrders
                  .filter((o) => o.status === "Entregado" || o.status === "Pagado")
                  .reduce((sum, o) => sum + (o.cost || o.amount - o.profit - 550), 0)
                  .toLocaleString("en-US")}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">Pagos liberados tras entrega exitosa al cliente.</p>
              <div className="mt-6 space-y-3">
                <div className="flex items-center justify-between rounded-lg bg-secondary p-3">
                  <p className="text-sm font-bold text-muted-foreground">Cuenta Registrada</p>
                  <p className="font-black text-navy">{currentUser?.bank_name || "Banco Popular"}</p>
                </div>
                <div className="flex items-center justify-between rounded-lg bg-secondary p-3">
                  <p className="text-sm font-bold text-muted-foreground">Número de Cuenta</p>
                  <p className="font-black text-navy">{currentUser?.bank_account || "—"}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* ── CONFIGURACION FUNCIONAL ── */}
      {section === "configuracion" && (
        <Card className="shadow-sm border-border">
          <CardHeader>
            <CardTitle>Configuración de la Tienda / Proveedor</CardTitle>
          </CardHeader>
          <CardContent>
            {showSaveSuccess && (
              <div className="mb-4 rounded-md bg-emerald-50 p-3 text-sm font-bold text-emerald-700 flex items-center gap-2">
                <Check className="h-4 w-4" /> Datos de la tienda actualizados correctamente.
              </div>
            )}
            <form onSubmit={handleSaveSettings} className="space-y-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-bold text-navy">Nombre Comercial / Razón Social</label>
                  <input
                    required
                    type="text"
                    value={shopName}
                    onChange={(e) => setShopName(e.target.value)}
                    className="w-full rounded-md border border-border bg-white px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-bold text-navy">Teléfono Comercial</label>
                  <input
                    required
                    type="text"
                    value={shopPhone}
                    onChange={(e) => setShopPhone(e.target.value)}
                    className="w-full rounded-md border border-border bg-white px-3 py-2 text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1 block text-sm font-bold text-navy">Dirección de Despacho (Almacén)</label>
                <input
                  required
                  type="text"
                  value={shopAddress}
                  onChange={(e) => setShopAddress(e.target.value)}
                  className="w-full rounded-md border border-border bg-white px-3 py-2 text-sm"
                />
              </div>

              <div className="border-t border-border pt-4">
                <h4 className="text-sm font-black text-navy mb-3 flex items-center gap-2">
                  <WalletCards className="h-4 w-4 text-primary" /> Datos Bancarios para Liquidación
                </h4>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-sm font-bold text-navy">Banco</label>
                    <select
                      value={bankName}
                      onChange={(e) => setBankName(e.target.value)}
                      className="w-full rounded-md border border-border bg-white px-3 py-2 text-sm"
                    >
                      <option value="Banco Popular">Banco Popular Dominicano</option>
                      <option value="Banco de Reservas">Banco de Reservas (Banreservas)</option>
                      <option value="BHD">Banco BHD</option>
                      <option value="Scotiabank">Scotiabank</option>
                    </select>
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-bold text-navy">Número de Cuenta</label>
                    <input
                      required
                      type="text"
                      value={bankAccount}
                      onChange={(e) => setBankAccount(e.target.value)}
                      placeholder="Ej. 782019283"
                      className="w-full rounded-md border border-border bg-white px-3 py-2 text-sm font-mono"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end border-t border-border pt-4">
                <button
                  type="submit"
                  className="flex items-center gap-2 rounded-lg bg-primary px-5 py-2 text-sm font-black text-white hover:bg-primary/90"
                >
                  <Save className="h-4 w-4" /> Guardar Cambios
                </button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* ── PERFIL ── */}
      {section === "perfil" && (
        <div className="grid gap-6 xl:grid-cols-[0.5fr_1fr]">
          <Card className="shadow-sm">
            <CardContent className="pt-6 text-center">
              <div className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-gradient-to-br from-primary to-[#071a36] text-2xl font-black text-white">
                {currentUser?.full_name?.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2) || "PV"}
              </div>
              <p className="mt-4 text-xl font-black text-navy">{currentUser?.full_name || "Proveedor Demo"}</p>
              <p className="mt-1 text-sm text-muted-foreground">{currentUser?.email || "proveedor@demo.com"}</p>
              <div className="mt-4 inline-block rounded-full bg-blue-100 px-4 py-1.5 text-sm font-black text-blue-700">
                Tienda Mayorista
              </div>
            </CardContent>
          </Card>
          <Card className="shadow-sm">
            <CardHeader><CardTitle>Datos del Proveedor</CardTitle></CardHeader>
            <CardContent className="space-y-0 divide-y divide-border">
              {[
                { label: "Nombre de Tienda / Razón Social", value: currentUser?.full_name || "Distribuidor Mayorista S.R.L." },
                { label: "Teléfono", value: currentUser?.phone || "No registrado" },
                { label: "Correo de Contacto", value: currentUser?.email || "proveedor@demo.com" },
                { label: "Ubicación Almacén", value: currentUser?.city || "Zona Industrial de Herrera, Santo Domingo" },
                { label: "Productos en Catálogo", value: `${myProducts.length} items` },
                { label: "Pedidos despachados", value: `${myOrders.length} despachos` },
              ].map((f) => (
                <div key={f.label} className="grid grid-cols-[200px_1fr] items-center gap-4 py-4">
                  <p className="text-sm font-bold text-muted-foreground">{f.label}</p>
                  <p className="font-black text-navy">{f.value}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Default cases for other sections */}
      {["ayuda"].includes(section) && (
        <div className="py-12 text-center text-muted-foreground">
          Contenido de {title} en desarrollo...
        </div>
      )}
    </DashboardShell>
  );
}
