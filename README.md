# Auction House React Web App

Монорепозиторий аукционного приложения: API-клиент и веб-приложение.

## Структура

- `packages/auction-api-client` — TypeScript API-клиент (auth, lots, bets)
- `apps/web` — Vite + React SPA

## Запуск

```bash
npm install
npm run build:client   # собрать API-клиент
npm run dev            # dev-сервер (http://localhost:5173)
```

## Сборка

```bash
npm run build
```

## API

По умолчанию Vite проксирует `/api` на `http://localhost:8000`. Укажите `VITE_API_URL` в `.env` для другого backend.
