// Phase 2
export default async function CategoryPage({ params }: { params: Promise<{ category: string }> }) {
  const { category } = await params
  return <div>Category: {category} — Phase 2</div>
}
