// Mirror of the insert policy "log known events" on public.events in flywheel-core
// (flywheel repo: scripts/sql/common-platform.sql; read back from pg_policies on 2026-10-27).
// A name missing there is dropped by the database without an error reaching the app.
// To send a new name: open a flywheel PR adding it to the policy first, then add it here.
export const ALLOWED_EVENTS = [
  // shared taxonomy
  'page_view',
  'signup_started',
  'signup_completed',
  'conversion',
  'key_action',
  'feedback_given',
  'error',
  // product names allowed for zbrojni-kviz
  'app_open',
  'start_lesson',
  'start_practice',
  'start_exam',
  'start_review',
  'start_bookmarks',
  'lesson_complete',
  'exam_finish',
  'session_finish',
] as const

export type AllowedEvent = (typeof ALLOWED_EVENTS)[number]
