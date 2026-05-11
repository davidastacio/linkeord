"use client";

import Image from "next/image";
import Link from "next/link";
import { BarChart3, Headphones, HelpCircle, Rocket, ShoppingBag, Truck } from "lucide-react";

const benefits = [
  {
    title: "Catálogo rentable",
    description: "Miles de productos listos para vender con márgenes competitivos.",
    icon: ShoppingBag,
  },
  {
    title: "Entregas y tracking",
    description: "Nos encargamos del envío y el seguimiento hasta la puerta de tus clientes.",
    icon: Truck,
  },
  {
    title: "Ganancias claras",
    description: "Panel intuitivo con reportes y métricas en tiempo real.",
    icon: BarChart3,
  },
  {
    title: "Soporte 24/7",
    description: "Nuestro equipo está disponible para ayudarte siempre que lo necesites.",
    icon: Headphones,
  },
] as const;

type AuthShellProps = {
  children: React.ReactNode;
  headline: React.ReactNode;
};

export function AuthShell({ children, headline }: AuthShellProps) {
  return (
    <main className="min-h-screen overflow-hidden bg-[radial-gradient(circle_at_13%_8%,rgba(219,234,254,0.9),transparent_29%),radial-gradient(circle_at_88%_18%,rgba(191,219,254,0.72),transparent_28%),linear-gradient(135deg,#ffffff_0%,#f8fbff_45%,#eaf4ff_100%)] px-5 py-6 text-navy sm:px-8 lg:px-12">
      <div className="relative mx-auto flex min-h-[calc(100vh-3rem)] w-full max-w-7xl flex-col">
        <header className="relative z-20 flex items-start justify-between gap-4">
          <Link href="/" aria-label="Linkeo" className="inline-flex">
            <Image
              src="/assets/linkeo-auth-logo.png"
              alt="Linkeo"
              width={300}
              height={120}
              priority
              className="h-auto w-40 object-contain sm:w-52"
            />
          </Link>

          <Link
            href="mailto:soporte@linkeo.com"
            className="inline-flex items-center gap-2 rounded-full px-2 py-1 text-sm font-extrabold text-blue-700 transition hover:text-blue-800"
          >
            <HelpCircle className="h-5 w-5 text-navy" />
            <span className="hidden sm:inline">¿Necesitas ayuda?</span>
          </Link>
        </header>

        <section className="relative z-10 grid flex-1 items-center gap-10 py-8 lg:grid-cols-[1.08fr_0.92fr] lg:gap-12 xl:gap-16">
          <div className="relative order-2 grid gap-7 lg:order-1 lg:min-h-[680px] lg:grid-cols-[0.84fr_1fr] lg:items-center">
            <div className="relative z-10 max-w-xl lg:self-start lg:pt-10">
              <div className="inline-flex items-center gap-2 rounded-full bg-blue-100/90 px-5 py-2 text-sm font-black text-blue-700 shadow-sm ring-1 ring-blue-200/80">
                <Rocket className="h-4 w-4" />
                Plataforma de dropshipping social
              </div>

              <h1 className="mt-6 max-w-xl text-5xl font-black leading-[0.96] tracking-normal text-slate-950 sm:text-6xl">
                {headline}
              </h1>

              <p className="mt-6 max-w-lg text-base font-medium leading-7 text-slate-600 sm:text-lg">
                Vende productos sin inventario. Tú te enfocas en hacer crecer tu negocio, nosotros nos encargamos de la
                logística y las entregas.
              </p>

              <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
                {benefits.map((benefit) => {
                  const Icon = benefit.icon;

                  return (
                    <div key={benefit.title} className="flex items-start gap-4">
                      <span className="grid h-12 w-12 shrink-0 place-items-center rounded-lg bg-white text-blue-600 shadow-[0_16px_36px_rgba(8,26,58,0.09)] ring-1 ring-blue-100">
                        <Icon className="h-6 w-6" />
                      </span>
                      <span>
                        <span className="block text-base font-black text-slate-950">{benefit.title}</span>
                        <span className="mt-1 block text-sm font-medium leading-6 text-slate-600">
                          {benefit.description}
                        </span>
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="relative mx-auto w-full max-w-[500px] lg:absolute lg:bottom-0 lg:left-[42%] lg:max-w-[600px] xl:left-[38%]">
              <div className="pointer-events-none absolute left-8 top-24 hidden h-64 w-64 rounded-full bg-blue-100/80 lg:block" />
              <div className="pointer-events-none absolute right-2 top-10 hidden h-44 w-44 bg-[radial-gradient(circle,#bfdbfe_1.3px,transparent_1.3px)] [background-size:18px_18px] opacity-70 lg:block" />
              <Image
                src="/assets/linkeo-auth-phone-box.png"
                alt="Vista de Linkeo con celular, caja y estadísticas"
                width={1448}
                height={1086}
                priority
                className="relative z-10 h-auto w-full object-contain drop-shadow-[0_30px_55px_rgba(8,26,58,0.16)]"
              />
            </div>
          </div>

          <div className="order-1 mx-auto w-full max-w-[560px] lg:order-2">{children}</div>
        </section>
      </div>
    </main>
  );
}
