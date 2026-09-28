import { useEffect, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import { Diagram } from '../components/Diagram'
import { Bullets, Empty, Md, Page, Section, ServiceChips } from '../components/ui'
import { leadership, scenarios } from '../lib/content'
import { useProgress } from '../lib/progress'

export default function MockSession() {
  const { kind, id = '' } = useParams()
  const { progress, update } = useProgress()
  const scenario = kind === 'scenario' ? scenarios.scenarios.find((s) => s.id === id) : undefined
  const lp = kind === 'lp' ? leadership.principles.find((p) => p.id === id) : undefined
  const key = `${kind}:${id}`
  const [promptIdx, setPromptIdx] = useState(() => Math.floor(Math.random() * (lp?.samplePrompts.length ?? 1)))
  const [answer, setAnswer] = useState(() => (lp && progress.stories[lp.id]) || '')
  const [revealed, setRevealed] = useState(false)
  const [showClarify, setShowClarify] = useState(false)
  const [checked, setChecked] = useState<Set<number>>(new Set())
  const [rating, setRating] = useState(0)
  const [saved, setSaved] = useState(false)
  const limit = scenario ? 30 * 60 : 3 * 60
  const [left, setLeft] = useState(limit)
  const [running, setRunning] = useState(false)

  useEffect(() => {
    if (!running) return
    const t = setInterval(() => setLeft((s) => s - 1), 1000)
    return () => clearInterval(t)
  }, [running])

  const attempts = progress.mock[key] ?? []
  const rubric = useMemo(
    () => scenario?.rubric ?? leadership.starTemplate.map((s) => `${s.step}: ${s.guidance}`),
    [scenario],
  )

  if (!scenario && !lp) return <Page title="Not found" back><Empty>Unknown prompt.</Empty></Page>

  const save = () => {
    update((p) => ({ ...p, mock: { ...p.mock, [key]: [...(p.mock[key] ?? []), { answer, rating, at: new Date().toISOString() }] } }))
    setSaved(true)
  }
  const mm = String(Math.floor(Math.abs(left) / 60)).padStart(2, '0')
  const ss = String(Math.abs(left) % 60).padStart(2, '0')

  return (
    <Page
      title={scenario?.title ?? lp!.name}
      back
      action={
        <button onClick={() => setRunning((r) => !r)} className={`chip font-mono ${left < 0 ? 'border-rose-500 text-rose-500' : running ? 'border-accent text-accent' : ''}`}>
          {left < 0 && '-'}{mm}:{ss} {running ? '❚❚' : '▶'}
        </button>
      }
    >
      <div className="card mb-4">
        <div className="mb-1 text-xs font-semibold uppercase text-accent">{scenario ? `System design · ${scenario.difficulty}` : 'Behavioral'}</div>
        <p className="text-[16px] leading-relaxed">{scenario ? scenario.prompt : lp!.samplePrompts[promptIdx]}</p>
        {lp && (
          <button className="mt-2 text-sm text-accent" onClick={() => setPromptIdx((i) => (i + 1) % lp.samplePrompts.length)}>
            Another prompt ›
          </button>
        )}
      </div>

      {scenario && (
        <div className="mb-4">
          <button className="text-sm text-accent" onClick={() => setShowClarify((v) => !v)}>
            {showClarify ? 'Hide' : 'Show'} clarifying questions to ask first
          </button>
          {showClarify && <div className="card mt-2"><Bullets items={scenario.clarifyingQuestions} /></div>}
        </div>
      )}

      <textarea
        value={answer}
        onChange={(e) => setAnswer(e.target.value)}
        onFocus={() => !running && !revealed && setRunning(true)}
        placeholder={scenario ? 'Sketch your architecture: requirements, components, data flow, trade-offs…' : 'Situation, Task, Action (what *you* did), Result (with numbers)…'}
        rows={10}
        className="mb-3 w-full rounded-xl border border-slate-300 bg-white p-3 text-[15px] dark:border-slate-700 dark:bg-slate-900"
      />
      {lp && (
        <button
          className="btn-ghost mb-3 w-full"
          onClick={() => update((p) => ({ ...p, stories: { ...p.stories, [lp.id]: answer } }))}
        >
          Save as my {lp.name} story
        </button>
      )}

      {!revealed ? (
        <button className="btn-primary w-full py-3" onClick={() => { setRevealed(true); setRunning(false) }}>
          Reveal reference & rubric
        </button>
      ) : (
        <div className="space-y-4">
          {scenario && (
            <>
              {scenario.diagram && <Diagram src={scenario.diagram} caption={scenario.diagramCaption} title={scenario.title} />}
              <div className="card"><Section title="Reference architecture"><Md>{scenario.referenceArchitecture}</Md></Section>
                <ServiceChips ids={scenario.services} /></div>
              <div className="card"><Section title="Trade-offs to discuss"><Bullets items={scenario.tradeoffs} /></Section></div>
              <div className="card"><Section title="Likely follow-ups"><Bullets items={scenario.followUps} /></Section></div>
            </>
          )}
          {lp && (
            <div className="card">
              <Section title="What they're probing"><Bullets items={lp.whatTheyProbe} /></Section>
              <Section title="SA angle"><p className="text-[15px]">{lp.saAngle}</p></Section>
            </div>
          )}
          <div className="card">
            <Section title="Did your answer cover…">
              <ul className="space-y-2">
                {rubric.map((r, i) => (
                  <li key={i}>
                    <label className="flex gap-2 text-[15px]">
                      <input
                        type="checkbox"
                        className="mt-1 accent-amber-500"
                        checked={checked.has(i)}
                        onChange={() => setChecked((s) => { const n = new Set(s); n.has(i) ? n.delete(i) : n.add(i); return n })}
                      />
                      {r}
                    </label>
                  </li>
                ))}
              </ul>
            </Section>
          </div>
          <div className="card">
            <div className="mb-2 text-sm font-semibold">Rate yourself</div>
            <div className="mb-3 flex gap-2">
              {[1, 2, 3, 4, 5].map((n) => (
                <button key={n} onClick={() => setRating(n)} className={`text-2xl ${n <= rating ? 'text-accent' : 'muted'}`}>★</button>
              ))}
            </div>
            <button className="btn-primary w-full" disabled={!rating || saved} onClick={save}>{saved ? 'Saved ✓' : 'Save attempt'}</button>
          </div>
        </div>
      )}

      {attempts.length > 0 && (
        <Section title={`Previous attempts (${attempts.length})`}>
          <div className="mt-4 space-y-2">
            {[...attempts].reverse().map((a, i) => (
              <details key={i} className="card py-3">
                <summary className="cursor-pointer text-sm">
                  {new Date(a.at).toLocaleString()} · {'★'.repeat(a.rating)}
                </summary>
                <p className="mt-2 whitespace-pre-wrap text-sm">{a.answer || '(no written answer)'}</p>
              </details>
            ))}
          </div>
        </Section>
      )}
    </Page>
  )
}
