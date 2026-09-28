import type { z } from 'zod'
import type {
  FlashcardsFile,
  LeadershipFile,
  QuizFile,
  ScenariosFile,
  ServiceDiagramsFile,
  ServicesFile,
  StudyPathFile,
  WellArchitectedFile,
} from './schema'
import servicesJson from '../../content/services.json'
import waJson from '../../content/well-architected.json'
import scenariosJson from '../../content/scenarios.json'
import quizJson from '../../content/quiz.json'
import flashcardsJson from '../../content/flashcards.json'
import leadershipJson from '../../content/leadership.json'
import studyPathJson from '../../content/study-path.json'
import { expandSvc, shortServiceName } from './diagram'

export const services = servicesJson as z.infer<typeof ServicesFile>
export const wellArchitected = waJson as z.infer<typeof WellArchitectedFile>
export const scenarios = scenariosJson as z.infer<typeof ScenariosFile>
export const quiz = quizJson as z.infer<typeof QuizFile>
export const flashcards = flashcardsJson as z.infer<typeof FlashcardsFile>
export const leadership = leadershipJson as z.infer<typeof LeadershipFile>

export const studyPath = studyPathJson as z.infer<typeof StudyPathFile>

// Per-service diagrams live in content/service-diagrams/*.json; merge them onto the services.
const diagramFiles = import.meta.glob<z.infer<typeof ServiceDiagramsFile>>('../../content/service-diagrams/*.json', {
  eager: true,
  import: 'default',
})
for (const file of Object.values(diagramFiles)) {
  for (const s of services.services) {
    const d = file[s.id]
    if (d && !s.diagram) Object.assign(s, d)
  }
}

export const serviceById = new Map(services.services.map((s) => [s.id, s]))

export type Tier = 'must' | 'should' | 'aware'
const tierMap = new Map<string, Tier>([
  ...studyPath.tiers.must.map((id) => [id, 'must'] as const),
  ...studyPath.tiers.should.map((id) => [id, 'should'] as const),
])
export const tierOf = (id: string): Tier => tierMap.get(id) ?? 'aware'
export const tierLabels: Record<Tier, string> = { must: 'Must know', should: 'Should know', aware: 'Awareness' }
const tierRank: Record<Tier, number> = { must: 0, should: 1, aware: 2 }
export const byTier = <T extends { id: string }>(a: T, b: T) => tierRank[tierOf(a.id)] - tierRank[tierOf(b.id)]

export const shortName = (id: string) => shortServiceName(serviceById.get(id)?.name ?? id)
export const expandDiagram = (src: string) => expandSvc(src, shortName, `${import.meta.env.BASE_URL}icons/`)

export const snapshotDate = services.snapshotDate

export const categoryLabels: Record<string, string> = {
  compute: 'Compute',
  containers: 'Containers',
  storage: 'Storage',
  database: 'Database',
  networking: 'Networking',
  security: 'Security & Identity',
  analytics: 'Analytics',
  'ai-ml': 'AI / ML',
  integration: 'Integration',
  management: 'Management',
  devtools: 'Developer Tools',
  migration: 'Migration',
  cost: 'Cost Management',
  'well-architected': 'Well-Architected',
  leadership: 'Leadership Principles',
  general: 'General',
}

export const domainLabels: Record<string, string> = {
  resilient: 'Resilient architectures',
  performant: 'High-performing',
  secure: 'Security',
  cost: 'Cost-optimized',
  operations: 'Operations',
  migration: 'Migration',
  genai: 'Generative AI',
  networking: 'Networking',
}

export function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}
