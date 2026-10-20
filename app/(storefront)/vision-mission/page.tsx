import type { Metadata } from 'next'
import Link from 'next/link'
import { PageHero, SectionTitle } from '@/components/storefront/PageHero'

// Source: docs/approved/URBANOVA_Vision_Mission.md (v1.0) — sections 2–8 and 11–12.

export const metadata: Metadata = {
  title: 'Vision & Mission',
  description: 'A city of the bold, built by the young. Who URBANOVA is, why we exist, and what we are working toward.',
}

const WALLS = [
  { wall: 'Pressure to fit in', answer: 'An identity and community that celebrates being bold and being yourself.' },
  { wall: 'No one sees their work', answer: 'A platform: our website, social media, events and newsletter, used to showcase their ventures.' },
  { wall: 'No one to ask', answer: 'Mentors from our partner businesses and community.' },
  { wall: 'No starting capital', answer: 'A support fund for tools, materials, training and small grants.' },
  { wall: 'Going it alone', answer: 'A movement of people who are building too.' },
]

const MISSION_PARTS = [
  { n: '1', title: 'Inspire confidence', body: 'Clothing, campaigns, stories and events that make young people feel seen and proud.' },
  { n: '2', title: 'Create visibility', body: 'Spotlight features, social media, events and our newsletter put young founders in front of real audiences.' },
  { n: '3', title: 'Connect people', body: 'Mentor matching, partner programs and community meet-ups link young people with each other and with people who have done it before.' },
  { n: '4', title: 'Provide support', body: 'Starter Fund grants, tools and materials, and sponsored training, where it makes the biggest difference.' },
  { n: '5', title: 'Sustain the movement', body: 'Brand sales, a fixed give-back share, partners, supporters and grants keep the work going.' },
]

const VALUES = [
  { title: 'Boldness', body: 'We act with courage. We would rather try, fail and learn than never try at all. We back young people who are willing to put themselves out there.' },
  { title: 'Authenticity', body: "We celebrate people as they are. Every member's story is told in their own words. The URBANOVA identity is aspirational, but never fake." },
  { title: 'Community', body: 'Nobody rises alone. Members, mentors, partners and customers look out for each other, and everyone who receives support is encouraged to give some back.' },
  { title: 'Integrity', body: 'We do what we say. We are honest about money, fair in our decisions, and careful with the trust young people, families and partners place in us.' },
  { title: 'Opportunity', body: 'Talent is everywhere; opportunity is not. We open doors for young people from every background, and give priority to those with the least access.' },
]

const WHO = [
  { who: 'Young creators and founders', gets: 'Visibility, mentoring, community and practical support.' },
  { who: 'Young people finding their path', gets: 'A sense of belonging, role models, and encouragement to start.' },
  { who: 'Our customers', gets: 'Quality clothing that means something, and a way to support the movement.' },
  { who: 'Partner businesses', gets: 'Access to a driven young community, visibility, and real impact they can point to.' },
  { who: 'The wider community', gets: 'Young people who are more confident, skilled and independent.' },
]

const COMMITMENTS = [
  {
    to: 'To young people',
    items: [
      'Membership will always be free.',
      'We will treat your story, image and work with respect, and only share them with your permission.',
      'You keep full ownership of your business, brand and designs.',
      'Selection for support will be fair and open, and you will get feedback if you are not chosen.',
      "We will keep you safe. Anyone under 18 needs a parent or guardian's consent before we publish their details.",
    ],
  },
  {
    to: 'To our customers',
    items: [
      'Our clothing will be made to a standard we are proud of.',
      'We will tell you exactly how much of your purchase goes to the movement.',
      'We will report every year on what your purchases helped achieve.',
    ],
  },
  {
    to: 'To our partners',
    items: [
      'We will use your support for exactly what we agreed.',
      'We will report back regularly on members supported and money spent.',
      'We will only use your name and logo with your approval.',
    ],
  },
  {
    to: 'To the community',
    items: [
      'We will publish an annual report: money in, money out, people supported, and lessons learned.',
      'We will run URBANOVA honestly and lawfully, with proper accounts and oversight.',
    ],
  },
]

