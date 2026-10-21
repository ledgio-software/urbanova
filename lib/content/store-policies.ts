import { formatPrice } from '@/lib/format'
import type { PolicyTerms, SiteConfig } from '@/lib/site-config'
import type { ContentBlock, DeliveryZoneInfo, PolicyDoc } from './types'

// Source: docs/approved/URBANOVA_Policies_Terms.md Part A (sections 2, 3, 5, 6, 7).
// Lines that depend on an unset business detail are left out rather than shown as placeholders.

interface Ctx {
  cfg: SiteConfig
  t: PolicyTerms
  zones: DeliveryZoneInfo[]
}

function businessLines(cfg: SiteConfig): string[] {
  const lines: string[] = []
  if (cfg.businessName) {
    const reg = [
      cfg.registrationNumber && `registration number ${cfg.registrationNumber}`,
      cfg.tin && `TIN ${cfg.tin}`,
    ].filter(Boolean)
    lines.push(
      `**Seller:** ${cfg.businessName}, a business registered in Ghana${reg.length ? ` (${reg.join(', ')})` : ''}.`,
    )
  }
  if (cfg.address) {
    lines.push(`**Address:** ${cfg.address}${cfg.digitalAddress ? `, Digital Address: ${cfg.digitalAddress}` : ''}`)
  }
  lines.push(`**Contact:** ${[cfg.phone && `Phone/WhatsApp ${cfg.phone}`, `Email ${cfg.email}`].filter(Boolean).join(' · ')}`)
  return lines
}

export function termsOfSale({ cfg, t }: Ctx): PolicyDoc {
  return {
    slug: 'terms-of-service',
    title: 'Terms & Conditions of Sale',
    description: 'The terms that apply when you buy from the URBANOVA online store.',
    intro:
      'These terms apply when you buy from the URBANOVA online store. Please read them before ordering. By placing an order you agree to them. Nothing in these terms reduces your legal rights as a consumer in Ghana.',
    sections: [
      { title: 'Who We Are', blocks: [{ type: 'ul', items: businessLines(cfg) }] },
      {
        title: 'Who Can Buy',
        blocks: [
          {
            type: 'ul',
            items: [
              'You must be 18 or older, or have permission from a parent or guardian, to place an order.',
              'You must give accurate contact and delivery details.',
              'We may refuse or cancel orders that appear fraudulent, or that break these terms.',
            ],
          },
        ],
      },
      {
        title: 'Products',
        blocks: [
          {
            type: 'ul',
            items: [
              'We show products as accurately as we can. Colours may look slightly different on different screens.',
              'Sizes follow the size guide on each product page. Please check it before ordering.',
              'All products are subject to availability. If an item you ordered is unavailable, we will tell you immediately and refund you within 7 days of telling you.',
            ],
          },
        ],
      },
      {
        title: 'Prices',
        blocks: [
          {
            type: 'ul',
            items: [
              'Prices are in Ghana cedis (GHS) and include all applicable taxes.',
              'Delivery charges are shown separately at checkout before you pay. The total you see at checkout is the total you pay.',
              'If we make an obvious pricing error, we will contact you before processing the order and you can choose to continue at the correct price or cancel for a full refund.',
            ],
          },
        ],
      },
      {
        title: 'How a Contract Is Made',
        blocks: [
          {
            type: 'ul',
            items: [
              'You can review and correct your order before you pay. You can leave checkout at any time before paying.',
              'After payment, you will receive an order confirmation by email. The contract is formed when we send this confirmation.',
              'You can read these terms at any time from the website footer.',
            ],
          },
        ],
      },
      {
        title: 'Payment',
        blocks: [
          {
            type: 'ul',
            items: [
              'We accept MTN Mobile Money, Telecel Cash, AT Money and Visa/Mastercard through our payment provider, Paystack.',
              'Payments are processed securely by our payment provider. We never see or store your full card number, CVV or mobile money PIN.',
              'Orders are only confirmed and dispatched after payment is verified.',
            ],
          },
        ],
      },
      {
        title: 'Delivery',
        blocks: [
          {
            type: 'ul',
            items: [
              'We will deliver within the time shown at checkout for your delivery zone, and in any case within 14 days of your order unless we agree a different time with you (for example, a pre-order). Details are in the Shipping & Returns policy.',
              'Risk in the goods passes to you when they are delivered to you or someone you nominate.',
            ],
          },
        ],
      },
      {
        title: 'Your Right to Cancel',
        blocks: [
          {
            type: 'p',
            text: 'You can cancel your order and return the goods for a refund within 14 days of receiving them, without giving a reason. You pay only the direct cost of returning the goods. Full details are in the Shipping & Returns policy.',
          },
        ],
      },
      {
        title: 'Faulty or Wrong Items',
        blocks: [
          {
            type: 'p',
            text: `If an item arrives damaged, faulty or not as ordered, contact us within ${t.faultyReportDays} days of delivery. We will replace it or refund it in full, including delivery charges, and cover the cost of returning it.`,
          },
        ],
      },
      {
        title: 'Limited Drops and Pre-Orders',
        blocks: [
          {
            type: 'ul',
            items: [
              'Limited drops may have a cap on how many items each customer can buy. We may cancel orders that exceed the cap, with a full refund.',
              'Pre-orders show an expected dispatch date. By pre-ordering you agree to that delivery time. If it slips, we will tell you and you may cancel for a full refund.',
              'Your 14-day right to cancel still applies to limited drops and pre-orders.',
            ],
          },
        ],
      },
      {
        title: 'Discount Codes and Promotions',
        blocks: [
          {
            type: 'ul',
            items: [
              'Codes cannot be exchanged for cash and only one code can be used per order unless stated.',
              "Each promotion's own conditions and end date will be shown with it.",
            ],
          },
        ],
      },
      {
        title: 'Give-Back Products',
        blocks: [
          {
            type: 'p',
            text: 'Where a product says that part of the price supports the URBANOVA Movement, we will pass on the stated amount for every item sold and not refunded, and report the total each year.',
          },
        ],
      },
      {
        title: 'Our Liability',
        blocks: [
          {
            type: 'ul',
            items: [
              'We are responsible for loss or damage you suffer that is a foreseeable result of us breaking these terms.',
              'We are not responsible for losses that were not foreseeable, or for business losses (our products are for personal use).',
              'Nothing in these terms limits our liability where it would be unlawful to do so, or removes your rights under Ghanaian law.',
            ],
          },
        ],
      },
      {
        title: 'Events Outside Our Control',
        blocks: [
          {
            type: 'p',
            text: 'We are not liable for delays caused by events outside our reasonable control (such as severe weather, strikes or network outages). We will tell you and, if the delay is long, you may cancel for a full refund.',
          },
        ],
      },
      {
        title: 'Changes, Law and Disputes',
        blocks: [
          {
            type: 'ul',
            items: [
              'We may update these terms. The version in force when you order applies to that order.',
              'These terms are governed by the laws of the Republic of Ghana.',
              'Please contact us first so we can try to resolve any problem (see our Complaints Policy). If we cannot, either side may take the matter to the courts of Ghana or agree to mediation.',
            ],
          },
        ],
      },
    ],
  }
}

