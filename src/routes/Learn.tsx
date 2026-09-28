import type { ReactNode } from 'react'
import { useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { ServiceIcon } from '../components/ServiceIcon'
import { TierBadge } from '../components/TierBadge'
import { Page, Section } from '../components/ui'
import { byTier, categoryLabels, services, shortName, studyPath, tierLabels, tierOf, type Tier } from '../lib/content'
import { useProgress } from '../lib/progress'

const categories = [...new Set(services.services.map((s) => s.category))]
const mustIds = studyPath.tiers.must

export default function Learn() {
  const [params, setParams] = useSearchParams()
  const { progress } = useProgress()
  const view = params.get('view') === 'all' ? 'all' : 'path'
  const set = (k: string, v: string | null) => {
    const next = new URLSearchParams(params)
    if (v === null) next.delete(k)
    else next.set(k, v)
    setParams(next, { replace: true })
  }

  const learnedMust = mustIds.filter((id) => progress.learned[id]).length
  const nextUp = studyPath.stages.flatMap((s) => s.services).find((id) => !progress.learned[id])

  return (
    <Page title="Learn">
      <div className="card mb-4">
        <div className="mb-1 flex items-baseline justify-between">
          <span className="font-semibold">Must-know services</span>
          <span className="text-sm muted">{learnedMust}/{mustIds.length} learned</span>
        </div>
        <div className="mb-3 h-2 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
          <div className="h-full bg-accent transition-all" style={{ width: `${(100 * learnedMust) / mustIds.length}%` }} />
        </div>
        {nextUp ? (
          <Link to={`/learn/services/${nextUp}`} className="flex items-center gap-3 rounded-xl bg-slate-100 p-2 dark:bg-slate-800">
            <ServiceIcon id={nextUp} size={36} />
            <span className="flex-1 text-sm">
              <span className="block text-xs muted">Up next</span>
              <span className="font-semibold">{shortName(nextUp)}</span>
            </span>
            <span className="pr-2 text-accent">›</span>
          </Link>
        ) : (
          <p className="text-sm">Study path complete. Keep the knowledge fresh with Cards and Quiz. 🎉</p>
        )}
      </div>

      <div className="mb-6 grid grid-cols-2 gap-3">
        <Hub to="/learn/well-architected" title="Well-Architected" sub="Pillars · DR · 7 Rs" />
        <Hub to="/learn/leadership" title="Leadership Principles" sub="16 LPs · STAR stories" />
        <Hub to="/cards?deck=icons" title="Icon drill" sub="Memorize service icons" />
        <Hub to="/learn/compare" title="Compare services" sub="Side by side" />
        <Hub to="/news" title="What's New" sub="Live AWS feed" wide />
      </div>

      <div className="mb-4 grid grid-cols-2 gap-2">
        <button className={view === 'path' ? 'btn-primary' : 'btn-ghost'} onClick={() => set('view', null)}>Study path</button>
        <button className={view === 'all' ? 'btn-primary' : 'btn-ghost'} onClick={() => set('view', 'all')}>All {services.services.length} services</button>
      </div>

      {view === 'path' ? <PathView learned={progress.learned} /> : <AllView tier={params.get('tier') as Tier | null} cat={params.get('cat')} set={set} learned={progress.learned} />}
    </Page>
  )
}

function PathView({ learned }: { learned: Record<string, string> }) {
  return (
    <div className="space-y-4">
      <p className="text-sm muted">
        Work top to bottom. Stages 1–8 cover the must-know core that comes up in nearly every SA interview. Stage 9 is for once the core feels solid.
      </p>
      {studyPath.stages.map((stage) => {
        const done = stage.services.filter((id) => learned[id]).length
        return (
          <section key={stage.title} className="card">
            <div className="mb-1 flex items-baseline justify-between gap-2">
              <h2 className="font-semibold">{stage.title}</h2>
              <span className={`shrink-0 text-xs ${done === stage.services.length ? 'text-accent' : 'muted'}`}>{done}/{stage.services.length}</span>
            </div>
            <p className="mb-3 text-sm muted">{stage.why}</p>
            <div className="mb-3 grid grid-cols-3 gap-2 sm:grid-cols-4">
              {stage.services.map((id) => (
                <Link key={id} to={`/learn/services/${id}`} className="relative flex flex-col items-center gap-1 rounded-xl border border-slate-200 p-2 text-center hover:border-accent dark:border-slate-800">
                  <ServiceIcon id={id} size={44} />
                  <span className="line-clamp-2 text-[11px] leading-tight font-medium">{shortName(id)}</span>
                  {learned[id] && <span className="absolute top-1 right-1.5 text-xs text-accent">✓</span>}
                </Link>
              ))}
            </div>
            <div className="flex flex-wrap gap-1.5">
              {stage.concepts.map((c) => <span key={c} className="chip">{c}</span>)}
            </div>
          </section>
        )
      })}
    </div>
  )
}

function AllView({ tier, cat, set, learned }: { tier: Tier | null; cat: string | null; set: (k: string, v: string | null) => void; learned: Record<string, string> }) {
  const [q, setQ] = useState('')
  const list = useMemo(() => {
    const needle = q.trim().toLowerCase()
    return services.services
      .filter(
        (s) =>
          (!cat || s.category === cat) &&
          (!tier || tierOf(s.id) === tier) &&
          (!needle || `${s.name} ${s.id} ${s.oneLiner}`.toLowerCase().includes(needle)),
      )
      .sort((a, b) => byTier(a, b) || a.name.localeCompare(b.name))
  }, [q, cat, tier])

  return (
    <Section title={`${list.length} services`}>
      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Search services…"
        className="mb-3 w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 dark:border-slate-700 dark:bg-slate-900"
      />
      <div className="mb-2 flex gap-2">
        <Chip on={!tier} onClick={() => set('tier', null)}>All tiers</Chip>
        {(['must', 'should', 'aware'] as Tier[]).map((t) => (
          <Chip key={t} on={tier === t} onClick={() => set('tier', t)}>{tierLabels[t]}</Chip>
        ))}
      </div>
      <div className="-mx-4 mb-3 flex gap-2 overflow-x-auto px-4 pb-1">
        <Chip on={!cat} onClick={() => set('cat', null)}>All categories</Chip>
        {categories.map((c) => (
          <Chip key={c} on={cat === c} onClick={() => set('cat', c)}>{categoryLabels[c]}</Chip>
        ))}
      </div>
      <div className="space-y-2">
        {list.map((s) => (
          <Link key={s.id} to={`/learn/services/${s.id}`} className="card flex items-center gap-3 py-3 hover:border-accent">
            <ServiceIcon id={s.id} size={40} />
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="truncate font-semibold">{s.name}</span>
                {learned[s.id] && <span className="text-xs text-accent">✓</span>}
              </div>
              <p className="line-clamp-1 text-sm muted">{s.oneLiner}</p>
            </div>
            <TierBadge tier={tierOf(s.id)} />
          </Link>
        ))}
      </div>
    </Section>
  )
}

function Chip({ on, onClick, children }: { on: boolean; onClick: () => void; children: ReactNode }) {
  return <button onClick={onClick} className={`chip shrink-0 ${on ? 'border-accent text-accent' : ''}`}>{children}</button>
}

function Hub({ to, title, sub, wide }: { to: string; title: string; sub: string; wide?: boolean }) {
  return (
    <Link to={to} className={`card block hover:border-accent ${wide ? 'col-span-2' : ''}`}>
      <div className="font-semibold">{title}</div>
      <div className="text-xs muted">{sub}</div>
    </Link>
  )
}
