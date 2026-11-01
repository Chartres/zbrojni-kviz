/** Local calendar date as YYYY-MM-DD (used for the daily-lesson streak). */
export function todayStr(d: Date = new Date()): string {
  return d.toLocaleDateString('sv-SE')
}
