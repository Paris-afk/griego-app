export default function ReviewPage() {
  return (
    <div className="mx-auto flex w-full max-w-md flex-col gap-5 px-[22px] pb-6 pt-[30px]">
      <header className="border-b border-[var(--color-border-soft)] pb-3.5">
        <h1 className="font-display text-[36px] font-medium leading-none tracking-[-0.4px] text-[var(--color-text)]">
          Repaso
        </h1>
      </header>
      <div className="rounded-card border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
        <p className="text-[15px] leading-relaxed text-[var(--color-text)]">
          La repetición espaciada (cola SM-2) llega en la <strong>Fase 6</strong>.
        </p>
      </div>
    </div>
  );
}
