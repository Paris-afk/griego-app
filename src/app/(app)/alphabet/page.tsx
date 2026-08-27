import Link from "next/link";
import { ChevronLeft } from "lucide-react";

import { getAlphabet } from "@/features/catalog";
import { AudioButton } from "@/shared/ui";
import { audioPathForText } from "@/shared/lib/audio";
import { cn } from "@/shared/lib/utils";

const TRANSFERENCIA_LABEL: Record<string, { label: string; tone: string }> = {
  POSITIVA: { label: "fácil", tone: "text-[var(--color-success)]" },
  NEGATIVA: { label: "cuidado", tone: "text-[var(--color-error)]" },
  NEUTRA: { label: "nueva", tone: "text-[var(--color-text-soft)]" },
};

export default async function AlphabetPage() {
  const letters = await getAlphabet();

  return (
    <div className="mx-auto flex w-full max-w-md flex-col gap-5 px-[22px] pb-6 pt-[24px]">
      <Link
        href="/course"
        className="inline-flex items-center gap-1 self-start py-1 text-[var(--color-text-soft)] hover:text-[var(--color-text)]"
      >
        <ChevronLeft width={18} height={18} strokeWidth={2.2} aria-hidden />
        <span className="text-[14px]">Curso</span>
      </Link>

      <header className="border-b border-[var(--color-border-soft)] pb-3.5">
        <h1 className="font-display text-[30px] font-medium leading-tight tracking-[-0.3px] text-[var(--color-text)]">
          El alfabeto
        </h1>
        <p className="mt-1 text-[13px] text-[var(--color-text-soft)]">
          24 letras · toca 🔊 para oír cada sonido
        </p>
      </header>

      <ul className="grid grid-cols-2 gap-2">
        {letters.map((letter) => {
          const tf = TRANSFERENCIA_LABEL[letter.transferencia] ?? TRANSFERENCIA_LABEL.NEUTRA;
          const audioSrc = audioPathForText(letter.lowercase.split(/\s+/)[0]);
          return (
            <li
              key={letter.id}
              className="flex flex-col gap-2 rounded-card border border-[var(--color-border)] bg-[var(--color-surface)] p-3.5"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex flex-col">
                  <span className="font-greek text-[34px] font-medium leading-none text-[var(--color-text)]">
                    {letter.lowercase}
                  </span>
                  <span className="font-greek text-[16px] text-[var(--color-text-soft)]">
                    {letter.uppercase}
                  </span>
                </div>
                <AudioButton src={audioSrc} />
              </div>

              <div className="flex flex-col gap-[1px]">
                <span className="text-[14px] font-medium text-[var(--color-text)]">
                  {letter.nameGreek} · {letter.nameTranslit}
                </span>
                <span className="text-[13px] text-[var(--color-text-soft)]">
                  {letter.equivalentEs}
                </span>
              </div>

              <span
                className={cn(
                  "self-start text-[10px] font-semibold tracking-[1px] uppercase",
                  tf.tone,
                )}
              >
                {tf.label}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
