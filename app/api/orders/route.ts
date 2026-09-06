// Phase 3/4 — full implementation in Phase 3 (customer) and Phase 4 (admin)
import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json(
    { error: 'Orders endpoint not yet implemented — Phase 3/4' },
    { status: 501 }
  )
}
