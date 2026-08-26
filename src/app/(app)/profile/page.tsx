import { getCurrentUser } from "@/features/auth";

export default async function ProfilePage() {
  const user = await getCurrentUser();

  return (
    <div className="mx-auto flex w-full max-w-md flex-col gap-5 px-[22px] pb-6 pt-[30px]">
      <header className="border-b border-[var(--color-border-soft)] pb-3.5">
        <h1 className="font-display text-[36px] font-medium leading-none tracking-[-0.4px] text-[var(--color-text)]">
          Perfil
        </h1>
      </header>
      <div className="rounded-card border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
        <div className="flex flex-col gap-1">
          <span className="text-[13px] text-[var(--color-text-soft)]">Correo</span>
          <span className="text-[17px] font-semibold text-[var(--color-text)]">
            {user?.email}
          </span>
        </div>
        <p className="mt-4 text-[15px] leading-relaxed text-[var(--color-text)]">
          Racha, estadísticas y errores recurrentes (tu{" "}
          <em>LearnerSnapshot</em>) llegan en la <strong>Fase 6</strong>.
        </p>
      </div>
    </div>
  );
}
