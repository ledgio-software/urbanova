import { notFound } from 'next/navigation'
import type { Metadata } from 'next'

const PAGES: Record<string, { title: string; description: string; content: () => React.ReactNode }> = {
  'shipping-returns': {
    title: 'Shipping & Returns',
    description: 'URBANOVA shipping information and returns policy for Ghana deliveries.',
    content: ShippingReturns,
  },
  'privacy-policy': {
    title: 'Privacy Policy',
    description: 'How URBANOVA collects, uses, and protects your personal information.',
    content: PrivacyPolicy,
  },
  'terms-of-service': {
    title: 'Terms of Service',
    description: 'Terms and conditions for shopping at URBANOVA.',
    content: TermsOfService,
  },
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const page = PAGES[slug]
  if (!page) return {}
  return { title: page.title, description: page.description }
}

export default async function LegalPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const page = PAGES[slug]
  if (!page) notFound()
  const Content = page.content
  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-16">
      <h1 className="font-headline text-display-sm uppercase tracking-widest text-brand-black mb-10">{page.title}</h1>
      <div className="font-body text-brand-black/70 space-y-6 leading-relaxed text-sm">
        <Content />
      </div>
    </div>
  )
}

function ShippingReturns() {
  return (
    <>
      <Section title="Delivery Zones & Fees">
        <p>We deliver across Ghana. Delivery fees and estimated timelines are shown at checkout based on your selected zone. All fees are in Ghana Cedis (GHS) and are non-refundable.</p>
      </Section>
      <Section title="Processing Time">
        <p>Orders are processed within 1–2 business days after payment confirmation. You will receive an email confirmation once your order is confirmed. Delivery timelines start from the dispatch date, not the order date.</p>
      </Section>
      <Section title="Tracking">
        <p>Once your order is dispatched, we will send you a WhatsApp message or email with tracking details where available. For any delivery queries, contact us at hello@urbanova.store or via WhatsApp.</p>
      </Section>
      <Section title="Returns & Exchanges">
        <p>We accept returns and exchanges within <strong>7 days of delivery</strong>, subject to the following conditions:</p>
        <ul className="list-disc pl-5 space-y-1 mt-2">
          <li>Item must be unworn, unwashed, and in original packaging with tags intact.</li>
          <li>Sale items are final sale and cannot be returned or exchanged.</li>
          <li>You must contact us before sending any item back — returns sent without prior approval will not be accepted.</li>
          <li>Return shipping is at the customer&apos;s cost.</li>
        </ul>
      </Section>
      <Section title="Damaged or Wrong Items">
        <p>If you receive a damaged or incorrect item, contact us within 48 hours of delivery with photos and your order number. We will arrange a replacement or refund at no additional cost to you.</p>
      </Section>
      <Section title="Refunds">
        <p>Approved refunds are processed within 5–7 business days to your original payment method. Mobile money refunds may take up to 3 business days depending on your network provider.</p>
      </Section>
      <p className="text-brand-black/40 text-xs pt-4">Last updated: September 2026</p>
    </>
  )
}

function PrivacyPolicy() {
  return (
    <>
      <Section title="What We Collect">
        <p>When you place an order or sign up to our newsletter, we collect your name, email address, phone number, and delivery address. We also collect payment confirmation data from our payment processor (Paystack). We do not store card numbers, CVVs, or mobile money PINs.</p>
      </Section>
      <Section title="How We Use It">
        <ul className="list-disc pl-5 space-y-1">
          <li>To process and fulfil your order</li>
          <li>To send your order confirmation and updates</li>
          <li>To respond to your enquiries</li>
          <li>To send marketing emails if you have opted in (you can unsubscribe at any time)</li>
        </ul>
      </Section>
      <Section title="Who We Share It With">
        <p>We share your data only with the third-party services necessary to operate our store: Paystack (payment processing), Resend (transactional email), and our delivery partners. We do not sell your data to anyone.</p>
      </Section>
      <Section title="Data Retention">
        <p>We retain your order data for a minimum of 7 years for accounting and legal purposes. You may request deletion of your account data at any time by emailing hello@urbanova.store — we will honour requests where we are not legally required to retain the data.</p>
      </Section>
      <Section title="Your Rights">
        <p>You have the right to access, correct, or delete the personal data we hold about you. Contact us at hello@urbanova.store for any data requests.</p>
      </Section>
      <Section title="Cookies">
        <p>Our store uses cookies for essential functions (cart state, session management). We do not use tracking or advertising cookies.</p>
      </Section>
      <p className="text-brand-black/40 text-xs pt-4">Last updated: September 2026</p>
    </>
  )
}

function TermsOfService() {
  return (
    <>
      <Section title="Agreement">
        <p>By accessing urbanova.store and placing an order, you agree to these terms. If you do not agree, please do not use our site.</p>
      </Section>
      <Section title="Products & Pricing">
        <p>All prices are in Ghana Cedis (GHS) and include applicable taxes. We reserve the right to change prices at any time without notice. A price change after you have placed an order will not affect that order.</p>
        <p className="mt-2">Product images are representative; slight colour variation may occur due to screen settings and fabric dye lots.</p>
      </Section>
      <Section title="Orders & Payment">
        <p>An order is confirmed only after payment is successfully processed. We reserve the right to cancel any order for reasons including but not limited to stock errors, pricing errors, or suspected fraudulent activity. If we cancel your order, you will receive a full refund.</p>
      </Section>
      <Section title="Intellectual Property">
        <p>All content on urbanova.store — including logos, graphics, photography, and text — is owned by URBANOVA and may not be reproduced, distributed, or used commercially without written permission.</p>
      </Section>
      <Section title="Limitation of Liability">
        <p>URBANOVA is not liable for any indirect, incidental, or consequential damages arising from your use of our products or site. Our maximum liability to you is limited to the amount you paid for the relevant order.</p>
      </Section>
      <Section title="Governing Law">
        <p>These terms are governed by the laws of the Republic of Ghana. Any disputes shall be subject to the exclusive jurisdiction of the courts of Ghana.</p>
      </Section>
      <Section title="Contact">
        <p>Questions about these terms? Email hello@urbanova.store.</p>
      </Section>
      <p className="text-brand-black/40 text-xs pt-4">Last updated: September 2026</p>
    </>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 className="font-headline text-base uppercase tracking-widest text-brand-black mb-2">{title}</h2>
      {children}
    </div>
  )
}
