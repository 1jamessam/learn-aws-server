import { useState } from 'react'
import { Diagram } from '../components/Diagram'
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
                  {p.diagram && <Diagram src={p.diagram} caption={p.diagramCaption} title={p.name} />}
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
        <DrSpectrum />
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
              {d.diagram && <div className="mb-2"><Diagram src={d.diagram} caption={d.diagramCaption} title={d.name} /></div>}
              <ServiceChips ids={d.services} />
            </div>
          ))}
        </div>
      </Section>

      <Section title="Migration strategies (7 Rs)">
        {wa.migrationDecisionTree && (
          <div className="mb-3"><Diagram src={wa.migrationDecisionTree} caption="Walk the questions top-down to pick a strategy per application." title="Choosing one of the 7 Rs" /></div>
        )}
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

// Headline of an RTO/RPO range, e.g. "Hours (commonly <24h)" -> "Hours".
const brief = (t: string) => t.split(/[;(]/)[0].trim()

// Visual scale: the four DR strategies from cheapest/slowest to most expensive/fastest.
function DrSpectrum() {
  const steps = wa.drStrategies
  return (
    <div className="card mb-3">
      <div className="mb-2 flex justify-between text-[11px] font-semibold uppercase tracking-wide muted">
        <span>Lower cost</span>
        <span>Faster recovery</span>
      </div>
      <div className="grid gap-1" style={{ gridTemplateColumns: `repeat(${steps.length}, 1fr)` }}>
        {steps.map((d, i) => (
          <div key={d.name} className="flex flex-col items-center text-center">
            <div
              className="mb-1 h-2 w-full first:rounded-l-full last:rounded-r-full"
              style={{ background: `color-mix(in oklab, var(--color-accent) ${30 + (70 * i) / Math.max(1, steps.length - 1)}%, transparent)` }}
            />
            <span className="text-xs font-semibold leading-tight">{d.name}</span>
            <span className="mt-1 text-[10px] muted">RTO {brief(d.rto)}</span>
            <span className="text-[10px] muted">RPO {brief(d.rpo)}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
