import { lazy, Suspense } from 'react'
import { NavLink, Route, Routes } from 'react-router-dom'
import Today from './routes/Today'

const Learn = lazy(() => import('./routes/Learn'))
const ServiceDetail = lazy(() => import('./routes/ServiceDetail'))
const Compare = lazy(() => import('./routes/Compare'))
const WellArchitected = lazy(() => import('./routes/WellArchitected'))
const Leadership = lazy(() => import('./routes/Leadership'))
const News = lazy(() => import('./routes/News'))
const Cards = lazy(() => import('./routes/Cards'))
const Quiz = lazy(() => import('./routes/Quiz'))
const Mock = lazy(() => import('./routes/Mock'))
const MockSession = lazy(() => import('./routes/MockSession'))

const tabs = [
  { to: '/', label: 'Today', icon: '◎' },
  { to: '/learn', label: 'Learn', icon: '▤' },
  { to: '/cards', label: 'Cards', icon: '❏' },
  { to: '/quiz', label: 'Quiz', icon: '✓' },
  { to: '/mock', label: 'Mock', icon: '◇' },
]

export default function App() {
  return (
    <>
      <Suspense fallback={<div className="p-8 text-center muted">Loading…</div>}>
        <Routes>
          <Route path="/" element={<Today />} />
          <Route path="/learn" element={<Learn />} />
          <Route path="/learn/services/:id" element={<ServiceDetail />} />
          <Route path="/learn/compare" element={<Compare />} />
          <Route path="/learn/well-architected" element={<WellArchitected />} />
          <Route path="/learn/leadership" element={<Leadership />} />
          <Route path="/news" element={<News />} />
          <Route path="/cards" element={<Cards />} />
          <Route path="/quiz" element={<Quiz />} />
          <Route path="/mock" element={<Mock />} />
          <Route path="/mock/:kind/:id" element={<MockSession />} />
          <Route path="*" element={<Today />} />
        </Routes>
      </Suspense>
      <nav className="fixed inset-x-0 bottom-0 z-20 border-t border-slate-200 bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur dark:border-slate-800 dark:bg-slate-900/95">
        <div className="mx-auto flex max-w-2xl">
          {tabs.map((t) => (
            <NavLink
              key={t.to}
              to={t.to}
              end={t.to === '/'}
              className={({ isActive }) =>
                `flex flex-1 flex-col items-center gap-0.5 py-2 text-[11px] font-medium ${isActive ? 'text-accent' : 'muted'}`
              }
            >
              <span className="text-lg leading-none">{t.icon}</span>
              {t.label}
            </NavLink>
          ))}
        </div>
      </nav>
    </>
  )
}
