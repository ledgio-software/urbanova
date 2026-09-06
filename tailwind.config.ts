import type { Config } from 'tailwindcss'

// URBANOVA design tokens
// Colors are founder-confirmed placeholders — update hex values in this file only,
// not scattered throughout components. See docs/URBANOVA_REFERENCE.md Part B, Section B.5.
const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './lib/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          navy:  '#0F1F3D', // primary background — confirm with founder
          red:   '#D72638', // CTA / accent — confirm with founder
          white: '#F5F4F0', // off-white / product photo background
          black: '#0A0A0A', // near-black for body text
        },
      },
      fontFamily: {
        // Headlines: bold condensed all-caps (Bebas Neue style)
        // Body: clean modern sans-serif (Inter style)
        // Loaded via next/font in app/layout.tsx — these are the Tailwind utility names
        headline: ['var(--font-headline)', 'Impact', 'sans-serif'],
        body:     ['var(--font-body)', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        // Display sizes for hero / section headers
        'display-xl': ['clamp(3rem, 10vw, 7rem)', { lineHeight: '0.95', letterSpacing: '-0.02em' }],
        'display-lg': ['clamp(2rem, 6vw, 4.5rem)',  { lineHeight: '0.95', letterSpacing: '-0.02em' }],
        'display-md': ['clamp(1.5rem, 4vw, 3rem)',   { lineHeight: '1',    letterSpacing: '-0.01em' }],
      },
      screens: {
        // Mobile-first — majority of URBANOVA customers browse on phones
        xs: '375px',
      },
    },
  },
  plugins: [],
}

export default config
