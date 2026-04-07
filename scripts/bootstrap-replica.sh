#!/usr/bin/env bash
set -euo pipefail

: "${PRIMARY_HOST:?PRIMARY_HOST is required}"
: "${PRIMARY_PORT:=5432}"
: "${REPLICATION_USER:?REPLICATION_USER is required}"
: "${REPLICATION_PASSWORD:?REPLICATION_PASSWORD is required}"
: "${PGDATA:=/var/lib/postgresql/data}"

export PGPASSWORD="${REPLICATION_PASSWORD}"

if [ -s "${PGDATA}/PG_VERSION" ]; then
  echo "Replica data directory already initialized, starting PostgreSQL."
  chown -R postgres:postgres "${PGDATA}"
  chmod 700 "${PGDATA}"
  exec gosu postgres postgres -c hot_standby=on
fi

mkdir -p "${PGDATA}"
chown -R postgres:postgres "${PGDATA}"
chmod 700 "${PGDATA}"

echo "Waiting for primary ${PRIMARY_HOST}:${PRIMARY_PORT} to be ready..."
until pg_isready -h "${PRIMARY_HOST}" -p "${PRIMARY_PORT}" -U "${REPLICATION_USER}"; do
  sleep 2
done

echo "Running pg_basebackup from primary ${PRIMARY_HOST}:${PRIMARY_PORT}..."
gosu postgres pg_basebackup \
  -h "${PRIMARY_HOST}" \
  -p "${PRIMARY_PORT}" \
  -D "${PGDATA}" \
  -U "${REPLICATION_USER}" \
  -Fp \
  -Xs \
  -P \
  -R

chown -R postgres:postgres "${PGDATA}"
chmod 700 "${PGDATA}"

exec gosu postgres postgres -c hot_standby=on
