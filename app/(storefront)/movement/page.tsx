import type { Metadata } from 'next'
import Link from 'next/link'
import { LookbookGallery } from '@/components/storefront/LookbookGallery'
import { PageHero, SectionTitle } from '@/components/storefront/PageHero'
import { MOVEMENT_POLICY_SLUGS, POLICY_LINKS } from '@/lib/content/policy-index'
import { siteConfig } from '@/lib/site-config'

// Source: docs/approved/URBANOVA_Movement.md (v1.0) and docs/approved/URBANOVA_Foundation_Phases.md (v1.0).
// Internal planning content (budget, risks, team roles, 30-day checklist, phase gates) is deliberately not published.

export const metadata: Metadata = {
  title: 'The Movement',
  description:
    'URBANOVA is a streetwear brand and youth movement that helps young people be themselves and build their own ventures.',
}

// Lookbook shots supplied by the founder; everyone pictured agreed to appear on the site.
const GALLERY = [
  { src: '/movement/lookbook-03.webp', alt: 'Three crew members: two in "No Risk No Story" tees either side of the "Rise Above" back print' },
  { src: '/movement/lookbook-06.webp', alt: 'Three crew members in "The Strong Survive" and "Chase Your Dreams" tees' },
  { src: '/movement/lookbook-04.webp', alt: 'Two crew members in black and white "Dreams Not Excuses" tees' },
  { src: '/movement/lookbook-01.webp', alt: 'Crew member in the black "Rise Above" long-sleeve walking down a tree-lined road' },
  { src: '/movement/lookbook-18.webp', alt: 'Two crew members walking through a courtyard in the brown logo tee and the "Chase Your Dreams" tee' },
  { src: '/movement/crew-front.webp', alt: 'Two URBANOVA crew members in black and brown tees standing on a city street' },
  { src: '/movement/lookbook-09.webp', alt: 'Portrait in the black "No Risk No Story" tee' },
  { src: '/movement/lookbook-13.webp', alt: 'Three crew members holding URBANOVA "Own the Street" shopping bags' },
  { src: '/movement/lookbook-11.webp', alt: 'Back print of the white "The Strong Survive" tee' },
  { src: '/movement/lookbook-20.webp', alt: 'Crew member seated at a café table in the cream "URBANOVA Worldwide" angel tee' },
  { src: '/movement/lookbook-15.webp', alt: 'Two crew members on stone steps in "Dreams Not Excuses" tees' },
  { src: '/movement/lookbook-05.webp', alt: 'Crew member in the black "No Risk No Story" tee carrying a bag' },
  { src: '/movement/crew-temple.webp', alt: 'URBANOVA brown tee with temple back print, worn beside the black logo tee' },
  { src: '/movement/lookbook-14.webp', alt: 'Brown "The Strong Survive" tee with the "Chase Your Dreams" tee behind' },
  { src: '/movement/lookbook-12.webp', alt: 'Portrait in the black "Dreams Not Excuses" tee' },
  { src: '/movement/lookbook-19.webp', alt: 'Two crew members walking under a timber canopy in URBANOVA tees' },
  { src: '/movement/lookbook-07.webp', alt: '"Rise Above" back print between two "No Risk No Story" tees' },
  { src: '/movement/lookbook-02.webp', alt: 'Back view of the "Rise Above" long-sleeve on a tree-lined road' },
  { src: '/movement/lookbook-21.webp', alt: 'Crew member in sunglasses seated in the cream "URBANOVA Worldwide" angel tee' },
  { src: '/movement/lookbook-10.webp', alt: 'Two crew members leaning on a stone wall in "Dreams Not Excuses" tees' },
  { src: '/movement/crew-back.webp', alt: 'Back prints of the URBANOVA "Believe in Yourself" black tee and the brown temple tee' },
  { src: '/movement/lookbook-08.webp', alt: 'Crew member looking down in the "No Risk No Story" tee' },
  { src: '/movement/lookbook-16.webp', alt: 'Crew member in the "No Risk No Story" tee under a frangipani tree' },
  { src: '/movement/lookbook-17.webp', alt: 'Three crew members in "No Risk No Story" and "Rise Above" tees under a tree' },
]

