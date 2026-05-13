"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Bell, ChevronDown, Menu, MessageSquareText, Search, PackagePlus } from "lucide-react";
import { AppLogo } from "@/components/app-logo";
import { SidebarNav } from "@/components/dashboard/sidebar-nav";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabase";

type DashboardShellProps = {
  mode: "dashboard" | "admin";
  title: string;
  eyebrow: string;
  children: React.ReactNode;
};

export function DashboardShell({ mode, title, eyebrow, children }: DashboardShellProps) {
  const isAdmin = mode === "admin";
  const [userProfile, setUserProfile] = useState<any>(null);

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single();
        
        if (profile) {
          setUserProfile(profile);
        }
      }
    };
    fetchUser();
  }, []);

  const userName = userProfile?.full_name || (isAdmin ? "Administrador" : "Cargando...");
  const userInitials = userProfile?.full_name 
    ? userProfile.full_name.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2)
    : (isAdmin ? "AD" : "...");
  const userRole = userProfile?.role === "admin" ? "Admin" : (userProfile?.role === "emprendedor" ? "Emprendedor" : "Usuario");

  return (
    <div className={cn("min-h-screen", isAdmin ? "bg-[#f6f9ff]" : "bg-[#f7faff]")}>
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-30 hidden w-72 overflow-y-auto border-r px-5 py-6 lg:block",
          isAdmin
            ? "border-white/10 bg-[#071a36] text-white"
            : "border-[#e7eefb] bg-white text-navy shadow-[18px_0_55px_rgba(8,26,58,0.06)]"
        )}
      >
        <AppLogo className={isAdmin ? "brightness-0 invert" : undefined} />
        <div className="mt-9">
          <SidebarNav mode={mode} />
        </div>
        <div className={cn("mt-8 rounded-lg p-5 text-white", isAdmin ? "navy-panel" : "bg-gradient-to-br from-[#075bff] via-[#123fe8] to-[#071a36] shadow-soft")}>
          <p className="text-sm font-bold">Necesitas ayuda?</p>
          <p className="mt-2 text-sm text-white/78">
            Nuestro equipo de soporte esta disponible 24/7 para ayudarte.
          </p>
          <Button variant="secondary" size="sm" className="mt-4 w-full bg-white/14 text-white hover:bg-white/20">
            Contactar soporte
          </Button>
        </div>
      </aside>
      <div className="lg:pl-72">
        <header className={cn("sticky top-0 z-20 border-b bg-white/90 backdrop-blur-xl", isAdmin ? "border-border" : "border-[#e8effa]")}>
          <div className="flex min-h-20 items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
            <Button variant="ghost" size="icon" className="lg:hidden" aria-label="Abrir menu">
              <Menu className="h-5 w-5" />
            </Button>
            <div>
              {isAdmin ? (
                <>
                  <p className="text-xs font-black uppercase text-primary">{eyebrow}</p>
                  <h1 className="mt-1 text-xl font-black text-navy sm:text-2xl">{title}</h1>
                </>
              ) : (
                <>
                  <h1 className="text-xl font-black text-navy sm:text-2xl">{title}</h1>
                  <p className="mt-1 text-sm font-medium text-muted-foreground">{eyebrow}</p>
                </>
              )}
            </div>
            <div className="hidden flex-1 justify-center md:flex">
              <div className={cn("flex h-11 w-full max-w-md items-center gap-3 rounded-md border bg-white px-4 text-muted-foreground", isAdmin ? "border-border" : "border-[#e4ecf8] shadow-sm")}>
                <Search className="h-4 w-4" aria-hidden="true" />
                <span className="text-sm">Buscar productos, pedidos o clientes</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {!isAdmin && (
                <Link
                  href="/dashboard/products"
                  className="hidden md:flex h-9 items-center gap-2 rounded-lg bg-primary px-4 text-sm font-black text-white shadow-sm hover:bg-primary/90 transition-colors"
                >
                  <PackagePlus className="h-4 w-4" />
                  Nuevo pedido
                </Link>
              )}
              <Button variant="outline" size="icon" aria-label="Notificaciones">
                <Bell className="h-5 w-5" />
              </Button>
              <Button variant="outline" size="icon" className="hidden sm:inline-flex" aria-label="Mensajes">
                <MessageSquareText className="h-5 w-5" />
              </Button>
              <Link href="/" className="hidden items-center gap-3 pl-2 sm:flex">
                <span className={cn("grid h-10 w-10 place-items-center rounded-full bg-secondary text-sm font-black text-primary", !isAdmin && "ring-4 ring-white")}>
                  {userInitials}
                </span>
                <span className="hidden xl:block">
                  <span className="block text-sm font-black text-navy">{userName}</span>
                  <span className="block text-xs font-semibold text-muted-foreground">{userRole}</span>
                </span>
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              </Link>
            </div>
          </div>
          <div className="flex gap-2 overflow-x-auto border-t border-border px-4 py-3 lg:hidden [&_nav]:flex [&_nav]:gap-2 [&_nav]:space-y-0 [&_nav>div]:contents [&_nav_p]:hidden">
            <SidebarNav mode={mode} />
          </div>
        </header>
        <main className="px-4 py-6 sm:px-6 lg:px-8">{children}</main>
      </div>
    </div>
  );
}
