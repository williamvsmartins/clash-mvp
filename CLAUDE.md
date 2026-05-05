# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Development
npm run dev          # Run bot with .env
npm run dev:dev      # Run bot with .env.dev
npm run watch        # Run with hot-reload using .env
npm run watch:dev    # Run with hot-reload using .env.dev

# Build & Production
npm run check        # Type-check only (no emit)
npm run build        # Compile TypeScript to ./build
npm run start        # Run compiled bot with .env

# Infrastructure
npm run up           # Start MongoDB + mongo-express via Docker Compose
```

No test runner is configured. Use `npm run check` to validate types.

## Architecture

This is a **Discord bot** built with [discord.js v14](https://discord.js.org/) using a custom class-based framework (`#base`). The bot serves as a **Clash Royale betting platform** — users register their Clash Royale tag, enter match queues, bet in-game currency, and the bot verifies match results via the Clash Royale API.

### Path Aliases

TypeScript paths (mapped in `tsconfig.json` and `package.json#imports`):

| Alias | Source |
|---|---|
| `#base` | `src/discord/base/` — bot framework (Command, Event, Responder) |
| `#database` | `src/database/` — Mongoose models |
| `#functions` | `src/functions/` — all business logic |
| `#settings` | `src/settings/` — env validation, logger, globals |

### Framework: Command / Event / Responder

Everything is registered by instantiating classes. `bootstrapApp` auto-imports all `*.ts` files under `src/discord/` so side-effects (constructor calls) register handlers automatically.

- **`Command`** — slash commands. Each file does `new Command({ name, run })`. Names must be lowercase, no spaces.
- **`Event`** — Discord.js client events. `new Event({ name, event, run })`.
- **`Responder`** — button/select/modal interactions. Uses `radix3` router so `customId` supports path params (e.g. `bet/:matchId/confirm`). Registered with `new Responder({ customId, type: ResponderType.Button, run })`.

The `Responder` type hierarchy falls back: specific select type → `Select` → `Row` → `All`.

### Business Logic Flow

1. **Registration** (`/registro` command + `clash-tag` button responder) — links Discord user ID to a Clash Royale tag; stored in `User` MongoDB model.
2. **Queue** (`/queue` staff command + `bet/queue/*` responders) — staff creates a bet queue embed with a wager amount. Users click "Enter" to join. When 2 players join, a private `aposta-*` channel is created and `matchData` Map is populated (in-memory, keyed by channel ID).
3. **Match confirmation** (`bet/match/accept` + `bet/match/cancel` responders) — both players must accept. On confirmation, `createActiveMatch` is called which persists the match in MongoDB (`ActiveMatch` schema) and deducts entry fee (`descontoPartida`).
4. **Match verification** (`finalize-match` responder or auto-verification) — calls `verifyMatch` → `ClashRoyaleService.verifyMatch` which fetches battle logs from `https://proxy.royaleapi.dev/v1` and finds a common battle within the match time window. Winner gets `premio` (double the wager). Draws refund both players.
5. **Wallet** (`deposito`/`sacar`/`saldo` button responders) — deposit via Mercado Pago PIX (`criarPagamentoPix`), withdraw via PIX key. Balance stored as integer **centavos** in `User.moedas`.
6. **Webhook** — HTTP server on `WEBHOOK_PORT` receives `payment.updated`/`payment.created` events from Mercado Pago at `POST /webhook/mercadopago`, then calls `processarWebhookPagamento` to credit the user.

### Key Design Decisions

- **Money is stored in centavos (integer)** — always divide by 100 for display. Never store floats.
- **`matchData` Map is in-memory** — data is lost on restart. Active match state is persisted in `ActiveMatch` MongoDB collection; the in-memory Map is only used between queue and channel creation.
- **Mock mode** — `ClashRoyaleService` has a mock implementation (`src/functions/clash-royale/mock.ts`). In `NODE_ENV=development`, the mock is activated automatically via `configureVerification({ useMock: true })`.
- **Global constants** — `ephemeral`, `fetchReply`, `required`, `inline`, `disabled`, `animated` are defined as `true` on `globalThis` in `src/settings/global.ts` for use as shorthand in discord.js option objects.

### MongoDB Schemas

| Model | Key fields |
|---|---|
| `User` | `userId` (Discord ID), `clashTag`, `moedas` (centavos) |
| `ActiveMatch` | `channelId`, `player1/2UserId`, `player1/2Tag`, `price`, `status`, `autoVerificationEnabled` |
| `Guild` | `guildId`, `fixedMessageId` |
| `Transaction` | `userId`, `type`, `amount`, `description` |
| `PixPayment` | `mercadoPagoId`, `userId`, `status` |
| `Confirmation` | used for two-party confirmation flows |
| `Match` | historical match records |

### Environment Variables

Required: `BOT_TOKEN`, `GUILD_ID`, `MONGO_URI`, `API_TOKEN` (Clash Royale API via royaleapi.dev proxy).

Optional: `MERCADO_PAGO_TOKEN`, `WEBHOOK_PORT` (default 3000), `NOTION_API_KEY`, `DATABASE_ID`, `DATABASE_DEPOSIT_ID`, `CHANNEL_ID`, `CHANNEL_ID_QUEUE`, `REGISTERED_ROLE_ID`, `SUPORTE_ROLE_ID`, `RATE` (default 10).

Copy `.env.example` to `.env` to start.

### Infrastructure

Docker Compose spins up MongoDB on port 27017 and mongo-express UI on port 8081 (credentials: `user_ui`/`senha_ui`).
