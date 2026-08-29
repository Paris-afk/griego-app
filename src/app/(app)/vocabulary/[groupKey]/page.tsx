import Link from "next/link";
import { redirect } from "next/navigation";
import { ChevronLeft } from "lucide-react";

import { getCurrentUser } from "@/features/auth";
import { VocabCardList, getVocabCards, groupLabel } from "@/features/vocabulary";

export default async function VocabGroupPage({
  params,
}: {
  params: Promise<{ groupKey: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const { groupKey } = await params;
  const cards = await getVocabCards(user.id, groupKey);

  return (
    <div className="mx-auto flex w-full max-w-md flex-col gap-5 px-[22px] pb-6 pt-[30px]">
      <header className="flex flex-col gap-2 border-b border-[var(--color-border-soft)] pb-3.5">
        <Link
          href="/vocabulary"
          className="-ml-1 flex min-h-[44px] items-center gap-1 self-start text-[13px] font-semibold text-[var(--color-primary-strong)]"
        >
          <ChevronLeft width={16} height={16} strokeWidth={2.2} aria-hidden />
          Vocabulario
        </Link>
        <h1 className="font-display text-[30px] font-medium leading-none tracking-[-0.3px] text-[var(--color-text)]">
          {groupLabel(groupKey)}
        </h1>
      </header>

      <VocabCardList cards={cards} />
    </div>
  );
}
