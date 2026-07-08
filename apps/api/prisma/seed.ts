import { PrismaClient, ProductStatus } from '@prisma/client';
import { hashPassword } from '../src/lib/password.js';

/**
 * Idempotent development seed.
 *
 * Uses upserts so it can be run repeatedly without duplicating data or
 * destroying existing records. The seed seller has a known DEV-ONLY password
 * so the portal can be logged into locally.
 */
const prisma = new PrismaClient();

const SEED_SELLER_EMAIL = 'seller@artisan.local';
const SEED_SELLER_PASSWORD = 'Seller123!Pass';

async function main() {
  // --- Shop (single tenant for Phase 1) ---
  const shop = await prisma.shop.upsert({
    where: { slug: 'artisan-collective' },
    update: {},
    create: {
      name: 'Artisan Collective',
      slug: 'artisan-collective',
      description: 'Handcrafted arts & handicrafts from independent makers.',
    },
  });

  // --- Seller/admin user + profile ---
  const passwordHash = await hashPassword(SEED_SELLER_PASSWORD);
  const seller = await prisma.user.upsert({
    where: { email: SEED_SELLER_EMAIL },
    update: { passwordHash, shopId: shop.id },
    create: {
      email: SEED_SELLER_EMAIL,
      passwordHash,
      role: 'ADMIN',
      displayName: 'Shop Owner',
      shopId: shop.id,
      sellerProfile: {
        create: {
          bio: 'Curator of the Artisan Collective.',
        },
      },
    },
  });

  // --- Categories ---
  const categories = [
    { name: 'Pottery & Ceramics', slug: 'pottery-ceramics', position: 1 },
    { name: 'Textiles & Weaving', slug: 'textiles-weaving', position: 2 },
    { name: 'Woodwork', slug: 'woodwork', position: 3 },
    { name: 'Jewelry', slug: 'jewelry', position: 4 },
  ];

  const categoryBySlug: Record<string, string> = {};
  for (const c of categories) {
    const created = await prisma.category.upsert({
      where: { shopId_slug: { shopId: shop.id, slug: c.slug } },
      update: { name: c.name, position: c.position },
      create: { ...c, shopId: shop.id },
    });
    categoryBySlug[c.slug] = created.id;
  }

  // --- Products (with a default variant, inventory and an image) ---
  const products = [
    {
      slug: 'hand-thrown-stoneware-mug',
      title: 'Hand-Thrown Stoneware Mug',
      description: 'Wheel-thrown stoneware mug with a reactive glaze.',
      basePrice: '28.00',
      categorySlug: 'pottery-ceramics',
      sku: 'MUG-STONE-01',
      quantity: 24,
    },
    {
      slug: 'handwoven-wool-throw',
      title: 'Handwoven Wool Throw',
      description: 'Loom-woven throw in undyed local wool.',
      basePrice: '145.00',
      categorySlug: 'textiles-weaving',
      sku: 'THROW-WOOL-01',
      quantity: 8,
    },
    {
      slug: 'carved-walnut-serving-board',
      title: 'Carved Walnut Serving Board',
      description: 'Hand-carved black walnut board, food-safe oil finish.',
      basePrice: '76.00',
      categorySlug: 'woodwork',
      sku: 'BOARD-WALNUT-01',
      quantity: 15,
    },
  ];

  for (const p of products) {
    const product = await prisma.product.upsert({
      where: { shopId_slug: { shopId: shop.id, slug: p.slug } },
      update: {
        title: p.title,
        description: p.description,
        basePrice: p.basePrice,
        status: ProductStatus.ACTIVE,
        categoryId: categoryBySlug[p.categorySlug],
      },
      create: {
        shopId: shop.id,
        categoryId: categoryBySlug[p.categorySlug],
        title: p.title,
        slug: p.slug,
        description: p.description,
        basePrice: p.basePrice,
        status: ProductStatus.ACTIVE,
      },
    });

    const variant = await prisma.productVariant.upsert({
      where: { sku: p.sku },
      update: { price: p.basePrice },
      create: {
        productId: product.id,
        sku: p.sku,
        name: 'Default',
        price: p.basePrice,
      },
    });

    await prisma.inventory.upsert({
      where: { variantId: variant.id },
      update: { quantity: p.quantity },
      create: { variantId: variant.id, quantity: p.quantity },
    });
  }

  console.warn(
    `Seed complete: shop "${shop.name}" (${shop.id}), owner ${seller.email}, ` +
      `${categories.length} categories, ${products.length} products.`,
  );
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
