"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { earnings, products as baseProducts } from "@/lib/mock-data";
import type { OrderStatus, StatusHistoryEntry } from "@/lib/mock/types";

export function useOrderStorage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [localEarnings, setEarnings] = useState<any[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [products, setProducts] = useState<any[]>([]);

  useEffect(() => {
    // 1. Fetch initial orders from Supabase
    const fetchOrders = async () => {
      const { data: authData } = await supabase.auth.getUser();
      let query = supabase.from("orders").select("*").order("date", { ascending: false });

      if (authData.user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", authData.user.id)
          .single();
        
        if (profile) {
          // Merge local settings modifications if any
          const localProfileStr = localStorage.getItem("linkeo_profile_" + profile.id);
          if (localProfileStr) {
            setCurrentUser({ ...profile, ...JSON.parse(localProfileStr) });
          } else {
            setCurrentUser(profile);
          }
          if (profile.role === "emprendedor") {
            query = query.eq("entrepreneurId", authData.user.id);
          }
        }
      }

      const { data, error } = await query;
      
      if (error) {
        console.error("Error fetching orders:", error);
      } else {
        const savedMediaStr = localStorage.getItem("linkeo_orders_media") || "{}";
        const savedMedia = JSON.parse(savedMediaStr);
        
        const mergedOrders = (data || []).map((o: any) => ({
          ...o,
          media: savedMedia[o.id] || o.media || []
        }));
        setOrders(mergedOrders);
      }
    };

    fetchOrders();

    // 2. Setup Realtime subscription
    const channelName = `orders_changes_${Math.random().toString(36).slice(2, 11)}`;
    const subscription = supabase
      .channel(channelName)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "orders" },
        (payload) => {
          fetchOrders();
        }
      )
      .subscribe();

    // Ganancias (Earnings) still local for now until we create an earnings table
    const savedEarnings = localStorage.getItem("linkeo_earnings");
    if (savedEarnings) {
      setEarnings(JSON.parse(savedEarnings));
    } else {
      setEarnings([]);
    }

    // Products initialization from localStorage
    const savedProducts = localStorage.getItem("linkeo_products");
    if (savedProducts) {
      setProducts(JSON.parse(savedProducts));
    } else {
      localStorage.setItem("linkeo_products", JSON.stringify(baseProducts));
      setProducts(baseProducts);
    }

    const handleStorageChange = () => {
      const updatedEarnings = localStorage.getItem("linkeo_earnings");
      if (updatedEarnings) setEarnings(JSON.parse(updatedEarnings));
      
      const updatedProducts = localStorage.getItem("linkeo_products");
      if (updatedProducts) setProducts(JSON.parse(updatedProducts));

      fetchOrders();
    };

    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("linkeo-storage", handleStorageChange);
    
    return () => {
      supabase.removeChannel(subscription);
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("linkeo-storage", handleStorageChange);
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

    // Local earnings logic
    if (status === "Entregado" && orderToUpdate.status !== "Entregado") {
      addEarning({
        id: `ERN-${Math.floor(Math.random() * 10000)}`,
        entrepreneurId: orderToUpdate.entrepreneurId || "ENT-001",
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

  const addEarning = (earning: any) => {
    const newEarnings = [earning, ...localEarnings];
    setEarnings(newEarnings);
    localStorage.setItem("linkeo_earnings", JSON.stringify(newEarnings));
    window.dispatchEvent(new Event("linkeo-storage"));
  };

  const addProduct = (product: any) => {
    const updatedProducts = [product, ...products];
    setProducts(updatedProducts);
    localStorage.setItem("linkeo_products", JSON.stringify(updatedProducts));
    window.dispatchEvent(new Event("linkeo-storage"));
  };

  const updateProfile = async (updatedFields: any) => {
    const updatedUser = { ...currentUser, ...updatedFields };
    setCurrentUser(updatedUser);
    
    if (currentUser?.id) {
      localStorage.setItem("linkeo_profile_" + currentUser.id, JSON.stringify(updatedUser));
      
      const { error } = await supabase
        .from("profiles")
        .update(updatedFields)
        .eq("id", currentUser.id);
      if (error) console.error("Error updating profile in Supabase:", error);
    }
    window.dispatchEvent(new Event("linkeo-storage"));
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

    window.dispatchEvent(new Event("linkeo-storage"));
  };

  return { orders, localEarnings, currentUser, products, addOrder, updateOrderStatus, assignDelivery, addEarning, addProduct, updateProfile, addOrderMedia };
}

