#!/usr/bin/env sh
set -eu

DOMAIN="cryptomsg.test"
HOSTS_FILE="/etc/hosts"
ENTRY="127.0.0.1 ${DOMAIN}"

if grep -qE "^[[:space:]]*127\\.0\\.0\\.1[[:space:]]+${DOMAIN}([[:space:]]|\$)" "${HOSTS_FILE}"; then
  echo "${DOMAIN} уже прописан в ${HOSTS_FILE}"
  exit 0
fi

if grep -qE "[[:space:]]${DOMAIN}([[:space:]]|\$)" "${HOSTS_FILE}"; then
  echo "В ${HOSTS_FILE} уже есть упоминание ${DOMAIN}, но не как 127.0.0.1. Проверь файл вручную:"
  echo "  ${HOSTS_FILE}"
  exit 1
fi

echo "Добавляю в ${HOSTS_FILE}: ${ENTRY}"
echo "${ENTRY}" | sudo tee -a "${HOSTS_FILE}" >/dev/null

echo "Готово."
