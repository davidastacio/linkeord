import { createClient } from "@supabase/supabase-js";
const rawUrl = "https://cswnnopcsftiscuevlpw.supabase.co";
const rawKey = "sb_publishable_eBfrlW1y7v0MB3I1iwjRoQ_UqyMJP4M";
const supabase = createClient(rawUrl, rawKey);

async function checkCols() {
  const cols = [
    "id", "entrepreneurId", "customerId", "productId", "supplierId", 
    "deliveryId", "deliveryName", "quantity", "amount", "profit", 
    "commission", "status", "date", "customerPhone", "pickupAddress", 
    "deliveryAddress", "notes", "estimatedArrival", "statusHistory"
  ];
  
  for (const col of cols) {
    const { error } = await supabase.from("orders").select(col).limit(1);
    if (error) {
      console.log(`Column ${col} is missing or error: ${error.message}`);
    } else {
      console.log(`Column ${col} exists.`);
    }
  }
}
checkCols();
