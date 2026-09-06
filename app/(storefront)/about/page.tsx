import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'About',
  description: "URBANOVA was built for the ones who don't wait to be noticed. Bold City. Bold You.",
}

export default function AboutPage() {
  return (
    <div>
      {/* Hero */}
      <section className="bg-brand-navy text-brand-white py-24 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="font-headline text-display-lg uppercase tracking-widest mb-6">
            We Don&apos;t Wait.
          </h1>
          <p className="font-body text-lg text-brand-white/70 leading-relaxed">
            URBANOVA started with one idea: the city moves fast, and the ones who own it move faster.
            Every piece we drop is built for that person — the one who walks in and changes the temperature of the room.
          </p>
        </div>
      </section>

      {/* Story */}
      <section className="max-w-3xl mx-auto px-4 sm:px-6 py-20">
        <div className="grid md:grid-cols-2 gap-12 items-start">
          <div>
            <h2 className="font-headline text-3xl uppercase tracking-widest text-brand-black mb-6">The Story</h2>
            <div className="font-body text-brand-black/70 space-y-4 leading-relaxed">
              <p>
                URBANOVA was born in Accra — a city that has always had style, even when the world wasn&apos;t watching.
                We saw the energy on the streets, in the markets, on the university campuses, and we knew it deserved a label that matched it.
              </p>
              <p>
                We&apos;re not chasing trends. We&apos;re building a wardrobe for the next generation of bold Africans — people who are proud of where they come from and ambitious about where they&apos;re going.
              </p>
              <p>
                Every drop is limited. Every piece is considered. Nothing is here by accident.
              </p>
            </div>
          </div>
          <div>
            <h2 className="font-headline text-3xl uppercase tracking-widest text-brand-black mb-6">The Standard</h2>
            <div className="font-body text-brand-black/70 space-y-4 leading-relaxed">
              <p>
                We hold ourselves to three things: quality that lasts, design that means something, and a community that comes first.
              </p>
              <p>
                We don&apos;t mass-produce. We plan each collection carefully, work with the best local and international manufacturers we can find, and only release something when we&apos;re proud of it.
              </p>
              <p>
                If you&apos;re wearing URBANOVA, you&apos;re not just wearing a brand — you&apos;re making a statement.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="bg-brand-black/5 py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="font-headline text-3xl uppercase tracking-widest text-brand-black text-center mb-12">What We Stand For</h2>
          <div className="grid sm:grid-cols-3 gap-8">
            {[
              { title: 'Bold Design', body: "We don't make safe pieces. Every cut, colour, and graphic has a point of view." },
              { title: 'Real Quality', body: 'Premium fabrics, reinforced stitching, and construction that survives the city.' },
              { title: 'Limited Always', body: "When a drop sells out, it's gone. That's not a gimmick — that's the model." },
            ].map((v) => (
              <div key={v.title} className="text-center">
                <h3 className="font-headline text-xl uppercase tracking-widest text-brand-black mb-3">{v.title}</h3>
                <p className="font-body text-brand-black/60 leading-relaxed text-sm">{v.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4 text-center">
        <h2 className="font-headline text-display-md uppercase tracking-widest text-brand-black mb-4">Ready to Move?</h2>
        <p className="font-body text-brand-black/60 mb-8 max-w-md mx-auto">
          The current collection is live. Limited units. Don&apos;t sleep on it.
        </p>
        <a
          href="/shop"
          className="inline-block bg-brand-red text-white font-body text-sm uppercase tracking-widest px-10 py-4 hover:bg-brand-red/80 transition-colors"
        >
          Shop Now
        </a>
      </section>
    </div>
  )
}