const MANIFESTO = [
  ['This is URBANOVA.', 'A city that never dims its lights.', 'A city built by the ones who refuse to wait their turn.'],
  ["Here, you don't shrink to fit.", "You don't ask permission to be bold.", 'You show up as yourself, loudly, and you build.'],
  ['Your idea is worth starting.', 'Your work is worth seeing.', "And you don't have to do it alone."],
  ['We rise together.', 'We lift the ones behind us.', 'We wear it with pride.'],
  ['Bold City. Bold You.', 'Welcome to URBANOVA.'],
]

export default function VisionMissionPage() {
  return (
    <div>
      <PageHero
        eyebrow="Vision & Mission"
        title="A city of the bold, built by the young."
        lead="URBANOVA is a streetwear brand and a youth movement, built around one idea: a city of the bold."
        actions={[
          { label: 'The Movement', href: '/movement' },
          { label: 'Shop Now', href: '/shop', variant: 'ghost' },
        ]}
      />

      {/* Who we are */}
      <section className="max-w-3xl mx-auto px-4 sm:px-6 py-20">
        <SectionTitle>Who We Are</SectionTitle>
        <div className="font-body text-brand-black/70 space-y-4 leading-relaxed">
          <p>
            The name joins two words. &ldquo;Urban&rdquo; is the city: fast, crowded, competitive, full of energy and opportunity.
            &ldquo;Nova&rdquo; is a star that suddenly bursts into brightness. Together they describe what happens when a young
            person decides to stop waiting and start shining.
          </p>
          <p>
            URBANOVA is not a place on a map. It is a state of mind that every ambitious young person already carries inside
            them. The clothing gives that mindset something to wear. The movement gives it somewhere to belong.
          </p>
        </div>
        <div className="grid sm:grid-cols-3 gap-4 mt-10">
          {[
            { t: 'The Brand', b: 'A streetwear label selling URBANOVA-branded T-shirts, hoodies and more. It turns the bold-city identity into something you can wear, and earns the money that keeps everything going.' },
            { t: 'The Movement', b: 'A community of young people, mentors and partner businesses that helps young people grow their own ideas and gives them a platform to be seen.' },
            { t: 'The Fund', b: 'Money set aside from sales, partners and supporters that gives practical help to young people who need it most.' },
          ].map((c) => (
            <div key={c.t} className="border border-brand-black/10 p-5">
              <h3 className="font-headline text-lg uppercase tracking-widest text-brand-black mb-2">{c.t}</h3>
              <p className="font-body text-sm text-brand-black/60 leading-relaxed">{c.b}</p>
            </div>
          ))}
        </div>
        <p className="font-body text-brand-black/70 mt-6 leading-relaxed">
          Every URBANOVA purchase supports the movement. Every member of the movement carries the brand forward. Each part
          makes the others stronger.
        </p>
      </section>

      {/* Vision */}
      <section className="bg-brand-navy text-brand-white py-20 px-4">
        <div className="max-w-3xl mx-auto">
          <p className="font-body text-xs uppercase tracking-[0.3em] text-brand-red mb-3">Our Vision</p>
          <p className="font-headline text-display-md uppercase tracking-wide leading-tight">
            A generation of young people who are proud to be exactly who they are, and who have the community, the platform
            and the support to build something of their own.
          </p>
        </div>
      </section>

      {/* Why we exist */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 py-20">
        <SectionTitle lead="Young people are full of ideas, talent and drive. Many are already designing, cooking, filming, coding, styling, selling and building. Too many of them run into the same walls.">
          Why We Exist
        </SectionTitle>
        <div className="divide-y divide-brand-black/10 border-y border-brand-black/10">
          {WALLS.map((w) => (
            <div key={w.wall} className="grid sm:grid-cols-[1fr_1.5fr] gap-2 sm:gap-8 py-5">
              <p className="font-headline text-lg uppercase tracking-widest text-brand-black">{w.wall}</p>
              <p className="font-body text-brand-black/70 leading-relaxed">{w.answer}</p>
            </div>
          ))}
        </div>
        <p className="font-body text-brand-black/70 mt-8 leading-relaxed max-w-2xl">
          Clothing is one of the first ways young people express who they are. Streetwear grew out of city culture: it was
          built by young people, for young people, outside the traditional fashion system. When someone wears URBANOVA,
          they are making a statement before they say a word.
        </p>
      </section>

      {/* Mission */}
      <section className="bg-brand-black/5 py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <p className="font-body text-xs uppercase tracking-[0.3em] text-brand-red mb-3">Our Mission</p>
          <p className="font-headline text-2xl sm:text-3xl uppercase tracking-wide text-brand-black leading-snug mb-12">
            To give young people the confidence, visibility and practical support to turn their ideas into real ventures,
            through a bold streetwear brand, a network of partner businesses, and a fund that helps those who need it most.
          </p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {MISSION_PARTS.map((m) => (
              <div key={m.n} className="bg-brand-white p-6 border border-brand-black/10">
                <p className="font-headline text-3xl text-brand-red mb-1">{m.n}</p>
                <h3 className="font-headline text-lg uppercase tracking-widest text-brand-black mb-2">{m.title}</h3>
                <p className="font-body text-sm text-brand-black/60 leading-relaxed">{m.body}</p>
              </div>
            ))}
          </div>
          <div className="mt-12">
            <h3 className="font-headline text-lg uppercase tracking-widest text-brand-black mb-3">What the mission is not</h3>
            <ul className="font-body text-brand-black/70 space-y-2 list-disc pl-5 leading-relaxed">
              <li>We are not a fashion label that uses a good cause as marketing. The movement is real work, with published results.</li>
              <li>We are not a lender. We do not put young people into debt.</li>
              <li>We do not promise riches or guaranteed success. We offer a fair chance and real support.</li>
              <li>We do not tell young people who to be. We help them become more of who they already are.</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 py-20">
        <SectionTitle lead="Our values are the rules we hold ourselves to. When a decision is unclear, we come back to these five.">
          Our Core Values
        </SectionTitle>
        <div className="grid sm:grid-cols-2 gap-x-10 gap-y-8">
          {VALUES.map((v) => (
            <div key={v.title}>
              <h3 className="font-headline text-xl uppercase tracking-widest text-brand-black mb-2">{v.title}</h3>
              <p className="font-body text-sm text-brand-black/60 leading-relaxed">{v.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Who we serve */}
      <section className="bg-brand-black/5 py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <SectionTitle>Who We Serve</SectionTitle>
          <div className="divide-y divide-brand-black/10 border-y border-brand-black/10">
            {WHO.map((w) => (
              <div key={w.who} className="grid sm:grid-cols-[1fr_1.5fr] gap-2 sm:gap-8 py-4">
                <p className="font-headline text-lg uppercase tracking-widest text-brand-black">{w.who}</p>
                <p className="font-body text-brand-black/70 leading-relaxed">{w.gets}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Commitments */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 py-20">
        <SectionTitle lead="A mission means little without promises people can hold us to.">Our Commitments</SectionTitle>
        <div className="grid sm:grid-cols-2 gap-8">
          {COMMITMENTS.map((c) => (
            <div key={c.to}>
              <h3 className="font-headline text-lg uppercase tracking-widest text-brand-black mb-3">{c.to}</h3>
              <ul className="font-body text-sm text-brand-black/70 space-y-2 list-disc pl-5 leading-relaxed">
                {c.items.map((i) => (
                  <li key={i}>{i}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* Manifesto */}
      <section className="bg-brand-navy text-brand-white py-24 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <p className="font-body text-xs uppercase tracking-[0.3em] text-brand-red mb-8">The URBANOVA Manifesto</p>
          <div className="space-y-8">
            {MANIFESTO.map((stanza, i) => (
              <p key={i} className="font-headline text-xl sm:text-2xl uppercase tracking-widest leading-relaxed">
                {stanza.map((line, j) => (
                  <span key={j} className="block">
                    {line}
                  </span>
                ))}
              </p>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4 text-center">
        <h2 className="font-headline text-display-md uppercase tracking-widest text-brand-black mb-4">Wear what we stand for.</h2>
        <p className="font-body text-brand-black/60 mb-8 max-w-md mx-auto">
          Every URBANOVA purchase supports the movement.
        </p>
        <div className="flex flex-wrap gap-3 justify-center">
          <Link href="/shop" className="inline-block bg-brand-red text-white font-body text-sm uppercase tracking-widest px-10 py-4 hover:bg-brand-red/80 transition-colors">
            Shop Now
          </Link>
          <Link href="/movement" className="inline-block border border-brand-black/30 text-brand-black font-body text-sm uppercase tracking-widest px-10 py-4 hover:bg-brand-black/5 transition-colors">
            See the Movement
          </Link>
        </div>
      </section>
    </div>
  )
}
