"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { LucideIcon } from "lucide-react";
import {
  BadgeDollarSign,
  BarChart3,
  Bell,
  Boxes,
  Building2,
  ClipboardList,
  CreditCard,
  FileBarChart,
  Gift,
  HandCoins,
  HelpCircle,
  LayoutDashboard,
  LockKeyhole,
  Megaphone,
  PackageCheck,
  ReceiptText,
  Settings,
  ShoppingBag,
  Store,
  Truck,
  UserCog,
  UserRound,
  Users,
  WalletCards
} from "lucide-react";
import { cn } from "@/lib/utils";

type NavItem = {
  label: string;
  href: string;
  icon: LucideIcon;
};

type NavGroup = {
  label?: string;
  items: NavItem[];
};

const entrepreneurNav: NavGroup[] = [
  {
    items: [{ label: "Dashboard", href: "/dashboard", icon: LayoutDashboard }]
  },
  {
    label: "Vender",
    items: [
      { label: "Mis productos", href: "/dashboard/mis-productos", icon: ClipboardList },
      { label: "Mis pedidos", href: "/dashboard/mis-pedidos", icon: ShoppingBag },
      { label: "Mis clientes", href: "/dashboard/mis-clientes", icon: Users },
      { label: "Mis ganancias", href: "/dashboard/mis-ganancias", icon: BadgeDollarSign },
      { label: "Mis retiros", href: "/dashboard/mis-retiros", icon: WalletCards }
    ]
  },
  {
    label: "Herramientas",
    items: [
      { label: "Estadisticas", href: "/dashboard/estadisticas", icon: BarChart3 },
      { label: "Promociones", href: "/dashboard/promociones", icon: Megaphone },
      { label: "Materiales", href: "/dashboard/materiales", icon: Boxes }
    ]
  },
  {
    label: "Cuenta",
    items: [
      { label: "Mi perfil", href: "/dashboard/perfil", icon: UserRound },
      { label: "Configuracion", href: "/dashboard/configuracion", icon: Settings },
      { label: "Ayuda", href: "/dashboard/ayuda", icon: HelpCircle }
    ]
  }
];

const adminNav: NavGroup[] = [
  {
    items: [{ label: "Dashboard", href: "/admin", icon: LayoutDashboard }]
  },
  {
    label: "Gestion",
    items: [
      { label: "Emprendedores", href: "/admin/emprendedores", icon: Users },
      { label: "Clientes", href: "/admin/clientes", icon: UserRound },
      { label: "Productos", href: "/admin/productos", icon: PackageCheck },
      { label: "Pedidos", href: "/admin/pedidos", icon: ClipboardList },
      { label: "Tiendas proveedoras", href: "/admin/tiendas-proveedoras", icon: Store },
      { label: "Deliverys", href: "/admin/deliverys", icon: Truck }
    ]
  },
  {
    label: "Finanzas",
    items: [
      { label: "Pagos a emprendedores", href: "/admin/pagos-emprendedores", icon: HandCoins },
      { label: "Pagos a tiendas", href: "/admin/pagos-tiendas", icon: CreditCard },
      { label: "Comisiones", href: "/admin/comisiones", icon: ReceiptText },
      { label: "Reportes financieros", href: "/admin/reportes-financieros", icon: FileBarChart }
    ]
  },
  {
    label: "Herramientas",
    items: [
      { label: "Promociones", href: "/admin/promociones", icon: Gift },
      { label: "Notificaciones", href: "/admin/notificaciones", icon: Bell },
      { label: "Soporte", href: "/admin/soporte", icon: HelpCircle }
    ]
  },
  {
    label: "Configuracion",
    items: [
      { label: "Usuarios", href: "/admin/usuarios", icon: UserCog },
      { label: "Roles y permisos", href: "/admin/roles-permisos", icon: LockKeyhole },
      { label: "Configuracion general", href: "/admin/configuracion", icon: Building2 }
    ]
  }
];

type SidebarNavProps = {
  mode: "dashboard" | "admin";
};

export function SidebarNav({ mode }: SidebarNavProps) {
  const pathname = usePathname();
  const groups = mode === "admin" ? adminNav : entrepreneurNav;
  const isAdmin = mode === "admin";

  return (
    <nav className="space-y-7" aria-label="Navegacion interna">
      {groups.map((group, groupIndex) => (
        <div key={group.label ?? `main-${groupIndex}`}>
          {group.label ? (
            <p className={cn("mb-3 px-3 text-xs font-black uppercase", isAdmin ? "text-white/45" : "text-slate-400")}>
              {group.label}
            </p>
          ) : null}
          <div className="space-y-1.5">
            {group.items.map((item) => {
              const itemPath = item.href.split("#")[0];
              const isActive = pathname === itemPath;
              const Icon = item.icon;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-bold transition-colors",
                    isActive && isAdmin && "bg-primary text-white shadow-soft",
                    isActive && !isAdmin && "bg-[#edf4ff] text-primary shadow-[inset_0_0_0_1px_rgba(7,91,255,0.08)]",
                    !isActive && isAdmin && "text-white/78 hover:bg-white/10 hover:text-white",
                    !isActive && !isAdmin && "text-navy/70 hover:bg-[#f3f7ff] hover:text-primary"
                  )}
                >
                  <Icon className={cn("h-5 w-5 shrink-0", isActive && !isAdmin && "text-primary")} aria-hidden="true" />
                  <span className="truncate">{item.label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      ))}
    </nav>
  );
}
