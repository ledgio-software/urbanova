import tailwindConfig from '@/tailwind.config'

// Brand colour tokens for places Tailwind classes can't reach (web app manifest, browser theme colour).
// Values live in tailwind.config.ts only — change them there.
const colors = tailwindConfig.theme?.extend?.colors as { brand: { navy: string; red: string; white: string } }

export const brandColors = colors.brand
