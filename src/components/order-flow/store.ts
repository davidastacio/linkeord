"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { earnings } from "@/lib/mock-data";
import type { OrderStatus, StatusHistoryEntry } from "@/lib/mock/types";

export function useOrderStorage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [localEarnings, setEarnings] = useState<any[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);

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
          setCurrentUser(profile);
          if (profile.role === "emprendedor") {
            query = query.eq("entrepreneurId", authData.user.id);
          }
        }
      }

      const { data, error } = await query;
      
      if (error) {
        console.error("Error fetching orders:", error);
      } else {
        setOrders(data || []);
      }
    };

    fetchOrders();

    // 2. Setup Realtime subscription
    const subscription = supabase
      .channel("orders_changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "orders" },
        (payload) => {
          // Refetch orders when any change happens across the network
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

    const handleStorageChange = () => {
      const updatedEarnings = localStorage.getItem("linkeo_earnings");
      if (updatedEarnings) setEarnings(JSON.parse(updatedEarnings));
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

  return { orders, localEarnings, currentUser, addOrder, updateOrderStatus, assignDelivery, addEarning };
}

