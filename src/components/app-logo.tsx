import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";

type AppLogoProps = {
  className?: string;
  markOnly?: boolean;
};

export function AppLogo({ className, markOnly = false }: AppLogoProps) {
  return (
    <Link
      href="/"
      className={cn("relative block shrink-0", markOnly ? "h-12 w-12" : "h-16 w-28 sm:w-32", className)}
      aria-label="Linkeo"
    >
      <Image
        src="/assets/linkeo-logo.png"
        alt="Linkeo"
        fill
        priority
        className="object-contain object-left"
        sizes={markOnly ? "48px" : "128px"}
      />
    </Link>
  );
}
