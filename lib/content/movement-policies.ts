import type { PolicyTerms, SiteConfig } from '@/lib/site-config'
import type { PolicyDoc } from './types'

// Source: docs/approved/URBANOVA_Policies_Terms.md Part B (sections 8, 9, 11–15) and Part C section 17.
// Not published here: Nova Market Seller Terms (publish only when the marketplace launches) and the
// internal Conflict of Interest / Fraud policies.

interface Ctx {
  cfg: SiteConfig
  t: PolicyTerms
}

export function membershipTerms({ t }: Ctx): PolicyDoc {
  return {
    slug: 'membership-terms',
    title: 'Membership Terms',
    description: 'Terms for young people joining the URBANOVA Movement.',
    intro: 'These terms apply to anyone who joins the URBANOVA Movement.',
    sections: [
      {
        title: 'Joining',
        blocks: [
          {
            type: 'ul',
            items: [
              `Membership is free and open to young people aged ${t.memberAgeRange}.`,
              "Members under 18 need a parent or guardian's consent to join.",
              'Members must give accurate information and agree to the Community Code of Conduct.',
            ],
          },
        ],
      },
      {
        title: 'What Members Can Expect',
        blocks: [
          {
            type: 'ul',
            items: [
              'Access to community spaces, events and newsletters',
              'The chance to apply for Spotlight, mentoring, Nova Market and the Starter Fund',
              'Fair, open selection, with feedback if not selected',
            ],
          },
        ],
      },
      {
        title: 'What Membership Is Not',
        blocks: [
          {
            type: 'ul',
            items: [
              'Membership does not guarantee selection for any program, funding or sales.',
              'Members are not employees, agents or representatives of URBANOVA and may not speak on its behalf.',
            ],
          },
        ],
      },
      {
        title: 'Leaving or Removal',
        blocks: [
          {
            type: 'ul',
            items: [
              'Members can leave at any time and ask for their data to be deleted.',
              'Members who break the Code of Conduct may be warned, suspended or removed.',
            ],
          },
        ],
      },
    ],
  }
}

export function spotlightConsent({ t }: Ctx): PolicyDoc {
  return {
    slug: 'spotlight-consent',
    title: 'Spotlight & Content Consent',
    description: 'How URBANOVA features members’ stories, photos and businesses, and how consent works.',
    intro:
      "This policy covers how URBANOVA features members' stories, photos and businesses on its website, social media, events and newsletters.",
    sections: [
      {
        title: 'Consent First',
        blocks: [
          {
            type: 'ul',
            items: [
              'We only feature a member after they agree in writing (an online consent form is enough).',
              'For members under 18, a parent or guardian must also sign.',
              'The consent form lists exactly what will be shared (name, photos, business name, story, links) and where.',
            ],
          },
        ],
      },
      {
        title: 'Ownership',
        blocks: [
          {
            type: 'ul',
            items: [
              'Members keep full ownership of their brand, designs, photos and stories.',
              "Members give URBANOVA a free, non-exclusive permission to share the agreed content on URBANOVA's channels.",
              'URBANOVA will not use member content in paid advertising for URBANOVA products, or give it to partners, without separate consent.',
            ],
          },
        ],
      },
      {
        title: 'Editing and Approval',
        blocks: [
          {
            type: 'ul',
            items: [
              'We may edit stories for length and clarity, but not change their meaning.',
              'Members see the final feature before it goes live and can ask for changes.',
            ],
          },
        ],
      },
      {
        title: 'Withdrawing Consent',
        blocks: [
          {
            type: 'ul',
            items: [
              'Members can ask for any feature to be removed at any time.',
              `We will remove it from the website and our social accounts within ${t.contentRemovalDays} days. We cannot recall printed materials or content others have already shared.`,
            ],
          },
        ],
      },
      {
        title: 'Under-18 Safety Rules',
        blocks: [
          {
            type: 'ul',
            items: [
              'No home address, school name, exact location or personal phone number of any under-18 is published.',
              "Business contact goes through a parent's or URBANOVA's channel, not the child's personal account.",
            ],
          },
        ],
      },
      {
        title: 'No Pay-to-Feature',
        blocks: [{ type: 'p', text: 'Spotlight is free and cannot be bought by members or partners.' }],
      },
    ],
  }
}

