import { useState } from 'react'
import { Bullets, Page, Section, ServiceChips } from '../components/ui'
import { wellArchitected as wa } from '../lib/content'

export default function WellArchitected() {
  const [open, setOpen] = useState<string | null>(wa.pillars[0]?.id ?? null)
  return (
    <Page title="Well-Architected" back>
      <Section title="Six pillars">
        <div className="space-y-2">
          {wa.pillars.map((p) => (
            <div key={p.id} className="card">
              <button className="flex w-full items-center justify-between text-left" onClick={() => setOpen(open === p.id ? null : p.id)}>
                <span className="font-semibold">{p.name}</span>
                <span className="muted">{open === p.id ? '−' : '+'}</span>
              </button>
              {open === p.id && (
                <div className="mt-3 space-y-4">
                  <p className="text-[15px]">{p.summary}</p>
                  <Section title="Design principles">
                    <ul className="space-y-2 text-[15px]">
                      {p.designPrinciples.map((d) => (
                        <li key={d.title}><strong>{d.title}.</strong> {d.detail}</li>
                      ))}
                    </ul>
                  </Section>
                  <Section title="Questions reviewers ask"><Bullets items={p.keyQuestions} /></Section>
                  <Section title="Anti-patterns"><Bullets items={p.antiPatterns} /></Section>
                  <Section title="Key services"><ServiceChips ids={p.keyServices} /></Section>
                </div>
              )}
            </div>
          ))}
        </div>
      </Section>

      <Section title="Disaster recovery strategies">
        <div className="space-y-2">
          {wa.drStrategies.map((d) => (
            <div key={d.name} className="card">
              <div className="font-semibold">{d.name}</div>
              <div className="my-1 flex flex-wrap gap-1.5 text-xs">
                <span className="chip">RTO {d.rto}</span>
                <span className="chip">RPO {d.rpo}</span>
                <span className="chip">Cost {d.cost}</span>
              </div>
              <p className="mb-2 text-[15px]">{d.description}</p>
              <ServiceChips ids={d.services} />
            </div>
          ))}
        </div>
      </Section>

      <Section title="Migration strategies (7 Rs)">
        <div className="space-y-2">
          {wa.migrationStrategies.map((m) => (
            <div key={m.name} className="card">
              <div className="font-semibold">{m.name}</div>
              <p className="text-[15px]">{m.description}</p>
              <p className="mt-1 text-sm muted">e.g. {m.example}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Lenses">
        <div className="space-y-2">
          {wa.lenses.map((l) => (
            <div key={l.name} className="card py-3">
              <div className="font-semibold">{l.name}</div>
              <p className="text-sm muted">{l.summary}</p>
            </div>
          ))}
        </div>
      </Section>
    </Page>
  )
}
