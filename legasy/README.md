# Messenger Interface

A modern messenger interface application built with Vite + React.

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:5173](http://localhost:5173) with your browser to see the result.

## Web Push (self-hosted, VAPID)

В проект добавлен Service Worker и фронтенд-модуль для Web Push.

### Service Worker (TypeScript)

- Исходник: `src/sw.ts`
- Сборка в: `public/sw.js` (должен быть доступен по URL `/sw.js`)
- Скрипт сборки: `pnpm run build:sw`

`pnpm dev` и `pnpm build` автоматически вызывают `build:sw` перед стартом.

### Переменные окружения

- `VITE_VAPID_PUBLIC_KEY` — публичный VAPID ключ (base64url), нужен для `pushManager.subscribe(...)`.
- `VITE_DISABLE_SW=true` — отключить регистрацию Service Worker (полезно, если SW мешает в dev).
- `VITE_API_URL` — базовый URL API (по умолчанию `https://cryptomsg.net/api/v1`).

### Тестирование в dev

Web Push требует HTTPS (или `localhost`). Для теста через HTTPS удобно использовать стенд `infra/nginx-test`:

- Запуск фронтенда с test-api: `pnpm dev:test-api`
- Запуск nginx: см. `infra/nginx-test/README.md`

### Контракт backend API для push (oblivion)

Фронтенд ожидает следующие endpoints (Bearer auth) от backend oblivion:

#### `POST /message/subscribe`

- **Headers**: `Authorization: Bearer <token>`, `Content-Type: application/json` (авторизация выставляется interceptor'ами `api`)
- **Body**: стандартный Web Push subscription object, который возвращает `PushManager.subscribe`:

```json
{
    "endpoint": "https://…",
    "expirationTime": null,
    "keys": { "p256dh": "…", "auth": "…" }
}
```

- **Response**: `{"ok": true}` (или `201 Created`/`204 No Content`)

Backend хранит подписки, привязанные к пользователю (по userId из access‑token), и отправляет Web Push при появлении новых сообщений.

### Payload push-уведомления

Backend oblivion отправляет через Web Push JSON вида:

```json
{
  "id": "message-id",
  "sender": "sender-public-key"
}
```

Service Worker (`src/sw.ts`) преобразует это в нотификацию с заголовком/текстом
и сохраняет `messageId`/`sender` в `notification.data`. При клике вкладка с
приложением фокусируется или открывается, после чего клиент может обновить
список сообщений.

## Learn More

To learn more about Vite, take a look at the following resources:

- [Vite Documentation](https://vitejs.dev/guide/) - learn about Vite features and API.
- [React Documentation](https://react.dev/learn) - learn about React.
