"use client";

import { useActionState, useState } from "react";

import { saveOnboarding } from "@/features/auth/actions";
import { cn } from "@/shared/lib/utils";

const GOAL_PRESETS = [5, 10, 15, 20, 30];

export default function OnboardingPage() {
  const [state, formAction, isPending] = useActionState(saveOnboarding, {});
  const [goal, setGoal] = useState(15);

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md flex-col justify-center px-[22px] py-10">
      <div className="w-full">
        <header className="mb-8 text-center">
          <h1 className="font-display text-[34px] font-medium tracking-[-0.4px] text-[var(--color-text)]">
            Tu meta diaria
          </h1>
          <p className="mt-2 text-[15px] leading-relaxed text-[var(--color-text-soft)]">
            ¿Cuántos minutos al día quieres dedicar al griego? Puedes cambiarlo
            después en Perfil.
          </p>
        </header>

        <form
          action={formAction}
          className="flex flex-col gap-5 rounded-card border border-[var(--color-border)] bg-[var(--color-surface)] p-6"
        >
          <div className="flex flex-col gap-2">
            <span className="text-[13px] font-semibold text-[var(--color-text)]">
              Minutos por día
            </span>
            <div className="grid grid-cols-5 gap-2">
              {GOAL_PRESETS.map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setGoal(value)}
                  className={cn(
                    "flex min-h-11 items-center justify-center rounded-button border text-[14px] font-semibold transition-colors",
                    goal === value
                      ? "border-[var(--color-primary)] bg-[var(--color-primary)] text-white"
                      : "border-[var(--color-border)] bg-[var(--color-background)] text-[var(--color-text)] hover:border-[var(--color-primary)]",
                  )}
                >
                  {value}
                </button>
              ))}
            </div>
            <input
              type="number"
              name="dailyGoal"
              min={5}
              max={120}
              value={goal}
              onChange={(e) => setGoal(Number(e.target.value))}
              className="h-12 w-full rounded-button border border-[var(--color-border)] bg-[var(--color-background)] px-4 text-[16px] text-[var(--color-text)] outline-none focus:border-[var(--color-primary)]"
            />
          </div>

          {state.error && (
            <p className="text-[14px] text-[var(--color-error)]">{state.error}</p>
          )}

          <button
            type="submit"
            disabled={isPending}
            className="flex min-h-14 w-full items-center justify-center rounded-button bg-[var(--color-primary)] text-[16px] font-semibold text-white transition-colors hover:bg-[var(--color-primary-strong)] disabled:opacity-50"
          >
            {isPending ? "Guardando…" : "Empezar"}
          </button>
        </form>
      </div>
    </main>
  );
}
