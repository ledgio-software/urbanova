import { requirePartnerPage } from '@/lib/dashboard-page'
import { MIN_PASSWORD_LENGTH } from '@/lib/password'
import { ChangePasswordForm } from '@/components/dashboard/ChangePasswordForm'

export const dynamic = 'force-dynamic'

export default async function PartnerPasswordPage() {
  const { user } = await requirePartnerPage({ allowPasswordChange: true })
  const firstLogin = user.mustChangePassword

  return (
    <div className="space-y-6">
      <div className="border-b border-gray-200 pb-5">
        <h1 className="font-headline text-2xl uppercase tracking-widest text-brand-black">
          {firstLogin ? 'Set your password' : 'Change password'}
        </h1>
        {firstLogin && (
          <p className="mt-1 text-sm font-body text-gray-600">
            Welcome to URBANOVA, {user.name}. Choose your own password to finish setting up your dashboard.
          </p>
        )}
      </div>
      <ChangePasswordForm firstLogin={firstLogin} minLength={MIN_PASSWORD_LENGTH} />
    </div>
  )
}
