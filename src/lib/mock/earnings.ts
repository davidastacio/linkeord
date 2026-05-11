import type { Earning } from "./types";

export const earnings: Earning[] = [
  { id: "ERN-001", entrepreneurId: "ENT-001", orderId: "#4589", label: "Ganancia por venta", amount: 350, type: "venta", date: "31 May, 2024" },
  { id: "ERN-002", entrepreneurId: "ENT-002", orderId: "#4588", label: "Ganancia por venta", amount: 420, type: "venta", date: "31 May, 2024" },
  { id: "ERN-003", entrepreneurId: "ENT-003", orderId: "#4587", label: "Ganancia por venta", amount: 310, type: "venta", date: "30 May, 2024" },
  { id: "ERN-004", entrepreneurId: "ENT-001", orderId: "#4584", label: "Bono por recurrencia", amount: 4250, type: "bono", date: "29 May, 2024" },
  { id: "ERN-005", entrepreneurId: "ENT-001", orderId: "#4583", label: "Retiro solicitado", amount: 3510, type: "retiro", date: "28 May, 2024" }
];
