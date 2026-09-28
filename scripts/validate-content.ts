import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { JSDOM } from 'jsdom'
import { expandSvc, svcRefs, unknownClasses } from '../src/lib/diagram'
import type { z } from 'zod'
import {
  FlashcardsFile,
  LeadershipFile,
  QuizFile,
  ScenariosFile,
  ServiceDiagramsFile,
  ServicesFile,
  StudyPathFile,
  WellArchitectedFile,
} from '../src/lib/schema'

const contentDir = new URL('../content/', import.meta.url)
const load = (f: string) => JSON.parse(readFileSync(new URL(f, contentDir), 'utf8'))
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

// Study path
const path = existsSync(new URL('study-path.json', contentDir)) ? check('study-path.json', StudyPathFile) : null
if (path) {
  const tiered = [...path.tiers.must, ...path.tiers.should]
  unique('study-path.json tiers', tiered)
  refs('study-path.json', [...tiered, ...path.stages.flatMap((s) => s.services)])
  for (const id of path.tiers.must)
    if (!path.stages.some((s) => s.services.includes(id))) errors.push(`study-path.json: must-know "${id}" is in no stage`)
}

// Diagrams: collect every Mermaid source, check conventions, then parse with Mermaid.
const diagrams: { where: string; src: string }[] = []
const diagramDir = new URL('service-diagrams/', contentDir)
let serviceDiagramCount = 0
if (existsSync(diagramDir)) {
  for (const f of readdirSync(diagramDir).filter((f) => f.endsWith('.json'))) {
    const d = check(`service-diagrams/${f}`, ServiceDiagramsFile)
    for (const [id, v] of Object.entries(d ?? {})) {
      if (!serviceIds.has(id)) errors.push(`service-diagrams/${f}: unknown service id "${id}"`)
      diagrams.push({ where: `service-diagrams/${f} ${id}`, src: v.diagram })
      serviceDiagramCount++
    }
  }
}
for (const s of services?.services ?? []) if (s.diagram) diagrams.push({ where: `services.json ${s.id}`, src: s.diagram })
for (const s of scenarios?.scenarios ?? []) if (s.diagram) diagrams.push({ where: `scenarios.json ${s.id}`, src: s.diagram })
for (const p of wa?.pillars ?? []) if (p.diagram) diagrams.push({ where: `well-architected.json pillar ${p.id}`, src: p.diagram })
for (const d of wa?.drStrategies ?? []) if (d.diagram) diagrams.push({ where: `well-architected.json DR ${d.name}`, src: d.diagram })
if (wa?.migrationDecisionTree) diagrams.push({ where: 'well-architected.json migrationDecisionTree', src: wa.migrationDecisionTree })

const iconDir = new URL('../public/icons/', import.meta.url)
const { window } = new JSDOM('')
Object.assign(globalThis, { window, document: window.document })
const { default: mermaid } = await import('mermaid')
const nameOf = (id: string) => services?.services.find((s) => s.id === id)?.name ?? id
for (const { where, src } of diagrams) {
  if (/classDef|%%\{|^\s*style /m.test(src)) errors.push(`${where}: must not define classDef/style/init (renderer injects them)`)
  for (const c of unknownClasses(src)) errors.push(`${where}: unknown node class ":::${c}"`)
  for (const id of svcRefs(src)) {
    if (!serviceIds.has(id)) errors.push(`${where}: @svc(${id}) is not a service id`)
    else if (!existsSync(new URL(`${id}.svg`, iconDir))) errors.push(`${where}: no icon for @svc(${id}); use a plain node`)
  }
  const nodes = new Set([...src.matchAll(/^\s*(\w+)\s*(?:@|\[|\(|\{|>)/gm)].map((m) => m[1]))
  if (nodes.size > 18) errors.push(`${where}: ${nodes.size} nodes; keep diagrams to about 14`)
  try {
    await mermaid.parse(expandSvc(src, nameOf))
  } catch (e) {
    errors.push(`${where}: Mermaid parse error: ${String((e as Error).message).split('\n').slice(0, 3).join(' | ')}`)
  }
}
console.log(`diagrams ${diagrams.length} (service ${serviceDiagramCount}, scenario ${scenarios?.scenarios.filter((s) => s.diagram).length ?? 0})`)

console.log(
  `services ${services?.services.length ?? '✗'} · scenarios ${scenarios?.scenarios.length ?? '✗'} · quiz ${quiz?.questions.length ?? '✗'} · cards ${cards?.cards.length ?? '✗'} · LPs ${lps?.principles.length ?? '✗'} · pillars ${wa?.pillars.length ?? '✗'}`,
)
if (errors.length) {
  console.error(`\n${errors.length} problem(s):\n` + errors.map((e) => `  - ${e}`).join('\n'))
  process.exit(1)
}
console.log('content OK')
