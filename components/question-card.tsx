"use client"

import { useEffect, useState } from "react"
import { Check, X, Flag, CircleCheck, CircleAlert } from "lucide-react"
import { Button } from "@/components/ui/button"
import { correctLabels, isCorrect, type Question } from "@/lib/exam"

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
    .map((label) => question.choices.find((choice) => choice.label === label))
    .filter((choice): choice is NonNullable<typeof choice> => Boolean(choice))
  const orderedMatchOptions = choiceOrder
    .map((key) => {
      const index = Number(key.replace("option-", ""))
      const text = question.matchOptions?.[index]
      return text === undefined ? null : { key, text }
    })
    .filter((option): option is { key: string; text: string } => option !== null)
  const correctAnswers = correctLabels(question)

  const handleMatchChange = (pairIndex: number, optionKey: string) => {
    const prefix = `pair-${pairIndex}:`
    const nextDraft = draft.filter((answer) => !answer.startsWith(prefix))
    if (optionKey) nextDraft.push(`${prefix}${optionKey}`)
    setDraft(nextDraft)
    if (!instantFeedback) onAnswer(nextDraft)
  }

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
            {question.matching ? (
              <span className="rounded-full bg-secondary px-2 py-0.5 text-secondary-foreground">
                Match {question.answerCount} pairs
              </span>
            ) : question.multi ? (
              <span className="rounded-full bg-secondary px-2 py-0.5 text-secondary-foreground">
                Select {question.answerCount}
              </span>
            ) : null}
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

      {question.matching ? (
        <ul className="flex flex-col gap-3">
          {question.matching.map((pair, pairIndex) => {
            const prefix = `pair-${pairIndex}:`
            const selectedOptionKey = (revealed ? committed ?? [] : draft)
              .find((answer) => answer.startsWith(prefix))
              ?.split(":")[1] ?? ""
            const correctOptionKey = `option-${question.matchOptions?.indexOf(pair.right) ?? -1}`
            const matchIsCorrect = selectedOptionKey === correctOptionKey
            const selectId = `question-${question.id}-match-${pairIndex}`

            return (
              <li
                key={pair.left}
                className={`grid gap-3 rounded-xl border p-4 sm:grid-cols-[minmax(0,1fr)_minmax(15rem,1fr)] sm:items-center ${
                  revealed
                    ? matchIsCorrect
                      ? "border-success bg-success-muted/40"
                      : "border-error bg-error-muted/40"
                    : "border-border bg-card"
                }`}
              >
                <label htmlFor={selectId} className="font-medium leading-snug">
                  {pair.left}
                </label>
                <select
                  id={selectId}
                  aria-label={`Match ${pair.left}`}
                  value={selectedOptionKey}
                  onChange={(event) => handleMatchChange(pairIndex, event.target.value)}
                  disabled={revealed}
                  className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-80"
                >
                  <option value="">Choose a match</option>
                  {orderedMatchOptions.map((option) => (
                    <option key={option.key} value={option.key}>
                      {option.text}
                    </option>
                  ))}
                </select>
                {revealed && (
                  <p className="text-sm text-muted-foreground sm:col-start-2">
                    Correct match: <span className="font-medium text-foreground">{pair.right}</span>
                  </p>
                )}
              </li>
            )
          })}
        </ul>
      ) : (
      <ul className="flex flex-col gap-3">
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
      )}

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
              {question.matching
                ? "Not quite. Review the correct matches below."
                : `Not quite. The correct answer${question.answerCount > 1 ? "s are" : " is"} highlighted above.`}
            </>
          )}
        </div>
      )}

      {instantFeedback && question.multi && !revealed && (
        <p className="mt-3 text-sm text-muted-foreground">
          {question.matching
            ? `Choose a match for each of the ${question.answerCount} prompts, then check your answers.`
            : `Select ${question.answerCount} option${question.answerCount > 1 ? "s" : ""}, then choose “Check answer”.`}
        </p>
      )}

      {!instantFeedback && answered && (
        <p className="mt-3 text-sm text-muted-foreground">Answer saved.</p>
      )}
    </article>
  )
}
