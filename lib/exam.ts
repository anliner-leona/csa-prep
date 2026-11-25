import rawQuestions from "./questions.json"
import cadQuestions from "./cad-questions.json"
import cisdfQuestions from "./cisdf-questions.json"

export interface Choice {
  label: string
  text: string
  correct: boolean
}

export interface MatchingPair {
  left: string
  right: string
}

export interface Question {
  id: number
  source: string
  sourceNumber: number
  testNumber?: number
  question: string
  choices: Choice[]
  matching?: MatchingPair[]
  matchOptions?: string[]
  /** number of correct answers */
  answerCount: number
  /** true when more than one correct answer is expected */
  multi: boolean
}

interface RawQuestion {
  source: string
  sourceNumber: number
  testNumber?: number
  question: string
  choices: Choice[]
  matching?: MatchingPair[]
}

const questionBank = [
  ...(rawQuestions as RawQuestion[]),
  ...(cadQuestions as RawQuestion[]),
  ...(cisdfQuestions as RawQuestion[]),
]

export const QUESTIONS: Question[] = questionBank.map((q, i) => {
  const answerCount = q.matching?.length ?? q.choices.filter((choice) => choice.correct).length
  return {
    id: i,
    source: q.source,
    sourceNumber: q.sourceNumber,
    testNumber: q.testNumber,
    question: q.question,
    choices: q.choices,
    matching: q.matching,
    matchOptions: q.matching
      ? Array.from(new Set(q.matching.map((pair) => pair.right)))
      : undefined,
    answerCount,
    multi: q.matching ? true : answerCount > 1,
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
  if (q.matching) {
    return q.matching.map((pair, pairIndex) => {
      const optionIndex = q.matchOptions?.indexOf(pair.right) ?? -1
      return `pair-${pairIndex}:option-${optionIndex}`
    })
  }
  return q.choices.filter((choice) => choice.correct).map((choice) => choice.label)
}

export function selectedMatchOption(selected: string[], pairIndex: number): number | null {
  const answer = selected.find((value) => value.startsWith(`pair-${pairIndex}:`))
  if (!answer) return null
  const optionIndex = Number(answer.split(":")[1]?.replace("option-", ""))
  return Number.isInteger(optionIndex) ? optionIndex : null
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
