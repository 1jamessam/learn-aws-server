import type { ReactNode } from 'react'
import { useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Page, Section, ServiceChips } from '../components/ui'
import { domainLabels, quiz, serviceById, shuffle } from '../lib/content'
import type { QuizQuestion } from '../lib/schema'
import { useProgress } from '../lib/progress'

type Mode = 'unseen' | 'weak' | 'random'

export default function Quiz() {
  const { progress, update } = useProgress()
  const [params] = useSearchParams()
  const service = params.get('service')
  const [domain, setDomain] = useState<string | null>(null)
  const [level, setLevel] = useState<string | null>(null)
  const [mode, setMode] = useState<Mode>('unseen')
  const [length, setLength] = useState(10)
  const [session, setSession] = useState<{ qs: QuizQuestion[]; i: number; picked: number | null; results: boolean[] } | null>(null)

  const pool = useMemo(
    () =>
      quiz.questions.filter(
        (q) => (!domain || q.domain === domain) && (!level || q.difficulty === level) && (!service || q.services.includes(service)),
      ),
    [domain, level, service],
  )

  const stats = useMemo(
    () =>
      Object.keys(domainLabels).map((d) => {
        const qs = quiz.questions.filter((q) => q.domain === d)
        let c = 0, w = 0
        for (const q of qs) {
          c += progress.quiz[q.id]?.correct ?? 0
          w += progress.quiz[q.id]?.wrong ?? 0
        }
        return { d, total: qs.length, seen: qs.filter((q) => progress.quiz[q.id]).length, pct: c + w ? Math.round((100 * c) / (c + w)) : null }
      }),
    [progress.quiz],
  )

  const start = () => {
    let qs = pool
    if (mode === 'unseen') qs = [...shuffle(qs.filter((q) => !progress.quiz[q.id])), ...shuffle(qs.filter((q) => progress.quiz[q.id]))]
    else if (mode === 'weak') qs = qs.filter((q) => (progress.quiz[q.id]?.wrong ?? 0) > 0).sort(
      (a, b) => (progress.quiz[b.id].wrong - progress.quiz[b.id].correct) - (progress.quiz[a.id].wrong - progress.quiz[a.id].correct),
    )
    else qs = shuffle(qs)
    setSession({ qs: qs.slice(0, length), i: 0, picked: null, results: [] })
  }

  if (session && session.i < session.qs.length) {
    const q = session.qs[session.i]
    const pick = (idx: number) => {
      if (session.picked !== null) return
      const ok = idx === q.answer
      update((p) => {
        const prev = p.quiz[q.id] ?? { correct: 0, wrong: 0, last: '' }
        return { ...p, quiz: { ...p.quiz, [q.id]: { correct: prev.correct + +ok, wrong: prev.wrong + +!ok, last: new Date().toISOString() } } }
      })
      setSession({ ...session, picked: idx, results: [...session.results, ok] })
    }
    return (
      <Page title={`Question ${session.i + 1}/${session.qs.length}`} action={<button className="text-sm text-accent" onClick={() => setSession(null)}>End</button>}>
        <div className="mb-2 text-xs font-semibold uppercase text-accent">{domainLabels[q.domain]} · {q.difficulty}</div>
        <p className="mb-4 text-[16px] leading-relaxed">{q.question}</p>
        <div className="space-y-2">
          {q.options.map((o, idx) => {
            const state =
              session.picked === null ? '' : idx === q.answer ? 'border-emerald-500 bg-emerald-500/10' : idx === session.picked ? 'border-rose-500 bg-rose-500/10' : 'opacity-60'
            return (
              <button key={idx} onClick={() => pick(idx)} className={`card w-full text-left text-[15px] ${state}`}>
                <span className="mr-2 font-bold">{String.fromCharCode(65 + idx)}.</span>{o}
              </button>
            )
          })}
        </div>
        {session.picked !== null && (
          <div className="mt-4 space-y-3">
            <div className="card">
              <div className={`mb-2 font-semibold ${session.picked === q.answer ? 'text-emerald-500' : 'text-rose-500'}`}>
                {session.picked === q.answer ? 'Correct' : `Answer: ${String.fromCharCode(65 + q.answer)}`}
              </div>
              <p className="text-[15px] leading-relaxed whitespace-pre-line">{q.explanation}</p>
            </div>
            {q.services.length > 0 && <ServiceChips ids={q.services.filter((s) => serviceById.has(s))} />}
            <button className="btn-primary w-full py-3" onClick={() => setSession({ ...session, i: session.i + 1, picked: null })}>
              {session.i + 1 === session.qs.length ? 'See results' : 'Next'}
            </button>
          </div>
        )}
      </Page>
    )
  }

  const score = session ? session.results.filter(Boolean).length : 0
  return (
    <Page title="Quiz">
      {session && (
        <div className="card mb-6 text-center">
          <div className="text-3xl font-bold">{score}/{session.results.length}</div>
          <div className="text-sm muted">last session</div>
          {session.results.some((r) => !r) && (
            <div className="mt-3 space-y-1 text-left text-sm">
              <div className="font-semibold">Missed:</div>
              {session.qs.filter((_, i) => session.results[i] === false).map((q) => (
                <p key={q.id} className="line-clamp-2 muted">• {q.question}</p>
              ))}
            </div>
          )}
        </div>
      )}

      {service && <div className="card mb-4 text-sm">Filtered to <strong>{serviceById.get(service)?.name}</strong></div>}

      <Section title="Domain">
        <div className="flex flex-wrap gap-2">
          <Chip on={!domain} onClick={() => setDomain(null)}>All</Chip>
          {Object.entries(domainLabels).map(([k, v]) => <Chip key={k} on={domain === k} onClick={() => setDomain(k)}>{v}</Chip>)}
        </div>
      </Section>
      <Section title="Level">
        <div className="flex gap-2">
          <Chip on={!level} onClick={() => setLevel(null)}>Both</Chip>
          <Chip on={level === 'associate'} onClick={() => setLevel('associate')}>Associate</Chip>
          <Chip on={level === 'professional'} onClick={() => setLevel('professional')}>Professional</Chip>
        </div>
      </Section>
      <Section title="Mode">
        <div className="flex gap-2">
          <Chip on={mode === 'unseen'} onClick={() => setMode('unseen')}>Unseen first</Chip>
          <Chip on={mode === 'weak'} onClick={() => setMode('weak')}>Weak spots</Chip>
          <Chip on={mode === 'random'} onClick={() => setMode('random')}>Random</Chip>
        </div>
      </Section>
      <Section title="Length">
        <div className="flex gap-2">
          {[5, 10, 20, 50].map((n) => <Chip key={n} on={length === n} onClick={() => setLength(n)}>{n}</Chip>)}
        </div>
      </Section>
      <button className="btn-primary mb-8 w-full py-4" disabled={pool.length === 0} onClick={start}>
        Start · {pool.length} questions in pool
      </button>

      <Section title="Your accuracy by domain">
        <div className="card space-y-3">
          {stats.map((s) => (
            <div key={s.d}>
              <div className="mb-1 flex justify-between text-sm">
                <span>{domainLabels[s.d]}</span>
                <span className="muted">{s.pct === null ? '–' : `${s.pct}%`} · {s.seen}/{s.total} seen</span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
                <div className="h-full bg-accent" style={{ width: `${s.pct ?? 0}%` }} />
              </div>
            </div>
          ))}
        </div>
      </Section>
    </Page>
  )
}

function Chip({ on, onClick, children }: { on: boolean; onClick: () => void; children: ReactNode }) {
  return <button onClick={onClick} className={`chip ${on ? 'border-accent text-accent' : ''}`}>{children}</button>
}
