'use client'

import { useState } from 'react'

export function WhatsAppWidget() {
  const [showTooltip, setShowTooltip] = useState(true)

  return (
    <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3">
      {/* Floating Tooltip */}
      {showTooltip && (
        <div className="hidden sm:flex items-center gap-2 bg-brand-black text-white text-xs font-body px-3.5 py-2 rounded-lg shadow-xl border border-white/10 animate-pulse">
          <span>Need help sizing or ordering? Chat with us!</span>
          <button
            onClick={() => setShowTooltip(false)}
            className="text-white/50 hover:text-white ml-1 text-sm font-bold"
            aria-label="Close message"
          >
            ×
          </button>
        </div>
      )}

      {/* Floating Button */}
      <a
        href="https://wa.me/233557786833?text=Hi%20URBANOVA%2C%20I%20have%20a%20question%20about%20an%20item%2Forder"
        target="_blank"
        rel="noopener noreferrer"
        className="group relative flex items-center justify-center w-14 h-14 bg-[#25D366] hover:bg-[#20bd5a] text-black rounded-full shadow-2xl transition-transform hover:scale-110"
        aria-label="Chat on WhatsApp"
      >
        <svg className="w-7 h-7 fill-current" viewBox="0 0 24 24">
          <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981z" />
        </svg>
        <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-brand-red rounded-full border-2 border-white" />
      </a>
    </div>
  )
}
