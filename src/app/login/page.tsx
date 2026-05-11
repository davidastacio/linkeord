"use client";

import Image from "next/image";
import Link from "next/link";
import { Eye, Lock, Mail } from "lucide-react";
import { AuthShell } from "@/components/auth/auth-shell";

export default function LoginPage() {
  return (
    <AuthShell
      headline={
        <>
          Bienvenido a <span className="text-blue-600">Linkeo</span>
        </>
      }
    >
      <div className="rounded-lg border border-white/80 bg-white/94 p-6 shadow-[0_26px_80px_rgba(8,26,58,0.12)] ring-1 ring-blue-100/80 backdrop-blur md:p-9">
        <div className="text-center">
          <span className="mx-auto grid h-24 w-24 place-items-center rounded-full bg-blue-50 shadow-sm">
            <Image src="/assets/linkeo-auth-logo.png" alt="Linkeo" width={120} height={80} className="h-auto w-16" />
          </span>
          <h2 className="mt-6 text-3xl font-black tracking-normal text-slate-950 sm:text-4xl">Inicia sesión</h2>
          <p className="mt-2 text-base font-semibold text-slate-600">Accede a tu cuenta de Linkeo</p>
        </div>

        <form className="mt-8 grid gap-4">
          <label className="relative block">
            <span className="sr-only">Correo electrónico</span>
            <Mail className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500" />
            <input
              type="email"
              placeholder="Correo electrónico"
              className="h-14 w-full rounded-md border border-slate-200 bg-white pl-12 pr-4 text-base font-semibold text-slate-900 shadow-sm outline-none transition placeholder:text-slate-500 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
            />
          </label>

          <label className="relative block">
            <span className="sr-only">Contraseña</span>
            <Lock className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500" />
            <input
              type="password"
              placeholder="Contraseña"
              className="h-14 w-full rounded-md border border-slate-200 bg-white pl-12 pr-12 text-base font-semibold text-slate-900 shadow-sm outline-none transition placeholder:text-slate-500 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
            />
            <Eye className="pointer-events-none absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500" />
          </label>

          <div className="flex flex-col gap-3 pt-1 text-sm font-semibold text-slate-600 sm:flex-row sm:items-center sm:justify-between">
            <label className="inline-flex items-center gap-3">
              <input type="checkbox" className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
              Recordarme
            </label>
            <Link href="/login" className="font-bold text-blue-600 hover:text-blue-700">
              ¿Olvidaste tu contraseña?
            </Link>
          </div>

          <button
            type="button"
            onClick={() => {
              window.location.href = "/dashboard";
            }}
            className="mt-3 h-14 rounded-md bg-blue-600 px-5 text-base font-black text-white shadow-[0_18px_35px_rgba(7,91,255,0.26)] transition hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-200"
          >
            Iniciar sesión
          </button>

          <div className="flex items-center gap-4 py-2 text-sm font-bold text-slate-500">
            <span className="h-px flex-1 bg-slate-200" />
            o continúa con
            <span className="h-px flex-1 bg-slate-200" />
          </div>

          <button
            type="button"
            className="flex h-12 items-center justify-center gap-3 rounded-md border border-slate-200 bg-white px-4 text-sm font-black text-slate-950 shadow-sm transition hover:bg-slate-50"
          >
            <span className="text-lg font-black text-blue-600">G</span>
            Continuar con Google
          </button>
          <button
            type="button"
            className="flex h-12 items-center justify-center gap-3 rounded-md border border-slate-200 bg-white px-4 text-sm font-black text-slate-950 shadow-sm transition hover:bg-slate-50"
          >
            <span className="text-xl leading-none text-black">●</span>
            Continuar con Apple
          </button>
        </form>

        <p className="mt-8 text-center text-sm font-semibold text-slate-600">
          ¿No tienes cuenta?{" "}
          <Link href="/register" className="font-black text-blue-600 hover:text-blue-700">
            Regístrate
          </Link>
        </p>
      </div>
    </AuthShell>
  );
}
