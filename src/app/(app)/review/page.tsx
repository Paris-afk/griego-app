import { redirect } from "next/navigation";

import { getCurrentUser } from "@/features/auth";
import { WeakWordsPanel, getDueCount, getErrorGroups, getWeakWords } from "@/features/review";

// Pantalla de repaso (Fase 6). Composición no diseñada en SCREENS.md: sigue el
// sistema «Ánfora» pero no está aprobada — avisado según SCREENS.md §5.
export default async function ReviewPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const [words, groups, due] = await Promise.all([
    getWeakWords(user.id),
    getErrorGroups(user.id),
    getDueCount(user.id),
  ]);

  return (
    <div className="mx-auto flex w-full max-w-md flex-col gap-5 px-[22px] pb-6 pt-[30px]">
      <header className="flex items-end justify-between border-b border-[var(--color-border-soft)] pb-3.5">
        <h1 className="font-display text-[36px] font-medium leading-none tracking-[-0.4px] text-[var(--color-text)]">
          Repaso
        </h1>
        {due > 0 && (
          <span className="rounded-pill bg-[#F6E8DF] px-3 py-1.5 text-[13px] font-semibold text-[var(--color-primary-strong)]">
            {due} para hoy
          </span>
        )}
      </header>

      <WeakWordsPanel words={words} groups={groups} />
    </div>
  );
}
