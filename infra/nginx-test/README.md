# cryptomsg.test nginx (dev)

Этот nginx нужен для локальной разработки через домен `cryptomsg.test`:

- всё, **кроме** `/api/v1/*`, проксируется на локальный Vite dev server
- `/api/v1/*` проксируется на прод: `https://cryptomsg.net/api/v1/*` и nginx добавляет CORS заголовки

## Запуск

1. Добавь домен в hosts (один раз):

```bash
sh scripts/add-cryptomsg-test-host.sh
```

2. Запусти фронтенд:

```bash
pnpm dev:test-api
```

3. Собери и запусти nginx:

```bash
sh scripts/generate-cryptomsg-test-cert.sh
docker build -t cryptomsg-test-nginx ./infra/nginx-test
docker run --rm -p 80:80 -p 443:443 -v "$(pwd)/infra/nginx-test/certs:/etc/nginx/certs:ro" --name cryptomsg-test-nginx cryptomsg-test-nginx
```

Открывай в браузере: `https://cryptomsg.test` (порт 443).

## Если Vite не на 5173

Отредактируй `proxy_pass http://host.docker.internal:5173;` в `infra/nginx-test/nginx.conf` под нужный порт.

## Примечание про Linux

На Linux `host.docker.internal` может отсутствовать. Тогда запускай контейнер так:

```bash
docker run --rm -p 80:80 --add-host=host.docker.internal:host-gateway --name cryptomsg-test-nginx cryptomsg-test-nginx
```
