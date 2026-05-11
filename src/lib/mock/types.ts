export type OrderStatus =
  | "Pendiente"
  | "Confirmado"
  | "Solicitado a tienda"
  | "Delivery asignado"
  | "Recogido"
  | "En camino"
  | "Entregado"
  | "Cancelado"
  | "Pagado";

export type EntityStatus = "Activo" | "Revision" | "Frecuente" | "Nuevo" | "Programado";

export type Product = {
  id: string;
  name: string;
  category: string;
  supplierId: string;
  price: number;
  cost: number;
  margin: number;
  demand: "Alta" | "Media" | "Baja";
  stock: number;
  stockLabel: string;
  sold: number;
  share: number;
  accent: string;
};

export type Entrepreneur = {
  id: string;
  name: string;
  store: string;
  sales: number;
  orders: number;
  status: EntityStatus;
  level: "Bronce" | "Plata" | "Oro";
};

export type Customer = {
  id: string;
  name: string;
  orders: number;
  total: number;
  status: EntityStatus;
};

export type SupplierStore = {
  id: string;
  name: string;
  products: number;
  pending: number;
  status: EntityStatus;
};

export type DeliveryTeam = {
  id: string;
  name: string;
  deliveries: number;
  rating: number;
  status: EntityStatus | OrderStatus;
};

export type DeliveryAgent = {
  id: string;
  name: string;
  phone: string;
  zone: string;
  vehicle: string;
  deliveries: number;
  rating: number;
  earnings: number;
  status: EntityStatus | OrderStatus;
};

export type StatusHistoryEntry = {
  status: OrderStatus;
  timestamp: string;
  note?: string;
};

export type Order = {
  id: string;
  entrepreneurId: string;
  customerId: string;
  productId: string;
  supplierId: string;
  deliveryId: string;
  quantity: number;
  amount: number;
  profit: number;
  commission: number;
  status: OrderStatus;
  date: string;
  customerPhone?: string;
  pickupAddress?: string;
  deliveryAddress?: string;
  notes?: string;
  estimatedArrival?: string;
  statusHistory?: StatusHistoryEntry[];
};

export type Earning = {
  id: string;
  entrepreneurId: string;
  orderId: string;
  label: string;
  amount: number;
  type: "venta" | "bono" | "retiro";
  date: string;
};

export type Commission = {
  id: string;
  orderId: string;
  label: string;
  amount: number;
  rate: number;
  status: OrderStatus;
};

export type Payment = {
  id: string;
  recipientType: "emprendedor" | "tienda" | "delivery";
  recipientId: string;
  label: string;
  amount: number;
  status: OrderStatus | EntityStatus;
  date: string;
};
