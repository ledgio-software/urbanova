import type { Metadata } from 'next'
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

export const metadata: Metadata = {
  title: {
    default: 'URBANOVA — Bold City. Bold You.',
    template: '%s | URBANOVA',
  },
  description: "Streetwear made for the ones who don't wait to be noticed. Shop URBANOVA.",
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? 'https://urbanova.store'),
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
