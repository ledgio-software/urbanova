// Phase 3 — Paystack webhook handler
// IMPORTANT: Only mark an order 'paid' after validating the webhook signature.
// See lib/paystack.ts → validateWebhookSignature()
import { NextResponse } from 'next/server'

export async function POST() {
  return NextResponse.json(
    { error: 'Webhook handler not yet implemented — Phase 3' },
    { status: 501 }
  )
}
