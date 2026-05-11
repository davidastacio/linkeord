import type { Payment } from "./types";

export const payments: Payment[] = [
  { id: "PAY-001", recipientType: "emprendedor", recipientId: "ENT-001", label: "Pago a emprendedores", amount: 168400, status: "Pendiente", date: "31 May, 2024" },
  { id: "PAY-002", recipientType: "tienda", recipientId: "SUP-001", label: "Pagos a tiendas", amount: 420850, status: "Programado", date: "31 May, 2024" },
  { id: "PAY-003", recipientType: "delivery", recipientId: "DEL-001", label: "Liquidacion delivery", amount: 62175, status: "Pagado", date: "30 May, 2024" },
  { id: "PAY-004", recipientType: "emprendedor", recipientId: "ENT-003", label: "Retiros solicitados", amount: 38900, status: "Revision", date: "29 May, 2024" }
];