export function partnerPolicy(): PolicyDoc {
  return {
    slug: 'partner-sponsorship',
    title: 'Partner & Sponsorship Policy',
    description: 'Who URBANOVA partners with, and the standards every partnership follows.',
    sections: [
      {
        title: 'Who We Partner With',
        blocks: [
          {
            type: 'ul',
            items: [
              "Registered, legitimate businesses and organisations whose values fit URBANOVA's",
              'We do not partner with businesses selling tobacco, vaping products, alcohol, gambling or betting, or high-cost or predatory lending, or with any organisation involved in exploiting young people',
              'Political parties and candidates are not accepted as partners, to keep the Movement non-partisan',
            ],
          },
        ],
      },
      {
        title: 'Checks Before Partnering',
        blocks: [
          {
            type: 'ul',
            items: [
              'Confirm registration and basic reputation',
              'Any partner whose staff will mentor or meet members agrees to the Safeguarding Policy',
            ],
          },
        ],
      },
      {
        title: 'Partnership Agreement',
        blocks: [
          { type: 'p', text: 'Every partnership has a written agreement (one page is enough) covering:' },
          {
            type: 'ul',
            items: [
              'What each side provides (money, goods, services, staff time) and when',
              'Recognition the partner receives (logo use, mentions, event presence)',
              'How funds will be used and how results will be reported',
              'How long it lasts and how either side can end it',
            ],
          },
        ],
      },
      {
        title: 'Independence',
        blocks: [
          {
            type: 'ul',
            items: [
              'Partners cannot choose or influence who is selected for Spotlight, mentoring or the Starter Fund.',
              "Partners do not receive member data without each member's consent.",
              'URBANOVA may end any partnership that damages its reputation or breaks this policy.',
            ],
          },
        ],
      },
      {
        title: 'Logos and Claims',
        blocks: [
          {
            type: 'ul',
            items: [
              "Each side uses the other's name and logo only as agreed in writing.",
              'Neither side may claim an endorsement beyond what was agreed.',
            ],
          },
        ],
      },
    ],
  }
}

export function donationsPolicy({ t }: Ctx): PolicyDoc {
  return {
    slug: 'donations-fundraising',
    title: 'Donations & Fundraising Policy',
    description: 'How URBANOVA receives, uses and reports donations to the Movement.',
    sections: [
      {
        title: 'Receiving Donations',
        blocks: [
          {
            type: 'ul',
            items: [
              "Donations go into the Movement's own bank or mobile money account, never a personal or store account.",
              'Every donor receives a receipt or confirmation.',
              "Donors can give anonymously. We will not publish a donor's name without consent.",
            ],
          },
        ],
      },
      {
        title: 'How Donations Are Used',
        blocks: [
          {
            type: 'ul',
            items: [
              "Unrestricted donations go to the Movement's general work, and are reported in our annual report.",
              'If a donor or campaign names a specific purpose (for example, starter kits), the money is used only for that purpose. If we raise more than needed, we will say how the extra will be used before the campaign closes, or ask donors.',
            ],
          },
        ],
      },
      {
        title: 'Honest Fundraising',
        blocks: [
          {
            type: 'ul',
            items: [
              'Campaigns state clearly what money is for, the target, and who runs it.',
              "We never pressure people to give, and never fundraise in a member's name or with their story without consent.",
              'We will not claim donations are tax-deductible unless confirmed by a tax adviser.',
              'Give-back products state exactly how much of each sale goes to the Movement.',
            ],
          },
        ],
      },
      {
        title: 'Refusing or Returning Donations',
        blocks: [
          {
            type: 'ul',
            items: [
              'We may refuse donations from sources that conflict with our Partner & Sponsorship Policy, or that come with conditions that would compromise our independence.',
              `Donations made in error (for example, a wrong amount) will be refunded on request within ${t.donationRefundDays} days.`,
            ],
          },
        ],
      },
      {
        title: 'Reporting',
        blocks: [
          {
            type: 'p',
            text: 'We publish an annual report showing money raised, money spent by category, and what was achieved.',
          },
        ],
      },
    ],
  }
}

