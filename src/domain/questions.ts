import rawQuestions from '@data/questions.json'
import rawMeta from '@data/meta.json'
import type {
  CategoryName,
  ExamGroup,
  Meta,
  Question,
} from './types'

export const ALL_QUESTIONS = rawQuestions as Question[]
export const META = rawMeta as Meta

const BY_ID = new Map<number, Question>(ALL_QUESTIONS.map((q) => [q.id, q]))

export function getQuestion(id: number): Question | undefined {
  return BY_ID.get(id)
}

export function byCategory(cat: CategoryName): Question[] {
  return ALL_QUESTIONS.filter((q) => q.cat === cat)
}

// The official file has no "safe handling" section, but the test draws 5 questions from it
// (NV 238/2025 § 12). Parts with id ranges claim their questions first; the rest go by category.
function resolveGroup(q: Question): ExamGroup {
  const parts = META.exam.composition
  const byRange = parts.find((p) => p.ranges?.some(([lo, hi]) => q.id >= lo && q.id <= hi))
  const part = byRange ?? parts.find((p) => p.categories.includes(q.cat))
  if (!part) throw new Error(`question ${q.id} belongs to no exam part`)
  return part.group
}

const GROUP_BY_ID = new Map<number, ExamGroup>(ALL_QUESTIONS.map((q) => [q.id, resolveGroup(q)]))

export function examGroupOf(q: Question): ExamGroup {
  return GROUP_BY_ID.get(q.id)!
}

export function questionsForGroup(group: ExamGroup): Question[] {
  return ALL_QUESTIONS.filter((q) => GROUP_BY_ID.get(q.id) === group)
}
