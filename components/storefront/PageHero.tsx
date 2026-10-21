import Image from 'next/image'
import Link from 'next/link'

interface PageHeroProps {
  eyebrow: string
  title: string
  lead: string
  actions?: { label: string; href: string; variant?: 'primary' | 'ghost' }[]
  /** Optional photo behind the hero; a navy overlay keeps the text legible. */
  background?: { src: string; alt: string }
}

export function PageHero({ eyebrow, title, lead, actions, background }: PageHeroProps) {
  return (
    <section className="relative isolate overflow-hidden bg-brand-navy text-brand-white">
      {background && (
        <>
          <Image src={background.src} alt={background.alt} fill priority sizes="100vw" className="-z-20 object-cover" />
          <div aria-hidden className="absolute inset-0 -z-10 bg-gradient-to-r from-brand-navy/95 via-brand-navy/80 to-brand-navy/50" />
        </>
      )}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-20 sm:py-28">
        <p className="font-body text-xs uppercase tracking-[0.3em] text-brand-red mb-4">{eyebrow}</p>
        <h1 className="font-headline text-display-lg uppercase tracking-widest">{title}</h1>
        <p className="font-body text-lg text-brand-white/70 mt-6 max-w-2xl leading-relaxed">{lead}</p>
        {actions && actions.length > 0 && (
          <div className="mt-10 flex flex-wrap gap-3">
            {actions.map((a) => (
              <Link
                key={a.href}
                href={a.href}
                className={
                  a.variant === 'ghost'
                    ? 'inline-block border border-white/30 text-brand-white font-body text-sm uppercase tracking-widest px-8 py-3.5 hover:bg-white/10 transition-colors'
                    : 'inline-block bg-brand-red text-white font-body text-sm uppercase tracking-widest px-8 py-3.5 hover:bg-brand-red/80 transition-colors'
                }
              >
                {a.label}
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}

export function SectionTitle({ children, lead }: { children: React.ReactNode; lead?: string }) {
  return (
    <div className="mb-10">
      <h2 className="font-headline text-3xl uppercase tracking-widest text-brand-black">{children}</h2>
      {lead && <p className="font-body text-brand-black/60 mt-3 max-w-2xl leading-relaxed">{lead}</p>}
    </div>
  )
}
