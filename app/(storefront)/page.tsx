// Copy source: docs/URBANOVA_REFERENCE.md Part E, Section E.1 and Part D, Section D.2
import Link from 'next/link'
import { getFeaturedProducts, getCategories, type ProductSummary, type CategoryRow } from '@/lib/products'
import { ProductCard } from '@/components/storefront/ProductCard'

export const revalidate = 60

export default async function HomePage() {
  const [featured, categories] = await Promise.all([getFeaturedProducts(), getCategories()])

  return (
    <>
      {/* Hero */}
      <section className="relative flex min-h-[85vh] items-center justify-center bg-brand-navy overflow-hidden">
        {/* Background Video */}
        <video
          autoPlay
          loop
          muted
          playsInline
          poster="/hero-bg.jpg"
          className="absolute inset-0 w-full h-full object-cover opacity-50"
        >
          <source src="/hero-video.mp4" type="video/mp4" />
        </video>

        {/* Brand Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-brand-navy via-brand-navy/50 to-brand-navy/30 z-10" />

        <div className="relative z-20 mx-auto max-w-4xl px-6 text-center">
          <h1 className="font-headline text-display-xl uppercase text-brand-white leading-none drop-shadow-lg">
            Bold City.{' '}
            <span className="text-brand-red">Bold You.</span>
          </h1>
          <p className="mt-6 font-body text-brand-white/90 text-lg sm:text-xl max-w-xl mx-auto">
            Streetwear made for the ones who don&apos;t wait to be noticed.
          </p>
          <Link
            href="/shop"
            className="mt-10 inline-block bg-brand-red text-white font-body text-sm uppercase tracking-widest px-8 py-4 hover:bg-brand-red/80 transition-colors shadow-xl"
          >
            Shop Now
          </Link>
        </div>
      </section>

      {/* Featured products */}
      {featured.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20">
          <div className="flex items-baseline justify-between mb-10">
            <h2 className="font-headline text-display-md uppercase text-brand-black">New Arrivals</h2>
            <Link href="/shop" className="text-sm font-body uppercase tracking-widest text-brand-red hover:text-brand-black transition-colors">
              View All →
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {featured.map((product: ProductSummary) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      )}

      {/* Brand story teaser */}
      <section className="bg-brand-navy py-20">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <p className="font-body text-brand-white/80 text-lg leading-relaxed">
            URBANOVA isn&apos;t just a city. It&apos;s a state of mind — fast-moving, unafraid, always rising.
            This is where that energy becomes something you wear.
          </p>
          <Link
            href="/about"
            className="mt-8 inline-block text-brand-red font-body text-sm uppercase tracking-widest hover:text-brand-white transition-colors"
          >
            Learn Our Story →
          </Link>
        </div>
      </section>

      {/* Category tiles */}
      {categories.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20">
          <h2 className="font-headline text-display-md uppercase text-brand-black mb-10 text-center">Shop by Category</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            {categories.map((cat: CategoryRow) => {
              const tagline = cat.slug === 't-shirts'
                ? 'The everyday uniform for the bold.'
                : cat.slug === 'hoodies'
                ? 'City nights start here.'
                : `Shop ${cat.name}.`
              return (
                <Link
                  key={cat.id}
                  href={`/shop/${cat.slug}`}
                  className="group relative aspect-[4/3] bg-brand-navy flex items-end overflow-hidden rounded"
                >
                  <div className="absolute inset-0 bg-brand-red/0 group-hover:bg-brand-red/10 transition-colors duration-300" />
                  <div className="relative z-10 p-8">
                    <p className="font-headline text-display-md uppercase text-brand-white leading-none">{cat.name}</p>
                    <p className="mt-2 text-sm font-body text-brand-white/60">{tagline}</p>
                    <p className="mt-4 text-xs font-body uppercase tracking-widest text-brand-red group-hover:translate-x-1 transition-transform">
                      Shop Now →
                    </p>
                  </div>
                </Link>
              )
            })}
          </div>
        </section>
      )}

      {/* Newsletter & WhatsApp VIP */}
      <section className="bg-brand-black py-20">
        <div className="mx-auto max-w-2xl px-6 text-center">
          <h2 className="font-headline text-display-md uppercase text-brand-white">Join the Rise.</h2>
          <p className="mt-3 font-body text-brand-white/70 text-sm max-w-md mx-auto leading-relaxed">
            Join our WhatsApp group to get an exclusive discount, early drop access, and let&apos;s build the streets together.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href="https://wa.me/233557786833?text=Hi%20URBANOVA%2C%20I%20want%20to%20join%20the%20VIP%20group%20for%20a%20discount!"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 bg-[#25D366] text-black font-body text-xs font-semibold uppercase tracking-widest px-6 py-3.5 rounded hover:bg-[#20bd5a] transition-colors shadow-lg"
            >
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981z" />
              </svg>
              Join WhatsApp Group
            </a>
            <form className="w-full sm:w-auto flex gap-2" action="/api/newsletter" method="POST">
              <input
                type="email"
                name="email"
                placeholder="Email address"
                required
                className="flex-1 sm:w-64 bg-white/10 border border-white/20 px-4 py-3 text-sm text-brand-white placeholder:text-white/30 focus:outline-none focus:border-brand-red transition-colors rounded"
              />
              <button
                type="submit"
                className="bg-brand-red text-white font-body text-xs uppercase tracking-widest px-6 py-3 rounded hover:bg-brand-red/80 transition-colors"
              >
                Join
              </button>
            </form>
          </div>
        </div>
      </section>
    </>
  )
}
