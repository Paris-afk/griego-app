"use client";

import { useState } from "react";

import { accentCharacter, backspace, isVowel } from "@/shared/lib/greek";
import { cn } from "@/shared/lib/utils";

// Teclado griego en pantalla (SCREENS.md §3.4). Layout ΕΡΤΥΘΙΟΠ / ΑΣΔΦΓΗΞΚΛ /
// ΖΧΨΩΒΝΜ. La tecla de acento (´) es una TECLA MUERTA: acentúa la siguiente
// vocal (las consonantes se insertan sin cambio). La sigma final (ς) va siempre
// a la vista. Las teclas muestran la mayúscula pero insertan la minúscula.
// La lógica (acento/backspace) vive en shared/lib/greek.ts (sin JSX).

const ROWS = [
  ["Ε", "Ρ", "Τ", "Υ", "Θ", "Ι", "Ο", "Π"],
  ["Α", "Σ", "Δ", "Φ", "Γ", "Η", "Ξ", "Κ", "Λ"],
  ["Ζ", "Χ", "Ψ", "Ω", "Β", "Ν", "Μ"],
] as const;

function Key({
  label,
  onPress,
  variant = "alpha",
  wide = false,
  disabled,
}: {
  label: string;
  onPress: () => void;
  variant?: "alpha" | "toggle";
  wide?: boolean;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      tabIndex={-1}
      disabled={disabled}
      onClick={onPress}
      className={cn(
        "flex min-h-[46px] items-center justify-center rounded-[10px] border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text)] select-none transition-colors active:bg-[var(--color-border-soft)] disabled:opacity-40",
        wide ? "flex-[2]" : "flex-1",
        variant === "alpha"
          ? "font-greek text-[20px] font-medium"
          : "text-[20px] font-semibold text-[var(--color-primary-strong)]",
      )}
    >
      {label}
    </button>
  );
}

export function GreekKeyboard({
  value,
  onChange,
  placeholder = "Escribe aquí…",
  disabled,
  className,
  hideInput = false,
}: {
  value: string;
  onChange: (next: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  /**
   * Oculta el campo propio del teclado. Lo usa `autocomplete`, donde la palabra
   * con huecos ya es el campo: dos campos a la vez confundirían.
   */
  hideInput?: boolean;
}) {
  const [pendingAccent, setPendingAccent] = useState(false);

  function typeCharacter(ch: string) {
    if (pendingAccent) {
      onChange(value + (isVowel(ch) ? accentCharacter(ch) : ch));
      setPendingAccent(false);
    } else {
      onChange(value + ch);
    }
  }

  return (
    <div className={cn("flex flex-col gap-2.5", className)}>
      {!hideInput && (
        <label className="flex min-h-[56px] w-full items-center justify-center rounded-[10px] border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3 text-center font-greek text-[24px] text-[var(--color-text)]">
          {value || (
            <span className="font-ui text-[15px] font-normal text-[var(--color-text-soft)]">
              {placeholder}
            </span>
          )}
        </label>
      )}

      <div className="flex flex-col gap-1.5">
        {ROWS.map((row, i) => (
          <div key={i} className="flex gap-1.5">
            {row.map((letter) => (
              <Key
                key={letter}
                label={letter}
                disabled={disabled}
                onPress={() => typeCharacter(letter.toLowerCase())}
              />
            ))}
          </div>
        ))}
        <div className="flex gap-1.5">
          <Key
            label={pendingAccent ? "´·" : "´"}
            variant="toggle"
            onPress={() => setPendingAccent((p) => !p)}
            disabled={disabled}
          />
          <Key label="ς" variant="toggle" onPress={() => onChange(value + "ς")} disabled={disabled} />
          <Key label="espacio" variant="toggle" wide onPress={() => onChange(value + " ")} disabled={disabled} />
          <Key label="⌫" variant="toggle" onPress={() => onChange(backspace(value))} disabled={disabled} />
        </div>
      </div>
    </div>
  );
}
