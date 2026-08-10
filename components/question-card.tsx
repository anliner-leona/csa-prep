"use client"

import { useEffect, useState } from "react"
import { Check, X, Flag, CircleCheck, CircleAlert } from "lucide-react"
import { Button } from "@/components/ui/button"
import { isCorrect, type Question } from "@/lib/exam"

interface QuestionCardProps {
  question: Question
  index: number
  total: number
  choiceOrder: string[]
  committed: string[] | undefined
  instantFeedback: boolean
  flagged: boolean
  onAnswer: (selected: string[]) => void
  onToggleFlag: () => void
}

export function QuestionCard({
  question,
  index,
  total,
  choiceOrder,
  committed,
  instantFeedback,
  flagged,
  onAnswer,
  onToggleFlag,
}: QuestionCardProps) {
  const [draft, setDraft] = useState<string[]>(committed ?? [])

  // reseed the working selection whenever we land on a different question
  useEffect(() => {
    setDraft(committed ?? [])
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [question.id])

  const revealed = instantFeedback && committed != null
  const answered = committed != null && committed.length > 0
  const orderedChoices = choiceOrder
    .map((label) => question.choices.find((c) => c.label === label))
    .filter((c): c is NonNullable<typeof c> => Boolean(c))

  const handleSelect = (label: string) => {
    if (revealed) return
    if (question.multi) {
      const nextDraft = draft.includes(label)
        ? draft.filter((l) => l !== label)
        : [...draft, label]
      setDraft(nextDraft)
      if (!instantFeedback) onAnswer(nextDraft)
    } else {
      const nextDraft = [label]
      setDraft(nextDraft)
      onAnswer(nextDraft) // single-answer commits immediately
    }
  }

  const canCheck = instantFeedback && question.multi && !revealed && draft.length > 0
  const correctAfterReveal = revealed && isCorrect(question, committed ?? [])

  return (
    <article className="flex flex-col">
      <div className="mb-5 flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2 text-xs font-medium text-muted-foreground">
            <span className="font-mono">
              Question {index + 1} / {total}
            </span>
            <span className="text-border">|</span>
            <span>{question.source}</span>
            {question.multi && (
              <span className="rounded-full bg-secondary px-2 py-0.5 text-secondary-foreground">
                Select {question.answerCount}
              </span>
            )}
          </div>
          <h2 className="mt-3 text-pretty text-xl font-medium leading-snug sm:text-2xl">
            {question.question}
          </h2>
        </div>
        <Button
          type="button"
          variant={flagged ? "default" : "outline"}
          size="icon"
          onClick={onToggleFlag}
          aria-pressed={flagged}
          aria-label={flagged ? "Remove flag" : "Flag for review"}
          className="shrink-0"
        >
          <Flag className={flagged ? "size-4 fill-current" : "size-4"} />
        </Button>
      </div>

      <ul className="space-y-3">
        {orderedChoices.map((choice) => {
          const selected = revealed
            ? (committed ?? []).includes(choice.label)
            : draft.includes(choice.label)

          let stateClass =
            "border-border bg-card hover:border-primary/50 hover:bg-accent/40"
          let markerClass = "border-border text-muted-foreground"
          let icon: React.ReactNode = choice.label

          if (revealed) {
            if (choice.correct) {
              stateClass = "border-success bg-success-muted"
              markerClass = "border-success bg-success text-success-foreground"
              icon = <Check className="size-4" />
            } else if (selected) {
              stateClass = "border-error bg-error-muted"
              markerClass = "border-error bg-error text-error-foreground"
              icon = <X className="size-4" />
            } else {
              stateClass = "border-border bg-card opacity-70"
            }
          } else if (selected) {
            stateClass = "border-primary bg-primary/5"
            markerClass = "border-primary bg-primary text-primary-foreground"
          }

          return (
            <li key={choice.label}>
              <button
                type="button"
                onClick={() => handleSelect(choice.label)}
                disabled={revealed}
                aria-pressed={selected}
                className={`flex w-full items-center gap-4 rounded-xl border p-4 text-left transition-colors disabled:cursor-default ${stateClass}`}
              >
                <span
                  className={`flex size-7 shrink-0 items-center justify-center rounded-lg border text-sm font-semibold ${markerClass} ${
                    question.multi && !revealed ? "rounded-md" : ""
                  }`}
                >
                  {icon}
                </span>
                <span className="text-pretty leading-snug">{choice.text}</span>
              </button>
            </li>
          )
        })}
      </ul>

      {canCheck && (
        <div className="mt-5">
          <Button onClick={() => onAnswer(draft)}>Check answer</Button>
        </div>
      )}

      {revealed && (
        <div
          className={`mt-5 flex items-center gap-2 rounded-xl border p-4 text-sm font-medium ${
            correctAfterReveal
              ? "border-success bg-success-muted text-foreground"
              : "border-error bg-error-muted text-foreground"
          }`}
        >
          {correctAfterReveal ? (
            <>
              <CircleCheck className="size-5 text-success" />
              Correct — nicely done.
            </>
          ) : (
            <>
              <CircleAlert className="size-5 text-error" />
              Not quite. The correct answer{question.answerCount > 1 ? "s are" : " is"}{" "}
              highlighted above.
            </>
          )}
        </div>
      )}

      {instantFeedback && question.multi && !revealed && (
        <p className="mt-3 text-sm text-muted-foreground">
          Select {question.answerCount} option
          {question.answerCount > 1 ? "s" : ""}, then choose “Check answer”.
        </p>
      )}

      {!instantFeedback && answered && (
        <p className="mt-3 text-sm text-muted-foreground">Answer saved.</p>
      )}
    </article>
  )
}
