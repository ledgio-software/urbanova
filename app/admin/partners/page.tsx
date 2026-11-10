import Link from 'next/link'
import { prisma } from '@/lib/db'
import { formatCommission } from '@/lib/partners'
import { PartnerStatusBadge } from '@/components/admin/PartnerStatusBadge'

export const dynamic = 'force-dynamic'

async function getPartners() {
  try {
    return await prisma.partner.findMany({
      orderBy: { createdAt: 'desc' },
      include: { _count: { select: { products: true, users: true } } },
    })
  } catch (err) {
    console.error('Failed to fetch partners:', err)
    return []
  }
}

export default async function PartnersPage() {
  const partners = await getPartners()

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200 pb-5">
        <div>
          <h1 className="font-headline text-2xl uppercase tracking-widest text-brand-black">Partners</h1>
          <p className="text-xs font-body text-gray-500 mt-1">
            Shops and creators selling on URBANOVA. Each gets a page on the site and their own dashboard.
          </p>
        </div>
        <Link
          href="/admin/partners/new"
          className="bg-brand-red text-white text-xs font-body uppercase tracking-wider font-semibold px-4 py-2 hover:bg-brand-red/90 transition-colors shadow-sm self-start sm:self-auto"
        >
          + Add Partner
        </Link>
      </div>

      {partners.length === 0 ? (
        <p className="font-body text-sm text-gray-500">No partners yet. Add your first partner to give them a page and a dashboard.</p>
      ) : (
        <div className="overflow-x-auto border border-gray-200 bg-white">
          <table className="w-full text-left font-body text-sm">
            <thead className="bg-gray-50 text-xs uppercase tracking-wider text-gray-500">
              <tr>
                <th className="px-4 py-3">Partner</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Commission</th>
                <th className="px-4 py-3">Products</th>
                <th className="px-4 py-3">Logins</th>
                <th className="px-4 py-3">Contact</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {partners.map((p) => (
                <tr key={p.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <Link href={`/admin/partners/${p.id}`} className="font-semibold text-brand-black hover:text-brand-red">
                      {p.name}
                    </Link>
                    <p className="text-xs text-gray-400">/partners/{p.slug}</p>
                  </td>
                  <td className="px-4 py-3"><PartnerStatusBadge status={p.status} /></td>
                  <td className="px-4 py-3">{p.type === 'stockist' ? 'Stockist' : 'Nova Market'}</td>
                  <td className="px-4 py-3">{p.type === 'stockist' ? 'None' : formatCommission(p.commissionBps)}</td>
                  <td className="px-4 py-3">{p._count.products}</td>
                  <td className="px-4 py-3">{p._count.users}</td>
                  <td className="px-4 py-3 text-gray-600">{p.contactPhone}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
