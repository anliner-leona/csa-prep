"use client"

import { useState } from "react"
import { Check, ListChecks, Shuffle, Timer, Zap, Layers, Play } from "lucide-react"
import { Button } from "@/components/ui/button"
import { QUESTIONS, SOURCES, TOTAL_QUESTIONS } from "@/lib/exam"
import type { ExamConfig } from "@/hooks/use-exam-session"

interface StartScreenProps {
  onStart: (config: ExamConfig) => void
  hasSavedSession: boolean
  onResume: () => void
}

interface ToggleRowProps {
  icon: React.ReactNode
  title: string
  description: string
  checked: boolean
  onChange: (v: boolean) => void
}

function ToggleRow({ icon, title, description, checked, onChange }: ToggleRowProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className="group flex w-full items-center gap-4 rounded-xl border border-border bg-card p-4 text-left transition-colors hover:border-primary/40"
    >
      <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-secondary text-secondary-foreground">
        {icon}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block font-medium leading-tight">{title}</span>
        <span className="mt-0.5 block text-sm text-muted-foreground text-pretty">
          {description}
        </span>
      </span>
      <span
        className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${
          checked ? "bg-primary" : "bg-input"
        }`}
      >
        <span
          className={`absolute top-0.5 size-5 rounded-full bg-card shadow-sm transition-transform ${
            checked ? "translate-x-[22px]" : "translate-x-0.5"
          }`}
        />
      </span>
    </button>
  )
}

export function StartScreen({ onStart, hasSavedSession, onResume }: StartScreenProps) {
  const [instantFeedback, setInstantFeedback] = useState(true)
  const [shuffleQuestions, setShuffleQuestions] = useState(false)
  const [shuffleChoices, setShuffleChoices] = useState(false)
  const [selectedSources, setSelectedSources] = useState<string[]>([...SOURCES])

  const toggleSource = (source: string) => {
    setSelectedSources((prev) =>
      prev.includes(source)
        ? prev.filter((s) => s !== source)
        : [...prev, source],
    )
  }

  const selectedCount = QUESTIONS.filter(
    (q) => selectedSources.length === 0 || selectedSources.includes(q.source),
  ).length

  const canStart = selectedCount > 0

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-10 sm:py-16">
      <header className="mb-10 text-center">
        <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs font-medium uppercase tracking-wider text-muted-foreground">
          <span className="size-1.5 rounded-full bg-primary" />
          ServiceNow Certifications
        </span>
        <h1 className="mt-5 text-pretty text-4xl font-semibold tracking-tight sm:text-5xl">
          Mock Exam Trainer
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-pretty text-muted-foreground">
          Practice all {TOTAL_QUESTIONS} questions across CSA, CAD, and CIS-DF
          sets. Work through single-choice, multiple-answer, and matching questions,
          then review a scored breakdown of your results.
        </p>
      </header>

      {hasSavedSession && (
        <div className="mb-8 flex flex-col items-start gap-3 rounded-xl border border-primary/30 bg-primary/5 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="font-medium">You have an exam in progress</p>
            <p className="text-sm text-muted-foreground">
              Pick up right where you left off.
            </p>
          </div>
          <Button onClick={onResume} className="shrink-0">
            Resume exam
          </Button>
        </div>
      )}

      <section className="space-y-6">
        <div>
          <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            <Layers className="size-4" /> Question sets
          </h2>
          <p className="mb-3 rounded-xl border border-border bg-secondary/50 p-4 text-sm text-muted-foreground">
            CIS-DF scoring uses the pink-highlighted answers in the source PDF. The PDF warns that some highlights may be wrong, so cross-check the key. We could recover 187 of 200 numbered items; 13 without usable question or answer data are excluded.
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            {SOURCES.map((source) => {
              const count = QUESTIONS.filter((q) => q.source === source).length
              const active = selectedSources.includes(source)
              return (
                <button
                  key={source}
                  type="button"
                  aria-pressed={active}
                  onClick={() => toggleSource(source)}
                  className={`flex items-center justify-between rounded-xl border p-4 text-left transition-colors ${
                    active
                      ? "border-primary bg-primary/5"
                      : "border-border bg-card hover:border-primary/40"
                  }`}
                >
                  <span>
                    <span className="block font-medium">{source}</span>
                    <span className="text-sm text-muted-foreground">
                      {source === "ServiceNow CAD"
                        ? `${count} questions across six practice tests`
                        : source === "CIS-DF"
                          ? `${count} usable questions · multiple choice + matching`
                          : `${count} questions`}
                    </span>
                  </span>
                  <span
                    className={`flex size-6 items-center justify-center rounded-md border transition-colors ${
                      active
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border"
                    }`}
                  >
                    {active && <Check className="size-4" />}
                  </span>
                </button>
              )
            })}
          </div>
        </div>

        <div>
          <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            <ListChecks className="size-4" /> Options
          </h2>
          <div className="space-y-3">
            <ToggleRow
              icon={<Zap className="size-5" />}
              title="Instant feedback"
              description="Reveal the correct answer immediately after you answer each question."
              checked={instantFeedback}
              onChange={setInstantFeedback}
            />
            <ToggleRow
              icon={<Shuffle className="size-5" />}
              title="Shuffle questions"
              description="Randomize the order questions are presented in."
              checked={shuffleQuestions}
              onChange={setShuffleQuestions}
            />
            <ToggleRow
              icon={<Shuffle className="size-5" />}
              title="Shuffle answer choices"
              description="Randomize the available answer options for each question."
              checked={shuffleChoices}
              onChange={setShuffleChoices}
            />
          </div>
        </div>
      </section>

      <div className="sticky bottom-4 mt-10">
        <div className="flex items-center justify-between gap-4 rounded-2xl border border-border bg-card/80 p-4 shadow-lg backdrop-blur">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Timer className="size-4" />
            <span>
              <span className="font-semibold text-foreground">{selectedCount}</span>{" "}
              questions ready
            </span>
          </div>
          <Button
            size="lg"
            disabled={!canStart}
            onClick={() =>
              onStart({
                instantFeedback,
                shuffleQuestions,
                shuffleChoices,
                sources: selectedSources,
              })
            }
          >
            <Play className="size-4" />
            Start exam
          </Button>
        </div>
      </div>
    </div>
  )
}
