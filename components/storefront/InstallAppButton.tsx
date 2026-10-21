'use client'

import { useEffect, useState } from 'react'

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

// "Add to Home Screen" prompt for the footer. Android/Chrome gets a one-tap button;
// iPhone Safari has no install API, so it gets the two-step instruction instead.
// Hidden when the site is already running as an installed app.
export function InstallAppButton() {
  const [installEvent, setInstallEvent] = useState<BeforeInstallPromptEvent | null>(null)
  const [showIosHint, setShowIosHint] = useState(false)
  const [installed, setInstalled] = useState(false)

  useEffect(() => {
    const standalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (navigator as Navigator & { standalone?: boolean }).standalone === true
    if (standalone) {
      setInstalled(true)
      return
    }
    setShowIosHint(/iphone|ipad|ipod/i.test(navigator.userAgent))
    const onPrompt = (e: Event) => {
      e.preventDefault()
      setInstallEvent(e as BeforeInstallPromptEvent)
    }
    const onInstalled = () => {
      setInstalled(true)
      setInstallEvent(null)
    }
    window.addEventListener('beforeinstallprompt', onPrompt)
    window.addEventListener('appinstalled', onInstalled)
    return () => {
      window.removeEventListener('beforeinstallprompt', onPrompt)
      window.removeEventListener('appinstalled', onInstalled)
    }
  }, [])

  if (installed) return null

  if (installEvent) {
    return (
      <button
        type="button"
        onClick={async () => {
          await installEvent.prompt()
          const { outcome } = await installEvent.userChoice
          if (outcome === 'accepted') setInstalled(true)
          setInstallEvent(null)
        }}
        className="mt-4 inline-flex items-center gap-2 border border-white/30 px-4 py-2.5 font-body text-xs uppercase tracking-widest text-brand-white hover:bg-white/10 transition-colors"
      >
        <span aria-hidden>＋</span> Add URBANOVA to your home screen
      </button>
    )
  }

  if (showIosHint) {
    return (
      <p className="mt-4 max-w-xs font-body text-xs leading-relaxed text-brand-white/50">
        Keep URBANOVA on your phone: tap <span className="text-brand-white/80">Share</span>, then{' '}
        <span className="text-brand-white/80">Add to Home Screen</span>.
      </p>
    )
  }

  return null
}
