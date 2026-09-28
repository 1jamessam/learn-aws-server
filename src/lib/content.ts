import type { z } from 'zod'
import type {
  FlashcardsFile,
  LeadershipFile,
  QuizFile,
  ScenariosFile,
  ServicesFile,
  WellArchitectedFile,
} from './schema'
import servicesJson from '../../content/services.json'
import waJson from '../../content/well-architected.json'
import scenariosJson from '../../content/scenarios.json'
import quizJson from '../../content/quiz.json'
import flashcardsJson from '../../content/flashcards.json'
import leadershipJson from '../../content/leadership.json'

export const services = servicesJson as z.infer<typeof ServicesFile>
export const wellArchitected = waJson as z.infer<typeof WellArchitectedFile>
export const scenarios = scenariosJson as z.infer<typeof ScenariosFile>
export const quiz = quizJson as z.infer<typeof QuizFile>
export const flashcards = flashcardsJson as z.infer<typeof FlashcardsFile>
export const leadership = leadershipJson as z.infer<typeof LeadershipFile>

export const serviceById = new Map(services.services.map((s) => [s.id, s]))

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
