"use client";

import { useState } from "react";
import { OrderStatusBadge } from "@/components/order-status-badge";
import { useOrderStorage } from "./store";
import { formatCurrency } from "@/lib/mock";
import { OrderSuccessToast } from "./OrderSuccessToast";

export function EntrepreneurProductsTable({ products }: { products: any[] }) {
  const { addOrder } = useOrderStorage();
  const [selectedProduct, setSelectedProduct] = useState<any | null>(null);
  const [createdOrder, setCreatedOrder] = useState<{ id: string; product: string } | null>(null);

  // Form state
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerAddress, setCustomerAddress] = useState("");
  const [sellPrice, setSellPrice] = useState("");
  const [notes, setNotes] = useState("");

  const handleSell = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct) return;

    const price = parseFloat(sellPrice);
    if (isNaN(price)) return;

    const costoReal = selectedProduct.cost || (selectedProduct.price - selectedProduct.margin);
    const comisionLinkeo = price * 0.10; // 10%
    const costoDelivery = 150; 
    const gananciaEmprendedor = price - costoReal - comisionLinkeo - costoDelivery;

    const newOrder = {
      id: `ORD-${Math.floor(Math.random() * 100000)}`,
      productId: selectedProduct.id,
      product: selectedProduct.name,
      customerId: "CUST-NEW",
      customer: customerName,
      customerPhone,
      customerAddress,
      entrepreneurId: "ENT-001",
      entrepreneur: "Emprendedor RD",
      amount: formatCurrency(price + costoDelivery), // Cobrar al cliente el precio + delivery
      profit: formatCurrency(gananciaEmprendedor),
      status: "Pendiente",
      date: new Date().toISOString().split("T")[0],
      notes,
    };

    addOrder(newOrder);
    setSelectedProduct(null); // close modal
    setCreatedOrder({ id: newOrder.id, product: newOrder.product }); // Trigger toast
    
    // reset form
    setCustomerName("");
    setCustomerPhone("");
    setCustomerAddress("");
    setSellPrice("");
    setNotes("");
  };

  return (
    <>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[800px] text-sm text-left">
          <thead>
            <tr className="border-b border-border text-xs text-muted-foreground">
              <th className="py-3 font-black">Producto</th>
              <th className="py-3 font-black">Categoria</th>
              <th className="py-3 font-black">Precio Sugerido</th>
              <th className="py-3 font-black">Tu ganancia</th>
              <th className="py-3 font-black">Stock</th>
              <th className="py-3 font-black">Accion</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id} className="border-b border-border last:border-0 hover:bg-secondary/50">
                <td className="py-4 font-black text-navy">{p.name}</td>
                <td className="py-4 text-muted-foreground">{p.category}</td>
                <td className="py-4 font-bold text-navy">RD$ {p.price.toLocaleString("en-US")}</td>
                <td className="py-4 font-bold text-emerald-600">RD$ {p.margin.toLocaleString("en-US")}</td>
                <td className="py-4"><OrderStatusBadge status={p.stockLabel as never} /></td>
                <td className="py-4">
                  <button 
                    onClick={() => {
                      setSelectedProduct(p);
                      setSellPrice(p.price.toString());
                    }}
                    className="rounded-md bg-primary px-4 py-1.5 text-xs font-black text-white hover:bg-primary/90"
                  >
                    Vender
                  </button>
                </td>
              </tr>
            ))}
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
                <input required value={customerName} onChange={e => setCustomerName(e.target.value)} className="w-full rounded-md border border-border px-3 py-2 text-sm" placeholder="Juan Perez" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1 block text-sm font-bold text-navy">Telefono</label>
                  <input required value={customerPhone} onChange={e => setCustomerPhone(e.target.value)} className="w-full rounded-md border border-border px-3 py-2 text-sm" placeholder="809-555-5555" />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-bold text-navy">Precio a Vender</label>
                  <input required type="number" value={sellPrice} onChange={e => setSellPrice(e.target.value)} className="w-full rounded-md border border-border px-3 py-2 text-sm" />
                </div>
              </div>
              <div>
                <label className="mb-1 block text-sm font-bold text-navy">Direccion de Entrega</label>
                <input required value={customerAddress} onChange={e => setCustomerAddress(e.target.value)} className="w-full rounded-md border border-border px-3 py-2 text-sm" placeholder="Calle 1, Res. Bella Vista" />
              </div>
              <div>
                <label className="mb-1 block text-sm font-bold text-navy">Notas adicionales</label>
                <textarea value={notes} onChange={e => setNotes(e.target.value)} className="w-full rounded-md border border-border px-3 py-2 text-sm" placeholder="Opcional..." rows={2} />
              </div>

              {/* Simulador rapido */}
              <div className="rounded-lg bg-secondary p-3 text-xs">
                <p className="font-bold text-muted-foreground mb-1">Simulador de ganancias</p>
                <div className="flex justify-between"><span className="text-muted-foreground">Costo Producto:</span> <span>RD$ {(selectedProduct.cost || (selectedProduct.price - selectedProduct.margin)).toLocaleString("en-US")}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Comision Linkeo (10%):</span> <span>RD$ {(parseFloat(sellPrice || "0") * 0.1).toLocaleString("en-US")}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Delivery:</span> <span>RD$ 150</span></div>
                <div className="mt-2 flex justify-between border-t border-border pt-2 font-black text-emerald-600">
                  <span>Tu Ganancia Estimada:</span> 
                  <span>RD$ {Math.max(0, parseFloat(sellPrice || "0") - (selectedProduct.cost || (selectedProduct.price - selectedProduct.margin)) - (parseFloat(sellPrice || "0") * 0.1) - 150).toLocaleString("en-US")}</span>
                </div>
              </div>

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
