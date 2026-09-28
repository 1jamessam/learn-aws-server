# AWS SA Prep

A mobile-first study app (installable PWA) for preparing for an AWS Solutions Architect interview:

- **Learn**: a 9-stage **study path** that says what to learn first. Services are tiered Must know / Should know / Awareness, and you can mark each one learned. The catalog has 119 AWS services, each with its official icon, a "where it fits" diagram, and SA-level "when to use / avoid", limits, pricing, comparisons and 2025–26 launches. Also Well-Architected (6 pillars, DR strategies, 7 Rs) and the 16 Leadership Principles.
- **Cards**: spaced-repetition flashcards (SM-2), plus an **Icon drill** deck that shows each service's icon so you learn to recognize them.
- **Quiz**: SAA/SAP-style scenario questions with explanations and per-domain accuracy.
- **Mock**: timed whiteboard system-design scenarios with reference architecture diagrams, plus LP behavioral prompts, with reference answers, a rubric checklist, self-rating and saved STAR stories.
- **What's New**: a live AWS announcements feed (RSS, cached for 1h) that you can bookmark from.

Study content is a researched **snapshot** in `content/*.json` (see `snapshotDate` and `sources` in each file). No API keys are needed at runtime. Your progress is stored on the server in `data/progress.json`, so it syncs across your devices. It is also cached in each browser, so the app works offline.

## Run on makima

```sh
git clone <this repo> ~/james-aws   # or rsync/scp the folder
cd ~/james-aws
docker compose up -d --build
```

Open `http://makima:8080` over Tailscale. On your phone, use **Add to Home Screen** to get the app icon and offline mode.

To update after pulling changes, run `docker compose up -d --build`. Progress lives in `./data` and survives rebuilds, so back that folder up.

To require a login, set `APP_PASSWORD` (and optionally `APP_USER`) in `docker-compose.yml`.

## Develop

```sh
npm install
npm run dev        # Vite on :5173, API on :8080
npm run validate   # schema + cross-reference checks for content/*.json
npm run build && npm start
```

## Refreshing the content snapshot

The content was researched from AWS primary sources and written to `content/*.json` against the zod schemas in `src/lib/schema.ts`. To refresh it, open Claude Code in this repo and ask it to re-research the content files (services and launches, scenarios, quiz, flashcards, LPs) against the schemas and `content/service-ids.txt`, then run `npm run validate`. The live **What's New** tab always shows current announcements between refreshes.

## Diagrams and icons

- Service icons in `public/icons/` come from the official [AWS Architecture Icons](https://aws.amazon.com/architecture/icons/) package (release 07/31/2026). AWS publishes them for customers and partners to use in architecture diagrams.
- Diagrams are Mermaid flowcharts stored as text in the content JSON (`diagram` fields and `content/service-diagrams/*.json`), and are rendered in the browser. The `@svc(id)` macro draws a service with its icon. Conventions are in `src/lib/diagram.ts`, and `npm run validate` parses every diagram.
- The tiers and study path are defined in `content/study-path.json`.
