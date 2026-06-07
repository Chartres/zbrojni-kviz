import { META } from '@/domain/questions'
import { STUDY_GUIDE_HTML } from '@/content/studyGuide'

export function StudyScreen() {
  return (
    <div className="mx-auto w-full max-w-3xl px-4 pt-2">
      <h1 className="font-display text-2xl font-bold uppercase tracking-tight text-steel-50">
        Studijní průvodce
      </h1>
      <p className="mt-1 text-sm text-steel-400">
        Zkouška: {META.exam.totalQuestions} otázek, {META.exam.timeLimitMinutes}{' '}
        minut, k úspěchu {META.exam.passThreshold} správně. Zdroj otázek:{' '}
        <a
          href={META.sourceUrl}
          target="_blank"
          rel="noreferrer"
          className="text-brass-400 underline"
        >
          oficiální PDF Ministerstva vnitra
        </a>
        .
      </p>

      <article
        className="study-prose mt-6"
        dangerouslySetInnerHTML={{ __html: STUDY_GUIDE_HTML }}
      />
    </div>
  )
}
