import Link from "next/link";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { FeatureCard } from "@/components/feature-card";
import { LandingHero } from "@/components/landing/landing-hero";
import { MarketingNavbar } from "@/components/marketing-navbar";
import { Button } from "@/components/ui/button";
import { landingFeatures, steps } from "@/lib/mock-data";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      <MarketingNavbar />
      <LandingHero />

      <main>
        <section className="relative z-10 mx-auto -mt-12 max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-lg border border-border bg-white p-4 shadow-premium">
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
              {landingFeatures.map((feature) => (
                <FeatureCard key={feature.title} {...feature} />
              ))}
            </div>
            <div className="mt-6 grid gap-4 border-t border-border pt-6 md:grid-cols-3">
              {[
                ["+500", "Emprendedores activos"],
                ["+10K", "Pedidos entregados"],
                ["98%", "Clientes satisfechos"]
              ].map(([value, label]) => (
                <div key={label} className="px-5 py-2">
                  <p className="text-4xl font-black text-primary">{value}</p>
                  <p className="mt-2 max-w-32 text-base font-extrabold text-navy">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="como-funciona" className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
            <div>
              <h2 className="text-center text-3xl font-black text-navy">Como funciona?</h2>
              <div className="mt-10 grid gap-5 md:grid-cols-5">
                {steps.map((step, index) => {
                  const Icon = step.icon;

                  return (
                    <div key={step.title} className="relative rounded-lg bg-white p-4">
                      <div className="grid h-14 w-14 place-items-center rounded-full bg-secondary text-primary">
                        <Icon className="h-6 w-6" aria-hidden="true" />
                      </div>
                      <h3 className="mt-5 text-sm font-black text-navy">
                        {index + 1}. {step.title}
                      </h3>
                      <p className="mt-2 text-sm leading-6 text-muted-foreground">{step.description}</p>
                    </div>
                  );
                })}
              </div>
            </div>

            <aside className="navy-panel flex min-h-64 flex-col justify-between rounded-lg p-7 text-white">
              <div>
                <h2 className="text-2xl font-black leading-tight">Listo para empezar a emprender?</h2>
                <p className="mt-4 leading-7 text-white/85">
                  Unete a Linkeo y lleva tu negocio al siguiente nivel.
                </p>
              </div>
              <Button asChild variant="outline" className="mt-8 bg-white text-primary hover:bg-blue-50">
                <Link href="/register">
                  Crear mi cuenta
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </aside>
          </div>
        </section>

        <section id="nosotros" className="border-y border-border bg-[#f6f9ff]">
          <div className="mx-auto grid max-w-7xl gap-8 px-4 py-16 sm:px-6 lg:grid-cols-3 lg:px-8">
            {["Sin inventario", "Operacion completa", "Ganancias claras"].map((title) => (
              <div key={title} className="flex gap-4">
                <CheckCircle2 className="mt-1 h-6 w-6 shrink-0 text-primary" aria-hidden="true" />
                <div>
                  <h3 className="text-lg font-black text-navy">{title}</h3>
                  <p className="mt-2 leading-7 text-muted-foreground">
                    Linkeo centraliza catalogo, entrega y cobro para que cada emprendedor pueda vender con menos friccion.
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      <footer id="contacto" className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-8 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
        <p>Linkeo. Plataforma demo para vender sin inventario.</p>
        <Link href="/admin" className="font-bold text-primary">
          Entrar al panel administrativo
        </Link>
      </footer>
    </div>
  );
}
