'use client'

import { useState } from 'react'

interface Props {
  label: string
  value: string | null
  onChange: (url: string | null) => void
  /** Upload endpoint: /api/admin/upload or /api/partner/upload */
  uploadUrl: string
  hint?: string
  aspect?: 'square' | 'wide'
}

// Single-image picker shared by the admin and partner dashboards.
export function ImageUploadField({ label, value, onChange, uploadUrl, hint, aspect = 'square' }: Props) {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleFile(file: File | undefined) {
    if (!file) return
    setError(null)
    setUploading(true)
    try {
      const form = new FormData()
      form.append('file', file)
      const res = await fetch(uploadUrl, { method: 'POST', body: form })
      const data = (await res.json()) as { url?: string; error?: string }
      if (!res.ok || !data.url) throw new Error(data.error ?? 'Upload failed')
      onChange(data.url)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div>
      <p className="block text-xs font-body uppercase tracking-widest text-gray-500 mb-2">{label}</p>
      <div className="flex items-start gap-4">
        <div
          className={`relative shrink-0 overflow-hidden border border-gray-200 bg-gray-100 ${
            aspect === 'wide' ? 'h-20 w-40' : 'h-20 w-20'
          }`}
        >
          {value ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={value} alt="" className="h-full w-full object-cover" />
          ) : (
            <span className="absolute inset-0 flex items-center justify-center text-[10px] uppercase tracking-widest text-gray-400">
              None
            </span>
          )}
        </div>
        <div className="space-y-2 text-xs font-body">
          <label className="inline-block cursor-pointer border border-gray-300 bg-white px-3 py-2 uppercase tracking-wider text-gray-700 hover:bg-gray-50">
            {uploading ? 'Uploading…' : value ? 'Replace' : 'Upload'}
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="sr-only"
              disabled={uploading}
              onChange={(e) => handleFile(e.target.files?.[0])}
            />
          </label>
          {value && (
            <button type="button" onClick={() => onChange(null)} className="ml-2 text-gray-500 underline hover:text-brand-red">
              Remove
            </button>
          )}
          {hint && <p className="text-gray-400">{hint}</p>}
          {error && <p className="text-brand-red">{error}</p>}
        </div>
      </div>
    </div>
  )
}
