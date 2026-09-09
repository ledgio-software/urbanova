import crypto from 'crypto'

const PAYSTACK_SECRET = process.env.PAYSTACK_SECRET_KEY ?? ''

// ─── Initialise a payment ──────────────────────────────────────────────────────

interface InitPaymentParams {
  email: string
  amountPesewas: number   // Paystack accepts the smallest currency unit (kobo/pesewas)
  reference: string
  callbackUrl: string
  metadata?: Record<string, unknown>
}

interface PaystackInitResponse {
  status: boolean
  message: string
  data: {
    authorization_url: string
    access_code: string
    reference: string
  }
}

export async function initializePayment(params: InitPaymentParams): Promise<PaystackInitResponse> {
  const res = await fetch('https://api.paystack.co/transaction/initialize', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${PAYSTACK_SECRET}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email: params.email,
      amount: params.amountPesewas,
      reference: params.reference,
      callback_url: params.callbackUrl,
      metadata: params.metadata,
    }),
  })

  if (!res.ok) {
    throw new Error(`Paystack init failed: ${res.status} ${res.statusText}`)
  }

  return res.json() as Promise<PaystackInitResponse>
}

// ─── Verify a payment (called from the webhook handler) ───────────────────────

interface PaystackVerifyResponse {
  status: boolean
  data: {
    status: string           // 'success' | 'failed' | 'abandoned'
    reference: string
    amount: number
    paid_at: string
    customer: { email: string }
  }
}

export async function verifyPayment(reference: string): Promise<PaystackVerifyResponse> {
  const res = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
    headers: { Authorization: `Bearer ${PAYSTACK_SECRET}` },
  })

  if (!res.ok) {
    throw new Error(`Paystack verify failed: ${res.status} ${res.statusText}`)
  }

  return res.json() as Promise<PaystackVerifyResponse>
}

// ─── Validate webhook signature ───────────────────────────────────────────────
// Per Paystack docs — NEVER mark an order paid without validating this.

export function validateWebhookSignature(payload: string, signature: string): boolean {
  const expected = crypto
    .createHmac('sha512', PAYSTACK_SECRET)
    .update(payload)
    .digest('hex')
  return expected === signature
}

// ─── Generate a unique payment reference ─────────────────────────────────────

export function generateReference(orderId: string): string {
  return `URB-${orderId}-${Date.now()}`
}
