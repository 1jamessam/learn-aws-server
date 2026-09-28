import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Page, Section } from '../components/ui'
import { leadership, scenarios } from '../lib/content'
import { useProgress } from '../lib/progress'

export default function Mock() {
  const { progress } = useProgress()
  const [level, setLevel] = useState<string | null>(null)
  const list = scenarios.scenarios.filter((s) => !level || s.difficulty === level)
  const best = (id: string) => Math.max(0, ...(progress.mock[id] ?? []).map((a) => a.rating))

  return (
    <Page title="Mock interview">
      <p className="mb-4 text-sm muted">
        Answer out loud or in writing against the clock, then compare with the reference answer and rubric and rate yourself.
      </p>
      <Section title="System design">
        <div className="mb-3 flex gap-2">
          {[null, 'associate', 'professional'].map((l) => (
            <button key={l ?? 'all'} onClick={() => setLevel(l)} className={`chip ${level === l ? 'border-accent text-accent' : ''}`}>
              {l ?? 'All'}
            </button>
          ))}
        </div>
        <div className="space-y-2">
          {list.map((s) => (
            <Link key={s.id} to={`/mock/scenario/${s.id}`} className="card block py-3 hover:border-accent">
              <div className="flex items-baseline justify-between gap-2">
                <span className="font-semibold">{s.title}</span>
                <Stars n={best(`scenario:${s.id}`)} />
              </div>
              <div className="text-xs muted">{s.difficulty} · {s.tags.slice(0, 3).join(' · ')}</div>
            </Link>
          ))}
        </div>
      </Section>
      <Section title="Behavioral (Leadership Principles)">
        <div className="space-y-2">
          {leadership.principles.map((p) => (
            <Link key={p.id} to={`/mock/lp/${p.id}`} className="card flex items-center justify-between py-3 hover:border-accent">
              <span className="font-semibold">{p.name}</span>
              <span className="flex items-center gap-2">
                {progress.stories[p.id]?.trim() && <span className="text-xs text-accent">story ✓</span>}
                <Stars n={best(`lp:${p.id}`)} />
              </span>
            </Link>
          ))}
        </div>
      </Section>
    </Page>
  )
}

export function Stars({ n }: { n: number }) {
  if (!n) return null
  return <span className="shrink-0 text-xs text-accent">{'★'.repeat(n)}{'☆'.repeat(5 - n)}</span>
}
