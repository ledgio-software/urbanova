import type { Metadata, Viewport } from 'next'
import { auth } from '@/auth'
import { RiderTopBar } from '@/components/rider/RiderTopBar'

export const metadata: Metadata = {
  title: 'Rider',
  robots: { index: false, follow: false },
}

export const viewport: Viewport = { width: 'device-width', initialScale: 1 }

export default async function RiderLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()
  if (session?.user?.role !== 'rider') return <>{children}</>

  return (
    <div className="min-h-screen bg-gray-100">
      <RiderTopBar name={session.user.name ?? 'Rider'} />
      <main className="mx-auto max-w-xl p-4">{children}</main>
    </div>
  )
}
