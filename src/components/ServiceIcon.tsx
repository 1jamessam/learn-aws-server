import { useState } from 'react'
import { serviceById, shortName } from '../lib/content'

// Official AWS Architecture Icon (public/icons/<id>.svg), with a lettered badge when none exists.
export function ServiceIcon({ id, size = 40, className = '' }: { id: string; size?: number; className?: string }) {
  const [failed, setFailed] = useState(false)
  const name = serviceById.get(id)?.name ?? id
  if (failed) {
    const initials = shortName(id).split(/[\s-]+/).map((w) => w[0]).join('').slice(0, 3).toUpperCase()
    return (
      <span
        className={`inline-flex shrink-0 items-center justify-center rounded-md bg-slate-700 font-bold text-white ${className}`}
        style={{ width: size, height: size, fontSize: size * 0.32 }}
        aria-label={name}
      >
        {initials}
      </span>
    )
  }
  return (
    <img
      src={`${import.meta.env.BASE_URL}icons/${id}.svg`}
      alt={name}
      width={size}
      height={size}
      loading="lazy"
      onError={() => setFailed(true)}
      className={`shrink-0 rounded-md ${className}`}
    />
  )
}
