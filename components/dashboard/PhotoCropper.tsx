'use client'

import { useEffect, useRef, useState } from 'react'
import { brandColors } from '@/lib/brand'

// Crop every product photo to the shop's portrait frame (3:4) before it is uploaded, so all products
// look the same on the site. Drag to move, slider to zoom; zooming out shows the whole item on the
// product-photo background. Output: 1200 × 1600 JPEG.

const FRAME_W = 270
const FRAME_H = 360
const OUT_W = 1200
const OUT_H = 1600

type Props = {
  file: File
  position?: { current: number; total: number } // "Photo 2 of 3"
  onDone: (cropped: File) => void
  onCancel: () => void
}

export function PhotoCropper({ file, position, onDone, onCancel }: Props) {
  const [img, setImg] = useState<HTMLImageElement | null>(null)
  const [zoom, setZoom] = useState(1) // 1 = fills the frame
  const [offset, setOffset] = useState({ x: 0, y: 0 })
  const [error, setError] = useState<string | null>(null)
  const drag = useRef<{ x: number; y: number; ox: number; oy: number } | null>(null)

  useEffect(() => {
    const url = URL.createObjectURL(file)
    const image = new Image()
    image.onload = () => {
      setImg(image)
      setZoom(1)
      setOffset({ x: 0, y: 0 })
    }
    image.onerror = () => setError('This photo could not be opened. Try a JPG or PNG.')
    image.src = url
    return () => URL.revokeObjectURL(url)
  }, [file])

  const cover = img ? Math.max(FRAME_W / img.naturalWidth, FRAME_H / img.naturalHeight) : 1
  const minZoom = img ? Math.min(FRAME_W / img.naturalWidth, FRAME_H / img.naturalHeight) / cover : 1
  const scale = cover * zoom
  const w = img ? img.naturalWidth * scale : 0
  const h = img ? img.naturalHeight * scale : 0

  // Keep the photo covering the frame where it is bigger than the frame; centre it where it is smaller
  const clamp = (o: { x: number; y: number }, ww = w, hh = h) => {
    const mx = Math.max(0, (ww - FRAME_W) / 2)
    const my = Math.max(0, (hh - FRAME_H) / 2)
    return { x: Math.min(mx, Math.max(-mx, o.x)), y: Math.min(my, Math.max(-my, o.y)) }
  }

  function changeZoom(z: number) {
    setZoom(z)
    if (img) setOffset((o) => clamp(o, img.naturalWidth * cover * z, img.naturalHeight * cover * z))
  }

  function save() {
    if (!img) return
    const canvas = document.createElement('canvas')
    canvas.width = OUT_W
    canvas.height = OUT_H
    const ctx = canvas.getContext('2d')
    if (!ctx) return setError('Your browser could not crop this photo.')
    const k = OUT_W / FRAME_W
    ctx.fillStyle = brandColors.white
    ctx.fillRect(0, 0, OUT_W, OUT_H)
    ctx.imageSmoothingQuality = 'high'
    ctx.drawImage(img, ((FRAME_W - w) / 2 + offset.x) * k, ((FRAME_H - h) / 2 + offset.y) * k, w * k, h * k)
    canvas.toBlob(
      (blob) => {
        if (!blob) return setError('Could not save the photo — please try again.')
        const name = file.name.replace(/\.[^.]+$/, '') || 'photo'
        onDone(new File([blob], `${name}.jpg`, { type: 'image/jpeg' }))
      },
      'image/jpeg',
      0.88,
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4" role="dialog" aria-modal="true" aria-label="Crop photo">
      <div className="w-full max-w-sm space-y-4 bg-white p-5 font-body" data-testid="photo-cropper">
        <div className="flex items-baseline justify-between">
          <h2 className="font-headline text-lg uppercase tracking-widest text-brand-black">Fit your photo</h2>
          {position && position.total > 1 && (
            <span className="text-xs text-gray-500">Photo {position.current} of {position.total}</span>
          )}
        </div>
        <p className="text-xs text-gray-500">Drag to move. Zoom so the whole item sits nicely in the frame.</p>

        <div
          className="relative mx-auto cursor-grab touch-none select-none overflow-hidden bg-brand-white active:cursor-grabbing"
          style={{ width: FRAME_W, height: FRAME_H }}
          onPointerDown={(e) => {
            ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
            drag.current = { x: e.clientX, y: e.clientY, ox: offset.x, oy: offset.y }
          }}
          onPointerMove={(e) => {
            const d = drag.current
            if (d) setOffset(clamp({ x: d.ox + e.clientX - d.x, y: d.oy + e.clientY - d.y }))
          }}
          onPointerUp={() => (drag.current = null)}
          onPointerCancel={() => (drag.current = null)}
        >
          {img && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={img.src}
              alt=""
              draggable={false}
              className="pointer-events-none absolute max-w-none"
              style={{ width: w, height: h, left: (FRAME_W - w) / 2 + offset.x, top: (FRAME_H - h) / 2 + offset.y }}
            />
          )}
        </div>

        <label className="block">
          <span className="mb-1 block text-xs uppercase tracking-widest text-gray-500">Zoom</span>
          <input
            type="range"
            min={Math.min(minZoom, 1)}
            max={3}
            step={0.01}
            value={zoom}
            onChange={(e) => changeZoom(Number(e.target.value))}
            className="w-full"
            aria-label="Zoom"
          />
        </label>
        <button type="button" onClick={() => changeZoom(Math.min(minZoom, 1))} className="text-xs text-gray-600 underline">
          Show the whole photo
        </button>

        {error && <p className="text-sm text-brand-red" role="alert">{error}</p>}
        <div className="flex gap-2">
          <button
            type="button"
            onClick={save}
            disabled={!img}
            className="flex-1 bg-brand-red px-4 py-2.5 text-xs font-semibold uppercase tracking-wider text-white hover:bg-brand-red/90 disabled:opacity-50"
          >
            Use photo
          </button>
          <button type="button" onClick={onCancel} className="border border-gray-300 px-4 py-2.5 text-xs uppercase tracking-wider text-gray-700 hover:bg-gray-50">
            Leave out
          </button>
        </div>
      </div>
    </div>
  )
}
