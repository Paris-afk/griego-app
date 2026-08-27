"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Check, X, ArrowRight, ChevronLeft, RotateCcw, AlertTriangle } from "lucide-react";

import {
  ExerciseSchema,
  exerciseRegistry,
  type Exercise,
  type ExerciseRendererProps,
} from "@/features/exercises";
import { checkAnswer, completeLesson, type CheckAnswerResult } from "./actions";
import { AudioButton, ProgressBar } from "@/shared/ui";
import { audioPathForText } from "@/shared/lib/audio";
import { cn } from "@/shared/lib/utils";

interface ExerciseDto {
  id: string;
  schemaJson: unknown;
  correct: boolean;
}

export interface LessonExperienceProps {
  lessonId: string;
  title: string;
  moduleId: string;
  exercises: ExerciseDto[];
  initialScore: number;
}

type Outcome = null | "completed" | "incomplete";

export function LessonExperience({
  lessonId,
  title,
  moduleId,
  exercises,
  initialScore,
}: LessonExperienceProps) {
  const router = useRouter();
  const parsed = useMemo(
    () =>
      exercises
        .map((e) => {
          const r = ExerciseSchema.safeParse(e.schemaJson);
          return r.success
            ? { id: e.id, correct: e.correct, exercise: r.data }
            : null;
        })
        .filter(
          (e): e is { id: string; correct: boolean; exercise: Exercise } =>
            e !== null,
        ),
    [exercises],
  );

  const total = parsed.length;
  const alreadyCorrectIds = useMemo(
    () => new Set(parsed.filter((e) => e.correct).map((e) => e.id)),
    [parsed],
  );

  const [correctSet, setCorrectSet] = useState(alreadyCorrectIds);
  const [outcome, setOutcome] = useState<Outcome>(() =>
    total > 0 && parsed.every((e) => alreadyCorrectIds.has(e.id))
      ? "completed"
      : null,
  );
  const [index, setIndex] = useState(() => {
    const i = parsed.findIndex((e) => !alreadyCorrectIds.has(e.id));
    return i === -1 ? Math.max(total - 1, 0) : i;
  });
  const [value, setValue] = useState<unknown>(null);
  const [result, setResult] = useState<CheckAnswerResult | null>(null);
  const [score, setScore] = useState(initialScore);
  const [pending, setPending] = useState(false);

  const current = parsed[index];

  if (!current) {
    return (
      <div className="rounded-card border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
        <p className="text-[15px] text-[var(--color-text)]">
          Esta lección no tiene ejercicios todavía.
        </p>
      </div>
    );
  }

  const exerciseModule = exerciseRegistry[current.exercise.type];
  const Renderer = exerciseModule.Renderer as unknown as React.ComponentType<
    ExerciseRendererProps<Exercise>
  >;

  const canSubmit =
    typeof value === "string"
      ? value.trim().length > 0
      : Array.isArray(value)
        ? value.length > 0
        : value != null && value !== "";

  async function submit() {
    if (pending) return;
    setPending(true);
    const res = await checkAnswer({
      lessonId,
      exerciseId: current.id,
      answer: value,
    });
    setResult(res);
    if (res.isCorrect) {
      setScore((s) => s + res.points);
      setCorrectSet((prev) => new Set(prev).add(current.id));
    }
    setPending(false);
  }

  function advance() {
    setResult(null);
    setValue(null);
    if (index >= total - 1) {
      const allCorrect = parsed.every((e) => correctSet.has(e.id));
      if (allCorrect) {
        setOutcome("completed");
        void completeLesson(lessonId);
        router.refresh();
      } else {
        setOutcome("incomplete");
      }
    } else {
      setIndex((i) => i + 1);
    }
  }

  function quit() {
    router.push(`/course/${moduleId}`);
  }

  function restartLesson() {
    setOutcome(null);
    setIndex(0);
    setValue(null);
    setResult(null);
    setCorrectSet(new Set());
    setScore(0);
  }

  const wrongCount = total - correctSet.size;
  const displayProgress = outcome
    ? 100
    : Math.min(
        100,
        ((index + (result?.isCorrect ? 1 : 0)) / Math.max(total, 1)) * 100,
      );
  const displayLabel = outcome ? `${total}/${total}` : `${index + 1}/${total}`;

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-md flex-col px-[22px] pb-8 pt-[24px]">
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={quit}
          aria-label="Salir de la lección"
          className="-ml-3 flex size-11 items-center justify-center text-[var(--color-text-soft)] hover:text-[var(--color-text)]"
        >
          <X width={21} height={21} strokeWidth={2.2} aria-hidden />
        </button>
        <ProgressBar value={displayProgress} max={100} className="ml-1.5 flex-grow" />
        <span className="text-[12px] tabular-nums tracking-[0.4px] text-[var(--color-text-soft)]">
          {displayLabel}
        </span>
      </div>

      {outcome ? (
        <FinishPanel
          outcome={outcome}
          score={score}
          max={total}
          wrongCount={wrongCount}
          onBack={quit}
          onRetry={restartLesson}
          title={title}
        />
      ) : (
        <>
          <div className="pt-12">
            <p className="font-display text-[19px] italic text-[var(--color-text-soft)]">
              {current.exercise.instruction}
            </p>
          </div>

          <div className="flex-grow pt-7">
            <Renderer
              exercise={current.exercise}
              value={value}
              onChange={setValue}
              disabled={result != null}
            />
          </div>

          {result != null && (
            <div className="flex flex-col gap-3">
              <div
                className={cn(
                  "flex items-center justify-between rounded-card border px-4 py-3",
                  result.isCorrect
                    ? "border-[var(--color-success)] bg-[#EEF3E8]"
                    : "border-[var(--color-error)] bg-[#F7E7E2]",
                )}
              >
                <span
                  className={cn(
                    "font-display text-[17px] font-semibold",
                    result.isCorrect
                      ? "text-[var(--color-success)]"
                      : "text-[var(--color-error)]",
                  )}
                >
                  {result.isCorrect ? "¡Correcto!" : "Incorrecto"}
                </span>
                <span className="text-[13px] tabular-nums text-[var(--color-text-soft)]">
                  {result.isCorrect ? `+${result.points} pts` : "+0 pts"}
                </span>
              </div>
              {!result.isCorrect && (
                <div className="flex items-center gap-2">
                  <p className="text-[15px] text-[var(--color-text)]">
                    La correcta:{" "}
                    {result.correct ? (
                      <span className="font-greek text-[18px] font-medium">{result.correct}</span>
                    ) : (
                      "—"
                    )}
                  </p>
                  {result.correct && (
                    <AudioButton src={audioPathForText(result.correct)} size="sm" />
                  )}
                </div>
              )}
            </div>
          )}
        </>
      )}

      <div className="mt-6">
        {outcome ? null : result == null ? (
          <button
            type="button"
            onClick={submit}
            disabled={!canSubmit || pending}
            className="flex min-h-[56px] w-full items-center justify-center rounded-button bg-[var(--color-primary)] text-[16px] font-semibold text-white transition-colors hover:bg-[var(--color-primary-strong)] disabled:opacity-40"
          >
            {pending ? "Comprobando…" : "Comprobar"}
          </button>
        ) : (
          <button
            type="button"
            onClick={advance}
            className="flex min-h-[56px] w-full items-center justify-center gap-2 rounded-button bg-[var(--color-primary)] text-[16px] font-semibold text-white transition-colors hover:bg-[var(--color-primary-strong)]"
          >
            {index >= total - 1 ? "Terminar" : "Continuar"}
            <ArrowRight width={17} height={17} strokeWidth={2.2} aria-hidden />
          </button>
        )}
      </div>
    </div>
  );
}

