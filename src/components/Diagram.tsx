import { useEffect, useId, useState } from 'react'
import { expandDiagram } from '../lib/content'
import { withClassDefs } from '../lib/diagram'

const darkQuery = typeof window !== 'undefined' ? window.matchMedia('(prefers-color-scheme: dark)') : null

function useDark() {
  const [dark, setDark] = useState(darkQuery?.matches ?? false)
  useEffect(() => {
    const on = (e: MediaQueryListEvent) => setDark(e.matches)
    darkQuery?.addEventListener('change', on)
    return () => darkQuery?.removeEventListener('change', on)
  }, [])
  return dark
}

let mermaidPromise: Promise<typeof import('mermaid').default> | null = null
let initializedFor: boolean | null = null
// Mermaid renders through a shared DOM scratch area, so renders must not overlap.
let queue: Promise<unknown> = Promise.resolve()
let renderCount = 0

async function renderSvg(id: string, src: string, dark: boolean): Promise<string> {
  mermaidPromise ??= import('mermaid').then((m) => m.default)
  const mermaid = await mermaidPromise
  const job = queue.then(async () => {
    if (initializedFor !== dark) {
      mermaid.initialize({
        startOnLoad: false,
        securityLevel: 'loose',
        theme: 'base',
        fontFamily: 'ui-sans-serif, system-ui, -apple-system, sans-serif',
        flowchart: { curve: 'basis', padding: 8, nodeSpacing: 18, rankSpacing: 34, diagramPadding: 4, wrappingWidth: 130, htmlLabels: true },
        themeVariables: dark
          ? { background: '#0f172a', primaryColor: '#1e293b', primaryTextColor: '#e2e8f0', primaryBorderColor: '#475569', lineColor: '#94a3b8', clusterBkg: '#111c33', clusterBorder: '#334155', edgeLabelBackground: '#0f172a', titleColor: '#cbd5e1', fontSize: '14px' }
          : { background: '#ffffff', primaryColor: '#f8fafc', primaryTextColor: '#0f172a', primaryBorderColor: '#94a3b8', lineColor: '#64748b', clusterBkg: '#f8fafc', clusterBorder: '#cbd5e1', edgeLabelBackground: '#ffffff', titleColor: '#334155', fontSize: '14px' },
      })
      initializedFor = dark
    }
    const { svg } = await mermaid.render(`${id}-${++renderCount}`, withClassDefs(expandDiagram(src), dark))
    return svg
  })
  queue = job.catch(() => undefined)
  return job
}

export function Diagram({ src, caption, title }: { src: string; caption?: string; title?: string }) {
  const dark = useDark()
  const rid = 'm' + useId().replace(/[^a-zA-Z0-9]/g, '')
  const [svg, setSvg] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [full, setFull] = useState(false)
  const [zoom, setZoom] = useState(1.5)

  useEffect(() => {
    let alive = true
    setSvg(null)
    renderSvg(rid, src, dark)
      .then((s) => alive && setSvg(s))
      .catch((e) => alive && setError(String(e?.message ?? e)))
    return () => {
      alive = false
    }
  }, [src, dark, rid])

  if (error) return <div className="card text-sm muted">Diagram failed to render.</div>

  return (
    <figure className="diagram">
      <button
        type="button"
        onClick={() => svg && setFull(true)}
        className="block w-full overflow-hidden rounded-2xl border border-slate-200 bg-white p-2 dark:border-slate-800 dark:bg-slate-900"
        aria-label={`Open diagram${title ? `: ${title}` : ''} full screen`}
      >
        {svg ? (
          <div className="diagram-svg mx-auto" dangerouslySetInnerHTML={{ __html: svg }} />
        ) : (
          <div className="flex h-48 items-center justify-center text-sm muted">Drawing diagram…</div>
        )}
      </button>
      {caption && <figcaption className="mt-2 text-sm muted">{caption} <span className="whitespace-nowrap text-accent">· tap to zoom</span></figcaption>}

      {full && svg && (
        <div className="fixed inset-0 z-50 flex flex-col bg-white dark:bg-slate-950" role="dialog" aria-modal="true">
          <div className="flex items-center gap-2 border-b border-slate-200 px-4 py-3 pt-[max(.75rem,env(safe-area-inset-top))] dark:border-slate-800">
            <span className="flex-1 truncate font-semibold">{title ?? 'Diagram'}</span>
            <button className="btn-ghost px-3 py-1.5" onClick={() => setZoom((z) => Math.max(1, z - 0.5))} aria-label="Zoom out">−</button>
            <button className="btn-ghost px-3 py-1.5" onClick={() => setZoom((z) => Math.min(4, z + 0.5))} aria-label="Zoom in">+</button>
            <button className="btn-primary px-3 py-1.5" onClick={() => { setFull(false); setZoom(1.5) }}>Close</button>
          </div>
          <div className="flex-1 overflow-auto p-4">
            <div className="diagram-svg diagram-full" style={{ width: `${zoom * 100}%` }} dangerouslySetInnerHTML={{ __html: svg }} />
          </div>
          {caption && <p className="border-t border-slate-200 px-4 py-3 pb-[max(.75rem,env(safe-area-inset-bottom))] text-sm dark:border-slate-800">{caption}</p>}
        </div>
      )}
    </figure>
  )
}
