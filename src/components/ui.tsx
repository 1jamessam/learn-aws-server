import type { ReactNode } from 'react'
import Markdown from 'react-markdown'
import { Link, useNavigate } from 'react-router-dom'
import { serviceById } from '../lib/content'

export function Page({ title, back, action, children }: { title: string; back?: boolean; action?: ReactNode; children: ReactNode }) {
  const nav = useNavigate()
  return (
    <div className="mx-auto max-w-2xl px-4 pb-28 pt-[max(1rem,env(safe-area-inset-top))]">
      <header className="sticky top-0 z-10 -mx-4 mb-4 flex items-center gap-2 bg-slate-50/90 px-4 py-3 backdrop-blur dark:bg-slate-950/90">
        {back && (
          <button onClick={() => nav(-1)} className="-ml-2 rounded-lg p-2 text-xl leading-none" aria-label="Back">
            ‹
          </button>
        )}
        <h1 className="flex-1 truncate text-xl font-bold">{title}</h1>
        {action}
      </header>
      {children}
    </div>
  )
}

export function Section({ title, children, right }: { title: string; children: ReactNode; right?: ReactNode }) {
  return (
    <section className="mb-6">
      <div className="mb-2 flex items-baseline justify-between">
        <h2 className="text-sm font-semibold uppercase tracking-wide muted">{title}</h2>
        {right}
      </div>
      {children}
    </section>
  )
}

export function Md({ children }: { children: string }) {
  return (
    <div className="prose-md text-[15px] leading-relaxed">
      <Markdown>{children}</Markdown>
    </div>
  )
}

export function ServiceChips({ ids }: { ids: string[] }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {ids.map((id) => {
        const s = serviceById.get(id)
        return s ? (
          <Link key={id} to={`/learn/services/${id}`} className="chip hover:border-accent">
            {s.name.replace(/^(Amazon|AWS) /, '')}
          </Link>
        ) : (
          <span key={id} className="chip">{id}</span>
        )
      })}
    </div>
  )
}

export function Bullets({ items }: { items: string[] }) {
  return (
    <ul className="list-disc space-y-1 pl-5 text-[15px]">
      {items.map((t, i) => (
        <li key={i}>{t}</li>
      ))}
    </ul>
  )
}

export function Empty({ children }: { children: ReactNode }) {
  return <div className="card text-center muted">{children}</div>
}
