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

### Commands

| Command | Location | Access |
|---|---|---|
| `/registro` | `src/discord/commands/public/registro.ts` | Public — links Discord user to Clash Royale tag |
| `/wallet` | `src/discord/commands/public/wallet.ts` | Public — opens wallet panel (deposit/withdraw/balance) |
| `/saldo` | `src/discord/commands/public/values.ts` | Public — shows current balance |
| `/ping` | `src/discord/commands/public/ping.ts` | Public |
| `/support` | `src/discord/commands/public/support.ts` | Public |
| `/queue` | `src/discord/commands/staff/queue.ts` | Staff — creates a bet queue embed |
| `/pagamentos` | `src/discord/commands/staff/pagamentos.ts` | Staff — lists pending payments |
| `/clash-test` | `src/discord/commands/staff/clash-test.ts` | Staff — tests Clash Royale API |

### Business Logic Flow

1. **Registration** (`/registro` + `clash-tag` responder) — links Discord user ID to a Clash Royale tag; stored in `User` MongoDB model.
2. **Queue** (`/queue` staff command + `bet/queue/enter_bet` / `bet/queue/leave_bet` responders) — staff creates a bet queue embed with a wager amount. Users click "Enter" to join. When 2 players join, a private `aposta-*` channel is created, `matchData` Map is populated (in-memory), and a `PendingMatch` document is persisted to MongoDB.
3. **Match confirmation** (`bet/match/accept` + `bet/match/cancel` responders) — both players must accept. Before deducting, the responder validates: (a) both players have a registered Clash tag, (b) both have sufficient balance at confirmation time. On success: `descontoPartida` debits both, `createActiveMatch` persists the match. If `createActiveMatch` fails after the debit, `estornoPartida` is called automatically to refund both players.
4. **Match verification** (`finalize-match` / `retry_verification` / `Cancelar` responders) — calls `verifyMatch` → `ClashRoyaleService.verifyMatch` which fetches battle logs from `https://proxy.royaleapi.dev/v1` and finds a common battle within the match time window. Winner gets `premio` (double the wager). Draws refund both players via `premio`.
5. **Wallet** (`deposito_modal` / `saque_modal` modals) — deposit via Mercado Pago PIX (`criarPagamentoPix`), withdraw via PIX key. Balance stored as integer **centavos** in `User.moedas`.
6. **Webhook** — HTTP server on `WEBHOOK_PORT` receives `payment.updated`/`payment.created` events from Mercado Pago at `POST /webhook/mercadopago`, then calls `processarWebhookPagamento` to credit the user.

### Business Model (ClashBet)

All business parameters live in `src/settings/platform.ts`. **Never hardcode financial values elsewhere — always import from there.**

- **Rake de 10%** — a plataforma retém 10% do pote total em cada partida. Ex: aposta R$10 cada → pote R$20 → vencedor recebe R$18, casa fica com R$2. Configurável via `RAKE_RATE`.
- **`calcularPremio(pote)`** — helper central que aplica o rake. Toda chamada a `premio()` já usa isso automaticamente.
- **Sistema de escada (12 níveis)** — apostas de R$0,50 a R$280,00. Prêmio do nível N ≥ aposta do nível N+1, incentivando reinvestimento. Definido em `LADDER`.
- **Bônus de login diário** — R$0,50 (configurável via `BONUS_LOGIN_DIARIO`). Garante aposta grátis no nível 1.
- **Bônus de primeira vitória do dia** — R$0,25 (configurável via `BONUS_PRIMEIRA_VITORIA`).
- **Projeção de lucro** — base: ~R$67,04/dia a cada 100 duelos; potencial de R$1.206.720,00/ano a 5.000 duelos/dia.
- **Sociedade** — Sócio 1: 42,5% · Sócio 2: 42,5% · Novo Sócio: 15% (com meta de +10% futuro). Definido em `SOCIEDADE`.

### Code Standards & Contribution Rules

These rules apply to every change — new features, bug fixes, and refactors alike.

#### Separation of Responsibilities

| Layer | Where | What belongs here |
|---|---|---|
| Configuration | `src/settings/platform.ts` | All tunable constants (rates, timeouts, bonuses). Never hardcode values elsewhere. |
| Business logic | `src/functions/use_cases/` | Financial operations, match lifecycle, notifications, engagement logic. |
| Helpers / menus | `src/functions/menus/` | Discord embed/component builders. Pure functions, no side effects. |
| Interaction handlers | `src/discord/responders/` | Thin layer: validate input, call `#functions`, reply. No business logic inline. |
| Commands | `src/discord/commands/` | Thin layer: parse options, call `#functions`, reply. No business logic inline. |
| Events | `src/discord/events/` | Thin layer: react to Discord events, call `#functions`. |
| Database models | `src/database/` | Mongoose schemas only. No query logic outside `#functions`. |

#### Rules

