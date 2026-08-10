"use client"

import { useEffect, useState } from "react"
import { Clock } from "lucide-react"
import { formatTime } from "@/lib/exam"

interface ExamTimerProps {
  startedAt: number
  submittedAt: number | null
  className?: string
}

export function ExamTimer({ startedAt, submittedAt, className }: ExamTimerProps) {
  const [now, setNow] = useState(() => Date.now())

  useEffect(() => {
    if (submittedAt) return
    const id = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(id)
  }, [submittedAt])

  const end = submittedAt ?? now
  const elapsed = Math.floor((end - startedAt) / 1000)

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-mono tabular-nums ${className ?? ""}`}
    >
      <Clock className="size-4 shrink-0" aria-hidden="true" />
      <span aria-label="Elapsed time">{formatTime(elapsed)}</span>
    </span>
  )
}
