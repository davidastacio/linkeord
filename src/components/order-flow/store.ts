"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { products as baseProducts } from "@/lib/mock-data";
import type { OrderStatus, StatusHistoryEntry } from "@/lib/mock/types";

export function useOrderStorage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [localEarnings, setEarnings] = useState<any[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [products, setProducts] = useState<any[]>([]);

  useEffect(() => {
    // 1. Fetch initial profiles, orders, earnings, products from Supabase
    const fetchData = async () => {
      const { data: authData } = await supabase.auth.getUser();
      let ordersQuery = supabase.from("orders").select("*").order("date", { ascending: false });
      let earningsQuery = supabase.from("earnings").select("*").order("created_at", { ascending: false });

      if (authData.user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", authData.user.id)
          .single();
        
        if (profile) {
          const localProfileStr = localStorage.getItem("linkeo_profile_" + profile.id);
          if (localProfileStr) {
            setCurrentUser({ ...profile, ...JSON.parse(localProfileStr) });
          } else {
            setCurrentUser(profile);
          }
          if (profile.role === "emprendedor") {
            ordersQuery = ordersQuery.eq("entrepreneurId", authData.user.id);
            earningsQuery = earningsQuery.eq("entrepreneurId", authData.user.id);
          }
        }
      }

      // Fetch Orders
      const { data: ordersData, error: ordersError } = await ordersQuery;
      if (ordersError) {
        console.error("Error fetching orders:", ordersError);
      } else {
        const savedMediaStr = localStorage.getItem("linkeo_orders_media") || "{}";
        const savedMedia = JSON.parse(savedMediaStr);
        const mergedOrders = (ordersData || []).map((o: any) => ({
          ...o,
          media: savedMedia[o.id] || o.media || []
        }));
        setOrders(mergedOrders);
      }

      // Fetch Earnings
      const { data: earningsData, error: earningsError } = await earningsQuery;
      if (earningsError) {
        console.error("Error fetching earnings:", earningsError);
      } else {
        setEarnings(earningsData || []);
      }

      // Fetch Products
      const { data: productsData, error: productsError } = await supabase
        .from("products")
        .select("*")
        .order("created_at", { ascending: false });

      if (productsError) {
        console.error("Error fetching products:", productsError);
      } else {
        const mapped = (productsData || []).map((p: any) => ({
          ...p,
          supplierId: p.supplierid || p.supplierId, // Map database supplierid to frontend supplierId
        }));
        setProducts(mapped);
      }
    };

    fetchData();

    // 2. Setup Realtime subscription
    const channelName = `db_changes_${Math.random().toString(36).slice(2, 11)}`;
    const subscription = supabase
      .channel(channelName)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "orders" },
        () => { fetchData(); }
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "products" },
        () => { fetchData(); }
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "earnings" },
        () => { fetchData(); }
      )
      .subscribe();
    
    return () => {
      supabase.removeChannel(subscription);
    };
  }, []);

  const addOrder = async (order: any) => {
    // Add to supabase
    const { error } = await supabase.from("orders").insert([order]);
    if (error) console.error("Error adding order:", error);
  };

  const updateOrderStatus = async (orderId: string, status: OrderStatus) => {
    const orderToUpdate = orders.find(o => o.id === orderId);
    if (!orderToUpdate) return;

    // Automatic earnings logic when delivered
    if (status === "Entregado" && orderToUpdate.status !== "Entregado") {
      await addEarning({
        id: `ERN-${Math.floor(Math.random() * 10000)}`,
        entrepreneurId: orderToUpdate.entrepreneurId || currentUser?.id || "ENT-001",
        amount: parseFloat(String(orderToUpdate.profit).replace(/[^0-9.-]+/g, "")),
        type: "venta",
        date: new Date().toISOString().split("T")[0],
        label: `Ganancia por pedido ${orderId}`,
        orderId: orderId,
      });
    }

    const historyEntry: StatusHistoryEntry = {
      status,
      timestamp: new Date().toISOString(),
    };

    const newHistory = [...(orderToUpdate.statusHistory || []), historyEntry];

    // Update in Supabase
    const { error } = await supabase
      .from("orders")
      .update({ status, statusHistory: newHistory })
      .eq("id", orderId);
    
    if (error) console.error("Error updating order status:", error);
  };

  const assignDelivery = async (orderId: string, deliveryId: string, deliveryName: string) => {
    const orderToUpdate = orders.find(o => o.id === orderId);
    if (!orderToUpdate) return;

    const historyEntry: StatusHistoryEntry = {
      status: "Delivery asignado",
      timestamp: new Date().toISOString(),
      note: `Asignado a ${deliveryName}`,
    };

    const newHistory = [...(orderToUpdate.statusHistory || []), historyEntry];

    // Update in Supabase
    const { error } = await supabase
      .from("orders")
      .update({ 
        deliveryId, 
        deliveryName, 
        status: "Delivery asignado",
        statusHistory: newHistory 
      })
      .eq("id", orderId);
      
    if (error) console.error("Error assigning delivery:", error);
  };

  const addEarning = async (earning: any) => {
    const { error } = await supabase.from("earnings").insert([earning]);
    if (error) console.error("Error adding earning to Supabase:", error);
  };

  const addProduct = async (product: any) => {
    // Exclude client-only keys that do not exist in Supabase columns
    const { stockLabel, share, accent, supplierId, ...dbProduct } = product;
    
    // Map supplierId to database supplierid
    const payload = {
      ...dbProduct,
      supplierid: supplierId,
    };

    const { error } = await supabase.from("products").insert([payload]);
    if (error) console.error("Error adding product to Supabase:", error);
  };

  const uploadProductImage = async (file: File): Promise<string> => {
    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${Math.random().toString(36).slice(2)}.${fileExt}`;
      const filePath = `products/${fileName}`;

      const { data, error } = await supabase.storage
        .from("product-images")
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: false,
        });

      if (error) {
        console.warn("Storage upload failed, falling back to base64:", error.message);
        return new Promise((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.readAsDataURL(file);
        });
      }

      const { data: { publicUrl } } = supabase.storage
        .from("product-images")
        .getPublicUrl(filePath);

      return publicUrl;
    } catch (err) {
      console.warn("Error in uploadProductImage, falling back to base64:", err);
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(file);
      });
    }
  };

  const updateProfile = async (updatedFields: any) => {
    const updatedUser = { ...currentUser, ...updatedFields };
    setCurrentUser(updatedUser);
    
    if (currentUser?.id) {
      localStorage.setItem("linkeo_profile_" + currentUser.id, JSON.stringify(updatedUser));
      
      // Filter out fields that do not exist in profiles table schema
      const dbPayload: any = {};
      if (updatedFields.full_name !== undefined) dbPayload.full_name = updatedFields.full_name;
      if (updatedFields.store_name !== undefined) dbPayload.store_name = updatedFields.store_name;
      if (updatedFields.role !== undefined) dbPayload.role = updatedFields.role;
      if (updatedFields.email !== undefined) dbPayload.email = updatedFields.email;

      if (Object.keys(dbPayload).length > 0) {
        const { error } = await supabase
          .from("profiles")
          .update(dbPayload)
          .eq("id", currentUser.id);
        if (error) console.error("Error updating profile in Supabase:", error);
      }
    }
  };

  const addOrderMedia = (orderId: string, url: string, type: "photo" | "video") => {
    const savedMediaStr = localStorage.getItem("linkeo_orders_media") || "{}";
    const savedMedia = JSON.parse(savedMediaStr);
    const mediaList = savedMedia[orderId] || [];
    const updatedMedia = [...mediaList, { type, url, date: new Date().toISOString() }];
    savedMedia[orderId] = updatedMedia;
    localStorage.setItem("linkeo_orders_media", JSON.stringify(savedMedia));

    // Update local state orders immediately
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, media: updatedMedia } : o));
  };

  return { orders, localEarnings, currentUser, products, addOrder, updateOrderStatus, assignDelivery, addEarning, addProduct, uploadProductImage, updateProfile, addOrderMedia };
}

