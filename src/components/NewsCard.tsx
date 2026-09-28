import type { NewsItem } from '../lib/progress'
import { useProgress } from '../lib/progress'
import { fmtDate } from '../lib/news'

export function NewsCard({ item, compact }: { item: NewsItem; compact?: boolean }) {
  const { progress, update } = useProgress()
  const saved = progress.bookmarks.some((b) => b.id === item.id)
  const toggle = () =>
    update((p) => ({
      ...p,
      bookmarks: saved ? p.bookmarks.filter((b) => b.id !== item.id) : [item, ...p.bookmarks],
    }))
  return (
    <article className="card">
      <div className="mb-1 flex items-start gap-2">
        <a href={item.link} target="_blank" rel="noreferrer" className="flex-1 font-semibold leading-snug hover:text-accent">
          {item.title}
        </a>
        <button onClick={toggle} className={`text-lg leading-none ${saved ? 'text-accent' : 'muted'}`} aria-label={saved ? 'Remove bookmark' : 'Bookmark'}>
          {saved ? '★' : '☆'}
        </button>
      </div>
      <div className="text-xs muted">{fmtDate(item.published)}</div>
      {!compact && <p className="mt-2 line-clamp-4 text-sm">{item.summary}</p>}
    </article>
  )
}