function FinishPanel({
  outcome,
  score,
  max,
  wrongCount,
  onBack,
  onRetry,
  title,
}: {
  outcome: "completed" | "incomplete";
  score: number;
  max: number;
  wrongCount: number;
  onBack: () => void;
  onRetry: () => void;
  title: string;
}) {
  const completed = outcome === "completed";
  return (
    <div className="flex flex-grow flex-col items-center justify-center gap-5 pt-10 text-center">
      <div
        className={cn(
          "flex size-16 items-center justify-center rounded-full",
          completed ? "bg-[var(--color-success)]" : "bg-[var(--color-error)]",
        )}
      >
        {completed ? (
          <Check width={30} height={30} strokeWidth={3} className="text-white" aria-hidden />
        ) : (
          <AlertTriangle width={30} height={30} strokeWidth={2.4} className="text-white" aria-hidden />
        )}
      </div>
      <div>
        <h2 className="font-display text-[26px] font-medium text-[var(--color-text)]">
          {completed ? "Lección completada" : "Lección incompleta"}
        </h2>
        <p className="mt-1 text-[15px] text-[var(--color-text-soft)]">{title}</p>
        {completed ? (
          <p className="mt-3 text-[15px] tabular-nums text-[var(--color-text)]">
            {score} pts · {max} ejercicios
          </p>
        ) : (
          <p className="mx-auto mt-3 max-w-[280px] text-[15px] leading-relaxed text-[var(--color-text)]">
            Te faltó acertar {wrongCount}{" "}
            {wrongCount === 1 ? "ejercicio" : "ejercicios"}. La lección solo se
            completa si aciertas todos.
          </p>
        )}
      </div>
      <div className="mt-2 flex w-full flex-col gap-2">
        <button
          type="button"
          onClick={onRetry}
          className="flex min-h-[56px] w-full items-center justify-center gap-2 rounded-button bg-[var(--color-primary)] text-[16px] font-semibold text-white hover:bg-[var(--color-primary-strong)]"
        >
          <RotateCcw width={17} height={17} strokeWidth={2.2} aria-hidden />
          {completed ? "Repetir lección" : "Intentar de nuevo"}
        </button>
        <button
          type="button"
          onClick={onBack}
          className="flex min-h-[56px] w-full items-center justify-center gap-2 rounded-button border border-[var(--color-border)] bg-[var(--color-surface)] text-[16px] font-semibold text-[var(--color-text)] hover:border-[var(--color-primary)]"
        >
          <ChevronLeft width={17} height={17} strokeWidth={2.2} aria-hidden />
          Volver al módulo
        </button>
      </div>
    </div>
  );
}
