// Test C UI: a learner joins a class and sends a summary; the instructor's page collects it.
// No accounts, no server: the summary rides in the link, the class lives on the instructor's device.
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, cleanup, within } from '@testing-library/react'
import { App } from '@/App'
import { InstructorScreen } from './screens/InstructorScreen'
import { buildSummary, summaryLink } from '@/domain/classroom'
import { emptyProgress, recordAnswer } from '@/domain/progress'
import { CLASS_KEY, INSTRUCTOR_KEY, loadInstructorClasses, loadLearnerClass, saveInstructorClasses } from '@/domain/storage'

vi.mock('@/analytics', () => ({
  track: vi.fn(), identify: vi.fn(), feedback: vi.fn(), conversion: vi.fn(), logError: vi.fn(),
}))
import { track } from '@/analytics'

const ORIGIN = 'https://zbrojnikviz.dravec.org'

beforeEach(() => {
  cleanup()
  localStorage.clear()
  vi.mocked(track).mockClear()
  window.history.replaceState(null, '', '/')
})

function openStats() {
  render(<App />)
  fireEvent.click(within(screen.getByRole('navigation', { name: 'Hlavní navigace' })).getByRole('button', { name: /Postup/ }))
}

describe('learner: Poslat instruktorovi', () => {
  it('joins a class by code, then sends a summary link with the chosen name', () => {
    openStats()
    fireEvent.change(screen.getByLabelText('Kód třídy od instruktora'), { target: { value: 'k7q-m2d' } })
    fireEvent.change(screen.getByLabelText('Jméno pro instruktora'), { target: { value: 'Petr N.' } })
    fireEvent.click(screen.getByRole('button', { name: 'Uložit' }))
    expect(loadLearnerClass()).toMatchObject({ code: 'K7QM2D', name: 'Petr N.' })
    expect(track).toHaveBeenCalledWith('key_action', { kind: 'class_join', class: 'K7QM2D', via: 'code' })

    fireEvent.click(screen.getByRole('button', { name: 'Poslat instruktorovi' }))
    const link = (screen.getByLabelText('Odkaz pro instruktora') as HTMLInputElement).value
    expect(link).toMatch(/\/instruktor\/#z1\./)
    expect(track).toHaveBeenCalledWith('key_action', { kind: 'class_send', class: 'K7QM2D' })
  })

  it('rejects a mistyped code and asks for a name', () => {
    openStats()
    fireEvent.change(screen.getByLabelText('Kód třídy od instruktora'), { target: { value: 'K7QM2' } })
    fireEvent.click(screen.getByRole('button', { name: 'Uložit' }))
    expect(screen.getByRole('alert').textContent).toMatch(/kód/i)
    expect(localStorage.getItem(CLASS_KEY)).toBeNull()
  })

  it('a join link (/?trida=CODE) fills the code in, then leaves the address bar clean', () => {
    window.history.replaceState(null, '', '/?trida=K7Q-M2D')
    openStats()
    expect((screen.getByLabelText('Kód třídy od instruktora') as HTMLInputElement).value).toBe('K7Q-M2D')
    expect(window.location.search).toBe('')
  })
})

describe('instructor page', () => {
  it('creates a class code and shows the link for learners', () => {
    render(<InstructorScreen origin={ORIGIN} />)
    fireEvent.change(screen.getByLabelText('Název kurzu (jen pro vás)'), { target: { value: 'Kurz listopad' } })
    fireEvent.click(screen.getByRole('button', { name: 'Vytvořit kód třídy' }))
    const room = loadInstructorClasses()[0]
    expect(room.code).toMatch(/^[A-Z2-9]{6}$/)
    expect(screen.getByText(`${room.code.slice(0, 3)}-${room.code.slice(3)}`)).toBeTruthy()
    expect((screen.getByLabelText('Odkaz pro žáky') as HTMLInputElement).value).toBe(`${ORIGIN}/?trida=${room.code.slice(0, 3)}-${room.code.slice(3)}`)
    expect(track).toHaveBeenCalledWith('key_action', { kind: 'class_create', class: room.code, ref: null })
  })

  it('keeps the offer ref from the address (/instruktor/?ref=k03)', () => {
    window.history.replaceState(null, '', '/instruktor/?ref=k03')
    render(<InstructorScreen origin={ORIGIN} />)
    fireEvent.click(screen.getByRole('button', { name: 'Vytvořit kód třídy' }))
    expect(loadInstructorClasses()[0].ref).toBe('k03')
  })

  it('opening a learner link adds the learner to the class and shows where they stand', () => {
    saveInstructorClasses([{ code: 'K7QM2D', label: '', ref: null, createdAt: 1, learners: {} }])
    let p = emptyProgress()
    p = recordAnswer(p, 562, true, 1)
    const s = buildSummary(p, { code: 'K7QM2D', name: 'Žaneta Ř.', id: 'l-1' }, 1000)
    window.history.replaceState(null, '', summaryLink('', s))
    render(<InstructorScreen origin={ORIGIN} />)
    expect(screen.getByRole('status').textContent).toMatch(/Žaneta Ř\./)
    expect(within(screen.getByRole('list', { name: 'Žáci třídy K7Q-M2D' })).getByText('Žaneta Ř.')).toBeTruthy()
    expect(Object.keys(loadInstructorClasses()[0].learners)).toEqual(['l-1'])
    expect(window.location.hash).toBe('')
    expect(track).toHaveBeenCalledWith('key_action', { kind: 'class_receive', class: 'K7QM2D', learners: 1 })
  })

  it('a pasted link works the same; a summary for a class not on this device can be taken over', () => {
    render(<InstructorScreen origin={ORIGIN} />)
    const s = buildSummary(emptyProgress(), { code: 'ABCDEF', name: 'Petr', id: 'l-2' }, 1)
    fireEvent.change(screen.getByLabelText('Vložte odkaz od žáka'), { target: { value: summaryLink(ORIGIN, s) } })
    fireEvent.click(screen.getByRole('button', { name: 'Přidat' }))
    expect(screen.getByRole('status').textContent).toMatch(/ABC-DEF/)
    fireEvent.click(screen.getByRole('button', { name: 'Převzít třídu ABC-DEF na tomto zařízení' }))
    expect(loadInstructorClasses()[0].code).toBe('ABCDEF')
    expect(Object.keys(loadInstructorClasses()[0].learners)).toEqual(['l-2'])
    expect(localStorage.getItem(INSTRUCTOR_KEY)).toContain('ABCDEF')
  })

  it('the app serves the instructor page at /instruktor/', () => {
    window.history.replaceState(null, '', '/instruktor/')
    render(<App />)
    expect(screen.getByRole('heading', { name: /Pro instruktory/ })).toBeTruthy()
    expect(screen.queryByRole('navigation', { name: 'Hlavní navigace' })).toBeNull()
  })
})
