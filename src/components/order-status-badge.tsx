import { Badge } from "@/components/ui/badge";
import type { OrderStatus } from "@/lib/mock";

type OrderStatusBadgeProps = {
  status: string | OrderStatus;
};

export function OrderStatusBadge({ status }: OrderStatusBadgeProps) {
  const variant =
    status === "Entregado" || status === "Pagado" || status === "Activo" || status === "Confirmado"
      ? "success"
      : status === "Pendiente" || status === "Revision" || status === "Solicitado a tienda"
        ? "warning"
        : status === "Cancelado"
          ? "muted"
          : "secondary";

  return <Badge variant={variant}>{status}</Badge>;
}
