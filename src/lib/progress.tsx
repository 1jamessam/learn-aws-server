import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react'
import type { CardState } from './srs'
import { today } from './srs'

export type NewsItem = { id: string; title: string; summary: string; link: string; published: string; products: string[] }

export type Progress = {
  updatedAt?: number
  srs: Record<string, CardState>
  quiz: Record<string, { correct: number; wrong: number; last: string }>
  mock: Record<string, { answer: string; rating: number; at: string }[]>
  stories: Record<string, string> // LP id -> your STAR story draft
  bookmarks: NewsItem[]
  activeDays: string[]
  newCardsPerDay: number
}

const empty: Progress = { srs: {}, quiz: {}, mock: {}, stories: {}, bookmarks: [], activeDays: [], newCardsPerDay: 20 }
const LS_KEY = 'sa-prep-progress'

function readLocal(): Progress | null {
  try {
    const raw = localStorage.getItem(LS_KEY)
    return raw ? { ...empty, ...JSON.parse(raw) } : null
  } catch {
    return null
  }
}

type Ctx = { progress: Progress; update: (fn: (p: Progress) => Progress) => void; syncState: 'synced' | 'offline' | 'saving' }
const ProgressContext = createContext<Ctx | null>(null)

export function ProgressProvider({ children }: { children: ReactNode }) {
  const [progress, setProgress] = useState<Progress>(() => readLocal() ?? empty)
  const [syncState, setSyncState] = useState<Ctx['syncState']>('synced')
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined)
  const loaded = useRef(false)
  const latest = useRef(progress)
  latest.current = progress

  const push = useCallback((p: Progress, keepalive = false) => {
    const body = JSON.stringify(p)
    // Browsers cap keepalive request bodies at 64 KB.
    fetch('/api/progress', { method: 'PUT', keepalive: keepalive && body.length < 60_000, headers: { 'Content-Type': 'application/json' }, body })
      .then((r) => setSyncState(r.ok ? 'synced' : 'offline'))
      .catch(() => setSyncState('offline'))
  }, [])

  // On load, the newer of server vs local copy wins.
  useEffect(() => {
    fetch('/api/progress')
      .then((r) => r.json())
      .then((remote: Partial<Progress>) => {
        loaded.current = true
        const local = latest.current
        if ((remote.updatedAt ?? 0) > (local.updatedAt ?? 0)) setProgress({ ...empty, ...remote })
        else if (local.updatedAt) push(local) // local has changes the server hasn't seen
      })
      .catch(() => {
        loaded.current = true
        setSyncState('offline')
      })
  }, [push])

  // Flush pending changes when the tab is backgrounded or closed.
  useEffect(() => {
    const flush = () => {
      if (document.visibilityState !== 'hidden' || !timer.current) return
      clearTimeout(timer.current)
      timer.current = undefined
      push(latest.current, true)
    }
    document.addEventListener('visibilitychange', flush)
    window.addEventListener('pagehide', flush)
    return () => {
      document.removeEventListener('visibilitychange', flush)
      window.removeEventListener('pagehide', flush)
    }
  }, [push])

  useEffect(() => {
    try {
      localStorage.setItem(LS_KEY, JSON.stringify(progress))
    } catch {
      /* storage unavailable */
    }
    if (!loaded.current || !progress.updatedAt) return
    clearTimeout(timer.current)
    setSyncState('saving')
    timer.current = setTimeout(() => {
      timer.current = undefined
      push(progress)
    }, 800)
  }, [progress, push])

  const update = useCallback((fn: (p: Progress) => Progress) => {
    setProgress((p) => {
      const next = fn(p)
      const d = today()
      const activeDays = next.activeDays.includes(d) ? next.activeDays : [...next.activeDays, d].slice(-400)
      return { ...next, activeDays, updatedAt: Date.now() }
    })
  }, [])

  return <ProgressContext.Provider value={{ progress, update, syncState }}>{children}</ProgressContext.Provider>
}

export function useProgress() {
  const ctx = useContext(ProgressContext)
  if (!ctx) throw new Error('useProgress outside provider')
  return ctx
}

export function streak(days: string[]): number {
  const set = new Set(days)
  let n = 0
  const d = new Date()
  if (!set.has(today(d))) d.setDate(d.getDate() - 1) // today not done yet doesn't break the streak
  while (set.has(today(d))) {
    n++
    d.setDate(d.getDate() - 1)
  }
  return n
}
