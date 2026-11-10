import type { Metadata } from 'next'
import { auth } from '@/auth'
import { PartnerNav } from '@/components/partner/PartnerNav'
import { prisma } from '@/lib/db'

export const metadata: Metadata = {
  title: 'Partner Dashboard',
  robots: { index: false, follow: false },
}

export default async function PartnerLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()

  // Not signed in as a partner (e.g. /partner/login): full-screen, no dashboard nav
  if (session?.user?.role !== 'partner') return <>{children}</>

  // Stockists are paid directly and manage their own orders
  const partnerId = session.user.partnerId
  const partner = partnerId
    ? await prisma.partner.findUnique({ where: { id: partnerId }, select: { type: true } }).catch(() => null)
    : null

  return (
    <div className="flex min-h-screen flex-col bg-gray-50 md:flex-row">
      <PartnerNav name={session.user.name ?? 'Partner'} stockist={partner?.type === 'stockist'} />
      <main className="w-full flex-1 overflow-auto p-4 sm:p-6 lg:p-8">{children}</main>
    </div>
  )
}
