// SM-2 spaced repetition. Grades: 0 = again, 3 = hard, 4 = good, 5 = easy.
export type CardState = { ef: number; interval: number; reps: number; due: string }

export const DAY = 24 * 60 * 60 * 1000

export function today(now = new Date()): string {
  return new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().slice(0, 10)
}

export function review(prev: CardState | undefined, grade: 0 | 3 | 4 | 5, now = new Date()): CardState {
  const s = prev ?? { ef: 2.5, interval: 0, reps: 0, due: today(now) }
  let { ef, interval, reps } = s
  if (grade < 3) {
    reps = 0
    interval = 0 // show again today
  } else {
    reps += 1
    interval = reps === 1 ? 1 : reps === 2 ? 6 : Math.round(interval * ef)
    if (grade === 3) interval = Math.max(1, Math.round(interval * 0.6))
  }
  ef = Math.max(1.3, ef + (0.1 - (5 - grade) * (0.08 + (5 - grade) * 0.02)))
  return { ef, interval, reps, due: today(new Date(now.getTime() + interval * DAY)) }
}

export const isDue = (s: CardState | undefined, now = new Date()) => !s || s.due <= today(now)
