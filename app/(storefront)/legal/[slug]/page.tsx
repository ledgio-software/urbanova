// Phase 5 — covers shipping-returns, privacy-policy, terms-of-service
export default async function LegalPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  return <div>Legal: {slug} — Phase 5</div>
}
