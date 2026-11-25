# PocketPilot175Bot

Cloudflare Worker + D1 backend for the private Telegram paper-trading analytics bot.

## Current behavior

- Telegram webhook endpoint: `POST /telegram-webhook`
- Health endpoint: `GET /health`
- Owner-only Telegram command handling.
- Paper/demo mode only. `/mode real` remains locked; no live broker orders are placed.
- M1 signal scan uses EMA 9/21 + RSI 14 from the configured Biquote data endpoint.
- Supported symbols in the deployed source: EURUSD, XAUUSD, GBPJPY, AUDUSD, USDJPY, GBPUSD.
- AUD/CAD OTC is deliberately pending until a genuine OTC quote source is verified.
- D1 stores paper positions, paper trade history, signal state and the owner UID format record.
- Phone-engine integration is optional and requires a reachable `PHONE_ENGINE_URL`.

This project does not collect Pocket Option passwords, browser cookies, or private session IDs. The `/uid` command validates only the UID's format; it does not authenticate a broker account.

## Repository and automatic deployment

Pushing to `main` runs tests and deploys the Worker through the official Cloudflare Wrangler GitHub Action.

Add these GitHub Actions repository secrets:

| Secret | Purpose |
| --- | --- |
| `CLOUDFLARE_API_TOKEN` | Cloudflare API token scoped to the account and Worker deployment permissions |
| `CLOUDFLARE_ACCOUNT_ID` | Cloudflare account ID |

Create the API token in Cloudflare with the minimum required Workers deployment permissions. Do not use a Global API Key.

## Worker secrets and variables

The existing Worker already has these secret bindings. Keep their values in Cloudflare Worker secrets; do not commit them to GitHub:

- `TELEGRAM_BOT_TOKEN`
- `OWNER_TELEGRAM_ID`
- `WEBHOOK_SECRET`
- `ENGINE_API_TOKEN`

Optional Worker variable:
- `PHONE_ENGINE_URL` — base URL for your phone engine. The phone tunnel URL can change, so configure the current URL in Cloudflare rather than hardcoding it in source.

After deployment, configure Telegram's webhook URL as:

`https://pocketpilot175bot.<your-workers-subdomain>.workers.dev/telegram-webhook`

Use Telegram's `secret_token` webhook option with the same value stored as `WEBHOOK_SECRET`. Never paste the bot token or webhook secret into GitHub issues, commits, or chat.

## D1 database

`wrangler.toml` points to the existing database `pocketpilot175bot-db`. The migration is an idempotent bootstrap for fresh installations; its `CREATE TABLE IF NOT EXISTS` statements do not drop or rewrite existing paper-trading records.

The current production database already has the required tables, including `bot_state`, `owner_profile`, `paper_positions`, `paper_trades`, and `signal_state`. A legacy table is intentionally left untouched.

## Local development

1. Install Node.js 22 or newer.
2. Run `npm install`.
3. Copy `.dev.vars.example` to `.dev.vars` and fill in local test credentials.
4. Run `npm test`.
5. Run `npm run dev`.

Never commit `.dev.vars`, `.env`, or any real credential.

## Deployment notes

- GitHub Actions deploys only after a push to `main` or a manual workflow dispatch.
- A failed test prevents deployment.
- The workflow requires both GitHub secrets above.
- No scheduled scan trigger is configured. Scans remain manual with `/scan`; enabling automatic scans should be an intentional follow-up.
- Existing D1 data is not reset by deployment.

## Safety

This repository is for signals and simulated trading only. Real-money mode remains disabled. OTC quotes must not be fabricated or inferred from ordinary forex data.
