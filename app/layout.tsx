import type { Metadata, Viewport } from 'next'
import { Inter, Bebas_Neue } from 'next/font/google'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-body',
  display: 'swap',
})

const bebasNeue = Bebas_Neue({
  subsets: ['latin'],
  weight: '400',
  variable: '--font-headline',
  display: 'swap',
})

import { brandColors } from '@/lib/brand'
import { getSiteUrl } from '@/lib/site-url'

export const metadata: Metadata = {
  title: {
    default: 'URBANOVA — Bold City. Bold You.',
    template: '%s | URBANOVA',
  },
  description: "Streetwear made for the ones who don't wait to be noticed. Shop URBANOVA.",
  metadataBase: new URL(getSiteUrl()),
  openGraph: {
    siteName: 'URBANOVA',
    type: 'website',
    locale: 'en_GH',
  },
  twitter: {
    card: 'summary_large_image',
    site: '@urbanovanow',
  },
  robots: {
    index: true,
    follow: true,
  },
  // Home-screen install on iPhone (Android uses app/manifest.ts)
  appleWebApp: {
    capable: true,
    title: 'URBANOVA',
    statusBarStyle: 'black-translucent',
  },
}

export const viewport: Viewport = {
  themeColor: brandColors.navy,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${inter.variable} ${bebasNeue.variable}`}>
      <body>{children}</body>
    </html>
  )
}
