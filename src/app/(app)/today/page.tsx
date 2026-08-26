import Link from "next/link";
import { ArrowRight, Flame, RotateCcw } from "lucide-react";

import { getCurrentUser } from "@/features/auth";
import { getContinuation, getWordOfTheDay } from "@/features/catalog";
import { buttonVariants, GoalRing, ProgressBar } from "@/shared/ui";

function formatToday(): string {
  const text = new Date().toLocaleDateString("es-ES", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
  return text.charAt(0).toUpperCase() + text.slice(1);
}

export default async function TodayPage() {
  const [user, continuation, wordOfTheDay] = await Promise.all([
    getCurrentUser(),
    getContinuation(),
    getWordOfTheDay(),
  ]);

  const profile = user?.profile;
  const goal = profile?.dailyGoalMinutes ?? 15;

  return (
    <div className="mx-auto flex w-full max-w-md flex-col gap-5 px-[22px] pb-6 pt-[30px]">
      <header className="flex items-end justify-between border-b border-[var(--color-border-soft)] pb-3.5">
        <div className="flex flex-col gap-[1px]">
          <h1 className="font-display text-[36px] font-medium leading-none tracking-[-0.4px] text-[var(--color-text)]">
            Hoy
          </h1>
          <div className="text-[13px] tracking-[0.2px] text-[var(--color-text-soft)]">
            {formatToday()}
          </div>
        </div>
        <div className="inline-flex items-center gap-1.5">
          <Flame width={15} height={15} strokeWidth={2} className="text-[#9A6A1E]" />
          <span className="text-[13px] font-semibold tabular-nums text-[var(--color-streak)]">
            {profile?.streak ?? 0} días
          </span>
        </div>
      </header>

      <section className="flex items-center gap-5">
        <GoalRing current={0} target={goal} />
        <div className="flex flex-col gap-1.5">
          <h2 className="font-display text-[21px] font-medium text-[var(--color-text)]">
            Meta diaria
          </h2>
          <p className="text-[14px] leading-[1.45] text-[var(--color-text-soft)]">
            Te faltan {goal} minutos para cerrar el día.
          </p>
        </div>
      </section>

      {continuation ? (
        <section className="flex flex-col gap-3 rounded-card border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
          <div className="text-[10px] font-semibold tracking-[1.4px] text-[var(--color-primary-strong)]">
            MÓDULO {continuation.module.title.toUpperCase()}
          </div>
          <h3 className="font-display text-[24px] font-medium leading-[1.2] tracking-[-0.2px] text-[var(--color-text)]">
            {continuation.lesson.title}
          </h3>
          <div className="flex items-center gap-3">
            <ProgressBar value={0} max={continuation.lesson._count.exercises} className="flex-grow" />
            <span className="text-[12px] tabular-nums tracking-[0.4px] text-[var(--color-text-soft)]">
              {continuation.lesson._count.exercises} ejercicios
            </span>
          </div>
          <Link
            href={`/lesson/${continuation.lesson.id}`}
            className={buttonVariants({ variant: "primary", size: "lg", fullWidth: true })}
          >
            Continuar
            <ArrowRight width={17} height={17} strokeWidth={2.2} aria-hidden />
          </Link>
        </section>
      ) : (
        <section className="rounded-card border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
          <p className="text-[15px] text-[var(--color-text-soft)]">
            Aún no hay lecciones para continuar. Empieza por el curso.
          </p>
          <Link href="/course" className={buttonVariants({ variant: "primary", size: "lg", fullWidth: true })}>
            Ir al curso
          </Link>
        </section>
      )}

      <Link
        href="/review"
        className="flex items-center gap-3.5 border-b border-[var(--color-border-soft)] pb-4 text-[var(--color-text)]"
      >
        <RotateCcw width={21} height={21} strokeWidth={2} className="shrink-0 text-[var(--color-secondary)]" />
        <div className="flex flex-col gap-[1px] flex-grow">
          <span className="text-[15px] font-semibold">Repaso pendiente</span>
          <span className="text-[13px] text-[var(--color-text-soft)]">
            Sin repasos por hoy
          </span>
        </div>
        <ArrowRight width={17} height={17} strokeWidth={2.2} className="text-[#938677]" aria-hidden />
      </Link>

      {wordOfTheDay && (
        <div className="flex flex-col gap-1">
          <div className="text-[10px] font-semibold tracking-[1.4px] text-[var(--color-text-soft)]">
            PALABRA DEL DÍA
          </div>
          <div className="font-greek text-[33px] font-medium leading-[1.25] tracking-[-0.2px] text-[var(--color-text)]">
            {wordOfTheDay.term}
          </div>
          <div className="text-[14px] text-[var(--color-text-soft)]">
            {wordOfTheDay.transliteration} · {wordOfTheDay.translation}
          </div>
        </div>
      )}

      <div className="flex-grow" />
    </div>
  );
}
