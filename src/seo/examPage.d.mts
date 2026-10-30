export interface ActData {
  name: string
  url: string
  units: { id: string; label: string; anchor: string; text: string; parent: string | null }[]
}
export interface Cite {
  act: string
  unit: string
  whole?: boolean
}

export const EXAM_PATH: string

export function resolveQuote(
  acts: Record<string, ActData>,
  cite: Cite,
): { label: string; act: string; url: string; text: string }

export function renderExamPage(p: {
  guide: { title: string; description: string; intro: string; faq: { q: string; a: string; cites: Cite[] }[] }
  acts: Record<string, ActData>
  origin: string
  cssHref: string
  beaconSrc?: string | null
}): string
