# AWS SA Prep

A mobile-first study app (installable PWA) for preparing for an AWS Solutions Architect interview:

- **Learn**: about 110 AWS services with SA-level "when to use / avoid", limits, pricing, comparisons and 2025–26 launches. Also Well-Architected (6 pillars, DR strategies, 7 Rs) and the 16 Leadership Principles.
- **Cards**: spaced-repetition flashcards (SM-2).
- **Quiz**: SAA/SAP-style scenario questions with explanations and per-domain accuracy.
- **Mock**: timed whiteboard system-design scenarios and LP behavioral prompts, with reference answers, a rubric checklist, self-rating and saved STAR stories.
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