const ARMS = [
  {
    name: 'URBANOVA Brand',
    what: 'Streetwear label and online store.',
    money: 'Earns from product sales and collaborations, and commits a set share of sales to the Movement.',
  },
  {
    name: 'URBANOVA Movement',
    what: 'Youth community, showcase, mentoring and support fund.',
    money: 'Funded by donations, sponsorships, grants and a share of brand sales. Any surplus is reinvested in the mission.',
  },
]

const PROGRAMS = [
  {
    name: 'Nova Spotlight',
    what: 'Features young founders and creatives on the URBANOVA website and social channels: profile, story, photos and a link to their shop or page.',
    who: 'Any member with a real project, product or service.',
  },
  {
    name: 'Nova Market',
    what: 'A section of the site where member businesses can list products, with URBANOVA handling payment and a small commission.',
    who: 'Member founders with something to sell.',
  },
  {
    name: 'Nova Mentors',
    what: 'Matches members with experienced business owners and partner staff for guidance sessions.',
    who: 'Members starting or growing a venture.',
  },
  {
    name: 'Nova Starter Fund',
    what: 'Small grants or in-kind help (equipment, materials, training), awarded through a transparent process.',
    who: 'Members with a plan and a need.',
  },
  {
    name: 'Nova Nights',
    what: 'Events: pop-up markets, pitch evenings, workshops, drops and meet-ups with partners.',
    who: 'Members, partners and the public.',
  },
]

const SHOWCASE = [
  { channel: 'Website Spotlight', gets: 'Profile page with story, photos and a link to buy or contact.' },
  { channel: 'URBANOVA social media', gets: 'Feature posts, reels and stories on the movement’s accounts, tagging the member.' },
  { channel: 'Nova Market listing', gets: 'Products sold through the URBANOVA site (once built).' },
  { channel: 'Events', gets: 'A table or stage slot at Nova Nights.' },
  { channel: 'Newsletter', gets: 'Featured in the community newsletter to subscribers.' },
]

const FAIRNESS = [
  'Spotlight stories let members tell their own journey in their own words. We edit for length and clarity, not to change who they are.',
  'No dress code, pitch style or “brand look” is imposed on members. URBANOVA gear is welcome, never required.',
  'Simple criteria are published for Spotlight and the Starter Fund.',
  'Decisions are made by at least three people, not one, with a short written reason recorded.',
  'No payment to be featured. Spotlight is earned by the work, not bought.',
  'Members who are not selected get feedback and are invited to reapply.',
  'Members keep full ownership of their brand, designs and content, and can ask for features to be removed at any time.',
]

const PARTNER_TYPES = [
  { type: 'Brand partners', eg: 'Local fashion, print, photography, music and food brands', gives: 'Collaborations, co-branded drops, shared events, product for members' },
  { type: 'Corporate sponsors', eg: 'Banks, telecoms, retailers, beverage companies', gives: 'Funding, event sponsorship, staff mentors' },
  { type: 'In-kind partners', eg: 'Printers, studios, courier firms, co-working spaces', gives: 'Services and materials instead of cash' },
  { type: 'Institutional partners', eg: 'Schools, universities, youth agencies, NGOs, foundations', gives: 'Referrals, venues, grants, training' },
  { type: 'Community supporters', eg: 'Individuals and small businesses', gives: 'Monthly gifts, one-off donations, volunteering' },
]

const TIERS = [
  { tier: 'Founding Partner', recognition: 'Logo on the website home page and event stage, named programs, joint announcements. Limited places.' },
  { tier: 'Nova Partner', recognition: 'Logo on the Partners page, social media features, event presence.' },
  { tier: 'Community Partner', recognition: 'Name on the Partners page, thank-you post.' },
  { tier: 'Supporter', recognition: 'Name on the supporters list (optional). Any amount, one-off or monthly.' },
]

const FUNDING = [
  'A fixed share of each brand sale, committed to the Movement',
  'Partner sponsorships, annual or per event',
  'Event income: tickets, stall fees and sponsorship at Nova Nights',
  'Monthly supporters giving small recurring gifts',
  'Time-limited crowdfunding drives for a specific goal, such as a starter-kit round',
  'Grants from foundations and youth-enterprise programs',
  'In-kind support: free or discounted services, venues and materials',
  'In time: a small commission on Nova Market sales, and paid workshops and content services',
]

