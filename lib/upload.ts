import { mkdir, writeFile } from 'fs/promises'
import path from 'path'

// Stores an uploaded file and returns a URL for it. Used by the admin and partner upload routes.
// 1. Vercel Blob when BLOB_READ_WRITE_TOKEN is set (production)
// 2. public/uploads/ on the local filesystem (dev)
// 3. base64 data: URL as a last resort (serverless without Blob — slow, see warning)
export async function storeUpload(file: File, folder: string): Promise<{ url: string; warning?: string }> {
  if (process.env.BLOB_READ_WRITE_TOKEN) {
    try {
      const { put } = await import('@vercel/blob')
      const blob = await put(`${folder}/${Date.now()}-${file.name}`, file, {
        access: 'public',
        // Cache for 1 year on Vercel's CDN — images are immutable (content-addressed names)
        cacheControlMaxAge: 31536000,
      })
      return { url: blob.url }
    } catch (blobErr) {
      console.error('Vercel Blob upload failed:', blobErr)
    }
  }

  const buffer = Buffer.from(await file.arrayBuffer())

  try {
    const uploadDir = path.join(process.cwd(), 'public', 'uploads')
    await mkdir(uploadDir, { recursive: true })
    const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_')
    const fileName = `${Date.now()}-${safeName}`
    await writeFile(path.join(uploadDir, fileName), buffer)
    return { url: `/uploads/${fileName}` }
  } catch (fsErr) {
    console.warn('Filesystem write unavailable (serverless environment), generating Data URL fallback:', fsErr)
  }

  // WARNING: data: URLs are stored in the database and bypass Next.js image optimisation.
  // Images will load slowly. Set BLOB_READ_WRITE_TOKEN in Vercel env vars to fix this.
  console.error(
    '[upload] BLOB_READ_WRITE_TOKEN not set — falling back to base64 data URL. ' +
      'Images will be slow. Add BLOB_READ_WRITE_TOKEN in Vercel project settings.',
  )
  const mimeType = file.type || 'image/jpeg'
  return {
    url: `data:${mimeType};base64,${buffer.toString('base64')}`,
    warning: 'Image stored as data URL. Set BLOB_READ_WRITE_TOKEN for fast CDN delivery.',
  }
}
