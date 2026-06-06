import { AppProvider, useApp } from '@/app/AppContext'
import { AuthProvider } from '@/auth/AuthContext'
import { AuthPanel } from '@/components/AuthPanel'
import { MenuScreen } from '@/components/screens/MenuScreen'
import { QuizScreen } from '@/components/screens/QuizScreen'
import { ResultsScreen } from '@/components/screens/ResultsScreen'
import { StudyScreen } from '@/components/screens/StudyScreen'
import { StatsScreen } from '@/components/screens/StatsScreen'

function CurrentView() {
  const { state } = useApp()
  switch (state.view) {
    case 'quiz':
    case 'exam':
      return <QuizScreen />
    case 'results':
      return <ResultsScreen />
    case 'study':
      return <StudyScreen />
    case 'stats':
      return <StatsScreen />
    case 'menu':
    default:
      return <MenuScreen />
  }
}

export function App() {
  return (
    <AuthProvider>
      <AppProvider>
        <div className="flex min-h-full flex-col metal-grain">
          <header className="flex items-center justify-end px-4 py-3">
            <AuthPanel />
          </header>
          <main className="flex-1">
            <CurrentView />
          </main>
          <footer className="border-t border-steel-800 py-6 text-center text-xs text-steel-600">
            Neoficiální procvičovací nástroj · otázky © Ministerstvo vnitra ČR ·
            zákon 90/2024 Sb.
          </footer>
        </div>
      </AppProvider>
    </AuthProvider>
  )
}
