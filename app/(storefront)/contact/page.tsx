import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Contact',
  description: 'Get in touch with Team URBANOVA. Questions about orders, sizing, or wholesale — we reply fast.',
}

export default function ContactPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-20">
      <h1 className="font-headline text-display-md uppercase tracking-widest text-brand-black mb-4">Get In Touch</h1>
      <p className="font-body text-brand-black/60 mb-12 text-lg">
        Questions about your order, sizing, stockists, or wholesale? We&apos;re a small team and we actually read these.
      </p>

      <div className="grid sm:grid-cols-2 gap-8 mb-16">
        <div className="border border-brand-black/10 p-6">
          <h2 className="font-headline text-xl uppercase tracking-widest text-brand-black mb-3">WhatsApp</h2>
          <p className="font-body text-brand-black/60 text-sm mb-4 leading-relaxed">
            Fastest way to reach us. We respond same day on business days.
          </p>
          <a
            href="https://wa.me/233000000000"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block bg-brand-black text-white font-body text-sm uppercase tracking-widest px-6 py-3 hover:bg-brand-black/80 transition-colors"
          >
            Message Us
          </a>
        </div>
        <div className="border border-brand-black/10 p-6">
          <h2 className="font-headline text-xl uppercase tracking-widest text-brand-black mb-3">Email</h2>
          <p className="font-body text-brand-black/60 text-sm mb-4 leading-relaxed">
            For order issues, wholesale enquiries, or press. We reply within 24 hours.
          </p>
          <a
            href="mailto:hello@urbanova.store"
            className="inline-block border border-brand-black text-brand-black font-body text-sm uppercase tracking-widest px-6 py-3 hover:bg-brand-black hover:text-white transition-colors"
          >
            hello@urbanova.store
          </a>
        </div>
      </div>

      <div className="border-t border-brand-black/10 pt-12">
        <h2 className="font-headline text-2xl uppercase tracking-widest text-brand-black mb-6">FAQs</h2>
        <div className="space-y-6">
          {[
            {
              q: "My order hasn't arrived. What do I do?",
              a: "Check your delivery estimate in your confirmation email first. If you're past that window, message us on WhatsApp with your order number — we'll sort it out.",
            },
            {
              q: 'Can I exchange my size?',
              a: 'Yes, within 7 days of delivery, provided the item is unworn and in original packaging. Reach out before sending anything back.',
            },
            {
              q: 'Do you ship outside Ghana?',
              a: "Not yet — but we're working on it. Sign up to our newsletter to be the first to know when international shipping launches.",
            },
            {
              q: 'Are you open to wholesale or pop-up partnerships?',
              a: "Absolutely. Email us at hello@urbanova.store with your proposal and we'll get back to you.",
            },
          ].map((faq) => (
            <div key={faq.q} className="border-b border-brand-black/10 pb-6">
              <p className="font-headline text-lg uppercase tracking-wide text-brand-black mb-2">{faq.q}</p>
              <p className="font-body text-brand-black/60 text-sm leading-relaxed">{faq.a}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
