"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Bell,
  ChevronDown,
  ClipboardList,
  LayoutDashboard,
  Menu,
  Search,
  Truck,
  BadgeDollarSign,
  History,
  UserRound,
} from "lucide-react";
import { AppLogo } from "@/components/app-logo";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const deliveryNav = [
  { label: "Dashboard", href: "/delivery", icon: LayoutDashboard },
  { label: "Pedidos asignados", href: "/delivery/pedidos", icon: ClipboardList },
  { label: "En camino", href: "/delivery/en-camino", icon: Truck },
  { label: "Historial", href: "/delivery/historial", icon: History },
  { label: "Mis ganancias", href: "/delivery/ganancias", icon: BadgeDollarSign },
  { label: "Mi perfil", href: "/delivery/perfil", icon: UserRound },
];

type DeliveryShellProps = {
  title: string;
  eyebrow: string;
  children: React.ReactNode;
  agentName?: string;
  /** Unused — kept for API compat with DashboardShell callers */
  mode?: string;
};

export function DeliveryShell({ title, eyebrow, children, agentName = "Carlos Delivery" }: DeliveryShellProps) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-[#f4f9f7]">
      {/* Sidebar */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-72 overflow-y-auto border-r border-white/10 bg-[#0e3d2f] px-5 py-6 text-white lg:block">
        <AppLogo className="brightness-0 invert" />
        <div className="mt-3 rounded-lg bg-white/10 px-3 py-2">
          <p className="text-xs font-bold text-white/60">Panel Delivery</p>
          <p className="mt-0.5 text-sm font-black text-white">{agentName}</p>
        </div>
        <nav className="mt-8 space-y-1.5" aria-label="Navegacion delivery">
          {deliveryNav.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-bold transition-colors",
                  isActive
                    ? "bg-[#20c997] text-white shadow-soft"
                    : "text-white/78 hover:bg-white/10 hover:text-white"
                )}
              >
                <Icon className="h-5 w-5 shrink-0" aria-hidden="true" />
                <span className="truncate">{item.label}</span>
              </Link>
            );
          })}
        </nav>
        <div className="mt-8 rounded-lg bg-[#20c997]/20 p-5">
          <p className="text-sm font-bold text-white">¿Necesitas ayuda?</p>
          <p className="mt-2 text-sm text-white/70">Soporte disponible 24/7.</p>
          <Button variant="secondary" size="sm" className="mt-4 w-full bg-white/14 text-white hover:bg-white/20">
            Contactar soporte
          </Button>
        </div>
      </aside>

      {/* Main */}
      <div className="lg:pl-72">
        <header className="sticky top-0 z-20 border-b border-border bg-white/90 backdrop-blur-xl">
          <div className="flex min-h-20 items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
            <Button variant="ghost" size="icon" className="lg:hidden" aria-label="Abrir menu">
              <Menu className="h-5 w-5" />
            </Button>
            <div>
              <p className="text-xs font-black uppercase text-[#0e3d2f]">{eyebrow}</p>
              <h1 className="mt-1 text-xl font-black text-navy sm:text-2xl">{title}</h1>
            </div>
            <div className="hidden flex-1 justify-center md:flex">
              <div className="flex h-11 w-full max-w-md items-center gap-3 rounded-md border border-border bg-white px-4 text-muted-foreground shadow-sm">
                <Search className="h-4 w-4" aria-hidden="true" />
                <span className="text-sm">Buscar pedidos...</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="icon" aria-label="Notificaciones">
                <Bell className="h-5 w-5" />
              </Button>
              <Link href="/delivery" className="hidden items-center gap-3 pl-2 sm:flex">
                <span className="grid h-10 w-10 place-items-center rounded-full bg-[#0e3d2f]/10 text-sm font-black text-[#0e3d2f]">
                  {agentName.slice(0, 2).toUpperCase()}
                </span>
                <span className="hidden xl:block">
                  <span className="block text-sm font-black text-navy">{agentName}</span>
                  <span className="block text-xs font-semibold text-muted-foreground">Delivery</span>
                </span>
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              </Link>
            </div>
          </div>
        </header>
        <main className="px-4 py-6 sm:px-6 lg:px-8">{children}</main>
      </div>
    </div>
  );
}
