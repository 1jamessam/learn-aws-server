import { useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { ServiceIcon } from '../components/ServiceIcon'
import { TierBadge } from '../components/TierBadge'
import { Empty, Page } from '../components/ui'
import { byTier, categoryLabels, flashcards, serviceById, services, shuffle, tierOf } from '../lib/content'
import type { Flashcard } from '../lib/schema'
import { useProgress } from '../lib/progress'
import { isDue, review } from '../lib/srs'

type Card = Omit<Flashcard, 'deck'> & { deck: Flashcard['deck'] | 'icons' }

// "Icon drill": show the official icon, recall the service. Must-know services come first.
const iconCards: Card[] = [...services.services].sort(byTier).map((s) => ({
  id: `icon-${s.id}`,
  deck: 'icons',
  front: 'Which service is this?',
  back: s.oneLiner,
  serviceId: s.id,
}))
const allCards: Card[] = [...flashcards.cards, ...iconCards]
const decks = ['icons', ...new Set(flashcards.cards.map((c) => c.deck))]
const deckLabel = (d: string) => (d === 'icons' ? 'Icon drill' : categoryLabels[d] ?? d)

export default function Cards() {
  const { progress, update } = useProgress()
  const [params] = useSearchParams()
  const [deck, setDeck] = useState<string | null>(params.get('deck'))
  const [queue, setQueue] = useState<Card[] | null>(null)
  const [flipped, setFlipped] = useState(false)
  const [done, setDone] = useState(0)

  const counts = useMemo(() => {
    // Icon cards only appear when that deck is picked, so "All decks" stays about concepts.
    const inDeck = deck ? allCards.filter((c) => c.deck === deck) : (flashcards.cards as Card[])
    return {
      due: inDeck.filter((c) => progress.srs[c.id] && isDue(progress.srs[c.id])),
      fresh: inDeck.filter((c) => !progress.srs[c.id]),
    }
  }, [deck, progress.srs])

  const start = () => {
    // Icon drill introduces new cards in tier order (must-know first); other decks shuffle.
    const fresh = deck === 'icons' ? counts.fresh : shuffle(counts.fresh)
    setQueue([...shuffle(counts.due), ...fresh.slice(0, progress.newCardsPerDay)])
    setDone(0)
    setFlipped(false)
  }

  const grade = (g: 0 | 3 | 4 | 5) => {
    if (!queue) return
    const [card, ...rest] = queue
    update((p) => ({ ...p, srs: { ...p.srs, [card.id]: review(p.srs[card.id], g) } }))
    // "Again" puts the card back a few positions later in this session.
    setQueue(g === 0 ? [...rest.slice(0, 3), card, ...rest.slice(3)] : rest)
    if (g !== 0) setDone((d) => d + 1)
    setFlipped(false)
  }

  if (queue && queue.length > 0) {
    const card = queue[0]
    return (
      <Page title="Review" action={<button className="text-sm text-accent" onClick={() => setQueue(null)}>End</button>}>
        <div className="mb-2 flex justify-between text-xs muted">
          <span>{deckLabel(card.deck)}{card.serviceId && card.deck !== 'icons' && ` · ${serviceById.get(card.serviceId)?.name ?? ''}`}</span>
          <span>{done} done · {queue.length} left</span>
        </div>
        {card.deck === 'icons' && card.serviceId ? (
          <button onClick={() => setFlipped(true)} className="card flex min-h-[45vh] w-full flex-col items-center justify-center gap-4 text-center">
            <ServiceIcon id={card.serviceId} size={120} />
            {flipped ? (
              <div className="border-t border-slate-200 pt-4 dark:border-slate-800">
                <div className="mb-1 text-xl font-bold">{serviceById.get(card.serviceId)?.name}</div>
                <div className="mb-2"><TierBadge tier={tierOf(card.serviceId)} /></div>
                <p className="text-[15px] muted">{card.back}</p>
              </div>
            ) : (
              <div className="text-sm muted">Name this service, then tap to check</div>
            )}
          </button>
        ) : (
          <button onClick={() => setFlipped(true)} className="card flex min-h-[45vh] w-full flex-col justify-center text-left">
            <div className="text-lg font-semibold leading-snug">{card.front}</div>
            {flipped ? (
              <div className="mt-4 border-t border-slate-200 pt-4 text-[16px] leading-relaxed whitespace-pre-line dark:border-slate-800">{card.back}</div>
            ) : (
              <div className="mt-6 text-sm muted">Tap to reveal</div>
            )}
          </button>
        )}
        {flipped && (
          <div className="mt-4 grid grid-cols-4 gap-2">
            <button className="btn bg-rose-500/90 text-white" onClick={() => grade(0)}>Again</button>
            <button className="btn-ghost" onClick={() => grade(3)}>Hard</button>
            <button className="btn-primary" onClick={() => grade(4)}>Good</button>
            <button className="btn bg-emerald-500/90 text-white" onClick={() => grade(5)}>Easy</button>
          </div>
        )}
      </Page>
    )
  }

  return (
    <Page title="Flashcards">
      {queue && <div className="card mb-4 text-center">Session complete: {done} cards reviewed. 🎉</div>}
      <div className="-mx-4 mb-4 flex flex-wrap gap-2 px-4">
        <button onClick={() => setDeck(null)} className={`chip ${!deck ? 'border-accent text-accent' : ''}`}>All decks</button>
        {decks.map((d) => (
          <button key={d} onClick={() => setDeck(d)} className={`chip ${deck === d ? 'border-accent text-accent' : ''}`}>
            {deckLabel(d)}
          </button>
        ))}
      </div>
      <div className="card mb-4 grid grid-cols-2 text-center">
        <div><div className="text-3xl font-bold">{counts.due.length}</div><div className="text-xs muted">due</div></div>
        <div><div className="text-3xl font-bold">{counts.fresh.length}</div><div className="text-xs muted">new</div></div>
      </div>
      {counts.due.length + counts.fresh.length === 0 ? (
        <Empty>All caught up for this deck.</Empty>
      ) : (
        <button className="btn-primary w-full py-4" onClick={start}>
          Start ({counts.due.length} due + up to {Math.min(progress.newCardsPerDay, counts.fresh.length)} new)
        </button>
      )}
      <label className="mt-6 flex items-center justify-between text-sm muted">
        New cards per session
        <select
          value={progress.newCardsPerDay}
          onChange={(e) => update((p) => ({ ...p, newCardsPerDay: Number(e.target.value) }))}
          className="rounded-lg border border-slate-300 bg-transparent px-2 py-1 dark:border-slate-700"
        >
          {[10, 20, 30, 50, 100].map((n) => <option key={n} value={n}>{n}</option>)}
        </select>
      </label>
    </Page>
  )
}
