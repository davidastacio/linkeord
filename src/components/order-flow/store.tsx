"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import {
  collection, doc, query, where, orderBy,
  onSnapshot, addDoc, updateDoc, getDocs,
  serverTimestamp, getDoc, setDoc
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, auth, storage } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import type { OrderStatus, StatusHistoryEntry } from "@/lib/mock/types";

type OrderStorageContextType = {
  orders: any[];
  localEarnings: any[];
  currentUser: any;
  products: any[];
  loading: boolean;
  addOrder: (order: any) => Promise<void>;
  updateOrderStatus: (orderId: string, status: OrderStatus) => Promise<void>;
  assignDelivery: (orderId: string, deliveryId: string, deliveryName: string) => Promise<void>;
  addEarning: (earning: any) => Promise<void>;
  addProduct: (product: any) => Promise<void>;
  uploadProductImage: (file: File) => Promise<string>;
  updateProfile: (updatedFields: any) => Promise<void>;
  addOrderMedia: (orderId: string, url: string, type: "photo" | "video") => Promise<void>;
};

const OrderStorageContext = createContext<OrderStorageContextType | undefined>(undefined);

export function OrderStorageProvider({ children }: { children: React.ReactNode }) {
  const [orders, setOrders] = useState<any[]>([]);
  const [localEarnings, setEarnings] = useState<any[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let unsubProfile: (() => void) | null = null;
    const unsubAuth = onAuthStateChanged(auth, async (firebaseUser) => {
      if (unsubProfile) {
        unsubProfile();
        unsubProfile = null;
      }
      if (!firebaseUser) {
        setCurrentUser(null);
        setLoading(false);
        return;
      }

      // Live subscription to user profile
      const profileRef = doc(db, "usuarios", firebaseUser.uid);
      unsubProfile = onSnapshot(profileRef, async (profileSnap) => {
        if (profileSnap.exists()) {
          setCurrentUser({ id: firebaseUser.uid, ...profileSnap.data() });
        } else {
          // Create profile if doesn't exist
          const newProfile = {
            email: firebaseUser.email,
            full_name: firebaseUser.displayName || firebaseUser.email?.split("@")[0],
            role: "emprendedor",
            approved: false,
            created_at: serverTimestamp(),
          };
          await setDoc(profileRef, newProfile);
        }
        setLoading(false);
      }, (err) => {
        console.error("Error listening to profile:", err);
        setLoading(false);
      });
    });

    return () => {
      unsubAuth();
      if (unsubProfile) unsubProfile();
    };
  }, []);

  useEffect(() => {
    if (!currentUser?.id) {
      setOrders([]);
      setEarnings([]);
      return;
    }

    // Subscribe to orders
    let ordersQuery;
    if (currentUser.role === "emprendedor") {
      ordersQuery = query(
        collection(db, "orders"),
        where("entrepreneurId", "==", currentUser.id),
        orderBy("date", "desc")
      );
    } else {
      ordersQuery = query(collection(db, "orders"), orderBy("date", "desc"));
    }

    const unsubOrders = onSnapshot(ordersQuery, (snap) => {
      setOrders(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    }, (err) => {
      console.error("Error subscribing to orders:", err);
    });

    // Subscribe to earnings
    let earningsQuery;
    if (currentUser.role === "emprendedor") {
      earningsQuery = query(
        collection(db, "earnings"),
        where("entrepreneurId", "==", currentUser.id),
        orderBy("created_at", "desc")
      );
    } else {
      earningsQuery = query(collection(db, "earnings"), orderBy("created_at", "desc"));
    }

    const unsubEarnings = onSnapshot(earningsQuery, (snap) => {
      setEarnings(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    }, (err) => {
      console.error("Error subscribing to earnings:", err);
    });

    // Subscribe to products
    const unsubProducts = onSnapshot(
      query(collection(db, "products"), orderBy("created_at", "desc")),
      (snap) => {
        setProducts(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
      },
      (err) => {
        console.error("Error subscribing to products:", err);
      }
    );

    return () => {
      unsubOrders();
      unsubEarnings();
      unsubProducts();
    };
  }, [currentUser?.id, currentUser?.role]);

  const addOrder = async (order: any) => {
    try {
      await addDoc(collection(db, "orders"), {
        ...order,
        date: new Date().toISOString(),
        created_at: serverTimestamp(),
      });
    } catch (err) {
      console.error("Error adding order:", err);
    }
  };

  const updateOrderStatus = async (orderId: string, status: OrderStatus) => {
    try {
      const orderRef = doc(db, "orders", orderId);
      const orderSnap = await getDoc(orderRef);
      if (!orderSnap.exists()) return;

      const orderData = orderSnap.data();
      const historyEntry: StatusHistoryEntry = {
        status,
        timestamp: new Date().toISOString(),
      };
      const newHistory = [...(orderData.statusHistory || []), historyEntry];

      await updateDoc(orderRef, { status, statusHistory: newHistory });
    } catch (err) {
      console.error("Error updating order status:", err);
    }
  };

  const assignDelivery = async (orderId: string, deliveryId: string, deliveryName: string) => {
    try {
      const orderRef = doc(db, "orders", orderId);
      const orderSnap = await getDoc(orderRef);
      if (!orderSnap.exists()) return;

      const orderData = orderSnap.data();
      const historyEntry: StatusHistoryEntry = {
        status: "Delivery asignado",
        timestamp: new Date().toISOString(),
        note: `Asignado a ${deliveryName}`,
      };
      const newHistory = [...(orderData.statusHistory || []), historyEntry];

      await updateDoc(orderRef, {
        deliveryId,
        deliveryName,
        status: "Delivery asignado",
        statusHistory: newHistory,
      });
    } catch (err) {
      console.error("Error assigning delivery:", err);
    }
  };

  const addEarning = async (earning: any) => {
    try {
      await addDoc(collection(db, "earnings"), {
        ...earning,
        created_at: serverTimestamp(),
      });
    } catch (err) {
      console.error("Error adding earning:", err);
    }
  };

  const addProduct = async (product: any) => {
    try {
      const { stockLabel, share, accent, ...cleanProduct } = product;
      await addDoc(collection(db, "products"), {
        ...cleanProduct,
        created_at: serverTimestamp(),
      });
    } catch (err) {
      console.error("Error adding product:", err);
    }
  };

  const uploadProductImage = async (file: File): Promise<string> => {
    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `products/${Math.random().toString(36).slice(2)}.${fileExt}`;
      const storageRef = ref(storage, fileName);

      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);
      return url;
    } catch (err) {
      console.warn("Storage upload failed, falling back to base64:", err);
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(file);
      });
    }
  };

  const updateProfile = async (updatedFields: any) => {
    if (!currentUser?.id) return;
    const updatedUser = { ...currentUser, ...updatedFields };
    setCurrentUser(updatedUser);

    try {
      const profileRef = doc(db, "usuarios", currentUser.id);
      const { id, ...fieldsToSave } = updatedFields;
      await updateDoc(profileRef, fieldsToSave);
    } catch (err) {
      console.error("Error updating profile:", err);
    }
  };

  const addOrderMedia = async (orderId: string, url: string, type: "photo" | "video") => {
    try {
      const orderRef = doc(db, "orders", orderId);
      const orderSnap = await getDoc(orderRef);
      if (!orderSnap.exists()) return;

      const orderData = orderSnap.data();
      const mediaList = orderData.media || [];
      const updatedMedia = [...mediaList, { type, url, date: new Date().toISOString() }];

      await updateDoc(orderRef, { media: updatedMedia });
    } catch (err) {
      console.error("Error adding order media:", err);
    }
  };

  return (
    <OrderStorageContext.Provider
      value={{
        orders,
        localEarnings,
        currentUser,
        products,
        loading,
        addOrder,
        updateOrderStatus,
        assignDelivery,
        addEarning,
        addProduct,
        uploadProductImage,
        updateProfile,
        addOrderMedia,
      }}
    >
      {children}
    </OrderStorageContext.Provider>
  );
}

export function useOrderStorage() {
  const context = useContext(OrderStorageContext);
  if (context === undefined) {
    // If used outside of provider, we will log a warning or fallback. Let's return a dummy structure so it doesn't crash during build/transitions.
    console.warn("useOrderStorage must be used within an OrderStorageProvider");
    return {
      orders: [],
      localEarnings: [],
      currentUser: null,
      products: [],
      loading: true,
      addOrder: async () => {},
      updateOrderStatus: async () => {},
      assignDelivery: async () => {},
      addEarning: async () => {},
      addProduct: async () => {},
      uploadProductImage: async () => "",
      updateProfile: async () => {},
      addOrderMedia: async () => {},
    };
  }
  return context;
}
