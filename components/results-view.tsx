"use client"

import { useMemo, useState } from "react"
import {
  Check,
  X,
  Flag,
  RotateCcw,
  Trophy,
  CircleSlash,
  Clock,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { formatTime, isCorrect, selectedMatchOption } from "@/lib/exam"
import { questionById, type ExamSession } from "@/hooks/use-exam-session"

const PASS_THRESHOLD = 70

type Filter = "all" | "correct" | "incorrect" | "unanswered" | "flagged"

interface ResultsViewProps {
  session: ExamSession
  onRestart: () => void
}

export function ResultsView({ session, onRestart }: ResultsViewProps) {
  const [filter, setFilter] = useState<Filter>("incorrect")

  const stats = useMemo(() => {
    let correct = 0
    let incorrect = 0
    let unanswered = 0
    const bySource: Record<string, { correct: number; total: number }> = {}

    for (const id of session.order) {
      const q = questionById(id)
      const answer = session.answers[id]
      bySource[q.source] ??= { correct: 0, total: 0 }
      bySource[q.source].total++

      if (!answer || answer.length === 0) {
        unanswered++
      } else if (isCorrect(q, answer)) {
        correct++
        bySource[q.source].correct++
      } else {
        incorrect++
      }
    }

    const total = session.order.length
    const percent = total > 0 ? Math.round((correct / total) * 100) : 0
    return { correct, incorrect, unanswered, total, percent, bySource }
  }, [session])

  const elapsed = session.submittedAt
    ? Math.floor((session.submittedAt - session.startedAt) / 1000)
    : 0
  const passed = stats.percent >= PASS_THRESHOLD

  const filtered = useMemo(() => {
    return session.order.filter((id) => {
      const q = questionById(id)
      const answer = session.answers[id]
      const answered = answer && answer.length > 0
      const ok = answered && isCorrect(q, answer)
      switch (filter) {
        case "correct":
          return ok
        case "incorrect":
          return answered && !ok
        case "unanswered":
          return !answered
        case "flagged":
          return session.flagged.includes(id)
        default:
          return true
      }
    })
  }, [session, filter])

  const filters: { key: Filter; label: string; count: number }[] = [
    { key: "incorrect", label: "Incorrect", count: stats.incorrect },
    { key: "correct", label: "Correct", count: stats.correct },
    { key: "unanswered", label: "Unanswered", count: stats.unanswered },
    { key: "flagged", label: "Flagged", count: session.flagged.length },
    { key: "all", label: "All", count: stats.total },
  ]

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-10">
      <header className="mb-8 text-center">
        <span className="text-sm font-medium uppercase tracking-wider text-muted-foreground">
          Exam complete
        </span>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
          Your Results
        </h1>
      </header>

      {session.order.some((id) => questionById(id).source === "CIS-DF") && (
        <p className="mb-6 rounded-xl border border-border bg-secondary/50 p-4 text-sm text-muted-foreground">
          CIS-DF scoring uses the answers highlighted pink in the source PDF. The PDF warns that some highlighted answers may be wrong, so cross-check them before relying on your score.
        </p>
      )}

      {/* Score summary */}
      <div className="grid gap-6 rounded-2xl border border-border bg-card p-6 sm:grid-cols-[auto_1fr] sm:p-8">
        <div className="flex flex-col items-center justify-center">
          <ScoreRing percent={stats.percent} passed={passed} />
          <div
            className={`mt-4 inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm font-medium ${
              passed
                ? "bg-success-muted text-foreground"
                : "bg-error-muted text-foreground"
            }`}
          >
            {passed ? (
              <>
                <Trophy className="size-4 text-success" /> Passing score
              </>
            ) : (
              <>
                <CircleSlash className="size-4 text-error" /> Below {PASS_THRESHOLD}%
              </>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-2">
          <Stat
            icon={<Check className="size-5 text-success" />}
            value={stats.correct}
            label="Correct"
          />
          <Stat
            icon={<X className="size-5 text-error" />}
            value={stats.incorrect}
            label="Incorrect"
          />
          <Stat
            icon={<CircleSlash className="size-5 text-muted-foreground" />}
            value={stats.unanswered}
            label="Unanswered"
          />
          <Stat
            icon={<Clock className="size-5 text-primary" />}
            value={formatTime(elapsed)}
            label="Time taken"
            mono
          />
        </div>
      </div>

      {/* Breakdown by source */}
      <div className="mt-6 space-y-4 rounded-2xl border border-border bg-card p-6">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Breakdown by set
        </h2>
        {Object.entries(stats.bySource).map(([source, s]) => {
          const pct = s.total > 0 ? Math.round((s.correct / s.total) * 100) : 0
          return (
            <div key={source}>
              <div className="mb-1.5 flex items-center justify-between text-sm">
                <span className="font-medium">{source}</span>
                <span className="font-mono text-muted-foreground">
                  {s.correct}/{s.total} · {pct}%
                </span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-secondary">
                <div
                  className="h-full rounded-full bg-primary transition-all"
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          )
        })}
      </div>

      {/* Actions */}
      <div className="mt-6">
        <Button onClick={onRestart} size="lg" className="w-full">
          <RotateCcw className="size-4" />
          Start new exam
        </Button>
      </div>

      {/* Review */}
      <section className="mt-10">
        <h2 className="mb-4 text-lg font-semibold">Review answers</h2>
        <div className="mb-5 flex flex-wrap gap-2">
          {filters.map((f) => (
            <button
              key={f.key}
              type="button"
              onClick={() => setFilter(f.key)}
              className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm transition-colors ${
                filter === f.key
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-card text-muted-foreground hover:border-primary/40"
              }`}
            >
              {f.label}
              <span
                className={`rounded-full px-1.5 text-xs font-mono ${
                  filter === f.key
                    ? "bg-primary-foreground/20"
                    : "bg-secondary text-secondary-foreground"
                }`}
              >
                {f.count}
              </span>
            </button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <p className="rounded-xl border border-dashed border-border p-8 text-center text-muted-foreground">
            Nothing to show here.
          </p>
        ) : (
          <ol className="space-y-4">
            {filtered.map((id) => (
              <ReviewItem
                key={id}
                id={id}
                order={session.order}
                answer={session.answers[id]}
                flagged={session.flagged.includes(id)}
              />
            ))}
          </ol>
        )}
      </section>
    </div>
  )
}

function ScoreRing({ percent, passed }: { percent: number; passed: boolean }) {
  const size = 148
  const stroke = 12
  const r = (size - stroke) / 2
  const c = 2 * Math.PI * r
  const offset = c - (percent / 100) * c
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          strokeWidth={stroke}
          className="stroke-secondary"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={offset}
          className={passed ? "stroke-success" : "stroke-error"}
          style={{ transition: "stroke-dashoffset 0.8s ease" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-4xl font-semibold tabular-nums">{percent}%</span>
        <span className="text-xs text-muted-foreground">score</span>
      </div>
    </div>
  )
}

function Stat({
  icon,
  value,
  label,
  mono,
}: {
  icon: React.ReactNode
  value: React.ReactNode
  label: string
  mono?: boolean
}) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-border bg-background p-4">
      <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-secondary">
        {icon}
      </span>
      <div>
        <div className={`text-xl font-semibold ${mono ? "font-mono" : ""}`}>
          {value}
        </div>
        <div className="text-xs text-muted-foreground">{label}</div>
      </div>
    </div>
  )
}

function ReviewItem({
  id,
  order,
  answer,
  flagged,
}: {
  id: number
  order: number[]
  answer: string[] | undefined
  flagged: boolean
}) {
  const q = questionById(id)
  const position = order.indexOf(id) + 1
  const selected = answer ?? []
  const answered = selected.length > 0
  const ok = answered && isCorrect(q, selected)

  return (
    <li className="rounded-2xl border border-border bg-card p-5">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2 text-xs font-medium text-muted-foreground">
          <span className="font-mono">#{position}</span>
          <span className="text-border">|</span>
          <span>{q.source}</span>
          {flagged && (
            <Flag className="size-3.5 fill-chart-5 text-chart-5" aria-label="flagged" />
          )}
        </div>
        <span
          className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${
            !answered
              ? "bg-secondary text-secondary-foreground"
              : ok
                ? "bg-success-muted text-foreground"
                : "bg-error-muted text-foreground"
          }`}
        >
          {!answered ? "Skipped" : ok ? "Correct" : "Incorrect"}
        </span>
      </div>

      <p className="mb-4 text-pretty font-medium leading-snug">{q.question}</p>

      {q.matching ? (
        <ul className="flex flex-col gap-2">
          {q.matching.map((pair, pairIndex) => {
            const selectedOptionIndex = selectedMatchOption(selected, pairIndex)
            const selectedOption = selectedOptionIndex === null
              ? undefined
              : q.matchOptions?.[selectedOptionIndex]
            const correctOptionIndex = q.matchOptions?.indexOf(pair.right) ?? -1
            const rowCorrect = selectedOptionIndex === correctOptionIndex
            const rowClass = selectedOption === undefined
              ? "border-border text-muted-foreground"
              : rowCorrect
                ? "border-success bg-success-muted text-foreground"
                : "border-error bg-error-muted text-foreground"

            return (
              <li
                key={pair.left}
                className={`rounded-lg border px-3 py-3 text-sm ${rowClass}`}
              >
                <p className="font-medium text-foreground">{pair.left}</p>
                <p className="mt-2 text-pretty">
                  Your match: {selectedOption ?? "Not matched"}
                  {rowCorrect && selectedOption !== undefined && (
                    <Check className="ml-2 inline size-4 text-success" aria-label="Correct" />
                  )}
                </p>
                <p className="mt-1 text-pretty text-muted-foreground">
                  Correct match: <span className="font-medium text-foreground">{pair.right}</span>
                </p>
              </li>
            )
          })}
        </ul>
      ) : (
        <ul className="flex flex-col gap-2">
          {q.choices.map((choice) => {
            const picked = selected.includes(choice.label)
            let cls = "border-border text-muted-foreground"
            let icon: React.ReactNode = null
            if (choice.correct) {
              cls = "border-success bg-success-muted text-foreground"
              icon = <Check className="size-4 text-success" />
            } else if (picked) {
              cls = "border-error bg-error-muted text-foreground"
              icon = <X className="size-4 text-error" />
            }
            return (
              <li
                key={choice.label}
                className={`flex items-center gap-3 rounded-lg border px-3 py-2 text-sm ${cls}`}
              >
                <span className="font-mono font-semibold">{choice.label}.</span>
                <span className="flex-1 text-pretty">{choice.text}</span>
                {icon}
              </li>
            )
          })}
        </ul>
      )}
    </li>
  )
}
