import { tierLabels, type Tier } from '../lib/content'

const styles: Record<Tier, string> = {
  must: 'bg-accent text-slate-950',
  should: 'border border-sky-500 text-sky-600 dark:text-sky-400',
  aware: 'border border-slate-300 text-slate-500 dark:border-slate-700 dark:text-slate-400',
}

export function TierBadge({ tier }: { tier: Tier }) {
  return <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${styles[tier]}`}>{tierLabels[tier]}</span>
}
