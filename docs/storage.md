# Storage facade (кросс‑платформенный контракт)

Цель: иметь единый контракт хранения для Web (IndexedDB), React Native и Electron, чтобы UI/модель не зависели от конкретной БД.

## Контракт

- **Фасад**: `src/storage/index.ts`
  - `StorageFacade`: `{ init(), contacts, messages }`
  - `AddressBookRepository`: адресная книга
  - `MessageRepository`: сообщения
  - Все методы возвращают `ResultAsync<..., StorageError>` из `neverthrow`.

## Типизированные ошибки

- **Тип**: `StorageError` в `src/storage/errors.ts` (union классов `extends AppError`)
- **Конструкторы**: `src/storage/errors.ts`

## Web-реализация (IndexedDB)

- **Схема**: `src/storage/indexeddb/schema.ts`
  - DB: `securechat-db`, версия `1`
  - Store `contacts` (keyPath: `publicKeyHex`, index: `by_nameLower`)
  - Store `messages` (keyPath: `id`, индексы: `by_conversation_createdAt`, `by_from_createdAt`, `by_to_createdAt`)
- **Клиент**: `src/storage/indexeddb/client.ts` (тонкая Promise/tx-обёртка, ошибки маппятся в `StorageError`)
- **Репозитории**:
  - `src/storage/indexeddb/IndexedDbAddressBookRepository.ts`
  - `src/storage/indexeddb/IndexedDbMessageRepository.ts`
- **Фасад**: `src/storage/indexeddb/index.ts`
- **Фабрика под Web**: `src/storage/web.ts`
- **Инициализация**: `src/main.tsx` вызывает `getStorageFacade().init()`

## Как добавить другую платформу

1. Реализовать `StorageFacade`/репозитории из `src/model/storage.ts` в новом репо (RN/Electron).
2. Использовать те же типы ошибок (`StorageError`) и `neverthrow`.
3. Подменить фабрику (`createWebStorageFacade`) на платформо‑специфичную.

