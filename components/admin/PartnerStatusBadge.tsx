const STYLES: Record<string, string> = {
  pending: 'bg-amber-100 text-amber-800',
  active: 'bg-green-100 text-green-800',
  suspended: 'bg-gray-200 text-gray-700',
}

const LABELS: Record<string, string> = {
  pending: 'Pending',
  active: 'Live',
  suspended: 'Suspended',
}

export function PartnerStatusBadge({ status }: { status: string }) {
  return (
    <span className={`inline-block px-2 py-0.5 text-[10px] font-body font-semibold uppercase tracking-wider ${STYLES[status] ?? STYLES.suspended}`}>
      {LABELS[status] ?? status}
    </span>
  )
}
