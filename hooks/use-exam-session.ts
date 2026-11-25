"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { QUESTIONS, shuffle, type Question } from "@/lib/exam"

const STORAGE_KEY = "csa-exam-session-v1"

export interface ExamConfig {
  shuffleQuestions: boolean
  shuffleChoices: boolean
  instantFeedback: boolean
  sources: string[]
}

export interface ExamSession {
  status: "active" | "submitted"
  order: number[]
  /** per-question randomized choice-label order, keyed by question id */
  choiceOrder: Record<number, string[]>
  current: number
  answers: Record<number, string[]>
  flagged: number[]
  startedAt: number
  submittedAt: number | null
  instantFeedback: boolean
}

function loadSession(): ExamSession | null {
  if (typeof window === "undefined") return null
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as ExamSession
    if (!parsed.order || !Array.isArray(parsed.order)) return null
    return parsed
  } catch {
    return null
  }
}

function saveSession(session: ExamSession | null) {
  if (typeof window === "undefined") return
  try {
    if (session) {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(session))
    } else {
      window.localStorage.removeItem(STORAGE_KEY)
    }
  } catch {
    /* ignore quota errors */
  }
}

export function useExamSession() {
  const [session, setSession] = useState<ExamSession | null>(null)
  const [hydrated, setHydrated] = useState(false)

  // hydrate from localStorage on mount
  useEffect(() => {
    setSession(loadSession())
    setHydrated(true)
  }, [])

  // persist on change
  useEffect(() => {
    if (!hydrated) return
    saveSession(session)
  }, [session, hydrated])

  const start = useCallback((config: ExamConfig) => {
    const pool = QUESTIONS.filter(
      (q) => config.sources.length === 0 || config.sources.includes(q.source),
    )
    const ordered = config.shuffleQuestions ? shuffle(pool) : pool
    const order = ordered.map((q) => q.id)

    const choiceOrder: Record<number, string[]> = {}
    for (const q of ordered) {
      const labels = q.matching
        ? (q.matchOptions ?? []).map((_, index) => `option-${index}`)
        : q.choices.map((choice) => choice.label)
      choiceOrder[q.id] = config.shuffleChoices ? shuffle(labels) : labels
    }

    setSession({
      status: "active",
      order,
      choiceOrder,
      current: 0,
      answers: {},
      flagged: [],
      startedAt: Date.now(),
      submittedAt: null,
      instantFeedback: config.instantFeedback,
    })
  }, [])

  const reset = useCallback(() => {
    setSession(null)
  }, [])

  const goTo = useCallback((index: number) => {
    setSession((s) => {
      if (!s) return s
      const clamped = Math.max(0, Math.min(index, s.order.length - 1))
      return { ...s, current: clamped }
    })
  }, [])

  const next = useCallback(() => {
    setSession((s) => {
      if (!s) return s
      return { ...s, current: Math.min(s.current + 1, s.order.length - 1) }
    })
  }, [])

  const prev = useCallback(() => {
    setSession((s) => {
      if (!s) return s
      return { ...s, current: Math.max(s.current - 1, 0) }
    })
  }, [])

  const answer = useCallback((questionId: number, selected: string[]) => {
    setSession((s) => {
      if (!s) return s
      return { ...s, answers: { ...s.answers, [questionId]: selected } }
    })
  }, [])

  const toggleFlag = useCallback((questionId: number) => {
    setSession((s) => {
      if (!s) return s
      const has = s.flagged.includes(questionId)
      return {
        ...s,
        flagged: has
          ? s.flagged.filter((id) => id !== questionId)
          : [...s.flagged, questionId],
      }
    })
  }, [])

  const submit = useCallback(() => {
    setSession((s) => {
      if (!s) return s
      return { ...s, status: "submitted", submittedAt: Date.now() }
    })
  }, [])

  return {
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
    setSession,
  }
}

export function questionById(id: number): Question {
  return QUESTIONS[id]
}
