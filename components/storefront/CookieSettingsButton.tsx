'use client'

import { OPEN_COOKIE_SETTINGS_EVENT } from '@/lib/consent'

// Footer link that reopens the cookie banner so visitors can change their choice.
export function CookieSettingsButton({ className }: { className?: string }) {
  return (
    <button type="button" onClick={() => window.dispatchEvent(new Event(OPEN_COOKIE_SETTINGS_EVENT))} className={className}>
      Cookie settings
    </button>
  )
}
