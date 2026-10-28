// Ad fontes: every question that restates a provision of the law links to that provision and
// quotes it verbatim. The links come from data/cite.py (matched, then accepted only above a
// threshold calibrated on blind grading); a question without a confident match gets nothing.
// Czech statutes are úřední díla and may be quoted freely.
import raw from '@data/citations.json'

interface Act {
  name: string
  url: string
  retrieved: string
}

interface Cite {
  act: string
  label: string
  anchor: string
  quote: string
}

const DATA = raw as { acts: Record<string, Act>; questions: Record<string, Cite> }

export interface Source {
  /** "Ze zákona" or "Z nařízení vlády": what kind of text is being quoted. */
  heading: string
  /** "§ 20 odst. 3 písm. a)" */
  label: string
  /** Full name of the act. */
  act: string
  /** Deep link to the provision in the consolidated text. */
  url: string
  /** The provision verbatim; text before " … " is its parent's lead-in. */
  quote: string
}

export function sourceFor(questionId: number): Source | undefined {
  const c = DATA.questions[String(questionId)]
  if (!c) return undefined
  const act = DATA.acts[c.act]
  return { heading: headingFor(act.name), label: c.label, act: act.name, url: `${act.url}#${c.anchor}`, quote: c.quote }
}

export function headingFor(actName: string): string {
  return actName.startsWith('Nařízení vlády') ? 'Z nařízení vlády' : 'Ze zákona'
}

export function citedCount(): number {
  return Object.keys(DATA.questions).length
}