export function starterFundPolicy({ t }: Ctx): PolicyDoc {
  return {
    slug: 'starter-fund',
    title: 'Starter Fund Policy',
    description: 'How the Nova Starter Fund works: who can apply, how decisions are made, and how support is paid.',
    sections: [
      {
        title: 'What the Fund Offers',
        blocks: [
          {
            type: 'ul',
            items: [
              'Small grants, or equipment, materials or training of similar value. The maximum amount is published with each application round.',
              'Grants, not loans. Members never repay or give up ownership of their business.',
            ],
          },
        ],
      },
      {
        title: 'Who Can Apply',
        blocks: [
          {
            type: 'ul',
            items: [
              `Active members for at least ${t.starterFundMinMembershipMonths} month${t.starterFundMinMembershipMonths === 1 ? '' : 's'}`,
              'With a real project and a clear plan for how the support will be used',
              'Priority to members with least access to money or networks',
              'Founders, team members, their relatives, and members of the selection panel cannot apply',
            ],
          },
        ],
      },
      {
        title: 'How Decisions Are Made',
        blocks: [
          {
            type: 'ul',
            items: [
              'Published application rounds, criteria and deadlines',
              'Each application scored by at least three panel members using the same criteria',
              'Decisions and reasons recorded; every applicant gets a response and short feedback',
            ],
          },
        ],
      },
      {
        title: 'Paying Out',
        blocks: [
          {
            type: 'ul',
            items: [
              'Where possible, we buy the equipment or pay the supplier directly rather than giving cash',
              "Cash grants paid to the member's own mobile money or bank account (or a parent's, for under-18s)",
            ],
          },
        ],
      },
      {
        title: 'Follow-Up',
        blocks: [
          {
            type: 'ul',
            items: [
              `Recipients share a short update after ${t.starterFundFollowUpMonths} months (photos, what was achieved)`,
              'Misuse of funds, such as using them for something not agreed, may mean repayment and removal from programs',
            ],
          },
        ],
      },
    ],
  }
}

export function safeguardingPolicy({ cfg }: Ctx): PolicyDoc {
  const leadLine = cfg.safeguardingLeadName
    ? `**Safeguarding Lead:** ${cfg.safeguardingLeadName}${cfg.safeguardingLeadContact ? ` — ${cfg.safeguardingLeadContact}` : ''}`
    : `**Reporting a concern:** contact ${cfg.email}.`
  return {
    slug: 'safeguarding',
    title: 'Safeguarding Policy',
    description: 'How URBANOVA keeps young people safe, online and in person.',
    intro:
      'URBANOVA works with young people, some under 18. Everyone involved has a duty to keep them safe from harm, abuse and exploitation, online and in person. This policy is in place, and a Safeguarding Lead appointed, before any under-18 joins the Movement.',
    sections: [
      {
        title: 'Who It Applies To',
        blocks: [
          {
            type: 'p',
            text: 'Founders, staff, volunteers, mentors, partner staff who work with members, and contractors such as photographers.',
          },
        ],
      },
      {
        title: 'Safeguarding Lead',
        blocks: [
          {
            type: 'ul',
            items: [
              leadLine,
              'The Lead receives and acts on concerns, keeps records, and contacts authorities when needed.',
              'A deputy is named for when the Lead is unavailable.',
            ],
          },
        ],
      },
      {
        title: 'Rules for Adults Working With Members',
        blocks: [
          {
            type: 'ul',
            items: [
              'Screening before working with under-18s: references and identity check, and a police check where available',
              'Sign the Code of Conduct and complete a short safeguarding briefing',
              'Never be alone, out of sight, with an under-18 member. Mentoring with under-18s happens in group settings, in public places, or online with a second adult or parent included',
              'Communicate with under-18s only through official URBANOVA channels or group chats that include another adult; no private messages from personal accounts',
              'Never give gifts, money or lifts to individual under-18 members outside approved programs',
              'Never take or share photos of members without consent',
              "No romantic or sexual contact with any member under 18, and no relationships that misuse a mentor's position with any member",
            ],
          },
        ],
      },
      {
        title: 'Online Safety',
        blocks: [
          {
            type: 'ul',
            items: [
              'Social accounts are moderated; harmful comments are removed',
              'Members are reminded never to share personal details publicly',
            ],
          },
        ],
      },
      {
        title: 'Reporting a Concern',
        blocks: [
          {
            type: 'ul',
            items: [
              'Anyone with a concern tells the Safeguarding Lead immediately, even if unsure',
              'If a young person is in immediate danger, contact the police first',
              'Listen, do not investigate, do not promise secrecy, and write down what was said and seen',
              'The Lead decides next steps, including referral to the police, the Department of Social Welfare or other authorities, and keeps confidential records',
              'Anyone accused is suspended from contact with members while the concern is looked into',
            ],
          },
        ],
      },
      {
        title: 'Review',
        blocks: [{ type: 'p', text: 'Reviewed every year and after any serious incident.' }],
      },
    ],
  }
}

