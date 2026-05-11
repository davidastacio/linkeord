"use client";

import { useEffect, useState } from "react";
import { recentOrders, earnings } from "@/lib/mock-data";
import type { Order, OrderStatus, StatusHistoryEntry } from "@/lib/mock/types";

export function useOrderStorage() {
  const [orders, setOrders] = useState(recentOrders);
  const [localEarnings, setEarnings] = useState(earnings);

  useEffect(() => {
    const savedOrders = localStorage.getItem("linkeo_orders");
    if (savedOrders) {
      setOrders(JSON.parse(savedOrders));
    } else {
      setOrders(recentOrders);
      localStorage.setItem("linkeo_orders", JSON.stringify(recentOrders));
    }

    const savedEarnings = localStorage.getItem("linkeo_earnings");
    if (savedEarnings) {
      setEarnings(JSON.parse(savedEarnings));
    } else {
      setEarnings(earnings);
      localStorage.setItem("linkeo_earnings", JSON.stringify(earnings));
    }

    const handleStorageChange = () => {
      const updatedOrders = localStorage.getItem("linkeo_orders");
      if (updatedOrders) setOrders(JSON.parse(updatedOrders));
      const updatedEarnings = localStorage.getItem("linkeo_earnings");
      if (updatedEarnings) setEarnings(JSON.parse(updatedEarnings));
    };

    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("linkeo-storage", handleStorageChange);
    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("linkeo-storage", handleStorageChange);
    };
  }, []);

  const addOrder = (order: any) => {
    const newOrders = [order, ...orders];
    setOrders(newOrders as any);
    localStorage.setItem("linkeo_orders", JSON.stringify(newOrders));
    window.dispatchEvent(new Event("linkeo-storage"));
  };

  const updateOrderStatus = (orderId: string, status: OrderStatus) => {
    const orderToUpdate = orders.find(o => o.id === orderId);
    if (!orderToUpdate) return;

    // When order becomes Entregado for the first time, add an earning entry
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

    const newOrders = orders.map((o) =>
      o.id === orderId
        ? {
            ...o,
            status,
            statusHistory: [...(o.statusHistory || []), historyEntry],
          }
        : o
    );
    setOrders(newOrders as any);
    localStorage.setItem("linkeo_orders", JSON.stringify(newOrders));
    window.dispatchEvent(new Event("linkeo-storage"));
  };

  /**
   * Assigns a delivery agent to an order and advances status to "Delivery asignado"
   */
  const assignDelivery = (orderId: string, deliveryId: string, deliveryName: string) => {
    const historyEntry: StatusHistoryEntry = {
      status: "Delivery asignado",
      timestamp: new Date().toISOString(),
      note: `Asignado a ${deliveryName}`,
    };

    const newOrders = orders.map((o) =>
      o.id === orderId
        ? {
            ...o,
            deliveryId,
            deliveryName,
            status: "Delivery asignado",
            statusHistory: [...(o.statusHistory || []), historyEntry],
          }
        : o
    );
    setOrders(newOrders as any);
    localStorage.setItem("linkeo_orders", JSON.stringify(newOrders));
    window.dispatchEvent(new Event("linkeo-storage"));
  };

  const addEarning = (earning: any) => {
    const newEarnings = [earning, ...localEarnings];
    setEarnings(newEarnings);
    localStorage.setItem("linkeo_earnings", JSON.stringify(newEarnings));
    window.dispatchEvent(new Event("linkeo-storage"));
  };

  return { orders, localEarnings, addOrder, updateOrderStatus, assignDelivery, addEarning };
}
