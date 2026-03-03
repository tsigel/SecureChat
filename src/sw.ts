/// <reference lib="webworker" />

import { Service } from './workers/Service';

const sw = self as unknown as ServiceWorkerGlobalScope;

// Весь lifecycle и обработка push/notificationclick инкапсулированы в Service.
// Здесь только инициализируем его один раз на уровне Service Worker.
void new Service(sw);
