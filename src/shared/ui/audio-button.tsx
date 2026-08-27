"use client";

import { useState } from "react";
import { Volume2 } from "lucide-react";

import { cn } from "@/shared/lib/utils";

// Reproduce un archivo de audio estático (Fase 3.5). Sin llamadas de red: es
// contenido servido desde /audio/el/. Diseño tipo mockup AnforaLeccion (círculo
// con borde, icono de altavoz).
export function AudioButton({
  src,
  size = "md",
  className,
}: {
  src: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const [busy, setBusy] = useState(false);

  function play() {
    if (busy || !src) return;
    setBusy(true);
    const audio = new Audio(src);
    audio.onended = () => setBusy(false);
    audio.onerror = () => setBusy(false);
    void audio.play().catch(() => setBusy(false));
    window.setTimeout(() => setBusy(false), 4000);
  }

  const box =
    size === "lg" ? "size-12" : size === "sm" ? "size-9" : "size-11";

  const icon = size === "sm" ? 17 : 20;

  return (
    <button
      type="button"
      onClick={play}
      aria-label="Escuchar la pronunciación"
      disabled={!src}
      className={cn(
        box,
        "inline-flex shrink-0 items-center justify-center rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-primary)] transition-colors hover:bg-[var(--color-border-soft)] disabled:opacity-40",
        className,
      )}
    >
      <Volume2 width={icon} height={icon} strokeWidth={2} aria-hidden />
    </button>
  );
}
