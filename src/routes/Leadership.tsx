import { Link } from 'react-router-dom'
import { Bullets, Page, Section } from '../components/ui'
import { leadership } from '../lib/content'
import { useProgress } from '../lib/progress'

export default function Leadership() {
  const { progress } = useProgress()
  const drafted = leadership.principles.filter((p) => progress.stories[p.id]?.trim()).length
  return (
    <Page title="Leadership Principles" back>
      <Section title="The interview loop">
        <div className="space-y-2">
          {leadership.interviewLoop.map((s) => (
            <details key={s.stage} className="card">
              <summary className="cursor-pointer font-semibold">{s.stage}</summary>
              <p className="my-2 text-[15px]">{s.description}</p>
              <Bullets items={s.tips} />
            </details>
          ))}
        </div>
      </Section>

      <Section title="STAR method">
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
