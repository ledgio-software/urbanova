// Phase 3
export default async function OrderConfirmationPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return <div>Order {id} confirmed — Phase 3</div>
}
