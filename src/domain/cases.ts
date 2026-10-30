// Case method (Langdell): the questions that turn on a situation (nutná obrana, carrying in
// public, minors) are grouped as cases. The learner reads the situation, answers the rules it
// raises one by one, and after each answer sees the rule and the provision that decides it.
// Generated from data/cases.src.json by scripts/cases.mjs; quotes are verbatim from data/law.
import raw from '@data/cases.json'
import { getQuestion } from './questions'
import { headingFor, type Source } from './sources'
import type { Question } from './types'

interface RawCase {
  slug: string
  title: string
  situation: string
  ids: number[]
  provisions: { act: string; label: string; url: string; text: string }[]
}

export interface Case {
  slug: string
  title: string
  /** The situation, told plainly; it asks, the questions and provisions answer. */
  situation: string
  /** In teaching order: definition first, then the rule, then its limits. */
  questions: Question[]
  /** The provisions that decide the case, verbatim. */
  provisions: Source[]
}

export const CASES: Case[] = (raw as { cases: RawCase[] }).cases.map((c) => ({
  slug: c.slug,
  title: c.title,
  situation: c.situation,
  questions: c.ids.map((id) => {
    const q = getQuestion(id)
    if (!q) throw new Error(`case ${c.slug}: no question ${id}`)
    return q
  }),
  provisions: c.provisions.map((p) => ({
    heading: headingFor(p.act),
    label: p.label,
    act: p.act,
    url: p.url,
    quote: p.text,
  })),
}))

export function caseBySlug(slug: string): Case | undefined {
  return CASES.find((c) => c.slug === slug)
}
