'use client'

import { useState } from 'react'

// Shows a partner's or rider's one-time password once, with copy + WhatsApp share. It is never stored in plain text.
export function OneTimePassword({
  email,
  password,
  phone,
  loginPath = '/partner/login',
  title = 'URBANOVA partner dashboard',
}: {
  email: string
  password: string
  phone?: string
  loginPath?: string
  title?: string
}) {
  const [copied, setCopied] = useState(false)
  const loginUrl = typeof window === 'undefined' ? loginPath : `${window.location.origin}${loginPath}`
  const message = `Your ${title} login\n${loginUrl}\nEmail: ${email}\nTemporary password: ${password}\nYou'll be asked to set your own password when you first log in.`
  const waDigits = phone ? phone.replace(/\D/g, '').replace(/^0/, '233') : ''

  return (
    <div className="border border-amber-300 bg-amber-50 p-4 font-body text-sm text-amber-900">
      <p className="font-semibold">Share this login with the partner now — the password won&apos;t be shown again.</p>
      <dl className="mt-3 grid grid-cols-[auto_1fr] gap-x-3 gap-y-1">
        <dt className="text-amber-700">Email</dt>
        <dd className="font-mono">{email}</dd>
        <dt className="text-amber-700">Temporary password</dt>
        <dd className="font-mono" data-testid="temp-password">{password}</dd>
      </dl>
      <div className="mt-4 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={async () => {
            await navigator.clipboard.writeText(message)
            setCopied(true)
          }}
          className="border border-amber-400 bg-white px-3 py-1.5 text-xs uppercase tracking-wider hover:bg-amber-100"
        >
          {copied ? 'Copied' : 'Copy login message'}
        </button>
        {waDigits && (
          <a
            href={`https://wa.me/${waDigits}?text=${encodeURIComponent(message)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-[#25D366] px-3 py-1.5 text-xs uppercase tracking-wider text-black hover:bg-[#20bd5a]"
          >
            Send on WhatsApp
          </a>
        )}
      </div>
    </div>
  )
}
