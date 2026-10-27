export type Choice = 'a' | 'b' | 'c'

export type CategoryName =
  | 'Zákon o zbraních'
  | 'Prováděcí předpisy'
  | 'Jiné předpisy'
  | 'Nauka o zbraních'
  | 'Zdravotnické minimum'

export type ExamGroup = 'pravni' | 'nauka' | 'bezpecnost' | 'zdravotnicke'

export interface Question {
  id: number
  cat: CategoryName
  q: string
  a: string
  b: string
  c: string
  correct: Choice
  images: string[]
}

export interface Category {
  id: string
  name: CategoryName
  group: ExamGroup
  range: [number, number]
  count: number
}

export interface ExamCompositionPart {
  group: ExamGroup
  label: string
  categories: CategoryName[]
  /** Inclusive question-id ranges; they claim a question before any category match. */
  ranges?: [number, number][]
  count: number
}

export interface ExamConfig {
  legalBasis: string
  legalBasisUrls: string[]
  totalQuestions: number
  composition: ExamCompositionPart[]
  passThreshold: number
  passThresholdExtended: number
  timeLimitMinutes: number
}

export interface Meta {
  source: string
  sourceUrl: string
  totalQuestions: number
  categories: Category[]
  exam: ExamConfig
  duplicatePairs: [number, number][]
}
