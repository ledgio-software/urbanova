import Link from 'next/link'

// Shown when the bag already holds items paid to someone else (URBANOVA vs. an URBANOVA stockist).
export function SellerConflictNotice({ inBag, thisItem }: { inBag: string; thisItem: string }) {
  return (
    <p className="border border-amber-300 bg-amber-50 p-3 font-body text-sm text-amber-900" role="status" data-testid="seller-conflict">
      Your bag has items from <strong>{inBag}</strong>. Items from <strong>{thisItem}</strong> are paid for separately —{' '}
      <Link href="/cart" className="underline">check out your bag</Link> first, then come back for this one.
    </p>
  )
}
