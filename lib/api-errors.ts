import { NextResponse } from 'next/server'

// Prisma: table (P2021) or column (P2022) missing — the live database is behind the code.
export function isSchemaOutOfDate(err: unknown): boolean {
  const code = typeof err === 'object' && err !== null && 'code' in err ? (err as { code: unknown }).code : undefined
  return code === 'P2021' || code === 'P2022'
}

export const SCHEMA_OUT_OF_DATE =
  'The database hasn’t been updated for this version of the site yet. Run “npx prisma db push” on the live database, then try again.'

/** JSON error for admin APIs: a clear message when the database needs updating, a generic one otherwise. */
export function adminServerError(err: unknown, what: string) {
  console.error(`${what} failed:`, err)
  if (isSchemaOutOfDate(err)) return NextResponse.json({ error: SCHEMA_OUT_OF_DATE }, { status: 503 })
  return NextResponse.json({ error: `${what} failed — please try again` }, { status: 500 })
}
