import type { DeliveryAgent } from "./types";

export const deliveryAgents: DeliveryAgent[] = [
  {
    id: "DEL-001",
    name: "Carlos Delivery",
    phone: "+1 (809) 555-1001",
    zone: "Santo Domingo Este",
    vehicle: "Moto",
    deliveries: 148,
    rating: 4.9,
    earnings: 24800,
    status: "Activo"
  },
  {
    id: "DEL-002",
    name: "Ruta Express DN",
    phone: "+1 (829) 555-1002",
    zone: "Santo Domingo Norte",
    vehicle: "Moto",
    deliveries: 211,
    rating: 4.8,
    earnings: 35640,
    status: "Activo"
  },
  {
    id: "DEL-003",
    name: "Moto Norte",
    phone: "+1 (849) 555-1003",
    zone: "Santiago",
    vehicle: "Moto",
    deliveries: 86,
    rating: 4.6,
    earnings: 14520,
    status: "En camino"
  }
];
