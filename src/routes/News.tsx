import { useMemo, useState } from 'react'
import { NewsCard } from '../components/NewsCard'
import { Empty, Page, Section } from '../components/ui'
import { fmtDate, useNews } from '../lib/news'
import { useProgress } from '../lib/progress'

export default function News() {
  const news = useNews()
  const { progress } = useProgress()
  const [tab, setTab] = useState<'latest' | 'saved'>('latest')
  const [q, setQ] = useState('')
  const items = tab === 'latest' ? news.items : progress.bookmarks
  const filtered = useMemo(() => {
    const n = q.trim().toLowerCase()
    return n ? items.filter((i) => `${i.title} ${i.summary} ${i.products.join(' ')}`.toLowerCase().includes(n)) : items
  }, [items, q])

  return (
    <Page title="What's New" back>
      <div className="mb-3 grid grid-cols-2 gap-2">
        <button className={tab === 'latest' ? 'btn-primary' : 'btn-ghost'} onClick={() => setTab('latest')}>Latest</button>
        <button className={tab === 'saved' ? 'btn-primary' : 'btn-ghost'} onClick={() => setTab('saved')}>
          Saved ({progress.bookmarks.length})
        </button>
      </div>
      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Filter, e.g. bedrock, lambda, s3…"
        className="mb-3 w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 dark:border-slate-700 dark:bg-slate-900"
      />
      <Section title={tab === 'latest' && news.fetchedAt ? `Fetched ${fmtDate(news.fetchedAt)}` : `${filtered.length} items`}>
        {tab === 'latest' && news.loading && <Empty>Loading…</Empty>}
        {tab === 'latest' && news.error && <Empty>Couldn't reach the AWS feed: {news.error}</Empty>}
        {!news.loading && filtered.length === 0 && <Empty>Nothing here yet.</Empty>}
        <div className="space-y-2">
          {filtered.map((n) => (
            <NewsCard key={n.id} item={n} />
          ))}
        </div>
      </Section>
    </Page>
  )
}