export function communityCode({ cfg }: Ctx): PolicyDoc {
  return {
    slug: 'community-code',
    title: 'Community Code of Conduct',
    description: 'The shared rules for everyone in the URBANOVA community.',
    intro:
      'URBANOVA is a city of the bold. Bold means confident, not cruel. Everyone in the community (members, mentors, partners, team and customers in our online spaces) agrees to:',
    sections: [
      {
        title: 'The Code',
        blocks: [
          {
            type: 'ul',
            items: [
              '**Respect everyone.** No bullying, harassment, hate speech, threats or discrimination based on gender, ethnicity, religion, disability, background or anything else.',
              '**Be real.** No fake identities, fake reviews, scams or misleading claims about products or results.',
              "**Build each other up.** Give honest, helpful feedback. Celebrate other people's wins.",
              "**Respect people's work.** Do not copy another member's designs, ideas or content.",
              "**Keep it safe.** No sharing of other people's private information or images. No explicit or violent content. No promoting drugs, gambling or weapons.",
              "**No spam or pressure selling.** Promote your business in the spaces set up for it, not in people's private messages.",
              '**Speak for yourself.** Do not claim to speak for URBANOVA unless you have been asked to.',
            ],
          },
        ],
      },
      {
        title: 'If the Code Is Broken',
        blocks: [
          {
            type: 'table',
            head: ['Step', 'What happens'],
            rows: [
              ['1. Warning', 'For minor or first issues, a private reminder'],
              ['2. Suspension', 'Temporary removal from community spaces and programs'],
              ['3. Removal', 'Permanent removal from the Movement for serious or repeated breaches'],
              [
                'Immediate action',
                'Safeguarding concerns, threats or illegal activity skip straight to removal and, where needed, authorities are informed',
              ],
            ],
          },
          {
            type: 'p',
            text: `Anyone removed can appeal once, in writing, to a founder not involved in the original decision. Report problems to ${cfg.email}. Reports are handled confidentially.`,
          },
        ],
      },
    ],
  }
}

export function complaintsPolicy({ cfg, t }: Ctx): PolicyDoc {
  const channels = [cfg.phone && `WhatsApp ${cfg.phone}`, `Email ${cfg.email}`, 'the website contact form'].filter(Boolean)
  return {
    slug: 'complaints',
    title: 'Complaints Policy',
    description: 'How to complain to URBANOVA and what happens next.',
    intro: 'We want to hear when something goes wrong, so we can put it right.',
    sections: [
      {
        title: 'How to Complain',
        blocks: [
          { type: 'ul', items: [`Contact us by: ${channels.join(' · ')}.`, 'Give your name, order number or membership details if relevant, what happened, and what you would like us to do.'] },
        ],
      },
      {
        title: 'What Happens Next',
        blocks: [
          {
            type: 'table',
            head: ['Stage', 'Timing'],
            rows: [
              ['We acknowledge your complaint', `Within ${t.complaintAcknowledgeDays} working days`],
              ['We investigate and reply with a solution', `Within ${t.complaintResolveDays} working days`],
              ['If you are unhappy, a founder not involved reviews it', `Within ${t.complaintReviewDays} working days of your request`],
            ],
          },
          {
            type: 'ul',
            items: [
              'Safeguarding complaints go straight to the Safeguarding Lead.',
              'Data protection complaints can also be made to the Data Protection Commission.',
              'We keep a log of complaints and review it to improve our service.',
            ],
          },
        ],
      },
    ],
  }
}