export function privacyPolicy({ cfg, t }: Ctx): PolicyDoc {
  const responsible: string[] = []
  responsible.push(
    `**Store:** ${[cfg.businessName, cfg.address, cfg.email].filter(Boolean).join(', ')}`,
  )
  if (cfg.movementEntityName) {
    responsible.push(`**Movement:** ${cfg.movementEntityName}, ${cfg.email}`)
  }
  if (cfg.dpcRegistrationNumber) {
    responsible.push(`**Data Protection Commission registration number:** ${cfg.dpcRegistrationNumber}`)
  }

  return {
    slug: 'privacy-policy',
    title: 'Privacy Policy',
    description: 'How URBANOVA collects, uses, and protects your personal information.',
    intro:
      "Your information stays yours. This policy explains what personal information URBANOVA collects, why, and your rights. We follow Ghana's Data Protection Act, 2012 (Act 843).",
    sections: [
      { title: 'Who Is Responsible', blocks: [{ type: 'ul', items: responsible }] },
      {
        title: 'What We Collect and Why',
        blocks: [
          {
            type: 'table',
            head: ['Information', 'Why we need it', 'Required?'],
            rows: [
              ['Name, phone, email', 'To process orders, contact you about delivery, send receipts', 'Yes, for orders'],
              ['Delivery address', 'To deliver your order', 'Yes, for delivery'],
              ['Order history', 'Customer service, returns, accounting', 'Yes'],
              [
                'Payment reference',
                'To confirm payment and handle refunds. Card and mobile money details are handled by our payment provider, not stored by us',
                'Yes',
              ],
              ['Marketing preferences', 'To send news and drops, only if you opt in', 'No'],
              ['Membership details (age band, location, project)', 'To run Movement programs', 'For members only'],
              ['Photos, stories, business details', 'Spotlight features, only with consent', 'No'],
              ['Website usage data', 'To keep the site working and improve it', 'Partly'],
            ],
          },
          { type: 'p', text: 'If you do not provide required information, we cannot complete your order or membership.' },
        ],
      },
      {
        title: 'Marketing',
        blocks: [
          {
            type: 'ul',
            items: [
              'We only send marketing messages (email, SMS, WhatsApp) if you have opted in.',
              'Every message includes a simple way to unsubscribe. You can also contact us to stop them.',
              'If you ask, we will tell you where we got your contact details.',
            ],
          },
        ],
      },
      {
        title: 'Who We Share It With',
        blocks: [
          {
            type: 'table',
            head: ['Recipient', 'Why'],
            rows: [
              ['Payment provider (Paystack)', 'To take payment and issue refunds'],
              ['Delivery partner / rider', 'Name, phone and address only, to deliver'],
              ['Website hosting and database (Vercel)', 'To run the website and store data'],
              ['Email provider (Resend)', 'To send receipts and messages'],
              ['Accountant / auditor', 'Legal and financial record keeping'],
              ['Authorities', 'Only where the law requires'],
            ],
          },
          {
            type: 'ul',
            items: [
              'We never sell your personal information.',
              'We do not share member or customer data with partners or sponsors without your consent.',
              'Some service providers may store data outside Ghana. We only use providers with appropriate security.',
            ],
          },
        ],
      },
      {
        title: 'How Long We Keep It',
        blocks: [
          {
            type: 'table',
            head: ['Information', 'Kept for'],
            rows: [
              ['Order and payment records', `${t.orderRecordYears} years, for tax and accounting`],
              ['Marketing list', 'Until you unsubscribe'],
              ['Membership records', `While you are a member, plus ${t.memberRecordYears} years`],
              ['Spotlight content', 'Until you ask us to remove it'],
            ],
          },
        ],
      },
      {
        title: 'Children',
        blocks: [
          {
            type: 'ul',
            items: [
              "Customers under 18 should have a parent or guardian's permission to order.",
              "For Movement members under 18, we collect only what is needed, and need a parent or guardian's written consent before publishing any name, photo, school or location.",
            ],
          },
        ],
      },
      {
        title: 'Cookies',
        blocks: [
          {
            type: 'p',
            text: 'Our store uses cookies for essential functions only, such as keeping your cart working. We do not use tracking or advertising cookies.',
          },
        ],
      },
      {
        title: 'Keeping Data Safe',
        blocks: [
          {
            type: 'ul',
            items: [
              'Encrypted connections (HTTPS) on the whole site.',
              'Access to customer data limited to people who need it, with strong passwords.',
              'If a data breach happens, we will tell the Data Protection Commission and affected people as soon as reasonably practicable.',
            ],
          },
        ],
      },
      {
        title: 'Your Rights',
        blocks: [
          {
            type: 'ul',
            items: [
              'Ask what information we hold about you and get a copy.',
              'Ask us to correct wrong information.',
              'Ask us to delete information we no longer need.',
              'Withdraw consent for marketing or Spotlight content at any time.',
              'Complain to the Data Protection Commission of Ghana.',
            ],
          },
          {
            type: 'p',
            text: `To use any of these rights, contact ${cfg.email}. We will reply within ${t.dataRequestReplyDays} days.`,
          },
        ],
      },
      {
        title: 'Changes',
        blocks: [
          { type: 'p', text: 'We will post any changes here with a new effective date, and tell account holders about important changes.' },
        ],
      },
    ],
  }
}

