"use client"

import { Flag } from "lucide-react"
import { isCorrect } from "@/lib/exam"
import { questionById } from "@/hooks/use-exam-session"

interface ExamNavigatorProps {
  order: number[]
  answers: Record<number, string[]>
  flagged: number[]
  current: number
  instantFeedback: boolean
  onGoTo: (index: number) => void
}

export function ExamNavigator({
  order,
  answers,
  flagged,
  current,
  instantFeedback,
  onGoTo,
}: ExamNavigatorProps) {
  const answeredCount = order.filter(
    (id) => answers[id] && answers[id].length > 0,
  ).length

  return (
    <div className="flex h-full flex-col">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Questions
        </h2>
        <span className="font-mono text-sm text-muted-foreground">
          {answeredCount}/{order.length}
        </span>
      </div>

      <div className="grid grid-cols-6 gap-2 overflow-y-auto pr-1 sm:grid-cols-5">
        {order.map((id, index) => {
          const answer = answers[id]
          const isAnswered = answer && answer.length > 0
          const isFlagged = flagged.includes(id)
          const isCurrent = index === current

          let cls =
            "border-border bg-card text-muted-foreground hover:border-primary/50"
          if (isAnswered) {
            if (instantFeedback) {
              cls = isCorrect(questionById(id), answer)
                ? "border-success bg-success-muted text-foreground"
                : "border-error bg-error-muted text-foreground"
            } else {
              cls = "border-primary bg-primary/10 text-foreground"
            }
          }
          if (isCurrent) {
            cls = "border-primary bg-primary text-primary-foreground"
          }

          return (
            <button
              key={id}
              type="button"
              onClick={() => onGoTo(index)}
              aria-current={isCurrent ? "true" : undefined}
              className={`relative flex aspect-square items-center justify-center rounded-lg border font-mono text-sm transition-colors ${cls}`}
            >
              {index + 1}
              {isFlagged && (
                <Flag
                  className="absolute -right-1 -top-1 size-3.5 fill-chart-5 text-chart-5"
                  aria-label="flagged"
                />
              )}
            </button>
          )
        })}
      </div>

      <div className="mt-5 space-y-2 border-t border-border pt-4 text-xs text-muted-foreground">
        <Legend swatch="bg-primary" label="Current" />
        {instantFeedback ? (
          <>
            <Legend swatch="bg-success" label="Correct" />
            <Legend swatch="bg-error" label="Incorrect" />
          </>
        ) : (
          <Legend swatch="bg-primary/40" label="Answered" />
        )}
        <Legend swatch="bg-card border border-border" label="Unanswered" />
      </div>
    </div>
  )
}

function Legend({ swatch, label }: { swatch: string; label: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className={`size-3 rounded ${swatch}`} />
      {label}
    </div>
  )
}
