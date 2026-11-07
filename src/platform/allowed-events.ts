// Mirror of the insert policy "log known events" on public.events in flywheel-core
// (flywheel repo: data/signals/allowlist.json, which generates the policy; v2 read back live on 2026-11-01).
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
  // allow-list v2, live since 2026-11-01 (flywheel #117). Accepted here; this app sends none of
  // them yet (they belong to other products, or would change this app's taxonomy).
  'start_topic',
  'start_weak_drill',
  'start_projected',
  'guide_open',
  'council_convened',
  'council_replied',
  'council_blocked',
  'scan_completed',
  // v3, live since 2026-11-04 (not sent by this app)
  'whats_new_seen',
  'whats_new_dismissed',
  // v4, live since 2026-11-07 (flywheel #171; not sent by this app)
  'exam_result_reported',
] as const

export type AllowedEvent = (typeof ALLOWED_EVENTS)[number]
