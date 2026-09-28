import { serve } from '@hono/node-server'
import { serveStatic } from '@hono/node-server/serve-static'
import { Hono } from 'hono'
import { basicAuth } from 'hono/basic-auth'
import { XMLParser } from 'fast-xml-parser'
import { mkdir, readFile, rename, writeFile } from 'node:fs/promises'
import path from 'node:path'

const PORT = Number(process.env.PORT ?? 8080)
const DATA_DIR = process.env.DATA_DIR ?? path.resolve('data')
const PROGRESS_FILE = path.join(DATA_DIR, 'progress.json')
const FEED_URL = 'https://aws.amazon.com/about-aws/whats-new/recent/feed/'
const FEED_TTL_MS = 60 * 60 * 1000

export type NewsItem = {
  id: string
  title: string
  summary: string
  link: string
  published: string
  products: string[]
}

const app = new Hono()

if (process.env.APP_PASSWORD) {
  app.use('*', basicAuth({ username: process.env.APP_USER ?? 'me', password: process.env.APP_PASSWORD }))
}

let feedCache: { at: number; items: NewsItem[] } | null = null

const stripHtml = (html: string) =>
  html
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim()

async function fetchFeed(): Promise<NewsItem[]> {
  const res = await fetch(FEED_URL, { headers: { 'User-Agent': 'james-aws-study-app' } })
  if (!res.ok) throw new Error(`feed responded ${res.status}`)
  const xml = await res.text()
  const parsed = new XMLParser({ ignoreAttributes: true }).parse(xml)
  const raw = parsed?.rss?.channel?.item ?? []
  const items = Array.isArray(raw) ? raw : [raw]
  return items.map((it: Record<string, unknown>) => {
    const categories = String(it.category ?? '')
    return {
      id: String(it.guid ?? it.link),
      title: String(it.title ?? ''),
      summary: stripHtml(String(it.description ?? '')).slice(0, 600),
      link: String(it.link ?? ''),
      published: new Date(String(it.pubDate)).toISOString(),
      products: [...categories.matchAll(/products\/([a-z0-9-]+)/g)].map((m) => m[1]),
    }
  })
}

app.get('/api/whats-new', async (c) => {
  if (!feedCache || Date.now() - feedCache.at > FEED_TTL_MS) {
    try {
      feedCache = { at: Date.now(), items: await fetchFeed() }
    } catch (err) {
      // Serve stale data rather than failing when AWS is unreachable.
      if (!feedCache) return c.json({ error: String(err) }, 502)
    }
  }
  return c.json({ fetchedAt: new Date(feedCache.at).toISOString(), items: feedCache.items })
})

app.get('/api/progress', async (c) => {
  try {
    return c.json(JSON.parse(await readFile(PROGRESS_FILE, 'utf8')))
  } catch {
    return c.json({})
  }
})

app.put('/api/progress', async (c) => {
  const body = await c.req.json()
  await mkdir(DATA_DIR, { recursive: true })
  // Write-then-rename so a crash never leaves a half-written file.
  const tmp = `${PROGRESS_FILE}.tmp`
  await writeFile(tmp, JSON.stringify(body))
  await rename(tmp, PROGRESS_FILE)
  return c.json({ ok: true })
})

app.use('/*', serveStatic({ root: './dist' }))
// SPA fallback for client-side routes.
app.get('*', serveStatic({ path: './dist/index.html' }))

serve({ fetch: app.fetch, port: PORT }, () => console.log(`listening on :${PORT}`))
