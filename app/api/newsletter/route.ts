import { NextRequest, NextResponse } from 'next/server'
import { NewsletterSchema } from '@/lib/validators'

export async function POST(req: NextRequest) {
  let body: unknown
  try {
    // Support both JSON and form submissions
    const contentType = req.headers.get('content-type') ?? ''
    if (contentType.includes('application/json')) {
      body = await req.json()
    } else {
      const formData = await req.formData()
      body = { email: formData.get('email') }
    }
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }

  const parsed = NewsletterSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Valid email required' }, { status: 422 })
  }

  // Placeholder: integrate with Mailchimp/Klaviyo/Resend Audiences when ready
  // The email is validated — store or forward as needed
  console.log('Newsletter signup:', parsed.data.email)

  // For form POST submissions, redirect back to referring page
  const referer = req.headers.get('referer') ?? '/'
  if (req.headers.get('content-type')?.includes('application/x-www-form-urlencoded') ||
      req.headers.get('content-type')?.includes('multipart/form-data')) {
    return NextResponse.redirect(referer, { status: 303 })
  }

  return NextResponse.json({ success: true })
}
