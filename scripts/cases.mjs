// Case method (Langdell): data/cases.src.json names each case's situation, its questions and the
// provisions that decide it, each with the questions (`for`) it decides; this writes data/cases.json with those provisions quoted verbatim
// from data/law/*.json, so the app ships the quote without the whole act.
// Run after editing cases.src.json: node scripts/cases.mjs (src/domain/cases.test.ts checks it).
import { readFileSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { resolveQuote } from '../src/seo/examPage.mjs'

const root = fileURLToPath(new URL('..', import.meta.url))
const src = JSON.parse(readFileSync(`${root}data/cases.src.json`, 'utf8'))
const acts = {}
const act = (id) => (acts[id] ??= JSON.parse(readFileSync(`${root}data/law/${id}.json`, 'utf8')))

const cases = src.cases.map((c) => ({
  ...c,
  provisions: c.provisions.map(({ for: ids, ...cite }) => ({
    cite,
    for: ids,
    ...resolveQuote({ [cite.act]: act(cite.act) }, cite),
  })),
}))
writeFileSync(`${root}data/cases.json`, JSON.stringify({ cases }, null, 2) + '\n')
console.log(`wrote ${cases.length} cases`)