function zoneBlocks({ zones, t }: Ctx): ContentBlock[] {
  if (zones.length === 0) {
    return [
      {
        type: 'p',
        text: 'We currently deliver within Ghana only. Delivery fees and estimated delivery times are shown at checkout for your delivery zone, before you pay.',
      },
    ]
  }
  return [
    {
      type: 'table',
      head: ['Zone', 'Estimated delivery', 'Fee'],
      rows: zones.map((z) => [z.name, z.estimatedDays, z.fee === 0 ? 'Free' : formatPrice(z.fee)]),
    },
    {
      type: 'ul',
      items: [
        `Orders are dispatched within ${t.dispatchDays} working days of payment, except pre-orders.`,
        'All orders will be delivered within 14 days unless a longer time is clearly agreed (for example, pre-orders).',
        'We currently deliver within Ghana only.',
      ],
    },
  ]
}

export function shippingReturns(ctx: Ctx): PolicyDoc {
  const { cfg, t } = ctx
  const contact = [cfg.phone, cfg.email].filter(Boolean).join(' / ')
  return {
    slug: 'shipping-returns',
    title: 'Shipping & Returns',
    description: 'URBANOVA delivery zones, delivery times, 14-day right to cancel, exchanges and refunds.',
    intro:
      'We want you moving in your URBANOVA gear as fast as possible. Here is how delivery, returns and refunds work. **Summary:** you have 14 days from receiving your order to cancel and return it for a refund, for any reason. Faulty or wrong items are always on us.',
    sections: [
      { title: 'Delivery Zones, Times and Fees', blocks: zoneBlocks(ctx) },
      {
        title: 'Tracking and Contact',
        blocks: [
          {
            type: 'ul',
            items: [
              "You will get a message when your order is dispatched, with the rider's or courier's contact or tracking details.",
              'Please make sure your phone is reachable. The rider will call before delivery.',
            ],
          },
        ],
      },
      {
        title: 'Failed Delivery',
        blocks: [
          {
            type: 'ul',
            items: [
              `If we cannot reach you after ${t.failedDeliveryAttempts} attempts, we will contact you to rearrange. A second delivery fee may apply.`,
              `Unclaimed orders after ${t.unclaimedOrderDays} days will be cancelled and refunded, minus the delivery cost.`,
            ],
          },
        ],
      },
      {
        title: 'Damaged or Lost Parcels',
        blocks: [
          {
            type: 'ul',
            items: [
              `Check your parcel on delivery. If it is damaged or something is missing, tell us within ${t.damageReportHours} hours with photos.`,
              'If a parcel is lost in transit, we will resend or refund it in full.',
            ],
          },
        ],
      },
      {
        title: 'Changing Your Mind (14-Day Right to Cancel)',
        blocks: [
          {
            type: 'ul',
            items: [
              'You can cancel within 14 days of receiving your goods, without giving a reason.',
              `Tell us by WhatsApp or email (${contact}) with your order number.`,
              `Send or bring the items back within ${t.returnBackDays} days of telling us.`,
              'You pay the direct cost of returning the items, unless they are faulty or wrong.',
              'Items should be returned with tags, unworn and unwashed. We can reduce a refund if an item has been worn or damaged beyond what is needed to check it, as you would in a shop.',
            ],
          },
        ],
      },
      {
        title: 'Exchanges',
        blocks: [
          {
            type: 'p',
            text: 'Want a different size or colour? Return the item as above and we will send the replacement once it arrives, subject to stock.',
          },
        ],
      },
      {
        title: 'Faulty, Damaged or Wrong Items',
        blocks: [
          {
            type: 'ul',
            items: [
              `Contact us within ${t.faultyReportDays} days of delivery with photos.`,
              'We will offer a replacement or a full refund, including the original delivery fee, and arrange or pay for the return.',
            ],
          },
        ],
      },
      {
        title: 'Items That Cannot Be Returned',
        blocks: [
          {
            type: 'ul',
            items: [
              'Custom or personalised items made to your specification (for example, a name printed on request).',
              'Gift cards once redeemed.',
            ],
          },
          { type: 'p', text: 'These exceptions do not affect your rights if an item is faulty.' },
        ],
      },
      {
        title: 'Refunds',
        blocks: [
          {
            type: 'ul',
            items: [
              'Refunds go back to the original payment method (mobile money wallet or card).',
              `We will refund within ${t.refundProcessingDays} days of receiving the returned items, and no later than 30 days after you cancel.`,
              'For a cancellation, we refund the original standard delivery fee. We do not refund any extra paid for express delivery.',
              'Card refunds may take a few extra days to show, depending on your bank.',
            ],
          },
        ],
      },
      {
        title: 'Cancelling Before Dispatch',
        blocks: [
          {
            type: 'p',
            text: 'If your order has not been dispatched yet, message us and we will cancel it and refund you in full, including delivery.',
          },
        ],
      },
    ],
  }
}

