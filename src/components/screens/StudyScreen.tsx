import { useApp } from '@/app/AppContext'
import { META } from '@/domain/questions'
import { STUDY_GUIDE_HTML } from '@/content/studyGuide'

export function StudyScreen() {
  const { dispatch } = useApp()
  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-10">
      <button
        type="button"
        onClick={() => dispatch({ type: 'goMenu' })}
        className="mb-6 text-sm text-steel-400 hover:text-brass-400"
      >
        ← Zpět
      </button>
      <h1 className="font-display text-3xl font-bold uppercase tracking-tight text-steel-50">
        Studijní průvodce
      </h1>
      <p className="mt-2 text-sm text-steel-400">
        Zkouška: {META.exam.totalQuestions} otázek, {META.exam.timeLimitMinutes}{' '}
        minut, k úspěchu {META.exam.passThreshold} správně. Zdroj otázek:{' '}
        <a
          href={META.sourceUrl}
          target="_blank"
          rel="noreferrer"
          className="text-brass-400 underline"
        >
          Ministerstvo vnitra ČR
        </a>
        .
      </p>

      <article
        className="study-prose mt-8"
        dangerouslySetInnerHTML={{ __html: STUDY_GUIDE_HTML }}
      />
    </div>
  )
}
