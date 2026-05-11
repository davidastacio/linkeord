"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, CheckCircle2, ShoppingBag, Sparkles, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";

export function LandingHero() {
  return (
    <section className="premium-surface relative overflow-hidden">
      <div className="mx-auto grid min-h-[680px] max-w-7xl items-center gap-10 px-4 py-10 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:px-8">
        <motion.div
          initial={{ opacity: 1, y: 0 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="relative z-10 max-w-2xl"
        >
          <div className="inline-flex items-center gap-2 rounded-md bg-blue-50 px-4 py-2 text-xs font-black uppercase text-primary shadow-sm">
            <Sparkles className="h-4 w-4" aria-hidden="true" />
            Plataforma #1 para emprendedores
          </div>
          <h1 className="mt-7 text-5xl font-black leading-[1.02] text-navy sm:text-6xl lg:text-7xl">
            Vende mas. Nosotros nos encargamos del <span className="text-primary">resto.</span>
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-8 text-slate-600">
            Ofrecemos productos de alta demanda, logistica confiable y entregas rapidas para que tu solo te enfoques en vender.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button asChild size="lg">
              <Link href="/register">
                Quiero vender
                <UserPlus className="h-5 w-5" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/dashboard#catalogo">
                Ver catalogo
                <ShoppingBag className="h-5 w-5" />
              </Link>
            </Button>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 1, scale: 1 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.75, delay: 0.1, ease: "easeOut" }}
          className="relative min-h-[420px]"
        >
          <div className="absolute inset-0 rounded-[36px] bg-blue-200/40 blur-3xl" />
          <Image
            src="/assets/linkeo-hero-phone-box.png"
            alt="Vista de referencia visual de Linkeo con aplicacion movil y caja de entrega"
            fill
            priority
            className="object-contain object-center drop-shadow-2xl"
            sizes="(max-width: 1024px) 100vw, 56vw"
          />
          <div className="absolute right-2 top-10 hidden rounded-lg bg-white p-4 shadow-premium sm:block">
            <div className="flex items-center gap-3">
              <span className="grid h-10 w-10 place-items-center rounded-full bg-emerald-50 text-emerald-600">
                <CheckCircle2 className="h-6 w-6" aria-hidden="true" />
              </span>
              <div>
                <p className="text-sm font-black text-navy">Entrega exitosa</p>
                <p className="text-xs font-semibold text-muted-foreground">Pedido #4587</p>
              </div>
            </div>
          </div>
          <div className="absolute bottom-8 left-4 hidden rounded-lg bg-white p-4 shadow-premium sm:block">
            <Button size="sm">
              Comparte tu link
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
