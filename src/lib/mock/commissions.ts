import type { Commission } from "./types";

export const commissions: Commission[] = [
  { id: "COM-001", orderId: "#4589", label: "Comision plataforma", amount: 160, rate: 10, status: "Pagado" },
  { id: "COM-002", orderId: "#4588", label: "Comision plataforma", amount: 285, rate: 10, status: "Pagado" },
  { id: "COM-003", orderId: "#4587", label: "Comision plataforma", amount: 125, rate: 10, status: "En camino" },
  { id: "COM-004", orderId: "#4586", label: "Comision plataforma", amount: 95, rate: 10, status: "Solicitado a tienda" }
];