- **Responders and commands must stay thin.** If a handler is doing more than: (1) read interaction data, (2) call a function from `#functions`, (3) reply — extract the logic to `#functions` first.
- **One file, one responsibility.** Each file in `src/functions/use_cases/` handles one domain (money, match, queue notifications, etc.). Do not mix domains in one file.
- **All financial constants come from `platform.ts`.** Rake rate, bonus values, timeouts — never inline a number that represents a business rule.
- **Follow the framework patterns.** Use `new Command()`, `new Event()`, `new Responder()` — never invent alternative registration mechanisms.
- **`npm run check` must pass before any commit.** No TypeScript errors or unused import warnings.
- **Exports go through index files.** New functions in `src/functions/use_cases/` must be re-exported from `src/functions/index.ts`. New settings exports from `src/settings/index.ts`.

#### Key Design Decisions

- **Money is stored in centavos (integer)** — always divide by 100 for display. Never store floats. `User.moedas` defaults to `0` (not `0.0`).
- **All financial functions throw on error** — `deposito`, `saque`, `descontoPartida`, `estornoPartida`, `premio` all propagate errors. Only `getMoney` swallows errors (returns 0 as safe fallback for reads). Callers must handle errors and inform the user.
- **Balance is validated at confirmation time, not queue entry** — the check in `confirm-match.ts` runs immediately before `descontoPartida`. Users may enter queues freely; insufficient balance at confirmation cancels the match.
- **`matchData` Map is backed by `PendingMatch` in MongoDB** — on bot restart, the `ready` event reloads all `PendingMatch` documents into the in-memory Map, preventing orphaned channels.
- **Webhook idempotency via atomic claim** — `processarWebhookPagamento` uses `findOneAndUpdate` with `status: { $in: ['pending', 'in_progress'] }` as the filter before crediting. Only the first call succeeds; retries from Mercado Pago are safely ignored.
- **Compensation pattern for match creation** — since MongoDB transactions require a replica set (not configured), `createActiveMatch` failure after `descontoPartida` is handled by calling `estornoPartida` before re-throwing.
- **Mock mode** — `ClashRoyaleService` has a mock implementation (`src/functions/clash-royale/mock.ts`). In `NODE_ENV=development`, the mock is activated automatically via `configureVerification({ useMock: true })`.
- **Global constants** — `ephemeral`, `fetchReply`, `required`, `inline`, `disabled`, `animated` are defined as `true` on `globalThis` in `src/settings/global.ts` for use as shorthand in discord.js option objects.

### MongoDB Schemas

| Model | Key fields | Notes |
|---|---|---|
| `User` | `userId` (Discord ID), `clashTag`, `moedas` (centavos, default 0) | |
| `ActiveMatch` | `channelId`, `player1/2UserId`, `player1/2Tag`, `price`, `status`, `autoVerificationEnabled`, `verificationAttempts` | `verificationAttempts` incremented via `$inc` (atomic) |
| `PendingMatch` | `channelId`, `user1`, `user2`, `price`, `createdAt` | Created when channel opens, deleted on confirm or cancel. Restored to `matchData` Map on bot restart. |
| `Confirmation` | `channelId`, `user1`, `user2`, `messageId`, `price`, `date` | Written after both players confirm and match is created |
| `Guild` | `guildId`, `fixedMessageId` | |
| `Transaction` | `userId`, `type`, `amount`, `description` | Types: `depósito`, `saque`, `desconto`, `estorno`, `premio` |
| `PixPayment` | `mercadoPagoId`, `userId`, `valor`, `status` | Status flow: `pending` → `approved` / `cancelled` / `expired` |
| `Match` | `channelId`, `match`, `winner`, `date` | Historical match records |

### Financial Functions (`src/functions/use_cases/money.ts`)

| Function | Behaviour |
|---|---|
| `getMoney(userId)` | Returns balance in centavos. Returns 0 on error (safe read). |
| `deposito(userId, valor)` | Credits centavos. Throws if user not found. |
| `saque(userId, valor, pix)` | Debits centavos. Throws if user not found. |
| `descontoPartida(userId1, userId2, valor)` | Debits both players. Throws if either not found. |
| `estornoPartida(userId1, userId2, valor)` | Refunds both players. Used as compensation when match creation fails after debit. |
| `premio(userId, valor)` | Credits winner. Throws if user not found. |

### Environment Variables

Required: `BOT_TOKEN`, `GUILD_ID`, `MONGO_URI`, `API_TOKEN` (Clash Royale API via royaleapi.dev proxy).

Optional: `MERCADO_PAGO_TOKEN`, `WEBHOOK_PORT` (default 3000), `NOTION_API_KEY`, `DATABASE_ID`, `DATABASE_DEPOSIT_ID`, `CHANNEL_ID`, `CHANNEL_ID_QUEUE`, `REGISTERED_ROLE_ID`, `SUPORTE_ROLE_ID`, `RATE` (default 10).

Copy `.env.example` to `.env` to start.

### Infrastructure

Docker Compose spins up MongoDB on port 27017 and mongo-express UI on port 8081 (credentials: `user_ui`/`senha_ui`).

> MongoDB is running as a standalone node (no replica set), so multi-document transactions are not available. Use the compensation pattern (`estornoPartida`) for rollback scenarios.
