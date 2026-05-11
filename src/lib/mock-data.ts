import {
  BadgeDollarSign,
  Boxes,
  CheckCircle2,
  Clock3,
  CreditCard,
  Headphones,
  PackageCheck,
  ShoppingBag,
  Store,
  Truck,
  UserPlus,
  Users
} from "lucide-react";
import {
  commissions,
  customers,
  deliveryAgents,
  deliveryTeams,
  earnings,
  entrepreneurs,
  formatCurrency,
  formatCurrencyShort,
  orders,
  payments,
  products,
  suppliers
} from "@/lib/mock";

export { commissions, customers, deliveryAgents, deliveryTeams, earnings, entrepreneurs, orders, payments, products, suppliers };

const entrepreneurById = new Map(entrepreneurs.map((item) => [item.id, item]));
const customerById = new Map(customers.map((item) => [item.id, item]));
const productById = new Map(products.map((item) => [item.id, item]));

const deliveredOrders = orders.filter((order) => order.status === "Entregado" || order.status === "Pagado");
const totalSales = orders.reduce((sum, order) => sum + order.amount, 0);
const totalProfit = orders.reduce((sum, order) => sum + order.profit, 0);
const totalCommissions = commissions.reduce((sum, commission) => sum + commission.amount, 0);
const entrepreneurTotal = earnings.filter((item) => item.entrepreneurId === "ENT-001" && item.type !== "retiro").reduce((sum, item) => sum + item.amount, 0);

export const recentOrders = orders.map((order) => {
  const product = productById.get(order.productId);
  const customer = customerById.get(order.customerId);
  const entrepreneur = entrepreneurById.get(order.entrepreneurId);

  return {
    ...order,
    entrepreneur: entrepreneur?.name ?? "Emprendedor",
    customer: customer?.name ?? "Cliente",
    product: product?.name ?? "Producto",
    amount: formatCurrency(order.amount),
    profit: formatCurrency(order.profit)
  };
});

export const entrepreneurMetrics = [
  { label: "Ganancias totales", value: formatCurrency(entrepreneurTotal), trend: "+18.5% vs. mes anterior", icon: BadgeDollarSign, featured: true, color: "blue" as const },
  { label: "Ventas del mes", value: String(orders.filter((order) => order.entrepreneurId === "ENT-001").length), trend: "+22% vs. mes anterior", icon: ShoppingBag, color: "blue" as const },
  { label: "Pedidos entregados", value: String(deliveredOrders.length), trend: "+20% vs. mes anterior", icon: PackageCheck, color: "green" as const },
  { label: "Clientes nuevos", value: String(customers.filter((customer) => customer.status === "Nuevo").length), trend: "+13% vs. mes anterior", icon: UserPlus, color: "purple" as const }
];

export const adminMetrics = [
  { label: "Ventas totales", value: formatCurrency(totalSales), trend: "+18.5% vs. periodo anterior", icon: ShoppingBag, color: "blue" as const },
  { label: "Pedidos totales", value: String(orders.length), trend: "+22.4% vs. periodo anterior", icon: PackageCheck, color: "green" as const },
  { label: "Emprendedores activos", value: String(entrepreneurs.filter((item) => item.status === "Activo").length), trend: "+15.3% vs. periodo anterior", icon: Users, color: "purple" as const },
  { label: "Clientes registrados", value: String(customers.length), trend: "+12.7% vs. periodo anterior", icon: UserPlus, color: "orange" as const },
  { label: "Ganancias netas", value: formatCurrency(totalProfit + totalCommissions), trend: "+20.1% vs. periodo anterior", icon: BadgeDollarSign, color: "blue" as const }
];

export const revenueSeries = [
  { month: "1 May", ventas: 2000, ganancias: 500 },
  { month: "8 May", ventas: 4800, ganancias: 2200 },
  { month: "15 May", ventas: 5500, ganancias: 3000 },
  { month: "22 May", ventas: 6400, ganancias: 3900 },
  { month: "31 May", ventas: totalSales, ganancias: totalProfit }
];

export const operationsSeries = [
  { month: "24 May", ventas: 16500, pedidos: 6, ganancias: 2200 },
  { month: "25 May", ventas: 24500, pedidos: 11, ganancias: 4200 },
  { month: "26 May", ventas: 31800, pedidos: 16, ganancias: 6900 },
  { month: "27 May", ventas: 35800, pedidos: 19, ganancias: 8400 },
  { month: "28 May", ventas: 26800, pedidos: 13, ganancias: 4400 },
  { month: "29 May", ventas: 40200, pedidos: 25, ganancias: 11200 },
  { month: "30 May", ventas: 38600, pedidos: 23, ganancias: 10800 },
  { month: "31 May", ventas: totalSales, pedidos: orders.length, ganancias: totalProfit }
];

export const tinySalesSeries = [
  { month: "1", ventas: 10, pedidos: 4, clientes: 5 },
  { month: "2", ventas: 18, pedidos: 11, clientes: 9 },
  { month: "3", ventas: 15, pedidos: 14, clientes: 13 },
  { month: "4", ventas: 24, pedidos: 18, clientes: 10 },
  { month: "5", ventas: 20, pedidos: 15, clientes: 16 },
  { month: "6", ventas: 30, pedidos: 25, clientes: 22 },
  { month: "7", ventas: 27, pedidos: 21, clientes: 20 },
  { month: "8", ventas: orders.length * 5, pedidos: orders.length, clientes: customers.length }
];

