// Anillo de meta diaria (mockup AnforaHoy). SVG de 96×96 como en el diseño.
export function GoalRing({
  current,
  target,
  size = 96,
}: {
  current: number;
  target: number;
  size?: number;
}) {
  const r = 41;
  const circumference = 2 * Math.PI * r;
  const pct = target > 0 ? Math.min(1, current / target) : 0;
  const dashOffset = circumference * (1 - pct);

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 96 96"
        className="block -rotate-90"
        aria-hidden="true"
      >
        <circle
          cx="48"
          cy="48"
          r={r}
          fill="none"
          stroke="var(--color-border-soft)"
          strokeWidth="7"
        />
        <circle
          cx="48"
          cy="48"
          r={r}
          fill="none"
          stroke="var(--color-primary)"
          strokeWidth="7"
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <div className="font-display text-[30px] font-medium leading-none tabular-nums text-[var(--color-text)]">
          {current}
        </div>
        <div className="mt-[3px] text-[10px] tracking-[1px] text-[var(--color-text-soft)]">
          DE {target} MIN
        </div>
      </div>
    </div>
  );
}
