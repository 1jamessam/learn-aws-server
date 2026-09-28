import { useEffect, useState } from 'react'
import type { NewsItem } from './progress'

type State = { items: NewsItem[]; fetchedAt?: string; error?: string; loading: boolean }

let cache: State | null = null

export function useNews(): State {
  const [state, setState] = useState<State>(cache ?? { items: [], loading: true })
  useEffect(() => {
    if (cache && !cache.error) return
    fetch('/api/whats-new')
      .then(async (r) => {
        const body = await r.json()
        if (!r.ok) throw new Error(body.error ?? r.statusText)
        return body as { items: NewsItem[]; fetchedAt: string }
      })
      .then((b) => (cache = { items: b.items, fetchedAt: b.fetchedAt, loading: false }))
      .catch((e) => (cache = { items: [], error: String(e.message ?? e), loading: false }))
      .finally(() => cache && setState(cache))
  }, [])
  return state
}

export const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
