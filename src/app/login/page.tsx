"use client";

import { useActionState } from "react";

import { signIn } from "@/features/auth/actions";

export default function LoginPage() {
  const [state, formAction, isPending] = useActionState(signIn, {});

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md flex-col items-center justify-center px-[22px] py-10">
      <div className="w-full">
        <header className="mb-8 text-center">
          <h1 className="font-display text-[34px] font-medium tracking-[-0.4px] text-[var(--color-text)]">
            Griego App
          </h1>
          <p className="mt-1 text-[15px] text-[var(--color-text-soft)]">
            Καλημέρα · Bienvenido de nuevo
          </p>
        </header>

        <form
          action={formAction}
          className="flex flex-col gap-4 rounded-card border border-[var(--color-border)] bg-[var(--color-surface)] p-6"
        >
          <label className="flex flex-col gap-1.5">
            <span className="text-[13px] font-semibold text-[var(--color-text)]">
              Usuario o correo
            </span>
            <input
              name="email"
              type="text"
              autoComplete="username"
              required
              className="h-12 rounded-button border border-[var(--color-border)] bg-[var(--color-background)] px-4 text-[16px] text-[var(--color-text)] outline-none focus:border-[var(--color-primary)]"
            />
          </label>

          <label className="flex flex-col gap-1.5">
            <span className="text-[13px] font-semibold text-[var(--color-text)]">
              Contraseña
            </span>
            <input
              name="password"
              type="password"
              autoComplete="current-password"
              required
              className="h-12 rounded-button border border-[var(--color-border)] bg-[var(--color-background)] px-4 text-[16px] text-[var(--color-text)] outline-none focus:border-[var(--color-primary)]"
            />
          </label>

          {state.error && (
            <p className="text-[14px] text-[var(--color-error)]">{state.error}</p>
          )}

          <button
            type="submit"
            disabled={isPending}
            className="mt-1 flex min-h-14 w-full items-center justify-center rounded-button bg-[var(--color-primary)] text-[16px] font-semibold text-white transition-colors hover:bg-[var(--color-primary-strong)] disabled:opacity-50"
          >
            {isPending ? "Entrando…" : "Entrar"}
          </button>

          <p className="text-[13px] leading-relaxed text-[var(--color-text-soft)]">
            Para pruebas: <code className="font-semibold">user</code> /{" "}
            <code className="font-semibold">1234</code>. (Cuenta demo temporal —
            se quita cuando exista registro.)
          </p>
        </form>
      </div>
    </main>
  );
}
