import type { Question } from '@/domain/types'
import type { Source } from '@/domain/sources'

export function questionPath(id: number): string

export function renderQuestionPage(p: {
  q: Question
  source: Source | null
  topic: { slug: string; category: string }
  prev: number | null
  next: number | null
  origin: string
  cssHref: string
}): string
