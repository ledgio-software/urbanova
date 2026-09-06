// Phase 2
export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  return <div>Product: {slug} — Phase 2</div>
}
