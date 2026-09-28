import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { NewsCard } from '../components/NewsCard'
import { Page, Section } from '../components/ui'
import { flashcards, leadership, quiz, scenarios, snapshotDate } from '../lib/content'
import { useNews } from '../lib/news'
import { streak, useProgress } from '../lib/progress'
import { isDue } from '../lib/srs'

export default function Today() {
  const { progress, syncState } = useProgress()
  const news = useNews()
  const due = flashcards.cards.filter((c) => progress.srs[c.id] && isDue(progress.srs[c.id])).length
  const unseen = flashcards.cards.filter((c) => !progress.srs[c.id]).length
  const answered = Object.values(progress.quiz)
  const accuracy = answered.length
    ? Math.round((100 * answered.reduce((a, q) => a + q.correct, 0)) / answered.reduce((a, q) => a + q.correct + q.wrong, 0))
    : null
  const pick = useMemo(() => {
    const s = scenarios.scenarios[Math.floor(Math.random() * scenarios.scenarios.length)]
    const lp = leadership.principles[Math.floor(Math.random() * leadership.principles.length)]
    return { s, lp, prompt: lp.samplePrompts[Math.floor(Math.random() * lp.samplePrompts.length)] }
  }, [])

  return (
    <Page title="Today" action={<span className="text-xs muted">{syncState === 'offline' ? 'offline' : syncState === 'saving' ? 'saving…' : 'synced'}</span>}>
      <div className="mb-6 grid grid-cols-3 gap-3">
        <Stat label="day streak" value={streak(progress.activeDays)} />
        <Stat label="cards due" value={due} />
        <Stat label="quiz acc." value={accuracy === null ? '–' : `${accuracy}%`} />
      </div>

      <div className="mb-6 grid grid-cols-2 gap-3">
        <Link to="/cards" className="btn-primary py-4">
          Review {due > 0 ? `${due} due` : `new cards`}
        </Link>
        <Link to="/quiz" className="btn-ghost py-4">
          Quick quiz ({quiz.questions.length - answered.length} unseen)
        </Link>
      </div>

      <Section title="Whiteboard warm-up">
        <Link to={`/mock/scenario/${pick.s.id}`} className="card block hover:border-accent">
          <div className="mb-1 text-xs font-semibold uppercase text-accent">{pick.s.difficulty}</div>
          <div className="font-semibold">{pick.s.title}</div>
          <p className="mt-1 line-clamp-3 text-sm muted">{pick.s.prompt}</p>
        </Link>
      </Section>

      <Section title={`Leadership: ${pick.lp.name}`}>
        <Link to={`/mock/lp/${pick.lp.id}`} className="card block hover:border-accent">
          <p className="text-[15px]">“{pick.prompt}”</p>
        </Link>
      </Section>

      <Section title="Latest from AWS" right={<Link to="/news" className="text-sm text-accent">All news ›</Link>}>
        <div className="space-y-2">
          {news.loading && <div className="card muted">Loading What's New…</div>}
          {news.error && <div className="card muted">Couldn't reach the AWS feed ({news.error}).</div>}
          {news.items.slice(0, 5).map((n) => (
            <NewsCard key={n.id} item={n} compact />
          ))}
        </div>
      </Section>

      <p className="text-center text-xs muted">
        Study content snapshot: {snapshotDate} · {unseen} cards not yet studied
      </p>
    </Page>
  )
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="card p-3 text-center">
      <div className="text-2xl font-bold">{value}</div>
      <div className="text-[11px] muted">{label}</div>
    </div>
  )
}
