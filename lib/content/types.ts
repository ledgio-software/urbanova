// Structured content for policy pages. Strings support **bold** inline.

export type ContentBlock =
  | { type: 'p'; text: string }
  | { type: 'ul'; items: string[] }
  | { type: 'h3'; text: string }
  | { type: 'table'; head: string[]; rows: string[][] }
  | { type: 'note'; text: string }

export interface ContentSection {
  title: string
  blocks: ContentBlock[]
}

export interface PolicyDoc {
  slug: string
  title: string
  description: string
  intro?: string
  sections: ContentSection[]
}

export interface DeliveryZoneInfo {
  name: string
  estimatedDays: string
  fee: number // pesewas
}
