"use client"

import { useEffect, useRef, useState } from "react"
import { StartScreen } from "@/components/start-screen"
import { ExamView } from "@/components/exam-view"
import { ResultsView } from "@/components/results-view"
import { useExamSession } from "@/hooks/use-exam-session"

type View = "home" | "exam" | "results"

export default function Page() {
  const {
    session,
    hydrated,
    start,
    reset,
    goTo,
    next,
    prev,
    answer,
    toggleFlag,
    submit,
  } = useExamSession()

  const [view, setView] = useState<View>("home")
  const bootstrapped = useRef(false)

  // On first hydration, jump to the right screen if a session exists.
  useEffect(() => {
    if (!hydrated || bootstrapped.current) return
    bootstrapped.current = true
    if (session?.status === "active") setView("exam")
    else if (session?.status === "submitted") setView("results")
  }, [hydrated, session])

  if (!hydrated) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <div className="size-8 animate-spin rounded-full border-2 border-border border-t-primary" />
      </main>
    )
  }

  if (view === "exam" && session && session.status === "active") {
    return (
      <main>
        <ExamView
          session={session}
          onExit={() => setView("home")}
          onGoTo={goTo}
          onNext={next}
          onPrev={prev}
          onAnswer={answer}
          onToggleFlag={toggleFlag}
          onSubmit={() => {
            submit()
            setView("results")
            window.scrollTo({ top: 0 })
          }}
        />
      </main>
    )
  }

  if (view === "results" && session) {
    return (
      <main>
        <ResultsView
          session={session}
          onRestart={() => {
            reset()
            setView("home")
            window.scrollTo({ top: 0 })
          }}
        />
      </main>
    )
  }

  return (
    <main>
      <StartScreen
        hasSavedSession={session?.status === "active"}
        onResume={() => setView("exam")}
        onStart={(config) => {
          start(config)
          setView("exam")
          window.scrollTo({ top: 0 })
        }}
      />
    </main>
  )
}
