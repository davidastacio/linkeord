import Link from "next/link";
import { Menu } from "lucide-react";
import { AppLogo } from "@/components/app-logo";
import { Button } from "@/components/ui/button";

const navItems = [
  { label: "Inicio", href: "/" },
  { label: "Como funciona", href: "/#como-funciona" },
  { label: "Catalogo", href: "/dashboard" },
  { label: "Para emprendedores", href: "/dashboard" },
  { label: "Nosotros", href: "/#nosotros" },
  { label: "Contacto", href: "/#contacto" }
];

export function MarketingNavbar() {
  return (
    <header className="sticky top-0 z-40 border-b border-white/60 bg-white/85 backdrop-blur-xl">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <AppLogo />
        <nav className="hidden items-center gap-8 lg:flex" aria-label="Navegacion principal">
          {navItems.map((item, index) => (
            <Link
              key={item.label}
              href={item.href}
              className={
                index === 0
                  ? "text-sm font-bold text-primary"
                  : "text-sm font-semibold text-navy/80 hover:text-primary"
              }
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="hidden items-center gap-3 sm:flex">
          <Button asChild variant="outline">
            <Link href="/login">Iniciar sesión</Link>
          </Button>
          <Button asChild>
            <Link href="/register">Regístrate</Link>
          </Button>
        </div>
        <Button variant="outline" size="icon" className="lg:hidden" aria-label="Abrir menu">
          <Menu className="h-5 w-5" />
        </Button>
      </div>
    </header>
  );
}
