"use client";

import { useEffect, useState } from "react";

import { cn } from "@/shared/lib/utils";

// Ilustración de una palabra, con degradación en cascada:
//
//   imagen web (si hay conexión y carga)  →  emoji  →  nada
//
// El EMOJI es el primario de verdad: funciona sin red, no pesa, no tiene
// riesgo de licencia y es instantáneo. La imagen es una mejora encima, no un
// requisito — coherente con que la app tenga que funcionar offline (Fase 6).
//
// La URL de la imagen se guarda en el contenido (versionada, con su licencia en
// `MediaAsset`), NO se resuelve en runtime: eso metería una llamada de red en
// la ruta crítica, que es justo lo que evitamos con el audio.

const SIZES = {
  sm: { box: "size-11", emoji: "text-[24px]" },
  md: { box: "size-16", emoji: "text-[34px]" },
  lg: { box: "size-24", emoji: "text-[52px]" },
} as const;

export function VocabImage({
  imageUrl,
  emoji,
  alt,
  size = "md",
  className,
}: {
  imageUrl?: string | null;
  emoji?: string | null;
  alt: string;
  size?: keyof typeof SIZES;
  className?: string;
}) {
  const [failed, setFailed] = useState(false);
  // `navigator.onLine` da falsos positivos (dice "sí" con una wifi sin salida),
  // así que NO se usa para decidir: solo evita pedir una imagen que seguro va a
  // fallar. Quien decide de verdad es el `onError`.
  const online = useOnline();

  const showImage = Boolean(imageUrl) && online && !failed;
  const dims = SIZES[size];

  if (!showImage && !emoji) return null;

  return (
    <span
      className={cn(
        "flex shrink-0 items-center justify-center overflow-hidden rounded-[10px] bg-[#F1E8DC]",
        dims.box,
        className,
      )}
    >
      {showImage ? (
        // Se usa <img> y no `next/image` a propósito: next/image exige declarar
        // cada dominio remoto por adelantado y no expone el fallo de carga, que
        // es justo el mecanismo del que depende el fallback a emoji. Optimizar
        // en servidor tampoco aporta: las imágenes son externas y esto corre en
        // local.
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={imageUrl ?? ""}
          alt={alt}
          loading="lazy"
          onError={() => setFailed(true)}
          className="size-full object-cover"
        />
      ) : (
        <span className={dims.emoji} role="img" aria-label={alt}>
          {emoji}
        </span>
      )}
    </span>
  );
}

// Estado de conexión. Arranca en `true` para que el render del servidor y el
// del cliente coincidan (en el servidor no hay `navigator`).
function useOnline(): boolean {
  const [online, setOnline] = useState(true);

  useEffect(() => {
    const update = () => setOnline(navigator.onLine);
    update();
    window.addEventListener("online", update);
    window.addEventListener("offline", update);
    return () => {
      window.removeEventListener("online", update);
      window.removeEventListener("offline", update);
    };
  }, []);

  return online;
}
