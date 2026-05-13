"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Lock, Mail, Package, Phone, Truck, User } from "lucide-react";
import { AuthShell } from "@/components/auth/auth-shell";
import { supabase } from "@/lib/supabase";

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    role: "emprendedor",
    acceptedTerms: false
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (formData.password !== formData.confirmPassword) {
      setError("Las contraseñas no coinciden.");
      setLoading(false);
      return;
    }

    if (!formData.acceptedTerms) {
      setError("Debes aceptar los Términos y Condiciones para continuar.");
      setLoading(false);
      return;
    }

    // Sign up with Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: formData.email,
      password: formData.password,
      options: {
        data: {
          full_name: formData.name,
          role: formData.role,
        }
      }
    });

    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }

    // Try to insert into profiles table (will need INSERT policy in Supabase)
    if (authData.user) {
      const { error: profileError } = await supabase.from("profiles").insert([
        {
          id: authData.user.id,
          email: formData.email,
          full_name: formData.name,
          role: formData.role,
        }
      ]);

      if (profileError) {
        console.error("Error creating profile:", profileError.message);
        // We'll log it but still redirect to dashboard for now
      }

      if (formData.role === "admin") {
        router.push("/admin");
      } else {
        router.push("/dashboard");
      }
    } else {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
        flowType: 'pkce',
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        },
      }
    });
    if (error) setError(error.message);
  };

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

        <form onSubmit={handleRegister} className="mt-7 grid gap-4">
          {error && (
            <div className="rounded-md bg-red-50 p-3 text-sm font-bold text-red-600">
              {error}
            </div>
          )}
          
          <label className="relative block">
            <span className="sr-only">Nombre completo</span>
            <User className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              name="name"
              placeholder="Nombre completo"
              value={formData.name}
              onChange={handleChange}
              required
              className="h-12 w-full rounded-md border border-slate-200 bg-white pl-12 pr-4 text-sm font-semibold text-slate-900 shadow-sm outline-none transition placeholder:text-slate-500 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
            />
          </label>

          <label className="relative block">
            <span className="sr-only">Correo electrónico</span>
            <Mail className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500" />
            <input
              type="email"
              name="email"
              placeholder="Correo electrónico"
              value={formData.email}
              onChange={handleChange}
              required
              className="h-12 w-full rounded-md border border-slate-200 bg-white pl-12 pr-4 text-sm font-semibold text-slate-900 shadow-sm outline-none transition placeholder:text-slate-500 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
            />
          </label>

          <label className="relative block">
            <span className="sr-only">Teléfono</span>
            <Phone className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500" />
            <input
              type="tel"
              name="phone"
              placeholder="Teléfono"
              value={formData.phone}
              onChange={handleChange}
              required
              className="h-12 w-full rounded-md border border-slate-200 bg-white pl-12 pr-4 text-sm font-semibold text-slate-900 shadow-sm outline-none transition placeholder:text-slate-500 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
            />
          </label>

          <label className="relative block">
            <span className="sr-only">Contraseña</span>
            <Lock className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500" />
            <input
              type="password"
              name="password"
              placeholder="Contraseña"
              value={formData.password}
              onChange={handleChange}
              required
              className="h-12 w-full rounded-md border border-slate-200 bg-white pl-12 pr-4 text-sm font-semibold text-slate-900 shadow-sm outline-none transition placeholder:text-slate-500 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
            />
          </label>

          <label className="relative block">
            <span className="sr-only">Confirmar contraseña</span>
            <Lock className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500" />
            <input
              type="password"
              name="confirmPassword"
              placeholder="Confirmar contraseña"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              className="h-12 w-full rounded-md border border-slate-200 bg-white pl-12 pr-4 text-sm font-semibold text-slate-900 shadow-sm outline-none transition placeholder:text-slate-500 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
            />
          </label>

          <div className="grid gap-3 pt-1">
            <p className="text-sm font-black text-slate-950">¿Cómo te identificarás en Linkeo?</p>
            <div className="grid gap-3 sm:grid-cols-2">
              <label className={`flex min-h-20 cursor-pointer items-center gap-4 rounded-md border px-4 py-3 shadow-sm transition ${formData.role === "emprendedor" ? "border-blue-500 bg-blue-50/70 ring-2 ring-blue-100" : "border-slate-200 bg-white hover:border-blue-300 hover:bg-blue-50/40"}`}>
                <input type="radio" name="role" value="emprendedor" checked={formData.role === "emprendedor"} onChange={handleChange} className="sr-only" />
                <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-md shadow-sm ${formData.role === "emprendedor" ? "bg-white text-blue-600" : "bg-slate-50 text-navy"}`}>
                  <Package className="h-6 w-6" />
                </span>
                <span>
                  <span className={`block text-sm font-black ${formData.role === "emprendedor" ? "text-blue-700" : "text-slate-950"}`}>Emprendedor</span>
                  <span className="block text-xs font-semibold leading-5 text-slate-600">
                    Vende productos y gestiona tu negocio
                  </span>
                </span>
              </label>

              <label className={`flex min-h-20 cursor-pointer items-center gap-4 rounded-md border px-4 py-3 shadow-sm transition ${formData.role === "delivery" ? "border-blue-500 bg-blue-50/70 ring-2 ring-blue-100" : "border-slate-200 bg-white hover:border-blue-300 hover:bg-blue-50/40"}`}>
                <input type="radio" name="role" value="delivery" checked={formData.role === "delivery"} onChange={handleChange} className="sr-only" />
                <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-md shadow-sm ${formData.role === "delivery" ? "bg-white text-blue-600" : "bg-slate-50 text-navy"}`}>
                  <Truck className="h-6 w-6" />
                </span>
                <span>
                  <span className={`block text-sm font-black ${formData.role === "delivery" ? "text-blue-700" : "text-slate-950"}`}>Delivery</span>
                  <span className="block text-xs font-semibold leading-5 text-slate-600">
                    Realiza entregas y gana comisiones
                  </span>
                </span>
              </label>
            </div>
          </div>

          <div className="flex items-start gap-3 pt-1 text-sm font-medium leading-6 text-slate-600">
            <button
              type="button"
              onClick={() => setFormData({ ...formData, acceptedTerms: !formData.acceptedTerms })}
              className={`mt-1 flex h-5 w-5 shrink-0 cursor-pointer items-center justify-center rounded border transition-colors ${
                formData.acceptedTerms ? 'bg-blue-600 border-blue-600 text-white' : 'border-slate-300 bg-white hover:border-blue-400'
              }`}
            >
              {formData.acceptedTerms && (
                <svg viewBox="0 0 14 14" fill="none" className="h-3.5 w-3.5">
                  <path d="M3 8L6 11L11 3.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            </button>
            <div className="cursor-pointer select-none" onClick={() => setFormData({ ...formData, acceptedTerms: !formData.acceptedTerms })}>
              Acepto los{" "}
              <a href="#" onClick={(e) => e.stopPropagation()} target="_blank" rel="noopener noreferrer" className="font-bold text-blue-600 hover:text-blue-700">
                Términos y Condiciones
              </a>{" "}
              y la{" "}
              <a href="#" onClick={(e) => e.stopPropagation()} target="_blank" rel="noopener noreferrer" className="font-bold text-blue-600 hover:text-blue-700">
                Política de Privacidad
              </a>
              .
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="mt-1 h-12 rounded-md bg-blue-600 px-5 text-sm font-black text-white shadow-[0_18px_35px_rgba(7,91,255,0.26)] transition hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-200 disabled:opacity-50"
          >
            {loading ? "Creando cuenta..." : "Crear cuenta"}
          </button>

          <div className="flex items-center gap-4 py-1 text-sm font-bold text-slate-500">
            <span className="h-px flex-1 bg-slate-200" />
            o regístrate con
            <span className="h-px flex-1 bg-slate-200" />
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <button
              type="button"
              onClick={handleGoogleLogin}
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
