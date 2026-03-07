#!/usr/bin/env sh
set -eu

DOMAIN="cryptomsg.test"
OUT_DIR="infra/nginx-test/certs"
KEY="${OUT_DIR}/${DOMAIN}.key"
CRT="${OUT_DIR}/${DOMAIN}.crt"

mkdir -p "${OUT_DIR}"

if [ -f "${KEY}" ] && [ -f "${CRT}" ]; then
  echo "Сертификат уже существует:"
  echo "  ${KEY}"
  echo "  ${CRT}"
  exit 0
fi

echo "Генерирую self-signed сертификат для ${DOMAIN} (SAN включён)"

# macOS openssl не всегда поддерживает -addext, поэтому используем временный config
TMP_CONF="$(mktemp)"
cat > "${TMP_CONF}" <<EOF
[req]
default_bits = 2048
prompt = no
default_md = sha256
distinguished_name = dn
x509_extensions = v3_req

[dn]
C = RU
ST = Local
L = Local
O = SecureChat Dev
CN = ${DOMAIN}

[v3_req]
subjectAltName = @alt_names
keyUsage = digitalSignature, keyEncipherment
extendedKeyUsage = serverAuth

[alt_names]
DNS.1 = ${DOMAIN}
EOF

openssl req -x509 -nodes -days 825 -newkey rsa:2048 \
  -keyout "${KEY}" \
  -out "${CRT}" \
  -config "${TMP_CONF}" >/dev/null 2>&1

rm -f "${TMP_CONF}"

echo "Готово:"
echo "  ${KEY}"
echo "  ${CRT}"
