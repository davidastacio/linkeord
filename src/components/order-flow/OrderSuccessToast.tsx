"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, Copy, ExternalLink, X } from "lucide-react";

type OrderSuccessToastProps = {
  orderId: string;
  productName: string;
  onClose: () => void;
};

export function OrderSuccessToast({ orderId, productName, onClose }: OrderSuccessToastProps) {
  const [copied, setCopied] = useState(false);
  const [visible, setVisible] = useState(false);
  const rawId = orderId.replace("#", "");
  const trackingUrl = `${typeof window !== "undefined" ? window.location.origin : ""}/track/${rawId}`;

  // Animate in
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 50);
    return () => clearTimeout(t);
  }, []);

  // Auto-close after 12s
  useEffect(() => {
    const t = setTimeout(() => handleClose(), 12000);
    return () => clearTimeout(t);
  }, []);

  const handleClose = () => {
    setVisible(false);
    setTimeout(onClose, 350);
  };

  const copyLink = () => {
    navigator.clipboard.writeText(trackingUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div
      className={`fixed bottom-6 right-6 z-[100] w-full max-w-sm rounded-2xl border border-emerald-200 bg-white shadow-2xl transition-all duration-350 ${
        visible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
      }`}
    >
      {/* Green top bar */}
      <div className="h-1.5 w-full rounded-t-2xl bg-gradient-to-r from-emerald-400 to-emerald-600" />

      <div className="p-5">
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-emerald-50 text-emerald-600">
              <CheckCircle2 className="h-5 w-5" />
            </div>
            <div>
              <p className="font-black text-navy">¡Pedido creado!</p>
              <p className="text-sm text-muted-foreground">{productName}</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="rounded-md p-1 text-muted-foreground hover:bg-secondary hover:text-navy"
            aria-label="Cerrar"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Order ID + tracking URL */}
        <div className="mt-4 rounded-xl border border-border bg-secondary/60 p-3">
          <p className="text-xs font-bold text-muted-foreground">Número de pedido</p>
          <p className="mt-0.5 text-lg font-black text-primary">{orderId}</p>
          <p className="mt-2 truncate text-xs text-muted-foreground">{trackingUrl}</p>
        </div>

        {/* Actions */}
        <div className="mt-4 grid grid-cols-2 gap-2">
          <button
            onClick={copyLink}
            className={`flex items-center justify-center gap-2 rounded-lg border py-2 text-sm font-black transition-colors ${
              copied
                ? "border-emerald-300 bg-emerald-50 text-emerald-700"
                : "border-border bg-white text-navy hover:bg-secondary"
            }`}
          >
            <Copy className="h-4 w-4" />
            {copied ? "¡Copiado!" : "Copiar link"}
          </button>
          <a
            href={`/track/${rawId}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 rounded-lg bg-primary py-2 text-sm font-black text-white hover:bg-primary/90"
          >
            <ExternalLink className="h-4 w-4" />
            Ver tracking
          </a>
        </div>
      </div>
    </div>
  );
}
