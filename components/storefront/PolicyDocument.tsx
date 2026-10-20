import Link from 'next/link'
import { POLICY_LINKS } from '@/lib/content/policy-index'
import type { ContentBlock, PolicyDoc } from '@/lib/content/types'

function RichText({ text }: { text: string }) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g)
  return (
    <>
      {parts.map((part, i) =>
        part.startsWith('**') && part.endsWith('**') ? (
          <strong key={i} className="text-brand-black font-semibold">
            {part.slice(2, -2)}
          </strong>
        ) : (
          <span key={i}>{part}</span>
        ),
      )}
    </>
  )
}

function Block({ block }: { block: ContentBlock }) {
  switch (block.type) {
    case 'p':
      return (
        <p>
          <RichText text={block.text} />
        </p>
      )
    case 'h3':
      return <h3 className="font-headline text-sm uppercase tracking-widest text-brand-black pt-2">{block.text}</h3>
    case 'note':
      return (
        <p className="border-l-2 border-brand-red pl-4 italic">
          <RichText text={block.text} />
        </p>
      )
    case 'ul':
      return (
        <ul className="list-disc pl-5 space-y-1.5">
          {block.items.map((item, i) => (
            <li key={i}>
              <RichText text={item} />
            </li>
          ))}
        </ul>
      )
    case 'table':
      return (
        <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr>
                {block.head.map((h) => (
                  <th
                    key={h}
                    className="font-headline text-xs uppercase tracking-widest text-brand-black border-b border-brand-black/20 py-2 pr-4"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {block.rows.map((row, i) => (
                <tr key={i} className="border-b border-brand-black/10 align-top">
                  {row.map((cell, j) => (
                    <td key={j} className={`py-2.5 pr-4 ${j === 0 ? 'font-semibold text-brand-black' : ''}`}>
                      <RichText text={cell} />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )
  }
}

export function PolicyDocument({ doc, effectiveDate }: { doc: PolicyDoc; effectiveDate?: string }) {
  const related = Object.entries(POLICY_LINKS).filter(([slug]) => slug !== doc.slug)
  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-16">
      <h1 className="font-headline text-display-md uppercase tracking-widest text-brand-black mb-4">{doc.title}</h1>
      {effectiveDate && <p className="text-xs uppercase tracking-widest text-brand-black/40 mb-6">Effective: {effectiveDate}</p>}
      {doc.intro && (
        <p className="font-body text-brand-black/70 leading-relaxed text-sm mb-10">
          <RichText text={doc.intro} />
        </p>
      )}
      <div className="font-body text-brand-black/70 space-y-8 leading-relaxed text-sm">
        {doc.sections.map((section) => (
          <section key={section.title} className="space-y-3">
            <h2 className="font-headline text-base uppercase tracking-widest text-brand-black">{section.title}</h2>
            {section.blocks.map((block, i) => (
              <Block key={i} block={block} />
            ))}
          </section>
        ))}
      </div>

      <nav aria-label="Other policies" className="mt-16 pt-8 border-t border-brand-black/10">
        <p className="font-headline text-xs uppercase tracking-widest text-brand-black/50 mb-3">Other policies</p>
        <ul className="flex flex-wrap gap-x-5 gap-y-2 text-sm">
          {related.map(([slug, title]) => (
            <li key={slug}>
              <Link href={`/legal/${slug}`} className="text-brand-black/60 hover:text-brand-red underline underline-offset-4">
                {title}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  )
}
