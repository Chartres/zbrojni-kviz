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
  /** For a verbatim duplicate in the MV file: the id of its first copy. */
  canonicalId?: number | null
  /** The page_view beacon (src/seo/beacon.mjs); omitted when the build has no Supabase config. */
  beaconSrc?: string | null
}): string
