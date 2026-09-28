import type { ReactNode } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Diagram } from '../components/Diagram'
import { ServiceIcon } from '../components/ServiceIcon'
import { TierBadge } from '../components/TierBadge'
import { Bullets, Page } from '../components/ui'
import { serviceById, services, tierOf } from '../lib/content'

export default function Compare() {
  const [params, setParams] = useSearchParams()
  const a = serviceById.get(params.get('a') ?? '')
  const b = serviceById.get(params.get('b') ?? '')
  const set = (key: 'a' | 'b', v: string) => {
    const next = new URLSearchParams(params)
    next.set(key, v)
    setParams(next, { replace: true })
  }
  const note = a && b && (a.comparesWith.find((c) => c.serviceId === b.id) ?? b.comparesWith.find((c) => c.serviceId === a.id))

  const rows: [string, (s: NonNullable<typeof a>) => ReactNode][] = [
    ['What', (s) => s.oneLiner],
    ['Use when', (s) => <Bullets items={s.whenToUse} />],
    ['Avoid when', (s) => <Bullets items={s.whenNotToUse} />],
    ['Key facts', (s) => <Bullets items={s.keyFacts} />],
    ['Pricing', (s) => s.pricingModel],
  ]

  return (
    <Page title="Compare" back>
      <div className="mb-4 grid grid-cols-2 gap-2">
        {(['a', 'b'] as const).map((k) => (
          <select
            key={k}
            value={params.get(k) ?? ''}
            onChange={(e) => set(k, e.target.value)}
            className="w-full rounded-xl border border-slate-300 bg-white px-2 py-2 text-sm dark:border-slate-700 dark:bg-slate-900"
          >
            <option value="">Pick a service…</option>
            {services.services.map((s) => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
        ))}
      </div>
      {note && <div className="card mb-4 border-accent/60 text-[15px]"><strong>Key difference: </strong>{note.difference}</div>}
      {a && b && (
        <div className="mb-4 grid grid-cols-2 gap-2">
          {[a, b].map((s) => (
            <div key={s.id} className="card flex flex-col items-center gap-2 p-3 text-center">
              <ServiceIcon id={s.id} size={56} />
              <span className="text-sm font-semibold leading-tight">{s.name}</span>
              <TierBadge tier={tierOf(s.id)} />
            </div>
          ))}
        </div>
      )}
      {a && b && (
        <div className="space-y-4">
          {rows.map(([label, render]) => (
            <div key={label}>
              <h2 className="mb-1 text-sm font-semibold uppercase tracking-wide muted">{label}</h2>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="card p-3">{render(a)}</div>
                <div className="card p-3">{render(b)}</div>
              </div>
            </div>
          ))}
          {[a, b].filter((s) => s.diagram).map((s) => (
            <div key={s.id}>
              <h2 className="mb-1 text-sm font-semibold uppercase tracking-wide muted">How {s.name} fits</h2>
              <Diagram src={s.diagram!} caption={s.diagramCaption} title={s.name} />
            </div>
          ))}
        </div>
      )}
    </Page>
  )
}
