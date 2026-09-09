import { NextRequest, NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const file = formData.get('file') as File | null

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    // 1. Try Vercel Blob storage if BLOB_READ_WRITE_TOKEN is present
    if (process.env.BLOB_READ_WRITE_TOKEN) {
      try {
        const { put } = await import('@vercel/blob')
        const blob = await put(`products/${Date.now()}-${file.name}`, file, {
          access: 'public',
        })
        return NextResponse.json({ url: blob.url })
      } catch (blobErr) {
        console.error('Vercel Blob upload failed:', blobErr)
      }
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // 2. Try local filesystem write to public/uploads/ (for local dev environments)
    try {
      const uploadDir = path.join(process.cwd(), 'public', 'uploads')
      await mkdir(uploadDir, { recursive: true })

      const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_')
      const fileName = `${Date.now()}-${safeName}`
      const filePath = path.join(uploadDir, fileName)

      await writeFile(filePath, buffer)
      return NextResponse.json({ url: `/uploads/${fileName}` })
    } catch (fsErr) {
      console.warn('Filesystem write unavailable (serverless environment), generating Data URL fallback:', fsErr)
    }

    // 3. Serverless fallback: Convert file to Base64 Data URL
    const mimeType = file.type || 'image/jpeg'
    const base64Data = buffer.toString('base64')
    const dataUrl = `data:${mimeType};base64,${base64Data}`

    return NextResponse.json({ url: dataUrl })
  } catch (error: any) {
    console.error('Upload error:', error)
    return NextResponse.json({ error: error.message || 'Upload failed' }, { status: 500 })
  }
}
