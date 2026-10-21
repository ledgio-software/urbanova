import type { MetadataRoute } from 'next'
import { brandColors } from '@/lib/brand'

// Makes the storefront installable ("Add to Home Screen") so it opens like an app.
// Icons in /public/icons are placeholders until the final logo is confirmed (Reference A.10 #1).
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'URBANOVA — Bold City. Bold You.',
    short_name: 'URBANOVA',
    description: "Streetwear made for the ones who don't wait to be noticed.",
    start_url: '/',
    scope: '/',
    display: 'standalone',
    orientation: 'portrait',
    background_color: brandColors.navy,
    theme_color: brandColors.navy,
    icons: [
      { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
      { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
      { src: '/icons/icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
  }
}
