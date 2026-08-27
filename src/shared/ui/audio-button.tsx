"use client";

import { useState } from "react";
import { Volume2 } from "lucide-react";

import { cn } from "@/shared/lib/utils";
import { playWord } from "@/shared/lib/sound";

// Reproduce un audio estático (Fase 3.5). Usa el controlador compartido
// (shared/lib/sound.ts): un único elemento <audio> persistente para evitar la
// restricción de autoplay por elemento (Fase 4.5).
export function AudioButton({
  src,
  size = "sm",
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
    playWord(src);
    window.setTimeout(() => setBusy(false), 1200);
  }

  const box =
    size === "lg" ? "size-12" : size === "md" ? "size-11" : "size-9";

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
