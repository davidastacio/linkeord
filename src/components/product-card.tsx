import { ShoppingBag } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

type ProductCardProps = {
  name: string;
  category: string;
  price: number;
  margin: number;
  demand: string;
  stockLabel: string;
};

export function ProductCard({
  name,
  category,
  price,
  margin,
  demand,
  stockLabel
}: ProductCardProps) {
  return (
    <Card className="overflow-hidden shadow-sm">
      <div className="aspect-[4/3] bg-gradient-to-br from-secondary via-white to-blue-100 p-4">
        <div className="flex h-full items-center justify-center rounded-md border border-white/80 bg-white/60">
          <ShoppingBag className="h-12 w-12 text-primary" aria-hidden="true" />
        </div>
      </div>
      <div className="p-4">
        <div className="flex items-center justify-between gap-3">
          <Badge variant="secondary">{category}</Badge>
          <Badge variant={demand === "Alta" ? "success" : "muted"}>{demand}</Badge>
        </div>
        <h3 className="mt-4 min-h-12 text-base font-extrabold leading-6 text-navy">{name}</h3>
        <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
          <div>
            <p className="text-muted-foreground">Precio</p>
            <p className="font-black text-navy">RD$ {price.toLocaleString("en-US")}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Margen</p>
            <p className="font-black text-primary">RD$ {margin.toLocaleString("en-US")}</p>
          </div>
        </div>
        <Button className="mt-5 w-full" size="sm">
          Compartir producto
        </Button>
        <p className="mt-3 text-center text-xs font-semibold text-muted-foreground">{stockLabel}</p>
      </div>
    </Card>
  );
}
