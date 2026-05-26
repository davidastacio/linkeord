"use client";

import { useState } from "react";
import { OrderStatusBadge } from "@/components/order-status-badge";
import { useOrderStorage } from "./store";
import { formatCurrency } from "@/lib/mock";
import { OrderSuccessToast } from "./OrderSuccessToast";

export function EntrepreneurProductsTable({ products }: { products: any[] }) {
  const { addOrder, currentUser } = useOrderStorage();
  const [selectedProduct, setSelectedProduct] = useState<any | null>(null);
  const [createdOrder, setCreatedOrder] = useState<{ id: string; product: string } | null>(null);

  // Form state
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerAddress, setCustomerAddress] = useState("");
  const [desiredProfit, setDesiredProfit] = useState("500");
  const [notes, setNotes] = useState("");

  const handleSell = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct || !currentUser) return;

    const profitAmount = parseFloat(desiredProfit);
    if (isNaN(profitAmount)) return;

    // Wholesale catalog price
    const costoCatalogo = selectedProduct.price; 
    
    // Additional platform/service fees
    const fulfillmentFee = 65;
    const serviceFee = 30;
    
    // Total charged to customer
    const price = costoCatalogo + fulfillmentFee + serviceFee + profitAmount;

    const newOrder = {
      id: `ORD-${Math.floor(Math.random() * 100000)}`,
      productId: selectedProduct.id,
      productName: selectedProduct.name,
      customerId: "CUST-NEW",
      customerName: customerName,
      customerPhone,
      deliveryAddress: customerAddress,
      entrepreneurId: currentUser.id,
      entrepreneur: currentUser.full_name || "Emprendedor",
      supplierId: selectedProduct.supplierId || "SUP-001",
      amount: price, // numeric type
      profit: profitAmount, // numeric type
      commission: fulfillmentFee + serviceFee, // platform commission
      status: "Pendiente",
      date: new Date().toISOString().split("T")[0],
      notes,
    };

    addOrder(newOrder);
    setSelectedProduct(null); // close modal
    setCreatedOrder({ id: newOrder.id, product: newOrder.productName }); // Trigger toast
    
    // reset form
    setCustomerName("");
    setCustomerPhone("");
    setCustomerAddress("");
    setDesiredProfit("500");
    setNotes("");
  };

  return (
    <>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[800px] text-sm text-left">
          <thead>
            <tr className="border-b border-border text-xs text-muted-foreground">
              <th className="py-3 font-black">Imagen</th>
              <th className="py-3 font-black">Producto</th>
              <th className="py-3 font-black">SKU</th>
              <th className="py-3 font-black">Categoría</th>
              <th className="py-3 font-black">Precio Catálogo</th>
              <th className="py-3 font-black">Sugerido Cliente</th>
              <th className="py-3 font-black">Ganancia Sugerida</th>
              <th className="py-3 font-black">Stock</th>
              <th className="py-3 font-black">Acción</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => {
              const suggestedProfit = 500; // Sugerencia base de ganancia
              const suggestedRetail = p.price + 65 + 30 + suggestedProfit;

              return (
                <tr key={p.id} className="border-b border-border last:border-0 hover:bg-secondary/50">
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
                  <td className="py-4 font-bold text-navy">RD$ {p.price.toLocaleString("en-US")}</td>
                  <td className="py-4 font-black text-primary">RD$ {suggestedRetail.toLocaleString("en-US")}</td>
                  <td className="py-4 font-bold text-emerald-600">RD$ {suggestedProfit.toLocaleString("en-US")}</td>
                  <td className="py-4"><OrderStatusBadge status={p.stockLabel as never} /></td>
                  <td className="py-4">
                    <button 
                      onClick={() => {
                        setSelectedProduct(p);
                        setDesiredProfit("500");
                      }}
                      className="rounded-md bg-primary px-4 py-1.5 text-xs font-black text-white hover:bg-primary/90"
                    >
                      Vender
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {selectedProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
            <h2 className="text-xl font-black text-navy">Crear Pedido</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Producto: <strong className="text-navy">{selectedProduct.name}</strong>
            </p>
            
            <form onSubmit={handleSell} className="mt-6 space-y-4">
              <div>
                <label className="mb-1 block text-sm font-bold text-navy">Nombre del Cliente</label>
                <input required value={customerName} onChange={e => setCustomerName(e.target.value)} className="w-full rounded-md border border-border px-3 py-2 text-sm" placeholder="Juan Pérez" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1 block text-sm font-bold text-navy">Teléfono</label>
                  <input required value={customerPhone} onChange={e => setCustomerPhone(e.target.value)} className="w-full rounded-md border border-border px-3 py-2 text-sm" placeholder="809-555-5555" />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-bold text-navy">¿Cuánto quieres ganar? (RD$)</label>
                  <input required type="number" min="0" value={desiredProfit} onChange={e => setDesiredProfit(e.target.value)} className="w-full rounded-md border border-border px-3 py-2 text-sm font-bold text-emerald-600" />
                </div>
              </div>
              <div>
                <label className="mb-1 block text-sm font-bold text-navy">Dirección de Entrega</label>
                <input required value={customerAddress} onChange={e => setCustomerAddress(e.target.value)} className="w-full rounded-md border border-border px-3 py-2 text-sm" placeholder="Calle 1, Res. Bella Vista" />
              </div>
              <div>
                <label className="mb-1 block text-sm font-bold text-navy">Notas adicionales</label>
                <textarea value={notes} onChange={e => setNotes(e.target.value)} className="w-full rounded-md border border-border px-3 py-2 text-sm" placeholder="Opcional..." rows={2} />
              </div>

              {/* Simulador rápido con las nuevas tasas */}
              {(() => {
                const profitVal = parseFloat(desiredProfit) || 0;
                const baseWholesale = selectedProduct.price;
                const fulfillment = 65;
                const serviceFee = 30;
                const clientBilled = baseWholesale + fulfillment + serviceFee + profitVal;

                return (
                  <div className="rounded-lg bg-secondary p-3 text-xs">
                    <p className="font-bold text-muted-foreground mb-1.5">Resumen de Cobro y Comisiones</p>
                    <div className="flex justify-between"><span className="text-muted-foreground">Costo Catálogo:</span> <span>RD$ {baseWholesale.toLocaleString("en-US")}</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">Fulfillment:</span> <span>RD$ {fulfillment}</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">Cobro por servicio:</span> <span>RD$ {serviceFee}</span></div>
                    <div className="flex justify-between border-t border-border/60 mt-1 pt-1"><span className="text-muted-foreground">Tu ganancia deseada:</span> <span className="font-bold text-emerald-600">+RD$ {profitVal.toLocaleString("en-US")}</span></div>
                    <div className="mt-2 flex justify-between border-t border-border pt-2 font-black text-primary text-sm">
                      <span>Total a cobrar al cliente:</span> 
                      <span>RD$ {clientBilled.toLocaleString("en-US")}</span>
                    </div>
                  </div>
                );
              })()}

              <div className="mt-6 flex justify-end gap-3">
                <button type="button" onClick={() => setSelectedProduct(null)} className="rounded-md px-4 py-2 text-sm font-bold text-muted-foreground hover:bg-secondary">
                  Cancelar
                </button>
                <button type="submit" className="rounded-md bg-primary px-4 py-2 text-sm font-black text-white hover:bg-primary/90">
                  Crear Pedido
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {createdOrder && (
        <OrderSuccessToast
          orderId={createdOrder.id}
          productName={createdOrder.product}
          onClose={() => setCreatedOrder(null)}
        />
      )}
    </>
  );
}