const PRINCIPLES = [
  'Donations and grants are used only for the purpose they were given for.',
  'Movement money goes into a separate account, never the brand’s or a founder’s personal account.',
  'We keep running costs low and publish the figure.',
  'No single funder should supply most of the income for long. We aim to build several sources.',
  'Founders and their relatives cannot receive Starter Fund money or decide on their own applications.',
  'We publish an annual report: money in, money out, members supported, and stories.',
]

const ROADMAP = [
  { phase: 'Foundation', goal: 'Register the business and the Movement, open separate accounts, and agree values, roles and safeguarding.', result: 'Registered, with separate accounts' },
  { phase: 'Store & Launch', goal: 'Open the store with a give-back line, open free membership, feature the first young founders and sign first partners.', result: 'First sales and first members' },
  { phase: 'Community', goal: 'Spotlight, mentors, events and monthly giving.', result: 'An active community with regular events' },
  { phase: 'Support Fund', goal: 'Run the first Starter Fund round fairly and publish the first report.', result: 'First young people funded' },
  { phase: 'Growth', goal: 'Grants, larger partners, Nova Market and new cities.', result: 'Several income sources; the movement expanding' },
]

export default function MovementPage() {
  const partnerMail = `mailto:${siteConfig.partnerEmail}?subject=${encodeURIComponent('Partnering with URBANOVA')}`

  return (
    <div>
      <PageHero
        eyebrow="The Movement"
        title="Be yourself, loudly. Build something of your own."
        lead="URBANOVA is a streetwear brand and youth movement that helps young people be themselves and build their own ventures: a community of bold young people, backed by partner businesses."
        background={{
          src: '/movement/lookbook-17.webp',
          alt: 'Three URBANOVA crew members in "No Risk No Story" and "Rise Above" tees under a tree',
        }}
        actions={[
          { label: 'Our Vision & Mission', href: '/vision-mission' },
          { label: 'Shop Now', href: '/shop', variant: 'ghost' },
        ]}
      />

      {/* In the city — copy: Reference B.3 voice line + Vision & Mission s.2.1 */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 pt-16 sm:pt-20">
        <SectionTitle lead="Every URBANOVA purchase supports the movement. Every member of the movement carries the brand forward.">
          Wear the version of you that isn&apos;t afraid.
        </SectionTitle>
        <LookbookGallery
          items={[
            {
              type: 'video',
              src: '/movement/crew-video.mp4',
              poster: '/movement/crew-video-poster.webp',
              alt: 'URBANOVA crew in the city',
            },
            ...GALLERY.map((g) => ({ type: 'image' as const, ...g })),
          ]}
        />
      </section>

      {/* What we believe */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 py-20">
        <SectionTitle>What We Believe</SectionTitle>
        <div className="grid sm:grid-cols-2 gap-x-10 gap-y-6">
          {[
            { t: 'Be yourself, loudly.', b: 'Young people should never have to shrink to fit. Boldness is the starting point, not the risk.' },
            { t: 'Courage is a team sport.', b: 'No one builds alone. The movement connects people with mentors, customers and each other.' },
            { t: 'Visibility is power.', b: 'A good idea nobody sees goes nowhere. We help young founders get seen.' },
            { t: 'Help is part of the job.', b: 'A share of what we earn goes back to young people who need a hand.' },
            { t: 'Straight dealing.', b: 'We are open about where money comes from and where it goes.' },
          ].map((b) => (
            <div key={b.t}>
              <h3 className="font-headline text-xl uppercase tracking-widest text-brand-black mb-1">{b.t}</h3>
              <p className="font-body text-sm text-brand-black/60 leading-relaxed">{b.b}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Two arms */}
      <section className="bg-brand-black/5 py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <SectionTitle lead="The money-making brand and the giving-back movement are kept as two clearly separate arms. That keeps customer sales, donations and grants from getting mixed up, and makes it easy to show exactly where money goes.">
            Two Arms, One Mission
          </SectionTitle>
          <div className="grid sm:grid-cols-2 gap-6">
            {ARMS.map((a) => (
              <div key={a.name} className="bg-brand-white border border-brand-black/10 p-6">
                <h3 className="font-headline text-xl uppercase tracking-widest text-brand-black mb-2">{a.name}</h3>
                <p className="font-body text-sm text-brand-black/70 mb-3">{a.what}</p>
                <p className="font-body text-sm text-brand-black/60 leading-relaxed">{a.money}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Programs */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 py-20">
        <SectionTitle lead="Five programs, designed to start small and grow. We launch one or two first and do them well before adding more.">
          What the Movement Does
        </SectionTitle>
        <div className="grid sm:grid-cols-2 gap-6">
          {PROGRAMS.map((p) => (
            <div key={p.name} className="border border-brand-black/10 p-6">
              <h3 className="font-headline text-xl uppercase tracking-widest text-brand-black mb-2">{p.name}</h3>
              <p className="font-body text-sm text-brand-black/70 leading-relaxed mb-3">{p.what}</p>
              <p className="font-body text-xs uppercase tracking-widest text-brand-black/40">For: {p.who}</p>
            </div>
          ))}
        </div>
        <p className="font-body text-sm text-brand-black/60 mt-8 leading-relaxed max-w-2xl">
          Joining will be free. Members accept a short community code, then can apply for Spotlight, Mentors, Market listing
          or the Starter Fund. Anyone under 18 needs a parent or guardian&apos;s consent for anything that publishes their image
          or details.
        </p>
      </section>

      {/* Showcase + fairness */}
      <section className="bg-brand-navy text-brand-white py-20 px-4">
        <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-12">
          <div>
            <h2 className="font-headline text-3xl uppercase tracking-widest mb-6">Getting Seen</h2>
            <ul className="space-y-4">
              {SHOWCASE.map((s) => (
                <li key={s.channel}>
                  <p className="font-headline text-lg uppercase tracking-widest">{s.channel}</p>
                  <p className="font-body text-sm text-brand-white/60 leading-relaxed">{s.gets}</p>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h2 className="font-headline text-3xl uppercase tracking-widest mb-6">Fair &amp; Open</h2>
            <ul className="font-body text-sm text-brand-white/70 space-y-3 list-disc pl-5 leading-relaxed">
              {FAIRNESS.map((f) => (
                <li key={f}>{f}</li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Partners */}
      <section id="partners" className="max-w-4xl mx-auto px-4 sm:px-6 py-20 scroll-mt-20">
        <SectionTitle lead="Partners are businesses and organisations that want to back young people and reach the audience URBANOVA is building. The aim is a fair exchange: partners get visibility and goodwill; the movement gets money, goods, skills and credibility.">
          Partner With Us
        </SectionTitle>
        <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr>
                {['Partner type', 'Examples', 'What they can give'].map((h) => (
                  <th key={h} className="font-headline text-xs uppercase tracking-widest text-brand-black border-b border-brand-black/20 py-2 pr-4">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="font-body text-brand-black/70">
              {PARTNER_TYPES.map((p) => (
                <tr key={p.type} className="border-b border-brand-black/10 align-top">
                  <td className="py-3 pr-4 font-semibold text-brand-black">{p.type}</td>
                  <td className="py-3 pr-4">{p.eg}</td>
                  <td className="py-3 pr-4">{p.gives}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <h3 className="font-headline text-xl uppercase tracking-widest text-brand-black mt-12 mb-4">Recognition</h3>
        <div className="grid sm:grid-cols-2 gap-4">
          {TIERS.map((t) => (
            <div key={t.tier} className="border border-brand-black/10 p-5">
              <p className="font-headline text-lg uppercase tracking-widest text-brand-black mb-1">{t.tier}</p>
              <p className="font-body text-sm text-brand-black/60 leading-relaxed">{t.recognition}</p>
            </div>
          ))}
        </div>

        <div className="mt-10 grid sm:grid-cols-2 gap-8 font-body text-sm text-brand-black/70 leading-relaxed">
          <div>
            <h3 className="font-headline text-lg uppercase tracking-widest text-brand-black mb-2">How it works</h3>
            <ul className="list-disc pl-5 space-y-1.5">
              <li>Get in touch and we send a short partner pack.</li>
              <li>An intro call, then a one-page agreement covering what each side provides, how long it lasts, logo use, and how either side can step back.</li>
              <li>A regular update to partners: members supported, events held, money received and spent.</li>
            </ul>
          </div>
          <div>
            <h3 className="font-headline text-lg uppercase tracking-widest text-brand-black mb-2">Our standards</h3>
            <ul className="list-disc pl-5 space-y-1.5">
              <li>Partners must be a registered, legitimate business or organisation.</li>
              <li>No partnership with businesses whose products or conduct harm young people, such as tobacco, gambling or exploitative lending.</li>
              <li>Partners do not control which members are chosen for Spotlight or the Starter Fund.</li>
            </ul>
          </div>
        </div>

        <a
          href={partnerMail}
          className="inline-block mt-10 bg-brand-red text-white font-body text-sm uppercase tracking-widest px-10 py-4 hover:bg-brand-red/80 transition-colors"
        >
          Become a Partner
        </a>
      </section>

      {/* Funding */}
      <section className="bg-brand-black/5 py-20 px-4">
        <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-12">
          <div>
            <h2 className="font-headline text-3xl uppercase tracking-widest text-brand-black mb-3">How the Movement Is Funded</h2>
            <p className="font-body text-sm text-brand-black/60 mb-5 leading-relaxed">
              Relying on one source is risky, so the plan mixes several.
            </p>
            <ul className="font-body text-sm text-brand-black/70 space-y-2 list-disc pl-5 leading-relaxed">
              {FUNDING.map((f) => (
                <li key={f}>{f}</li>
              ))}
            </ul>
          </div>
          <div>
            <h2 className="font-headline text-3xl uppercase tracking-widest text-brand-black mb-3">Our Money Principles</h2>
            <p className="font-body text-sm text-brand-black/60 mb-5 leading-relaxed">
              Start with a small, well-run fund and publish what was given.
            </p>
            <ul className="font-body text-sm text-brand-black/70 space-y-2 list-disc pl-5 leading-relaxed">
              {PRINCIPLES.map((p) => (
                <li key={p}>{p}</li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Roadmap */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 py-20">
        <SectionTitle lead="Store first, then movement. The brand earns the money that funds the movement, so a working store comes before big programs. We start small, prove it, then grow.">
          The Road Ahead
        </SectionTitle>
        <ol className="space-y-0 border-l-2 border-brand-red/40">
          {ROADMAP.map((r, i) => (
            <li key={r.phase} className="relative pl-8 pb-8 last:pb-0">
              <span className="absolute -left-[13px] top-0 flex h-6 w-6 items-center justify-center rounded-full bg-brand-red text-white text-xs font-body font-semibold">
                {i + 1}
              </span>
              <h3 className="font-headline text-xl uppercase tracking-widest text-brand-black">{r.phase}</h3>
              <p className="font-body text-sm text-brand-black/70 leading-relaxed mt-1">{r.goal}</p>
              <p className="font-body text-xs uppercase tracking-widest text-brand-black/40 mt-2">Result: {r.result}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* Safe and trustworthy */}
      <section id="policies" className="bg-brand-navy text-brand-white py-20 px-4 scroll-mt-20">
        <div className="max-w-4xl mx-auto">
          <h2 className="font-headline text-3xl uppercase tracking-widest mb-3">Safe &amp; Trustworthy</h2>
          <p className="font-body text-brand-white/70 mb-8 max-w-2xl leading-relaxed">
            Many members will be under 18. No under-18 joins until our Safeguarding Policy is in place and a Safeguarding
            Lead is appointed. These are the policies that govern the movement.
          </p>
          <ul className="grid sm:grid-cols-2 gap-x-8 gap-y-2">
            {MOVEMENT_POLICY_SLUGS.map((slug) => (
              <li key={slug}>
                <Link
                  href={`/legal/${slug}`}
                  className="font-body text-sm text-brand-white/80 hover:text-brand-white underline underline-offset-4 decoration-white/30"
                >
                  {POLICY_LINKS[slug]}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4 text-center">
        <h2 className="font-headline text-display-md uppercase tracking-widest text-brand-black mb-4">Every piece backs the movement.</h2>
        <p className="font-body text-brand-black/60 mb-8 max-w-md mx-auto">
          Shop the collection and be part of it.
        </p>
        <Link href="/shop" className="inline-block bg-brand-red text-white font-body text-sm uppercase tracking-widest px-10 py-4 hover:bg-brand-red/80 transition-colors">
          Shop Now
        </Link>
      </section>
    </div>
  )
}
