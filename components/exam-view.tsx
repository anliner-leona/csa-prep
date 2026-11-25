"use client"

import { useState } from "react"
import {
  ChevronLeft,
  ChevronRight,
  Grid3x3,
  LogOut,
  Flag,
  X,
  Send,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { QuestionCard } from "@/components/question-card"
import { ExamNavigator } from "@/components/exam-navigator"
import { ExamTimer } from "@/components/exam-timer"
import { questionById, type ExamSession } from "@/hooks/use-exam-session"

interface ExamViewProps {
  session: ExamSession
  onExit: () => void
  onGoTo: (index: number) => void
  onNext: () => void
  onPrev: () => void
  onAnswer: (questionId: number, selected: string[]) => void
  onToggleFlag: (questionId: number) => void
  onSubmit: () => void
}

export function ExamView({
  session,
  onExit,
  onGoTo,
  onNext,
  onPrev,
  onAnswer,
  onToggleFlag,
  onSubmit,
}: ExamViewProps) {
  const [navOpen, setNavOpen] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)

  const questionId = session.order[session.current]
  const question = questionById(questionId)
  const answeredCount = session.order.filter(
    (id) => session.answers[id] && session.answers[id].length > 0,
  ).length
  const progress = Math.round((answeredCount / session.order.length) * 100)
  const unanswered = session.order.length - answeredCount

  return (
    <div className="flex min-h-screen flex-col">
      {/* Top bar */}
      <header className="sticky top-0 z-30 border-b border-border bg-background/85 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={onExit} className="gap-1.5">
              <LogOut className="size-4" />
              <span className="hidden sm:inline">Exit</span>
            </Button>
            <div className="hidden items-center gap-2 sm:flex">
              <span className="size-2 rounded-full bg-primary" />
              <span className="text-sm font-medium">ServiceNow Exam Trainer</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <ExamTimer
              startedAt={session.startedAt}
              submittedAt={session.submittedAt}
              className="rounded-lg border border-border bg-card px-2.5 py-1.5 text-sm"
            />
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5 lg:hidden"
              onClick={() => setNavOpen(true)}
            >
              <Grid3x3 className="size-4" />
              <span className="font-mono">
                {session.current + 1}/{session.order.length}
              </span>
            </Button>
            <Button size="sm" className="gap-1.5" onClick={() => setConfirmOpen(true)}>
              <Send className="size-4" />
              <span className="hidden sm:inline">Submit</span>
            </Button>
          </div>
        </div>
        {/* progress */}
        <div className="h-1 w-full bg-secondary">
          <div
            className="h-full bg-primary transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
      </header>

      {/* Body */}
      <div className="mx-auto flex w-full max-w-6xl flex-1 gap-8 px-4 py-8">
        <main className="min-w-0 flex-1">
          <QuestionCard
            question={question}
            index={session.current}
            total={session.order.length}
            choiceOrder={session.choiceOrder[questionId] ?? question.choices.map((c) => c.label)}
            committed={session.answers[questionId]}
            instantFeedback={session.instantFeedback}
            flagged={session.flagged.includes(questionId)}
            onAnswer={(selected) => onAnswer(questionId, selected)}
            onToggleFlag={() => onToggleFlag(questionId)}
          />

          {/* Nav controls */}
          <div className="mt-8 flex items-center justify-between gap-3">
            <Button
              variant="outline"
              onClick={onPrev}
              disabled={session.current === 0}
              className="gap-1.5"
            >
              <ChevronLeft className="size-4" />
              Previous
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => onToggleFlag(questionId)}
              className="gap-1.5 text-muted-foreground"
            >
              <Flag
                className={
                  session.flagged.includes(questionId)
                    ? "size-4 fill-chart-5 text-chart-5"
                    : "size-4"
                }
              />
              {session.flagged.includes(questionId) ? "Flagged" : "Flag"}
            </Button>

            {session.current === session.order.length - 1 ? (
              <Button onClick={() => setConfirmOpen(true)} className="gap-1.5">
                Finish
                <Send className="size-4" />
              </Button>
            ) : (
              <Button onClick={onNext} className="gap-1.5">
                Next
                <ChevronRight className="size-4" />
              </Button>
            )}
          </div>
        </main>

        {/* Desktop navigator */}
        <aside className="hidden w-64 shrink-0 lg:block">
          <div className="sticky top-24 rounded-2xl border border-border bg-card p-4">
            <ExamNavigator
              order={session.order}
              answers={session.answers}
              flagged={session.flagged}
              current={session.current}
              instantFeedback={session.instantFeedback}
              onGoTo={onGoTo}
            />
          </div>
        </aside>
      </div>

      {/* Mobile navigator drawer */}
      {navOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-foreground/40 backdrop-blur-sm"
            onClick={() => setNavOpen(false)}
          />
          <div className="absolute inset-y-0 right-0 flex w-[85%] max-w-sm flex-col bg-card p-5 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <span className="font-semibold">Navigator</span>
              <Button variant="ghost" size="icon" onClick={() => setNavOpen(false)}>
                <X className="size-5" />
              </Button>
            </div>
            <div className="min-h-0 flex-1">
              <ExamNavigator
                order={session.order}
                answers={session.answers}
                flagged={session.flagged}
                current={session.current}
                instantFeedback={session.instantFeedback}
                onGoTo={(i) => {
                  onGoTo(i)
                  setNavOpen(false)
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Submit confirmation */}
      {confirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-foreground/40 backdrop-blur-sm"
            onClick={() => setConfirmOpen(false)}
          />
          <div className="relative w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-xl">
            <h2 className="text-lg font-semibold">Submit exam?</h2>
            <p className="mt-2 text-sm text-muted-foreground text-pretty">
              You&apos;ve answered{" "}
              <span className="font-medium text-foreground">
                {answeredCount} of {session.order.length}
              </span>{" "}
              questions.
              {unanswered > 0 && (
                <>
                  {" "}
                  <span className="font-medium text-foreground">
                    {unanswered}
                  </span>{" "}
                  will be marked as unanswered.
                </>
              )}{" "}
              You can review your full breakdown afterward.
            </p>
            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <Button variant="outline" onClick={() => setConfirmOpen(false)}>
                Keep going
              </Button>
              <Button
                onClick={() => {
                  setConfirmOpen(false)
                  onSubmit()
                }}
              >
                Submit exam
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
