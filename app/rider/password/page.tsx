import { requireRiderPage } from '@/lib/dashboard-page'
import { MIN_PASSWORD_LENGTH } from '@/lib/password'
import { ChangePasswordForm } from '@/components/dashboard/ChangePasswordForm'

export const dynamic = 'force-dynamic'

export default async function RiderPasswordPage() {
  const { rider } = await requireRiderPage({ allowPasswordChange: true })
  const firstLogin = rider.mustChangePassword

  return (
    <div className="space-y-4">
      <h1 className="font-headline text-2xl uppercase tracking-widest text-brand-black">{firstLogin ? 'Set your password' : 'Change password'}</h1>
      {firstLogin && <p className="text-sm font-body text-gray-600">Welcome, {rider.name}. Choose your own password to start receiving deliveries.</p>}
      <ChangePasswordForm firstLogin={firstLogin} minLength={MIN_PASSWORD_LENGTH} endpoint="/api/rider/password" home="/rider" />
    </div>
  )
}
