import { redirect } from "next/navigation";
import { Flame } from "lucide-react";

import { getCurrentUser } from "@/features/auth";
import { getProgressStats } from "@/features/progress";
import { getErrorGroups } from "@/features/review";
import { ProgressBar } from "@/shared/ui";

// Perfil y estadísticas (Fase 6). Composición no diseñada en SCREENS.md:
// sigue el sistema «Ánfora» pero no está aprobada (SCREENS.md §5).
export default async function ProfilePage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const [stats, groups] = await Promise.all([
    getProgressStats(user.id),
    getErrorGroups(user.id),
  ]);

  const lessonPct =
    stats.lessonsTotal > 0 ? (stats.lessonsCompleted / stats.lessonsTotal) * 100 : 0;

  return (
    <div className="mx-auto flex w-full max-w-md flex-col gap-5 px-[22px] pb-6 pt-[30px]">
      <header className="flex items-end justify-between border-b border-[var(--color-border-soft)] pb-3.5">
        <h1 className="font-display text-[36px] font-medium leading-none tracking-[-0.4px] text-[var(--color-text)]">
          Tu progreso
        </h1>
        <span className="inline-flex items-center gap-1.5">
          <Flame width={15} height={15} className="text-[var(--color-streak)]" aria-hidden />
          <span className="font-display text-[19px] font-medium tabular-nums text-[#8A5D18]">
            {stats.streak}
          </span>
        </span>
      </header>

      <section className="grid grid-cols-3 gap-2.5">
        <Stat value={String(stats.mastered)} label="dominadas" />
        <Stat value={String(stats.weak)} label="flojas" />
        <Stat
          value={stats.accuracy === null ? "—" : `${stats.accuracy}%`}
          label="aciertos"
        />
      </section>

      <section className="flex flex-col gap-2.5 rounded-card border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
        <div className="flex items-baseline justify-between">
          <span className="font-display text-[17px] text-[var(--color-text)]">
            Lecciones completadas
          </span>
          <span className="text-[14px] tabular-nums text-[var(--color-text-soft)]">
            {stats.lessonsCompleted} / {stats.lessonsTotal}
          </span>
        </div>
        <ProgressBar value={lessonPct} max={100} />
      </section>

      {stats.seen > 0 && (
        <p className="text-[13px] leading-relaxed text-[var(--color-text-soft)]">
          Has visto {stats.seen} palabras en los últimos 30 días y respondido{" "}
          {stats.answers} ejercicios.
        </p>
      )}

      {groups.length > 0 && (
        <section className="flex flex-col gap-3">
          <h2 className="text-[10px] font-semibold tracking-[1.4px] text-[var(--color-text-soft)]">
            TUS ERRORES MÁS FRECUENTES
          </h2>
          <div className="flex flex-col gap-2">
            {groups.slice(0, 5).map((group) => (
              <div
                key={group.tag}
                className="flex items-baseline justify-between rounded-card border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3"
              >
                <span className="text-[15px] text-[var(--color-text)]">{group.label}</span>
                <span className="font-display text-[17px] font-medium tabular-nums text-[var(--color-error)]">
                  {group.count}
                </span>
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="flex flex-col gap-1 rounded-card border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
        <span className="text-[13px] text-[var(--color-text-soft)]">Correo</span>
        <span className="text-[17px] font-semibold text-[var(--color-text)]">
          {user.email}
        </span>
      </section>
    </div>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div className="flex flex-col items-center gap-0.5 rounded-card border border-[var(--color-border)] bg-[var(--color-surface)] px-2 py-3.5">
      <span className="font-display text-[24px] font-medium tabular-nums text-[var(--color-text)]">
        {value}
      </span>
      <span className="text-[11px] text-[var(--color-text-soft)]">{label}</span>
    </div>
  );
}
