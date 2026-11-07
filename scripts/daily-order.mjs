// Writes data/daily-order.json once: the bank in the order Otázka dne serves it (test D).
// Frozen as data so a change to the bank never reshuffles past or future days. New question ids
// are appended at the end (run with --append); ids no longer in the bank are skipped at runtime.
import { readFileSync, writeFileSync, existsSync } from 'node:fs'
const root = new URL('../', import.meta.url).pathname
const ids = JSON.parse(readFileSync(`${root}data/questions.json`, 'utf8')).map((q) => q.id).sort((a, b) => a - b)
const path = `${root}data/daily-order.json`
let order
if (existsSync(path)) {
  order = JSON.parse(readFileSync(path, 'utf8')).order
  if (!process.argv.includes('--append')) throw new Error('daily-order.json exists; use --append to add new ids')
  for (const id of ids) if (!order.includes(id)) order.push(id)
} else {
  // mulberry32, seed 20261107 (the start of test D)
  let a = 20261107
  const rng = () => {
    a |= 0; a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
  order = [...ids]
  for (let i = order.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1))
    ;[order[i], order[j]] = [order[j], order[i]]
  }
}
writeFileSync(path, JSON.stringify({ epoch: '2026-11-07', note: 'Otázka dne order. Append only.', order }) + '\n')
console.log(`daily-order.json: ${order.length} ids`)
