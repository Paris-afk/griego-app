import Link from "next/link";
import { redirect } from "next/navigation";
import { ChevronRight } from "lucide-react";

import { getCurrentUser } from "@/features/auth";
import { getVocabGroups } from "@/features/vocabulary";

// Vocabulario por grupos — vía paralela al curso (ver features/vocabulary).
// Composición no diseñada en SCREENS.md: sigue «Ánfora» pero no está aprobada.
export default async function VocabularyPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const groups = await getVocabGroups(user.id);

  return (
    <div className="mx-auto flex w-full max-w-md flex-col gap-5 px-[22px] pb-6 pt-[30px]">
      <header className="border-b border-[var(--color-border-soft)] pb-3.5">
        <h1 className="font-display text-[36px] font-medium leading-none tracking-[-0.4px] text-[var(--color-text)]">
          Vocabulario
        </h1>
        <p className="mt-1.5 text-[13px] text-[var(--color-text-soft)]">
          Repasa por temas, sin seguir el orden del curso.
        </p>
      </header>

      <ul className="flex flex-col gap-2.5">
        {groups.map((group) => (
          <li key={group.key}>
            <Link
              href={`/vocabulary/${group.key}`}
              className="flex min-h-[64px] items-center gap-3.5 rounded-card border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3 transition-colors hover:border-[var(--color-primary)]"
            >
              <span className="flex size-11 shrink-0 items-center justify-center rounded-[10px] bg-[#F1E8DC] text-[24px]">
                {group.emoji}
              </span>
              <div className="flex flex-grow flex-col gap-0.5">
                <span className="font-display text-[19px] text-[var(--color-text)]">
                  {group.label}
                </span>
                <span className="text-[13px] text-[var(--color-text-soft)]">
                  {group.total} palabras
                  {group.mastered > 0 ? ` · ${group.mastered} dominadas` : ""}
                </span>
              </div>
              <ChevronRight
                width={17}
                height={17}
                strokeWidth={2.2}
                className="text-[#938677]"
                aria-hidden
              />
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
