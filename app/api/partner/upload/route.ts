import { NextRequest, NextResponse } from 'next/server'
import { getPartnerContext } from '@/lib/authz'
import { storeUpload } from '@/lib/upload'

export const dynamic = 'force-dynamic'

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp']
const MAX_BYTES = 5 * 1024 * 1024

// Partner image upload — images only, 5 MB max, stored under the partner's own folder.
export async function POST(req: NextRequest) {
  const ctx = await getPartnerContext()
  if (!ctx) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (ctx.user.mustChangePassword) return NextResponse.json({ error: 'Set your password first' }, { status: 403 })

  try {
    const formData = await req.formData()
    const file = formData.get('file')
    if (!(file instanceof File)) return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json({ error: 'Please upload a JPG, PNG or WebP image' }, { status: 415 })
    }
    if (file.size > MAX_BYTES) return NextResponse.json({ error: 'Image must be 5 MB or smaller' }, { status: 413 })

    return NextResponse.json(await storeUpload(file, `partners/${ctx.partner.id}`))
  } catch (error) {
    console.error('Partner upload error:', error)
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 })
  }
}
