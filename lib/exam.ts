import rawQuestions from "./questions.json"

export interface Choice {
  label: string
  text: string
  correct: boolean
}

export interface Question {
  id: number
  source: string
  sourceNumber: number
  question: string
  choices: Choice[]
  /** number of correct answers */
  answerCount: number
  /** true when more than one correct answer is expected */
  multi: boolean
}

interface RawQuestion {
  source: string
  sourceNumber: number
  question: string
  choices: Choice[]
}

export const QUESTIONS: Question[] = (rawQuestions as RawQuestion[]).map((q, i) => {
  const answerCount = q.choices.filter((c) => c.correct).length
  return {
    id: i,
    source: q.source,
    sourceNumber: q.sourceNumber,
    question: q.question,
    choices: q.choices,
    answerCount,
    multi: answerCount > 1,
  }
})

export const TOTAL_QUESTIONS = QUESTIONS.length

export const SOURCES = Array.from(new Set(QUESTIONS.map((q) => q.source)))

/** Fisher-Yates shuffle returning a new array. */
export function shuffle<T>(input: T[]): T[] {
  const arr = [...input]
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}

/** Returns the set of correct choice labels for a question. */
export function correctLabels(q: Question): string[] {
  return q.choices.filter((c) => c.correct).map((c) => c.label)
}

/** Determines whether the selected labels exactly match the correct answers. */
export function isCorrect(q: Question, selected: string[]): boolean {
  const correct = correctLabels(q)
  if (selected.length !== correct.length) return false
  const set = new Set(correct)
  return selected.every((s) => set.has(s))
}

export function formatTime(totalSeconds: number): string {
  const s = Math.max(0, Math.floor(totalSeconds))
  const h = Math.floor(s / 3600)
  const m = Math.floor((s % 3600) / 60)
  const sec = s % 60
  const pad = (n: number) => n.toString().padStart(2, "0")
  return h > 0 ? `${h}:${pad(m)}:${pad(sec)}` : `${pad(m)}:${pad(sec)}`
}
