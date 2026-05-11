import type { Product } from "./types";

export const products: Product[] = [
  {
    id: "PRD-001",
    name: "Perfume Victoria 100ml",
    category: "Belleza",
    supplierId: "SUP-001",
    price: 1600,
    cost: 1250,
    margin: 350,
    demand: "Alta",
    stock: 86,
    stockLabel: "Disponible",
    sold: 48,
    share: 38,
    accent: "bg-rose-100"
  },
  {
    id: "PRD-002",
    name: "Reloj Naviforce NF9197",
    category: "Accesorios",
    supplierId: "SUP-002",
    price: 2850,
    cost: 2430,
    margin: 420,
    demand: "Alta",
    stock: 44,
    stockLabel: "Disponible",
    sold: 32,
    share: 25,
    accent: "bg-amber-100"
  },
  {
    id: "PRD-003",
    name: "Audifonos Inalambricos i11",
    category: "Tecnologia",
    supplierId: "SUP-003",
    price: 950,
    cost: 670,
    margin: 280,
    demand: "Media",
    stock: 120,
    stockLabel: "Nuevo",
    sold: 21,
    share: 17,
    accent: "bg-slate-100"
  },
  {
    id: "PRD-004",
    name: "Bolso de Hombro Rosa",
    category: "Moda",
    supplierId: "SUP-001",
    price: 1250,
    cost: 940,
    margin: 310,
    demand: "Alta",
    stock: 38,
    stockLabel: "Disponible",
    sold: 18,
    share: 14,
    accent: "bg-pink-100"
  },
  {
    id: "PRD-005",
    name: "Gafas de Sol Clasicas",
    category: "Moda",
    supplierId: "SUP-002",
    price: 780,
    cost: 520,
    margin: 260,
    demand: "Media",
    stock: 57,
    stockLabel: "Disponible",
    sold: 13,
    share: 8,
    accent: "bg-orange-100"
  }
];