const salesEarnings = earnings.filter((item) => item.type === "venta").reduce((sum, item) => sum + item.amount, 0);
const bonusEarnings = earnings.filter((item) => item.type === "bono").reduce((sum, item) => sum + item.amount, 0);
const withdrawalEarnings = earnings.filter((item) => item.type === "retiro").reduce((sum, item) => sum + item.amount, 0);
const earningsBase = salesEarnings + bonusEarnings + withdrawalEarnings;

export const entrepreneurEarningsBreakdown = [
  { name: "Ganancia por ventas", value: Number(((salesEarnings / earningsBase) * 100).toFixed(1)), amount: formatCurrency(salesEarnings), color: "#20C997" },
  { name: "Bonos y promociones", value: Number(((bonusEarnings / earningsBase) * 100).toFixed(1)), amount: formatCurrency(bonusEarnings), color: "#075BFF" },
  { name: "Retiros", value: Number(((withdrawalEarnings / earningsBase) * 100).toFixed(1)), amount: formatCurrency(withdrawalEarnings), color: "#7C4DFF" }
];

const supplierPayments = payments.filter((item) => item.recipientType === "tienda").reduce((sum, item) => sum + item.amount, 0);
const deliveryPayments = payments.filter((item) => item.recipientType === "delivery").reduce((sum, item) => sum + item.amount, 0);
const adminBreakdownTotal = totalCommissions + supplierPayments + deliveryPayments;

export const adminProfitBreakdown = [
  { name: "Comision plataforma", value: Number(((totalCommissions / adminBreakdownTotal) * 100).toFixed(1)), amount: formatCurrency(totalCommissions), color: "#20C997" },
  { name: "Deliverys", value: Number(((deliveryPayments / adminBreakdownTotal) * 100).toFixed(1)), amount: formatCurrency(deliveryPayments), color: "#075BFF" },
  { name: "Tiendas proveedoras", value: Number(((supplierPayments / adminBreakdownTotal) * 100).toFixed(1)), amount: formatCurrency(supplierPayments), color: "#7C4DFF" }
];

export const recentActivity = [
  { title: "Nuevo emprendedor registrado", detail: `${entrepreneurs[0].name} esta activo en la plataforma.`, time: "5 min ago", icon: Users, color: "bg-blue-50 text-primary" },
  { title: "Nuevo pedido recibido", detail: `Pedido ${orders[0].id} por ${formatCurrency(orders[0].amount)}.`, time: "15 min ago", icon: ShoppingBag, color: "bg-cyan-50 text-cyan-600" },
  { title: "Pago procesado", detail: `${payments[0].label}: ${formatCurrency(payments[0].amount)}.`, time: "1h ago", icon: CreditCard, color: "bg-emerald-50 text-emerald-600" },
  { title: "Nuevo producto agregado", detail: `${products[0].name} agregado por ${suppliers[0].name}.`, time: "2h ago", icon: Store, color: "bg-amber-50 text-amber-600" },
  { title: "Delivery asignado", detail: `Pedido ${orders[0].id} asignado a ${deliveryTeams[0].name}.`, time: "3h ago", icon: Truck, color: "bg-violet-50 text-violet-600" }
];

export const financialReports = [
  ...payments.slice(0, 3).map((payment) => ({
    label: payment.label,
    value: formatCurrencyShort(payment.amount),
    status: payment.status
  })),
  { label: "Comisiones cobradas", value: formatCurrencyShort(totalCommissions), status: "Pagado" }
];

export const landingFeatures = [
  {
    title: "Catalogo rentable",
    description: "Productos en tendencia, de alta calidad y con margenes competitivos.",
    icon: ShoppingBag
  },
  {
    title: "Nosotros entregamos",
    description: "Recogida, logistica y entrega al cliente final sin complicaciones.",
    icon: Truck
  },
  {
    title: "Tu ganas mas",
    description: "Tu pones el precio, cierras la venta y recibes tus ganancias.",
    icon: BadgeDollarSign
  },
  {
    title: "Soporte 24/7",
    description: "Acompanamiento para cada pedido, cliente y entrega.",
    icon: Headphones
  }
];

export const steps = [
  { title: "Registrate", description: "Crea tu cuenta demo en minutos.", icon: Users },
  { title: "Elige productos", description: "Selecciona articulos del catalogo.", icon: ShoppingBag },
  { title: "Comparte y vende", description: "Consigue clientes y cierra la venta.", icon: BadgeDollarSign },
  { title: "Linkeo entrega", description: "Gestionamos recogida, cobro y delivery.", icon: Truck },
  { title: "Recibe ganancias", description: "Tus ganancias llegan de forma clara.", icon: CheckCircle2 }
];

export const adminQueues = [
  { label: "Por recoger", value: orders.filter((order) => order.status === "Solicitado a tienda").length, icon: Clock3 },
  { label: "En almacen", value: orders.filter((order) => order.status === "Recogido").length, icon: Boxes },
  { label: "En delivery", value: orders.filter((order) => order.status === "En camino").length, icon: Truck },
  { label: "Cerrados hoy", value: deliveredOrders.length, icon: PackageCheck }
];

export const dashboardPages = [
  "Mis productos",
  "Mis pedidos",
  "Mis clientes",
  "Mis ganancias",
  "Mis retiros",
  "Perfil",
  "Configuracion"
];

export const adminPages = [
  "Gestion de emprendedores",
  "Gestion de clientes",
  "Productos",
  "Tiendas proveedoras",
  "Deliverys",
  "Pagos a emprendedores",
  "Pagos a tiendas",
  "Comisiones",
  "Reportes financieros",
  "Roles y permisos"
];
