import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding URBANOVA database...')

  // ─── Categories ────────────────────────────────────────────────────────────
  const tshirts = await prisma.category.upsert({
    where: { slug: 't-shirts' },
    update: {},
    create: {
      name: 'T-Shirts',
      slug: 't-shirts',
      description: 'Everyday tees, city-coded.',
    },
  })

  const hoodies = await prisma.category.upsert({
    where: { slug: 'hoodies' },
    update: {},
    create: {
      name: 'Hoodies',
      slug: 'hoodies',
      description: 'Built for cool nights and bold moves.',
    },
  })

  console.log('✓ Categories seeded')

  // ─── Delivery Zones ─────────────────────────────────────────────────────────
  // Fees are placeholder — founder must confirm. See URBANOVA_REFERENCE.md Appendix.
  await prisma.deliveryZone.upsert({
    where: { id: 'dz-accra' },
    update: {},
    create: {
      id: 'dz-accra',
      name: 'Accra',
      estimatedDays: '1–2 business days',
      fee: 2000, // GHS 20.00 — placeholder
    },
  })

  await prisma.deliveryZone.upsert({
    where: { id: 'dz-other' },
    update: {},
    create: {
      id: 'dz-other',
      name: 'Other Regions',
      estimatedDays: '3–5 business days',
      fee: 5000, // GHS 50.00 — placeholder
    },
  })

  console.log('✓ Delivery zones seeded')

  // ─── Products & Variants ────────────────────────────────────────────────────
  // Prices are placeholder — founder must confirm production costs.
  // SKU format: URB-[CATEGORY]-[STYLE]-[COLOR]-[SIZE]

  const skylineTee = await prisma.product.upsert({
    where: { slug: 'urbanova-skyline-tee' },
    update: {},
    create: {
      name: 'URBANOVA Skyline Tee',
      slug: 'urbanova-skyline-tee',
      categoryId: tshirts.id,
      description:
        'Bold skyline graphic tee for those who move like the city never sleeps. 100% cotton, regular fit, breathable everyday wear. Runs true to size — check our size guide if you\'re between sizes.',
      basePrice: 15000, // GHS 150.00 — placeholder
      featured: true,
      tags: ['graphic-tee', 'skyline', 'bestseller'],
    },
  })

  const novaHoodie = await prisma.product.upsert({
    where: { slug: 'urbanova-nova-hoodie' },
    update: {},
    create: {
      name: 'URBANOVA Nova Hoodie',
      slug: 'urbanova-nova-hoodie',
      categoryId: hoodies.id,
      description:
        'Heavyweight fleece built for city nights and bold entrances. Brushed fleece interior, front spark print, relaxed fit. For an oversized look, size up.',
      basePrice: 25000, // GHS 250.00 — placeholder
      featured: true,
      tags: ['hoodie', 'nova', 'heavyweight'],
    },
  })

  console.log('✓ Products seeded')

  // ─── Variants ───────────────────────────────────────────────────────────────
  const sizes = ['S', 'M', 'L', 'XL', 'XXL']

  // Skyline Tee — Midnight City (Black) + Concrete White
  const teeColors = [
    { label: 'Midnight City', code: 'BLK' },
    { label: 'Concrete White', code: 'WHT' },
  ]

  for (const color of teeColors) {
    for (const size of sizes) {
      const sku = `URB-TS-SKYLINE-${color.code}-${size}`
      await prisma.productVariant.upsert({
        where: { sku },
        update: {},
        create: {
          productId: skylineTee.id,
          sku,
          size,
          color: color.label,
          stockQuantity: 20,
        },
      })
    }
  }

  // Nova Hoodie — Night Navy + Midnight City (Black)
  const hoodieColors = [
    { label: 'Night Navy', code: 'NVY' },
    { label: 'Midnight City', code: 'BLK' },
  ]

  for (const color of hoodieColors) {
    for (const size of sizes) {
      const sku = `URB-HD-NOVA-${color.code}-${size}`
      await prisma.productVariant.upsert({
        where: { sku },
        update: {},
        create: {
          productId: novaHoodie.id,
          sku,
          size,
          color: color.label,
          stockQuantity: 15,
        },
      })
    }
  }

  console.log('✓ Variants seeded (20 SKUs total)')
  console.log('Seed complete.')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
