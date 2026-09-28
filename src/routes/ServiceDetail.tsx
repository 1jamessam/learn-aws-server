import { Link, useParams } from 'react-router-dom'
import { Bullets, Empty, Page, Section } from '../components/ui'
import { categoryLabels, flashcards, quiz, scenarios, serviceById } from '../lib/content'

export default function ServiceDetail() {
  const { id = '' } = useParams()
  const s = serviceById.get(id)
  if (!s) return <Page title="Not found" back><Empty>Unknown service “{id}”.</Empty></Page>

  const relatedScenarios = scenarios.scenarios.filter((x) => x.services.includes(id))
  const cardCount = flashcards.cards.filter((c) => c.serviceId === id).length
  const quizCount = quiz.questions.filter((q) => q.services.includes(id)).length

  return (
    <Page title={s.name} back>
      <div className="mb-1 text-xs font-semibold uppercase text-accent">{categoryLabels[s.category]}</div>
      <p className="mb-5 text-[17px] leading-snug">{s.oneLiner}</p>

      <div className="space-y-4">
        <div className="card"><Section title="Use it when"><Bullets items={s.whenToUse} /></Section>
          <Section title="Avoid when"><Bullets items={s.whenNotToUse} /></Section></div>
        <div className="card"><Section title="Key facts & limits"><Bullets items={s.keyFacts} /></Section>
          <Section title="Pricing model"><p className="text-[15px]">{s.pricingModel}</p></Section></div>

        {s.comparesWith.length > 0 && (
          <div className="card">
            <Section title="Compared with">
              <ul className="space-y-2">
                {s.comparesWith.map((c) => (
                  <li key={c.serviceId}>
                    <Link to={`/learn/compare?a=${s.id}&b=${c.serviceId}`} className="font-semibold text-accent">
                      vs {serviceById.get(c.serviceId)?.name ?? c.serviceId} ›
                    </Link>
                    <p className="text-sm">{c.difference}</p>
                  </li>
                ))}
              </ul>
            </Section>
          </div>
        )}

        {s.interviewTips.length > 0 && (
          <div className="card border-accent/50"><Section title="Interview tips"><Bullets items={s.interviewTips} /></Section></div>
        )}

        {s.recentLaunches.length > 0 && (
          <div className="card">
            <Section title="Recent launches">
              <ul className="space-y-2 text-[15px]">
                {s.recentLaunches.map((l, i) => (
                  <li key={i}>
                    <span className="text-xs muted">{l.date} · </span>
                    {l.url ? <a href={l.url} target="_blank" rel="noreferrer" className="hover:text-accent">{l.title}</a> : l.title}
                  </li>
                ))}
              </ul>
            </Section>
          </div>
        )}

        {relatedScenarios.length > 0 && (
          <Section title="Appears in scenarios">
            <div className="space-y-2">
              {relatedScenarios.map((x) => (
                <Link key={x.id} to={`/mock/scenario/${x.id}`} className="card block py-3 hover:border-accent">{x.title}</Link>
              ))}
            </div>
          </Section>
        )}

        <div className="flex flex-wrap gap-2 text-sm">
          <a href={s.docs} target="_blank" rel="noreferrer" className="btn-ghost">AWS docs ↗</a>
          {quizCount > 0 && <Link to={`/quiz?service=${id}`} className="btn-ghost">{quizCount} quiz questions</Link>}
          {cardCount > 0 && <span className="btn-ghost pointer-events-none">{cardCount} flashcards</span>}
        </div>
      </div>
    </Page>
  )
}
