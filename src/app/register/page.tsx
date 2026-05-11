"use client";

import Link from "next/link";
import { Lock, Mail, Package, Phone, Truck, User } from "lucide-react";
import { AuthShell } from "@/components/auth/auth-shell";

const fields = [
  { label: "Nombre completo", type: "text", icon: User },
  { label: "Correo electrónico", type: "email", icon: Mail },
  { label: "Teléfono", type: "tel", icon: Phone },
  { label: "Contraseña", type: "password", icon: Lock },
  { label: "Confirmar contraseña", type: "password", icon: Lock },
] as const;

export default function RegisterPage() {
  return (
    <AuthShell
      headline={
        <>
          Crea tu cuenta en <span className="text-blue-600">Linkeo</span>
        </>
      }
    >
      <div className="rounded-lg border border-white/80 bg-white/94 p-5 shadow-[0_26px_80px_rgba(8,26,58,0.12)] ring-1 ring-blue-100/80 backdrop-blur md:p-8">
        <div className="text-center">
          <h2 className="text-3xl font-black tracking-normal text-slate-950 sm:text-4xl">Regístrate</h2>
          <p className="mt-2 text-base font-semibold text-slate-600">Empieza en minutos.</p>
        </div>

        <form className="mt-7 grid gap-4">
          {fields.map((field) => {
            const Icon = field.icon;

            return (
              <label key={field.label} className="relative block">
                <span className="sr-only">{field.label}</span>
                <Icon className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500" />
                <input
                  type={field.type}
                  placeholder={field.label}
                  className="h-12 w-full rounded-md border border-slate-200 bg-white pl-12 pr-4 text-sm font-semibold text-slate-900 shadow-sm outline-none transition placeholder:text-slate-500 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                />
              </label>
            );
          })}

          <div className="grid gap-3 pt-1">
            <p className="text-sm font-black text-slate-950">¿Cómo te identificarás en Linkeo?</p>
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="flex min-h-20 cursor-pointer items-center gap-4 rounded-md border border-blue-500 bg-blue-50/70 px-4 py-3 shadow-sm ring-2 ring-blue-100">
                <input type="radio" name="role" value="entrepreneur" defaultChecked className="sr-only" />
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-md bg-white text-blue-600 shadow-sm">
                  <Package className="h-6 w-6" />
                </span>
                <span>
                  <span className="block text-sm font-black text-blue-700">Emprendedor</span>
                  <span className="block text-xs font-semibold leading-5 text-slate-600">
                    Vende productos y gestiona tu negocio
                  </span>
                </span>
              </label>

              <label className="flex min-h-20 cursor-pointer items-center gap-4 rounded-md border border-slate-200 bg-white px-4 py-3 shadow-sm transition hover:border-blue-300 hover:bg-blue-50/40">
                <input type="radio" name="role" value="delivery" className="sr-only" />
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-md bg-slate-50 text-navy shadow-sm">
                  <Truck className="h-6 w-6" />
                </span>
                <span>
                  <span className="block text-sm font-black text-slate-950">Delivery</span>
                  <span className="block text-xs font-semibold leading-5 text-slate-600">
                    Realiza entregas y gana comisiones
                  </span>
                </span>
              </label>
            </div>
          </div>

          <label className="flex items-start gap-3 pt-1 text-sm font-medium leading-6 text-slate-600">
            <input type="checkbox" className="mt-1 h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
            <span>
              Acepto los{" "}
              <Link href="/register" className="font-bold text-blue-600 hover:text-blue-700">
                Términos y Condiciones
              </Link>{" "}
              y la{" "}
              <Link href="/register" className="font-bold text-blue-600 hover:text-blue-700">
                Política de Privacidad
              </Link>
              .
            </span>
          </label>

          <button
            type="button"
            className="mt-1 h-12 rounded-md bg-blue-600 px-5 text-sm font-black text-white shadow-[0_18px_35px_rgba(7,91,255,0.26)] transition hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-200"
          >
            Crear cuenta
          </button>

          <div className="flex items-center gap-4 py-1 text-sm font-bold text-slate-500">
            <span className="h-px flex-1 bg-slate-200" />
            o regístrate con
            <span className="h-px flex-1 bg-slate-200" />
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <button
              type="button"
              className="flex h-11 items-center justify-center gap-3 rounded-md border border-slate-200 bg-white px-4 text-sm font-black text-slate-950 shadow-sm transition hover:bg-slate-50"
            >
              <span className="text-lg font-black text-blue-600">G</span>
              Continuar con Google
            </button>
            <button
              type="button"
              className="flex h-11 items-center justify-center gap-3 rounded-md border border-slate-200 bg-white px-4 text-sm font-black text-slate-950 shadow-sm transition hover:bg-slate-50"
            >
              <span className="text-xl leading-none text-black">●</span>
              Continuar con Apple
            </button>
          </div>
        </form>

        <p className="mt-6 text-center text-sm font-semibold text-slate-600">
          ¿Ya tienes cuenta?{" "}
          <Link href="/login" className="font-black text-blue-600 hover:text-blue-700">
            Iniciar sesión
          </Link>
        </p>
      </div>
    </AuthShell>
  );
}
