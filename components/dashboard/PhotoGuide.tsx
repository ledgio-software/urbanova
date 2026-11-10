import Image from 'next/image'

// Shown next to product photo uploads: what a good product photo looks like on URBANOVA.
const TIPS = [
  'Hang the item on a hanger (or lay it flat).',
  'Use a plain, light wall or background.',
  'Good light — daylight near a window, no flash.',
  'Hold your phone upright and get the whole item in the photo.',
  'One item per photo. The first photo is the main one.',
]

export function PhotoGuide() {
  return (
    <div className="flex gap-4 border border-gray-200 bg-gray-50 p-3" data-testid="photo-guide">
      <div className="relative aspect-[3/4] w-20 shrink-0 self-start overflow-hidden bg-brand-white sm:w-24">
        <Image src="/images/product-photo-example.jpg" alt="Example: a white URBANOVA tee on a hanger against a plain light wall" fill sizes="96px" className="object-contain" />
      </div>
      <div className="min-w-0 font-body text-xs text-gray-600">
        <p className="mb-1 font-semibold uppercase tracking-wider text-brand-black">Take photos like this</p>
        <ul className="list-disc space-y-0.5 pl-4">
          {TIPS.map((t) => (
            <li key={t}>{t}</li>
          ))}
        </ul>
        <p className="mt-1">You can fit each photo to the frame before it&apos;s saved.</p>
      </div>
    </div>
  )
}
