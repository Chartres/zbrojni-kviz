/** Czech plural: 1 → one, 2–4 → few, 0 and 5+ → many. */
const plural = (n: number, one: string, few: string, many: string): string =>
  n === 1 ? one : n >= 2 && n <= 4 ? few : many

/** Czech plural: days (den/dny/dní). */
export const days = (n: number): string => plural(n, 'den', 'dny', 'dní')

/** Czech plural: questions (otázka/otázky/otázek). */
export const questions = (n: number): string => plural(n, 'otázka', 'otázky', 'otázek')

/** Czech plural: classes (třída/třídy/tříd). */
export const classes = (n: number): string => plural(n, 'třída', 'třídy', 'tříd')

/** Czech plural: learners (žák/žáci/žáků). */
export const learners = (n: number): string => plural(n, 'žák', 'žáci', 'žáků')
