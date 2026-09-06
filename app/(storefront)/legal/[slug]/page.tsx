// Phase 5 — covers shipping-returns, privacy-policy, terms-of-service
export default function LegalPage({ params }: { params: { slug: string } }) {
  return <div>Legal: {params.slug} — Phase 5</div>
}
