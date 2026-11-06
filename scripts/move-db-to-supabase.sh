#!/usr/bin/env bash
# Copy the URBANOVA database (all tables + data) from the current Postgres to a new Supabase project,
# then bring the copy up to this branch's schema. See docs/SUPABASE_MIGRATION.md for the full steps.
#
# Usage (from the repo root, on the branch you are about to deploy):
#   OLD_DATABASE_URL='postgresql://…current direct (non-pooled) URL…' \
#   SUPABASE_DIRECT_URL='postgresql://…Supabase session/direct URL, port 5432…' \
#   bash scripts/move-db-to-supabase.sh
#
# Safe to re-run until it succeeds: it refuses to touch a Supabase database that already has tables,
# and it never writes to the old database (that stays as your fallback).

set -euo pipefail

: "${OLD_DATABASE_URL:?Set OLD_DATABASE_URL to the current database (direct, non-pooled URL)}"
: "${SUPABASE_DIRECT_URL:?Set SUPABASE_DIRECT_URL to the Supabase session/direct URL (port 5432)}"

for tool in pg_dump psql npx; do
  command -v "$tool" >/dev/null || { echo "Missing $tool — install PostgreSQL client tools (and Node.js)."; exit 1; }
done

case "$SUPABASE_DIRECT_URL" in
  *:6543/*) echo "SUPABASE_DIRECT_URL uses port 6543 (transaction pooler). Use the session/direct URL on port 5432."; exit 1 ;;
esac

q() { psql "$1" -XAtq -v ON_ERROR_STOP=1 -c "$2"; }

echo "→ Checking connections…"
old_server=$(q "$OLD_DATABASE_URL" "show server_version_num")
q "$SUPABASE_DIRECT_URL" "select 1" >/dev/null
dump_major=$(pg_dump --version | sed -E 's/[^0-9]*([0-9]+).*/\1/')
if (( dump_major < old_server / 10000 )); then
  echo "pg_dump $dump_major is older than the old server ($((old_server / 10000))). Install a newer PostgreSQL client."; exit 1
fi

existing=$(q "$SUPABASE_DIRECT_URL" "select count(*) from information_schema.tables where table_schema='public'")
if [[ "$existing" != "0" ]]; then
  echo "The Supabase database already has $existing table(s) in 'public'. Refusing to overwrite."
  echo "Use a fresh Supabase project (or empty its public schema yourself) and run again."; exit 1
fi

backup="urbanova-backup-$(date +%Y%m%d-%H%M%S).sql"
echo "→ Backing up the current database to $backup …"
pg_dump "$OLD_DATABASE_URL" --schema=public --no-owner --no-privileges --no-comments --format=plain \
  | grep -v -E '^CREATE SCHEMA public;$' > "$backup"
echo "  $(du -h "$backup" | cut -f1) written. Keep this file somewhere safe."

echo "→ Restoring into Supabase (one transaction — all or nothing)…"
psql "$SUPABASE_DIRECT_URL" -Xq -v ON_ERROR_STOP=1 --single-transaction -f "$backup" >/dev/null

echo "→ Applying this branch's schema changes (prisma db push)…"
DATABASE_URL="$SUPABASE_DIRECT_URL" DIRECT_URL="$SUPABASE_DIRECT_URL" npx prisma db push --skip-generate

echo "→ Comparing row counts (old → Supabase)…"
tables=$(q "$OLD_DATABASE_URL" "select table_name from information_schema.tables where table_schema='public' and table_type='BASE TABLE' order by 1")
mismatch=0
for t in $tables; do
  a=$(q "$OLD_DATABASE_URL" "select count(*) from public.\"$t\"")
  b=$(q "$SUPABASE_DIRECT_URL" "select count(*) from public.\"$t\"")
  flag="ok"; [[ "$a" == "$b" ]] || { flag="MISMATCH"; mismatch=1; }
  printf '  %-22s %8s → %-8s %s\n' "$t" "$a" "$b" "$flag"
done

if (( mismatch )); then
  echo "Row counts differ — do NOT switch Vercel yet. (New orders placed during the copy also cause this; re-run on a fresh project.)"
  exit 1
fi
echo "✓ Done. Every table matches. Now update DATABASE_URL and DIRECT_URL in Vercel (docs/SUPABASE_MIGRATION.md, step 4)."
