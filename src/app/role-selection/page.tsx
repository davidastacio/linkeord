import Link from "next/link";
import { ArrowRight, Package, ShieldCheck, Sparkles, Truck } from "lucide-react";

const roles = [
  {
    title: "Administrador",
    description: "Accede al panel administrativo de la plataforma demo.",
    href: "/admin",
    icon: ShieldCheck,
  },
  {
    title: "Emprendedor",
    description: "Gestiona productos, pedidos y ganancias.",
    href: "/dashboard",
    icon: Package,
  },
  {
    title: "Delivery",
    description: "Consulta entregas asignadas y comisiones.",
    href: "/delivery",
    icon: Truck,
  },
] as const;

export default function RoleSelectionPage() {
  return (
    <main className="min-h-screen bg-[linear-gradient(135deg,#ffffff_0%,#f8fbff_45%,#eaf4ff_100%)] px-5 py-10 text-navy">
      <section className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-5xl flex-col justify-center">
        <div className="text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-blue-100 px-5 py-2 text-sm font-black text-blue-700">
            <Sparkles className="h-4 w-4" />
            Pantalla demo
          </div>
          <h1 className="mt-5 text-4xl font-black text-slate-950 sm:text-5xl">Selector de roles</h1>
          <p className="mx-auto mt-4 max-w-2xl text-base font-medium leading-7 text-slate-600">
            Este acceso queda separado del flujo real de autenticación y se conserva solo para pruebas internas.
          </p>
        </div>

        <div className="mt-9 grid gap-4 md:grid-cols-3">
          {roles.map((role) => {
            const Icon = role.icon;

            return (
              <Link
                key={role.title}
                href={role.href}
                className="group rounded-lg border border-slate-200 bg-white p-6 shadow-[0_22px_60px_rgba(15,38,84,0.09)] transition hover:-translate-y-1 hover:border-blue-300 hover:shadow-[0_30px_80px_rgba(11,99,246,0.16)]"
              >
                <span className="grid h-14 w-14 place-items-center rounded-lg bg-blue-50 text-blue-600">
                  <Icon className="h-7 w-7" />
                </span>
                <h2 className="mt-5 text-xl font-black text-slate-950">{role.title}</h2>
                <p className="mt-3 min-h-14 text-sm font-medium leading-6 text-slate-600">{role.description}</p>
                <span className="mt-5 inline-flex items-center gap-2 text-sm font-black text-blue-600">
                  Acceder
                  <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
                </span>
              </Link>
            );
          })}
        </div>

        <div className="mt-8 text-center">
          <Link href="/login" className="text-sm font-black text-blue-600 hover:text-blue-700">
            Volver a iniciar sesión
          </Link>
        </div>
      </section>
    </main>
  );
}
