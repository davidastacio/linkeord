import { createClient } from "@supabase/supabase-js";
import { orders, entrepreneurs, customers, products } from "./src/lib/mock";

const rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://cswnnopcsftiscuevlpw.supabase.co";
const rawKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "sb_publishable_eBfrlW1y7v0MB3I1iwjRoQ_UqyMJP4M";

const supabase = createClient(rawUrl, rawKey);

const entrepreneurById = new Map(entrepreneurs.map(e => [e.id, e.name]));
const customerById = new Map(customers.map(c => [c.id, c.name]));
const productById = new Map(products.map(p => [p.id, p.name]));

async function seedOrders() {
  console.log("Seeding orders into Supabase...");

  for (const order of orders) {
    const { data, error } = await supabase.from("orders").upsert([
      {
        id: order.id,
        entrepreneurId: order.entrepreneurId,
        customerId: order.customerId,
        productId: order.productId,
        supplierId: order.supplierId,
        deliveryId: order.deliveryId,
        deliveryName: (order as any).deliveryName || null,
        quantity: order.quantity,
        amount: order.amount,
        profit: order.profit,
        commission: order.commission,
        status: order.status,
        date: order.date,
        customerPhone: order.customerPhone || null,
        pickupAddress: order.pickupAddress || null,
        deliveryAddress: order.deliveryAddress || null,
        notes: order.notes || null,
        estimatedArrival: order.estimatedArrival || null,
        statusHistory: order.statusHistory || [],
        
        // These fields might exist in the user's table as NOT NULL
        entrepreneur: entrepreneurById.get(order.entrepreneurId) || "Emprendedor",
        customer: customerById.get(order.customerId) || "Cliente",
        product: productById.get(order.productId) || "Producto"
      }
    ]);

    if (error) {
      console.error(`Error inserting order ${order.id}:`, error.message);
    } else {
      console.log(`Inserted order ${order.id}`);
    }
  }
  
  console.log("Seeding complete!");
}

seedOrders();
