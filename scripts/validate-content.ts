import { readFileSync } from 'node:fs'
import type { z } from 'zod'
import {
  FlashcardsFile,
  LeadershipFile,
  QuizFile,
  ScenariosFile,
  ServicesFile,
  WellArchitectedFile,
} from '../src/lib/schema'

const load = (f: string) => JSON.parse(readFileSync(new URL(`../content/${f}`, import.meta.url), 'utf8'))
const errors: string[] = []

function check<T extends z.ZodType>(file: string, schema: T): z.infer<T> | null {
  const r = schema.safeParse(load(file))
  if (!r.success) {
    for (const i of r.error.issues.slice(0, 20)) errors.push(`${file}: ${i.path.join('.')} ${i.message}`)
    return null
  }
  return r.data
}

function unique(file: string, ids: string[]) {
  const seen = new Set<string>()
  for (const id of ids) {
    if (seen.has(id)) errors.push(`${file}: duplicate id ${id}`)
    seen.add(id)
  }
}

const canonical = readFileSync(new URL('../content/service-ids.txt', import.meta.url), 'utf8')
  .split('\n')
  .flatMap((l) => l.split(':')[1]?.trim().split(/\s+/) ?? [])
  .filter(Boolean)

const services = check('services.json', ServicesFile)
const wa = check('well-architected.json', WellArchitectedFile)
const scenarios = check('scenarios.json', ScenariosFile)
const quiz = check('quiz.json', QuizFile)
const cards = check('flashcards.json', FlashcardsFile)
const lps = check('leadership.json', LeadershipFile)

const serviceIds = new Set(services?.services.map((s) => s.id) ?? canonical)
const refs = (file: string, ids: string[]) => {
  for (const id of ids) if (!serviceIds.has(id)) errors.push(`${file}: unknown service id "${id}"`)
}

if (services) {
  unique('services.json', services.services.map((s) => s.id))
  for (const id of canonical) if (!serviceIds.has(id)) errors.push(`services.json: missing canonical service "${id}"`)
  refs('services.json comparesWith', services.services.flatMap((s) => s.comparesWith.map((c) => c.serviceId)))
}
if (wa) {
  refs('well-architected.json', [...wa.pillars.flatMap((p) => p.keyServices), ...wa.drStrategies.flatMap((d) => d.services)])
}
if (scenarios) {
  unique('scenarios.json', scenarios.scenarios.map((s) => s.id))
  refs('scenarios.json', scenarios.scenarios.flatMap((s) => s.services))
}
if (quiz) {
  unique('quiz.json', quiz.questions.map((q) => q.id))
  refs('quiz.json', quiz.questions.flatMap((q) => q.services))
  for (const q of quiz.questions) {
    if (q.answer >= q.options.length) errors.push(`quiz.json: ${q.id} answer index out of range`)
    if (new Set(q.options).size !== q.options.length) errors.push(`quiz.json: ${q.id} has duplicate options`)
  }
  const dist = [0, 0, 0, 0, 0, 0]
  for (const q of quiz.questions) dist[q.answer]++
  console.log('quiz answer position distribution:', dist.slice(0, 4).join(' / '))
}
if (cards) {
  unique('flashcards.json', cards.cards.map((c) => c.id))
  refs('flashcards.json', cards.cards.flatMap((c) => (c.serviceId ? [c.serviceId] : [])))
}
if (lps) unique('leadership.json', lps.principles.map((p) => p.id))

console.log(
  `services ${services?.services.length ?? '✗'} · scenarios ${scenarios?.scenarios.length ?? '✗'} · quiz ${quiz?.questions.length ?? '✗'} · cards ${cards?.cards.length ?? '✗'} · LPs ${lps?.principles.length ?? '✗'} · pillars ${wa?.pillars.length ?? '✗'}`,
)
if (errors.length) {
  console.error(`\n${errors.length} problem(s):\n` + errors.map((e) => `  - ${e}`).join('\n'))
  process.exit(1)
}
console.log('content OK')
