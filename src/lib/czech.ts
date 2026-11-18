/** Czech plural: days (den/dny/dní). */
export const days = (n: number): string =>
  n === 1 ? 'den' : n <= 4 ? 'dny' : 'dní'

/** Czech plural: questions (otázka/otázky/otázek). */
export const questions = (n: number): string =>
  n === 1 ? 'otázka' : n <= 4 ? 'otázky' : 'otázek'