export function websiteTerms({ cfg }: Ctx): PolicyDoc {
  const name = cfg.businessName ?? 'URBANOVA'
  return {
    slug: 'website-terms',
    title: 'Website Terms of Use',
    description: 'The terms that apply to everyone who uses the URBANOVA website.',
    intro: 'These terms apply to everyone who uses the URBANOVA website, whether or not they buy anything.',
    sections: [
      {
        title: 'Intellectual Property',
        blocks: [
          {
            type: 'ul',
            items: [
              `The URBANOVA name, logos, designs, graphics, photos and text on this website belong to ${name} or are used with permission.`,
              'You may share links and posts from our official accounts. You may not copy, print or sell our designs or use our name or logo on products without written permission.',
              'Member content shown in Spotlight belongs to the member.',
            ],
          },
        ],
      },
      {
        title: 'Acceptable Use',
        blocks: [
          { type: 'p', text: 'You must not:' },
          {
            type: 'ul',
            items: [
              "Use the site for anything unlawful or fraudulent, including using someone else's payment details",
              'Try to hack, overload or interfere with the site',
              'Post or send abusive, hateful or misleading content',
              'Copy product information or images in bulk (scraping)',
              'Resell items bought in breach of a limited-drop purchase cap',
            ],
          },
        ],
      },
      {
        title: 'Links to Other Sites',
        blocks: [
          {
            type: 'p',
            text: 'Links to member businesses and partners are for convenience. We are not responsible for their content, products or privacy practices.',
          },
        ],
      },
      {
        title: 'Availability',
        blocks: [
          { type: 'p', text: 'We try to keep the site running but cannot guarantee it will always be available or error-free.' },
        ],
      },
    ],
  }
}
