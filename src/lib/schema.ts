import { z } from 'zod'

// Shared by the app (types) and scripts/validate-content.ts (runtime checks).

const id = z.string().regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, 'kebab-case id')
const url = z.string().url()

export const Meta = z.object({
  snapshotDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  sources: z.array(url).min(1),
})

export const Category = z.enum([
  'compute',
  'containers',
  'storage',
  'database',
  'networking',
  'security',
  'analytics',
  'ai-ml',
  'integration',
  'management',
  'devtools',
  'migration',
  'cost',
])
export type Category = z.infer<typeof Category>

export const Service = z.object({
  id, // e.g. "s3", "dynamodb", "bedrock-agentcore"
  name: z.string(), // "Amazon S3"
  category: Category,
  oneLiner: z.string(),
  whenToUse: z.array(z.string()).min(2),
  whenNotToUse: z.array(z.string()).min(1),
  keyFacts: z.array(z.string()).min(2), // limits, numbers, durability, quotas
  pricingModel: z.string(),
  comparesWith: z.array(z.object({ serviceId: id, difference: z.string() })),
  recentLaunches: z.array(z.object({ date: z.string(), title: z.string(), url: url.optional() })),
  interviewTips: z.array(z.string()),
  docs: url,
})
export type Service = z.infer<typeof Service>

export const ServicesFile = Meta.extend({ services: z.array(Service).min(60) })

export const Pillar = z.object({
  id,
  name: z.string(),
  summary: z.string(),
  designPrinciples: z.array(z.object({ title: z.string(), detail: z.string() })).min(3),
  keyQuestions: z.array(z.string()).min(3),
  keyServices: z.array(id),
  antiPatterns: z.array(z.string()),
})

export const WellArchitectedFile = Meta.extend({
  pillars: z.array(Pillar).length(6),
  lenses: z.array(z.object({ name: z.string(), summary: z.string() })),
  drStrategies: z.array(
    z.object({ name: z.string(), rto: z.string(), rpo: z.string(), cost: z.string(), description: z.string(), services: z.array(id) }),
  ),
  migrationStrategies: z.array(z.object({ name: z.string(), description: z.string(), example: z.string() })),
})

export const Scenario = z.object({
  id,
  title: z.string(),
  difficulty: z.enum(['associate', 'professional']),
  tags: z.array(z.string()),
  prompt: z.string(), // what the interviewer asks
  clarifyingQuestions: z.array(z.string()).min(3),
  referenceArchitecture: z.string(), // markdown
  services: z.array(id),
  tradeoffs: z.array(z.string()).min(2),
  followUps: z.array(z.string()).min(2),
  rubric: z.array(z.string()).min(3), // what a strong answer covers
})
export type Scenario = z.infer<typeof Scenario>

export const ScenariosFile = Meta.extend({ scenarios: z.array(Scenario).min(20) })

export const QuizQuestion = z.object({
  id,
  domain: z.enum(['resilient', 'performant', 'secure', 'cost', 'operations', 'migration', 'genai', 'networking']),
  difficulty: z.enum(['associate', 'professional']),
  question: z.string(),
  options: z.array(z.string()).min(3).max(6),
  answer: z.number().int().nonnegative(), // index into options
  explanation: z.string(),
  services: z.array(id),
})
export type QuizQuestion = z.infer<typeof QuizQuestion>

export const QuizFile = Meta.extend({ questions: z.array(QuizQuestion).min(200) })

export const Flashcard = z.object({
  id,
  deck: Category.or(z.enum(['well-architected', 'leadership', 'general'])),
  front: z.string(),
  back: z.string(),
  serviceId: id.optional(),
})
export type Flashcard = z.infer<typeof Flashcard>

export const FlashcardsFile = Meta.extend({ cards: z.array(Flashcard).min(300) })

export const LeadershipPrinciple = z.object({
  id,
  name: z.string(),
  description: z.string(), // official text
  whatTheyProbe: z.array(z.string()),
  samplePrompts: z.array(z.string()).min(3), // "Tell me about a time..."
  saAngle: z.string(), // how it shows up for a Solutions Architect
})
export type LeadershipPrinciple = z.infer<typeof LeadershipPrinciple>

export const LeadershipFile = Meta.extend({
  principles: z.array(LeadershipPrinciple).length(16),
  starTemplate: z.array(z.object({ step: z.string(), guidance: z.string() })),
  interviewLoop: z.array(z.object({ stage: z.string(), description: z.string(), tips: z.array(z.string()) })),
})
