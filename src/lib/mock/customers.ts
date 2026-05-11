import type { Customer } from "./types";

export const customers: Customer[] = [
  { id: "CUS-001", name: "Laura Perez", orders: 6, total: 12450, status: "Frecuente" },
  { id: "CUS-002", name: "Andres Martinez", orders: 4, total: 8920, status: "Nuevo" },
  { id: "CUS-003", name: "Sofia Vargas", orders: 3, total: 6700, status: "Activo" },
  { id: "CUS-004", name: "Juan Lopez", orders: 2, total: 3100, status: "Activo" },
  { id: "CUS-005", name: "Camila Fernandez", orders: 3, total: 5540, status: "Frecuente" }
];
