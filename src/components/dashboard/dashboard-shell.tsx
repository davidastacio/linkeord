"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Bell, ChevronDown, Menu, MessageSquareText, Search, PackagePlus, Clock, LogOut, ShieldAlert } from "lucide-react";
import { AppLogo } from "@/components/app-logo";
import { SidebarNav } from "@/components/dashboard/sidebar-nav";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabase";

type DashboardShellProps = {
  mode: "dashboard" | "admin" | "provider";
  title: string;
  eyebrow: string;
  children: React.ReactNode;
};

export function DashboardShell({ mode, title, eyebrow, children }: DashboardShellProps) {
  const isAdmin = mode === "admin";
  const [userProfile, setUserProfile] = useState<any>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = async () => {
    setLoggingOut(true);
    await supabase.auth.signOut();
    window.location.href = "/login";
  };

  useEffect(() => {
    const fetchUser = async () => {
      try {
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
      } catch (err) {
        console.error("Error loading user profile:", err);
      } finally {
        setLoadingProfile(false);
      }
    };
    fetchUser();
  }, []);

  const userName = userProfile?.full_name || (isAdmin ? "Administrador" : (mode === "provider" ? "Proveedor" : "Cargando..."));
  const userInitials = userProfile?.full_name 
    ? userProfile.full_name.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2)
    : (isAdmin ? "AD" : (mode === "provider" ? "PV" : "..."));
  const userRole = userProfile?.role === "admin" ? "Admin" : (userProfile?.role === "proveedor" ? "Proveedor" : (userProfile?.role === "emprendedor" ? "Emprendedor" : "Usuario"));

  // 1. Loading Screen
  if (loadingProfile) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f7faff]">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  // 2. Admin Authorization & Authentication Gate
  if (isAdmin) {
    // If user is not authenticated
    if (!userProfile) {
      const handleGoogleLogin = async () => {
        await supabase.auth.signInWithOAuth({
          provider: 'google',
          options: {
            redirectTo: `${window.location.origin}/auth/callback?next=/admin`,
          }
        });
      };

      return (
        <div className="relative flex min-h-screen flex-col items-center justify-center bg-[#071a36] p-4 text-center">
          <div className="absolute top-1/4 left-1/4 h-72 w-72 rounded-full bg-blue-500/10 blur-[120px]" />
          <div className="absolute bottom-1/4 right-1/4 h-72 w-72 rounded-full bg-indigo-500/10 blur-[120px]" />
          <div className="relative z-10 w-full max-w-md rounded-2xl border border-white/10 bg-white/5 p-8 shadow-[0_20px_60px_rgba(0,0,0,0.3)] backdrop-blur-md md:p-10 text-white">
            <span className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-white/10 shadow-inner">
              <ShieldAlert className="h-10 w-10 text-blue-400" />
            </span>
            <h2 className="mt-8 text-2xl font-black">Acceso de Administrador</h2>
            <p className="mt-2 text-sm text-slate-400 font-semibold">Identifícate con tu cuenta autorizada</p>

            <button
              onClick={handleGoogleLogin}
              className="mt-8 flex h-14 w-full items-center justify-center gap-3 rounded-md bg-blue-600 px-5 text-base font-black text-white hover:bg-blue-700 transition shadow-[0_10px_25px_rgba(7,91,255,0.3)]"
            >
              <span className="text-lg font-black text-white">G</span>
              Continuar con Google
            </button>
            <p className="mt-6 text-xs text-slate-500 font-semibold">Solo usuarios con rol administrativo pueden entrar aquí.</p>
          </div>
          <p className="mt-8 text-xs font-semibold text-slate-500">Linkeo © 2026. Panel Administrativo.</p>
        </div>
      );
    }

    // If authenticated but doesn't have role "admin"
    if (userProfile.role !== "admin") {
      return (
        <div className="relative flex min-h-screen flex-col items-center justify-center bg-[#f7faff] p-4 text-center">
          <div className="relative z-10 w-full max-w-md rounded-2xl border border-border bg-white p-8 shadow-[0_20px_60px_rgba(8,26,58,0.06)] md:p-10">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-50 text-red-600 shadow-inner">
              <ShieldAlert className="h-8 w-8" />
            </div>
            <h2 className="mt-6 text-2xl font-black text-navy">Acceso Denegado</h2>
            <p className="mt-4 text-sm font-semibold leading-relaxed text-slate-600">
              Lo sentimos, <span className="text-blue-600">{userProfile.full_name}</span>. No tienes permisos de administrador para visualizar esta sección.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
              <Button
                onClick={() => window.location.href = "/dashboard"}
                className="flex h-11 items-center justify-center gap-2 rounded-md bg-blue-600 px-5 text-sm font-black text-white hover:bg-blue-700 transition"
              >
                Ir a mi Dashboard
              </Button>
              <Button
                onClick={handleLogout}
                variant="outline"
                className="flex h-11 items-center justify-center gap-2 rounded-md border-slate-200 bg-white px-5 text-sm font-black text-slate-700 hover:bg-slate-50 transition"
              >
                Cerrar sesión
              </Button>
            </div>
          </div>
        </div>
      );
    }
  }

  // 3. Bloqueo de seguridad: Si el usuario existe pero no está aprobado, se le muestra la pantalla de espera
  if (userProfile && userProfile.approved === false && userProfile.role !== "admin") {
    return (
      <div className="relative flex min-h-screen flex-col items-center justify-center bg-[#f7faff] p-4 text-center">
        {/* Elementos decorativos de fondo */}
        <div className="absolute top-1/4 left-1/4 h-72 w-72 rounded-full bg-blue-400/10 blur-[100px]" />
        <div className="absolute bottom-1/4 right-1/4 h-72 w-72 rounded-full bg-indigo-400/10 blur-[100px]" />

        <div className="relative z-10 w-full max-w-lg rounded-2xl border border-white/80 bg-white/70 p-8 shadow-[0_20px_60px_rgba(8,26,58,0.08)] backdrop-blur-md md:p-10">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-blue-50 text-blue-600 shadow-inner">
            <Clock className="h-8 w-8 animate-pulse" />
          </div>

          <div className="mt-6">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1 text-xs font-black text-amber-700 ring-1 ring-inset ring-amber-600/10">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-ping" />
              Pendiente de Aprobación
            </span>
          </div>

          <h2 className="mt-6 text-2xl font-black text-navy sm:text-3xl">¡Tu cuenta está en revisión!</h2>
          <p className="mt-4 text-sm font-semibold leading-relaxed text-slate-600">
            Hola, <span className="text-blue-600">{userProfile.full_name}</span>. Para garantizar la seguridad e integridad de la plataforma, un administrador debe validar tu perfil y darte de alta antes de que puedas comenzar a operar.
          </p>

          <div className="mt-8 rounded-lg bg-blue-50/50 p-4 text-left text-xs font-bold leading-5 text-slate-600 border border-blue-100/40">
            <p className="text-blue-700 mb-1">🔍 ¿Qué pasa ahora?</p>
            <p>1. Nuestro equipo de administración verificará tu registro en un plazo máximo de 24 horas.</p>
            <p>2. Se configurará tu entorno de trabajo según el rol seleccionado (<span className="capitalize">{userProfile.role}</span>).</p>
            <p>3. Una vez aprobada, al recargar esta página podrás acceder de inmediato.</p>
          </div>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Button
              onClick={() => window.location.reload()}
              className="flex h-11 items-center justify-center gap-2 rounded-md bg-blue-600 px-5 text-sm font-black text-white hover:bg-blue-700 transition"
            >
              Recargar Estado
            </Button>
            <Button
              onClick={handleLogout}
              disabled={loggingOut}
              variant="outline"
              className="flex h-11 items-center justify-center gap-2 rounded-md border-slate-200 bg-white px-5 text-sm font-black text-slate-700 hover:bg-slate-50 transition"
            >
              <LogOut className="h-4 w-4" />
              {loggingOut ? "Cerrando..." : "Cerrar sesión"}
            </Button>
          </div>
        </div>
        <p className="mt-8 text-xs font-semibold text-slate-400">Linkeo © 2026. Todos los derechos reservados.</p>
      </div>
    );
  }

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
        <div className="mt-6 border-t border-border/40 pt-4">
          <Button
            onClick={handleLogout}
            disabled={loggingOut}
            variant="ghost"
            className={cn(
              "w-full justify-start gap-3 px-3 py-2.5 text-sm font-black transition-all rounded-md",
              isAdmin
                ? "text-white/60 hover:bg-white/5 hover:text-white"
                : "text-slate-500 hover:bg-red-50 hover:text-red-600"
            )}
          >
            <LogOut className="h-5 w-5" />
            {loggingOut ? "Cerrando..." : "Cerrar sesión"}
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
              {mode === "dashboard" && (
                <Link
                  href="/dashboard/mis-productos"
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
              <Button
                variant="outline"
                size="icon"
                onClick={handleLogout}
                disabled={loggingOut}
                title="Cerrar sesión"
                className="text-slate-500 hover:bg-red-50 hover:text-red-600 hover:border-red-200"
              >
                <LogOut className="h-5 w-5" />
              </Button>
              <Link 
                href={mode === "admin" ? "/admin/usuarios" : (mode === "provider" ? "/provider/perfil" : "/dashboard/perfil")} 
                className="hidden items-center gap-3 pl-2 sm:flex"
              >
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
