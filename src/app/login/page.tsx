"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, Lock, Mail } from "lucide-react";
import { AuthShell } from "@/components/auth/auth-shell";
import { auth, db } from "@/lib/firebase";
import {
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
} from "firebase/auth";
import { doc, getDoc, collection, query, where, getDocs, setDoc } from "firebase/firestore";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const redirectByRole = (role: string) => {
    if (role === "admin") router.push("/admin");
    else if (role === "proveedor") router.push("/provider");
    else if (role === "delivery") router.push("/delivery");
    else router.push("/dashboard");
  };

  const getRoleForUser = async (user: any): Promise<string> => {
    // 1. Try to fetch profile directly by UID
    const profileSnap = await getDoc(doc(db, "usuarios", user.uid));
    if (profileSnap.exists()) {
      return profileSnap.data().role || "emprendedor";
    }

    // 2. Fallback: Search by email in case profile was created with a different key/id
    if (user.email) {
      const q = query(collection(db, "usuarios"), where("email", "==", user.email));
      const querySnap = await getDocs(q);
      if (!querySnap.empty) {
        const foundDoc = querySnap.docs[0];
        const data = foundDoc.data();
        const role = data.role || "emprendedor";
        // Self-heal: link UID to the profile data
        try {
          await setDoc(doc(db, "usuarios", user.uid), {
            ...data,
            email: user.email,
          });
        } catch (e) {
          console.warn("Failed to auto-heal profile document:", e);
        }
        return role;
      }
    }

    return "emprendedor";
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { user } = await signInWithEmailAndPassword(auth, email, password);
      const role = await getRoleForUser(user);
      redirectByRole(role);
    } catch {
      setError("Correo o contraseña incorrectos");
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const { user } = await signInWithPopup(auth, provider);
      const role = await getRoleForUser(user);
      redirectByRole(role);
    } catch (err: any) {
      setError(err.message);
    }
  };


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

        <form onSubmit={handleLogin} className="mt-8 grid gap-4">
          {error && (
            <div className="rounded-md bg-red-50 p-3 text-sm font-bold text-red-600">
              {error}
            </div>
          )}
          <label className="relative block">
            <span className="sr-only">Correo electrónico</span>
            <Mail className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500" />
            <input
              type="email"
              placeholder="Correo electrónico"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="h-14 w-full rounded-md border border-slate-200 bg-white pl-12 pr-4 text-base font-semibold text-slate-900 shadow-sm outline-none transition placeholder:text-slate-500 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
            />
          </label>

          <label className="relative block">
            <span className="sr-only">Contraseña</span>
            <Lock className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500" />
            <input
              type="password"
              placeholder="Contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
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
            type="submit"
            disabled={loading}
            className="mt-3 h-14 rounded-md bg-blue-600 px-5 text-base font-black text-white shadow-[0_18px_35px_rgba(7,91,255,0.26)] transition hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-200 disabled:opacity-50"
          >
            {loading ? "Iniciando..." : "Iniciar sesión"}
          </button>

          <div className="flex items-center gap-4 py-2 text-sm font-bold text-slate-500">
            <span className="h-px flex-1 bg-slate-200" />
            o continúa con
            <span className="h-px flex-1 bg-slate-200" />
          </div>

          <button
            type="button"
            onClick={handleGoogleLogin}
            className="flex h-12 items-center justify-center gap-3 rounded-md border border-slate-200 bg-white px-4 text-sm font-black text-slate-950 shadow-sm transition hover:bg-slate-50"
          >
            <span className="text-lg font-black text-blue-600">G</span>
            Continuar con Google
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
