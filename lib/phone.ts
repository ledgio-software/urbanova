/** WhatsApp click-to-chat link for a Ghana phone number (wa.me needs digits only, with country code). */
export function whatsappUrlFor(phone: string | null | undefined): string | undefined {
  let digits = (phone ?? '').replace(/\D/g, '')
  if (!digits) return undefined
  if (digits.startsWith('0')) digits = `233${digits.slice(1)}` // local Ghana format, e.g. 055…
  return `https://wa.me/${digits}`
}
