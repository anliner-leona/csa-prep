"use client"

import { useRef, useState } from "react"
import { ListChecks, Shuffle, Timer, Zap, Layers, Play } from "lucide-react"
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
  const [selectedSource, setSelectedSource] = useState(SOURCES[0])
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([])

  const selectedCount = QUESTIONS.filter((q) => q.source === selectedSource).length

  const canStart = selectedCount > 0

  const handleTabKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>, index: number) => {
    let nextIndex = index
    if (event.key === "ArrowRight") nextIndex = (index + 1) % SOURCES.length
    else if (event.key === "ArrowLeft") nextIndex = (index - 1 + SOURCES.length) % SOURCES.length
    else if (event.key === "Home") nextIndex = 0
    else if (event.key === "End") nextIndex = SOURCES.length - 1
    else return
    event.preventDefault()
    setSelectedSource(SOURCES[nextIndex])
    tabRefs.current[nextIndex]?.focus()
  }

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
          {selectedSource === "CIS-DF" && (
            <p className="mb-3 rounded-xl border border-border bg-secondary/50 p-4 text-sm text-muted-foreground">
              CIS-DF scoring uses the pink-highlighted answers in the source PDF. The PDF warns that some highlights may be wrong, so cross-check the key. We could recover 187 of 200 numbered items; 13 without usable question or answer data are excluded.
            </p>
          )}
          <div
            role="tablist"
            aria-label="Choose an exam"
            className="flex w-full gap-1 overflow-x-auto rounded-xl border border-border bg-secondary/50 p-1"
          >
            {SOURCES.map((source, index) => {
              const count = QUESTIONS.filter((q) => q.source === source).length
              const active = selectedSource === source
              return (
                <button
                  key={source}
                  ref={(element) => { tabRefs.current[index] = element }}
                  id={`exam-tab-${index}`}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  aria-controls="exam-tab-panel"
                  tabIndex={active ? 0 : -1}
                  onKeyDown={(event) => handleTabKeyDown(event, index)}
                  onClick={() => setSelectedSource(source)}
                  className={`min-h-11 flex-1 whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium transition-colors sm:text-base ${
                    active
                      ? "bg-card text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {source}
                </button>
              )
            })}
          </div>
          <div
            id="exam-tab-panel"
            role="tabpanel"
            aria-labelledby={`exam-tab-${SOURCES.indexOf(selectedSource)}`}
            tabIndex={0}
            className="mt-3 rounded-xl border border-border bg-card p-4"
          >
            <p className="font-medium">{selectedSource}</p>
            <p className="text-sm text-muted-foreground">
              {selectedSource === "ServiceNow CAD"
                ? `${selectedCount} questions across six practice tests`
                : selectedSource === "CIS-DF"
                  ? `${selectedCount} usable questions · multiple choice + matching`
                  : `${selectedCount} questions`}
            </p>
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
                sources: [selectedSource],
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
