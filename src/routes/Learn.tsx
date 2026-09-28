import { useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Page, Section } from '../components/ui'
import { categoryLabels, services } from '../lib/content'

const categories = [...new Set(services.services.map((s) => s.category))]

export default function Learn() {
  const [params, setParams] = useSearchParams()
  const [q, setQ] = useState('')
  const cat = params.get('cat')
  const list = useMemo(() => {
    const needle = q.trim().toLowerCase()
    return services.services.filter(
      (s) =>
        (!cat || s.category === cat) &&
        (!needle || `${s.name} ${s.id} ${s.oneLiner}`.toLowerCase().includes(needle)),
    )
  }, [q, cat])

  return (
    <Page title="Learn">
      <div className="mb-6 grid grid-cols-2 gap-3">
        <Hub to="/learn/well-architected" title="Well-Architected" sub="6 pillars · DR · 7 Rs" />
        <Hub to="/learn/leadership" title="Leadership Principles" sub="16 LPs · STAR stories" />
        <Hub to="/news" title="What's New" sub="Live AWS feed" />
        <Hub to="/learn/compare" title="Compare services" sub="Side by side" />
      </div>

      <Section title={`Services (${list.length})`}>
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search services…"
          className="mb-3 w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 dark:border-slate-700 dark:bg-slate-900"
        />
        <div className="-mx-4 mb-3 flex gap-2 overflow-x-auto px-4 pb-1">
          <button onClick={() => setParams({})} className={`chip shrink-0 ${!cat ? 'border-accent text-accent' : ''}`}>
            All
          </button>
          {categories.map((c) => (
            <button
              key={c}
              onClick={() => setParams({ cat: c })}
              className={`chip shrink-0 ${cat === c ? 'border-accent text-accent' : ''}`}
            >
              {categoryLabels[c]}
            </button>
          ))}
        </div>
        <div className="space-y-2">
          {list.map((s) => (
            <Link key={s.id} to={`/learn/services/${s.id}`} className="card block py-3 hover:border-accent">
              <div className="flex items-baseline justify-between gap-2">
                <span className="font-semibold">{s.name}</span>
                {s.recentLaunches.length > 0 && <span className="shrink-0 text-[10px] font-bold uppercase text-accent">new</span>}
              </div>
              <p className="line-clamp-2 text-sm muted">{s.oneLiner}</p>
            </Link>
          ))}
        </div>
      </Section>
    </Page>
  )
}

function Hub({ to, title, sub }: { to: string; title: string; sub: string }) {
  return (
    <Link to={to} className="card block hover:border-accent">
      <div className="font-semibold">{title}</div>
      <div className="text-xs muted">{sub}</div>
    </Link>
  )
}
