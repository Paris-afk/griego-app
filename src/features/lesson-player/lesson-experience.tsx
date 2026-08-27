"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Check, X, ArrowRight, ChevronLeft, RotateCcw, AlertTriangle, Play, Flame } from "lucide-react";

import {
  ExerciseSchema,
  exerciseRegistry,
  exerciseSpokenText,
  type Exercise,
  type ExerciseRendererProps,
} from "@/features/exercises";
import { checkAnswer, completeLesson, type CheckAnswerResult } from "./actions";
import { AudioButton, ProgressBar } from "@/shared/ui";
import { audioPathForText } from "@/shared/lib/audio";
import { playSfx, playWord, unlockAudio } from "@/shared/lib/sound";
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
  streak: number;
}

type Phase = "start" | "answering" | "correct" | "feedback" | "finish";
type Outcome = null | "completed" | "incomplete";

const AUTO_ADVANCE_MS = 600;

export function LessonExperience({
  lessonId,
  title,
  moduleId,
  exercises,
  initialScore,
  streak,
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
  const alreadyCorrect = useMemo(
    () => new Set(parsed.filter((e) => e.correct).map((e) => e.id)),
    [parsed],
  );

  const [correctSet, setCorrectSet] = useState(alreadyCorrect);
  const [outcome, setOutcome] = useState<Outcome>(null);
  const [index, setIndex] = useState(() => {
    const i = parsed.findIndex((e) => !alreadyCorrect.has(e.id));
    return i === -1 ? Math.max(total - 1, 0) : i;
  });
  const [phase, setPhase] = useState<Phase>(() =>
    total > 0 && parsed.every((e) => alreadyCorrect.has(e.id)) ? "finish" : "start",
  );
  const [value, setValue] = useState<unknown>(null);
  const [result, setResult] = useState<CheckAnswerResult | null>(null);
  const [score, setScore] = useState(initialScore);
  const [pending, setPending] = useState(false);
  const advanceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const current = parsed[index];

  // Auto-play del audio de la palabra al pasar a responder (desbloqueado ya).
  useEffect(() => {
    if (phase === "answering" && current) {
      const word = exerciseSpokenText(current.exercise);
      if (word) playWord(audioPathForText(word));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, index]);

  useEffect(() => () => clearTimer(), []);

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

  function clearTimer() {
    if (advanceTimer.current) {
      clearTimeout(advanceTimer.current);
      advanceTimer.current = null;
    }
  }

  function startLesson() {
    unlockAudio();
    setPhase("answering");
  }

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
      playSfx("correct");
      setPhase("correct");
      clearTimer();
      advanceTimer.current = setTimeout(advance, AUTO_ADVANCE_MS);
    } else {
      playSfx("wrong");
      setPhase("feedback");
    }
    setPending(false);
  }

  function advance() {
    clearTimer();
    setValue(null);
    setResult(null);
    if (index >= total - 1) {
      const allCorrect = parsed.every((e) => correctSet.has(e.id));
      if (allCorrect) {
        setOutcome("completed");
        void completeLesson(lessonId);
        router.refresh();
      } else {
        setOutcome("incomplete");
      }
      setPhase("finish");
    } else {
      setIndex((i) => i + 1);
      setPhase("answering");
    }
  }

  function quit() {
    clearTimer();
    router.push(`/course/${moduleId}`);
  }

  function restartLesson() {
    setOutcome(null);
    setIndex(0);
    setValue(null);
    setResult(null);
    setCorrectSet(new Set());
    setScore(0);
    setPhase("start");
  }

  const resolved = parsed.slice(0, index).filter((e) => correctSet.has(e.id)).length;
  const filled =
    phase === "finish"
      ? total
      : index + (phase === "correct" || phase === "feedback" ? 1 : 0);
  const displayLabel = phase === "finish" ? `${total}/${total}` : `${index + 1}/${total}`;

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
        <ProgressBar value={(filled / Math.max(total, 1)) * 100} max={100} className="ml-1.5 flex-grow" />
        <span className="text-[12px] tabular-nums tracking-[0.4px] text-[var(--color-text-soft)]">
          {displayLabel}
        </span>
      </div>

      {phase === "start" ? (
        <StartPanel title={title} isResume={resolved > 0} onStart={startLesson} />
      ) : phase === "finish" ? (
        <FinishPanel
          outcome={outcome ?? "incomplete"}
          score={score}
          total={total}
          correct={correctSet.size}
          streak={streak}
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
              disabled={phase !== "answering"}
            />
          </div>

          <div className="mt-6">
            {phase === "answering" ? (
              <button
                type="button"
                onClick={submit}
                disabled={!canSubmit || pending}
                className="flex min-h-[56px] w-full items-center justify-center rounded-button bg-[var(--color-primary)] text-[16px] font-semibold text-white transition-colors hover:bg-[var(--color-primary-strong)] disabled:opacity-40"
              >
                {pending ? "Comprobando…" : "Comprobar"}
              </button>
            ) : phase === "correct" ? (
              <div
                className={cn(
                  "flex items-center justify-center gap-2 rounded-card border border-[var(--color-success)] bg-[#EEF3E8] py-3 text-[var(--color-success)] transition-opacity",
                  result?.isCorrect && "animate-pulse",
                )}
              >
                <Check width={20} height={20} strokeWidth={3} aria-hidden />
                <span className="font-display text-[17px] font-semibold">
                  ¡Correcto! +{result?.points ?? 0} pts
                </span>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                <div className="rounded-card border border-[var(--color-error)] bg-[#F7E7E2] p-4">
                  <div className="flex items-center gap-2 text-[var(--color-error)]">
                    <AlertTriangle width={18} height={18} strokeWidth={2.2} aria-hidden />
                    <span className="font-display text-[17px] font-semibold">
                      Incorrecto
                    </span>
                  </div>
                  <div className="mt-3 flex items-center justify-between gap-3">
                    <div>
                      <div className="text-[12px] text-[var(--color-text-soft)]">Escribiste</div>
                      <div className="font-greek text-[18px] text-[var(--color-text)] line-through">
                        {typeof value === "string" ? value : ""}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-[12px] text-[var(--color-text-soft)]">Correcto</div>
                      <div className="flex items-center justify-end gap-2">
                        <div className="font-greek text-[18px] font-medium text-[var(--color-text)]">
                          {result?.correct ?? ""}
                        </div>
                        {result?.correct && (
                          <AudioButton src={audioPathForText(result.correct)} />
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={advance}
                  className="flex min-h-[56px] w-full items-center justify-center gap-2 rounded-button bg-[var(--color-primary)] text-[16px] font-semibold text-white hover:bg-[var(--color-primary-strong)]"
                >
                  {index >= total - 1 ? "Terminar" : "Seguir"}
                  <ArrowRight width={17} height={17} strokeWidth={2.2} aria-hidden />
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

function StartPanel({
  title,
  isResume,
  onStart,
}: {
  title: string;
  isResume: boolean;
  onStart: () => void;
}) {
  return (
    <div className="flex flex-grow flex-col items-center justify-center gap-6 text-center">
      <div className="flex size-16 items-center justify-center rounded-full bg-[var(--color-primary)]">
        <Play width={28} height={28} strokeWidth={2.4} className="ml-1 text-white" aria-hidden />
      </div>
      <div>
        <h2 className="font-display text-[26px] font-medium text-[var(--color-text)]">
          {title}
        </h2>
        <p className="mt-1 text-[14px] text-[var(--color-text-soft)]">
          Toca para empezar; el audio se activa con este gesto.
        </p>
      </div>
      <button
        type="button"
        onClick={onStart}
        className="flex min-h-[56px] w-full items-center justify-center rounded-button bg-[var(--color-primary)] text-[16px] font-semibold text-white hover:bg-[var(--color-primary-strong)]"
      >
        {isResume ? "Continuar la lección" : "Comenzar"}
      </button>
    </div>
  );
}

function FinishPanel({
  outcome,
  score,
  total,
  correct,
  streak,
  onBack,
  onRetry,
  title,
}: {
  outcome: "completed" | "incomplete";
  score: number;
  total: number;
  correct: number;
  streak: number;
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
      </div>

      <div className="grid w-full grid-cols-3 gap-2">
        <Stat value={`${correct}/${total}`} label="aciertos" />
        <Stat value={String(score)} label="puntos" />
        <Stat value={String(streak)} label="racha (días)" icon />
      </div>

      {!completed && (
        <p className="mx-auto max-w-[280px] text-[14px] leading-relaxed text-[var(--color-text)]">
          Te faltó acertar {total - correct}{" "}
          {total - correct === 1 ? "ejercicio" : "ejercicios"}. La lección solo se
          completa si aciertas todos.
        </p>
      )}

      <div className="mt-1 flex w-full flex-col gap-2">
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

function Stat({ value, label, icon }: { value: string; label: string; icon?: boolean }) {
  return (
    <div className="flex flex-col items-center gap-0.5 rounded-card border border-[var(--color-border)] bg-[var(--color-surface)] px-2 py-3">
      <div className="flex items-center gap-1 font-display text-[22px] font-medium tabular-nums text-[var(--color-text)]">
        {icon && <Flame width={16} height={16} className="text-[var(--color-streak)]" aria-hidden />}
        {value}
      </div>
      <div className="text-[11px] text-[var(--color-text-soft)]">{label}</div>
    </div>
  );
}
