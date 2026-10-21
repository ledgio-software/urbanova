// A visitor's cookie choice, kept in their own browser (Policies & Terms s.4).
// Marketing pixels load only when `marketing` is true.

export interface ConsentChoice {
  marketing: boolean
  decidedAt: string // ISO timestamp
}

const STORAGE_KEY = 'urbanova-cookie-consent'

/** Fired by the footer "Cookie settings" link to reopen the banner. */
export const OPEN_COOKIE_SETTINGS_EVENT = 'urbanova:open-cookie-settings'

export function readConsent(): ConsentChoice | null {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const value = JSON.parse(raw) as Partial<ConsentChoice>
    if (typeof value.marketing !== 'boolean' || typeof value.decidedAt !== 'string') return null
    return { marketing: value.marketing, decidedAt: value.decidedAt }
  } catch {
    return null
  }
}

export function saveConsent(marketing: boolean): ConsentChoice {
  const choice = { marketing, decidedAt: new Date().toISOString() }
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(choice))
  } catch {
    // Storage blocked (private mode etc.) — the choice applies to this visit only.
  }
  return choice
}
