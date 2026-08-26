import { cn } from "@/shared/lib/utils";

// Barra de progreso del sistema «Ánfora» (mockups AnforaHoy/AnforaLeccion).
// Usa tokens existentes para la pista y el relleno (regla: nada de grises
// inventados, SCREENS.md §4.3).
export function ProgressBar({
  value,
  max,
  className,
}: {
  value: number;
  max: number;
  className?: string;
}) {
  const pct = max > 0 ? Math.min(100, (value / max) * 100) : 0;
  return (
    <div
      className={cn(
        "h-1 w-full overflow-hidden rounded-full bg-[var(--color-border-soft)]",
        className,
      )}
    >
      <div
        className="h-full rounded-full bg-[var(--color-primary)]"
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}
