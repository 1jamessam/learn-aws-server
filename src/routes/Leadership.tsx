import { Link } from 'react-router-dom'
import { Bullets, Page, Section } from '../components/ui'
import { leadership } from '../lib/content'
import { useProgress } from '../lib/progress'

const starColors = [
  'bg-sky-500/15 text-sky-700 dark:text-sky-300',
  'bg-violet-500/15 text-violet-700 dark:text-violet-300',
  'bg-accent/20 text-amber-700 dark:text-amber-300',
  'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300',
]

export default function Leadership() {
  const { progress } = useProgress()
  const drafted = leadership.principles.filter((p) => progress.stories[p.id]?.trim()).length
  return (
    <Page title="Leadership Principles" back>
      <Section title="The interview loop">
        <ol className="relative ml-4 border-l-2 border-accent/40">
          {leadership.interviewLoop.map((s, i) => (
            <li key={s.stage} className="mb-3 ml-6">
              <span className="absolute -left-[15px] flex h-7 w-7 items-center justify-center rounded-full bg-accent text-xs font-bold text-slate-950">{i + 1}</span>
              <details className="card py-3">
                <summary className="cursor-pointer font-semibold">{s.stage}</summary>
                <p className="my-2 text-[15px]">{s.description}</p>
                <Bullets items={s.tips} />
              </details>
            </li>
          ))}
        </ol>
      </Section>

      <Section title="STAR method">
        <div className="mb-2 grid grid-cols-4 gap-1.5">
          {leadership.starTemplate.slice(0, 4).map((s, i) => (
            <div key={s.step} className={`rounded-xl p-2 text-center ${starColors[i]}`}>
              <div className="text-2xl font-black">{s.step[0]}</div>
              <div className="text-[11px] font-semibold leading-tight">{s.step.replace(/\s*\(.*\)$/, '')}</div>
            </div>
          ))}
        </div>
        <div className="card space-y-2">
          {leadership.starTemplate.map((s) => (
            <div key={s.step}><strong>{s.step}:</strong> <span className="text-[15px]">{s.guidance}</span></div>
          ))}
        </div>
      </Section>

      <Section title={`Principles · ${drafted}/16 stories drafted`}>
        <div className="space-y-2">
          {leadership.principles.map((p) => (
            <details key={p.id} className="card">
              <summary className="flex cursor-pointer items-center justify-between font-semibold">
                {p.name}
                {progress.stories[p.id]?.trim() && <span className="text-xs text-accent">story ✓</span>}
              </summary>
              <p className="my-2 text-[15px] italic">{p.description}</p>
              <Section title="As a Solutions Architect"><p className="text-[15px]">{p.saAngle}</p></Section>
              <Section title="What they probe"><Bullets items={p.whatTheyProbe} /></Section>
              <Section title="Practice prompts"><Bullets items={p.samplePrompts} /></Section>
              <Link to={`/mock/lp/${p.id}`} className="btn-primary w-full">Practice & draft story</Link>
            </details>
          ))}
        </div>
      </Section>
    </Page>
  )
}
