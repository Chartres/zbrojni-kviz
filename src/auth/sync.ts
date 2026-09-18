import { mergeProgress, type ProgressData } from '@/domain/progress'

/** Abstraction over the cloud store so the sync logic is testable. */
export interface RemoteProgressStore {
  fetch(userId: string): Promise<ProgressData | null>
  save(userId: string, data: ProgressData): Promise<void>
}

/**
 * Reconcile local and cloud progress: pull remote, merge (last-write-wins per
 * question, union bookmarks), push the merged result, and return it. On any
 * network failure we keep working locally — sync is best-effort, never blocking.
 */
export async function syncProgress(
  store: RemoteProgressStore,
  userId: string,
  local: ProgressData,
): Promise<ProgressData> {
  let merged: ProgressData
  try {
    const remote = await store.fetch(userId)
    merged = remote ? mergeProgress(local, remote) : local
  } catch {
    return local
  }
  try {
    await store.save(userId, merged)
  } catch {
    // keep the merged view locally even if the upload failed
  }
  return merged
}
