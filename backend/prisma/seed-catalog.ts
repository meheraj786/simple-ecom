import "dotenv/config";
import { connectDB, disconnectDB, prisma } from "../src/db.js";

const catalog = [
  {
    category: { name: "Men's Fashion", slug: "mens-fashion" },
    subcategory: { name: "Men's Shirts", slug: "mens-shirts" },
    products: [
      {
        name: "Everyday Oxford Shirt",
        slug: "everyday-oxford-shirt",
        sku: "MEN-SHIRT-001",
        description: "A versatile cotton Oxford shirt for everyday wear.",
        price: "1890.00",
        compareAtPrice: "2290.00",
      },
      {
        name: "Classic Linen Shirt",
        slug: "classic-linen-shirt",
        sku: "MEN-SHIRT-002",
        description: "A lightweight linen-blend shirt with a relaxed fit.",
        price: "2190.00",
        compareAtPrice: "2590.00",
      },
    ],
  },
  {
    category: { name: "Women's Fashion", slug: "womens-fashion" },
    subcategory: { name: "Women's Dresses", slug: "womens-dresses" },
    products: [
      {
        name: "Printed Day Dress",
        slug: "printed-day-dress",
        sku: "WOM-DRESS-001",
        description: "A comfortable printed dress for day-to-day outings.",
        price: "2790.00",
        compareAtPrice: "3290.00",
      },
      {
        name: "Soft Cotton Kurti",
        slug: "soft-cotton-kurti",
        sku: "WOM-DRESS-002",
        description: "A breathable cotton kurti with an easy, graceful fit.",
        price: "1690.00",
        compareAtPrice: "1990.00",
      },
    ],
  },
  {
    category: { name: "Footwear", slug: "footwear" },
    subcategory: { name: "Sneakers", slug: "sneakers" },
    products: [
      {
        name: "City Runner Sneakers",
        slug: "city-runner-sneakers",
        sku: "SHO-SNEAK-001",
        description: "Lightweight everyday sneakers with cushioned support.",
        price: "3490.00",
        compareAtPrice: "3990.00",
      },
      {
        name: "Canvas Low Tops",
        slug: "canvas-low-tops",
        sku: "SHO-SNEAK-002",
        description: "Classic canvas low tops made for daily comfort.",
        price: "2490.00",
        compareAtPrice: "2890.00",
      },
    ],
  },
  {
    category: { name: "Bags & Accessories", slug: "bags-accessories" },
    subcategory: { name: "Everyday Bags", slug: "everyday-bags" },
    products: [
      {
        name: "Daily Carry Tote",
        slug: "daily-carry-tote",
        sku: "BAG-TOTE-001",
        description: "A roomy, durable tote for work and weekend essentials.",
        price: "1590.00",
        compareAtPrice: "1890.00",
      },
      {
        name: "Compact Crossbody Bag",
        slug: "compact-crossbody-bag",
        sku: "BAG-XBODY-001",
        description: "A compact crossbody with practical everyday storage.",
        price: "2290.00",
        compareAtPrice: "2690.00",
      },
    ],
  },
  {
    category: {
      name: "Beauty & Personal Care",
      slug: "beauty-personal-care",
    },
    subcategory: { name: "Skincare", slug: "skincare" },
    products: [
      {
        name: "Daily Hydration Moisturizer",
        slug: "daily-hydration-moisturizer",
        sku: "BEA-SKIN-001",
        description: "A lightweight daily moisturizer for lasting hydration.",
        price: "990.00",
        compareAtPrice: "1190.00",
      },
      {
        name: "Gentle Cleanser",
        slug: "gentle-cleanser",
        sku: "BEA-SKIN-002",
        description: "A gentle face cleanser for a fresh, comfortable finish.",
        price: "690.00",
        compareAtPrice: "850.00",
      },
    ],
  },
  {
    category: { name: "Home & Living", slug: "home-living" },
    subcategory: { name: "Home Decor", slug: "home-decor" },
    products: [
      {
        name: "Woven Cushion Cover",
        slug: "woven-cushion-cover",
        sku: "HOM-DECOR-001",
        description: "A textured cushion cover to add warmth to your space.",
        price: "790.00",
        compareAtPrice: "990.00",
      },
      {
        name: "Ceramic Table Vase",
        slug: "ceramic-table-vase",
        sku: "HOM-DECOR-002",
        description: "A minimal ceramic vase for shelves and dining tables.",
        price: "1290.00",
        compareAtPrice: "1590.00",
      },
    ],
  },
  {
    category: { name: "Electronics", slug: "electronics" },
    subcategory: { name: "Audio", slug: "audio" },
    products: [
      {
        name: "Wireless Everyday Earbuds",
        slug: "wireless-everyday-earbuds",
        sku: "ELE-AUDIO-001",
        description: "Wireless earbuds with clear sound and a compact case.",
        price: "3290.00",
        compareAtPrice: "3790.00",
      },
      {
        name: "Portable Bluetooth Speaker",
        slug: "portable-bluetooth-speaker",
        sku: "ELE-AUDIO-002",
        description: "A portable speaker for music at home or on the go.",
        price: "2890.00",
        compareAtPrice: "3390.00",
      },
    ],
  },
  {
    category: { name: "Kids & Baby", slug: "kids-baby" },
    subcategory: { name: "Kids Clothing", slug: "kids-clothing" },
    products: [
      {
        name: "Kids Cotton T-Shirt",
        slug: "kids-cotton-t-shirt",
        sku: "KID-TEE-001",
        description: "A soft cotton tee designed for active little days.",
        price: "690.00",
        compareAtPrice: "850.00",
      },
      {
        name: "Kids Everyday Hoodie",
        slug: "kids-everyday-hoodie",
        sku: "KID-HOOD-001",
        description: "A cozy pullover hoodie for cooler days and playtime.",
        price: "1490.00",
        compareAtPrice: "1790.00",
      },
    ],
  },
  {
    category: { name: "Sports & Outdoors", slug: "sports-outdoors" },
    subcategory: { name: "Fitness Gear", slug: "fitness-gear" },
    products: [
      {
        name: "Training Performance Tee",
        slug: "training-performance-tee",
        sku: "SPO-TEE-001",
        description:
          "A quick-drying training tee for gym and outdoor workouts.",
        price: "1190.00",
        compareAtPrice: "1490.00",
      },
      {
        name: "Grip Training Gloves",
        slug: "grip-training-gloves",
        sku: "SPO-GLOVE-001",
        description: "Comfortable training gloves with a secure grip.",
        price: "890.00",
        compareAtPrice: "1090.00",
      },
    ],
  },
  {
    category: { name: "Jewelry", slug: "jewelry" },
    subcategory: { name: "Everyday Jewelry", slug: "everyday-jewelry" },
    products: [
      {
        name: "Minimal Pendant Necklace",
        slug: "minimal-pendant-necklace",
        sku: "JEW-NECK-001",
        description: "A simple pendant necklace that layers easily.",
        price: "1390.00",
        compareAtPrice: "1690.00",
      },
      {
        name: "Classic Hoop Earrings",
        slug: "classic-hoop-earrings",
        sku: "JEW-HOOP-001",
        description: "Lightweight hoops with a timeless everyday profile.",
        price: "990.00",
        compareAtPrice: "1190.00",
      },
    ],
  },
] as const;

async function seedCatalog(): Promise<void> {
  await connectDB();

  for (const [categoryIndex, entry] of catalog.entries()) {
    const category = await prisma.category.upsert({
      where: { slug: entry.category.slug },
      update: { name: entry.category.name },
      create: entry.category,
    });
    const subcategory = await prisma.subCategory.upsert({
      where: { slug: entry.subcategory.slug },
      update: {
        name: entry.subcategory.name,
        categoryId: category.id,
      },
      create: {
        ...entry.subcategory,
        categoryId: category.id,
      },
    });

    for (const [productIndex, item] of entry.products.entries()) {
      const product = await prisma.product.upsert({
        where: { slug: item.slug },
        update: {
          name: item.name,
          sku: item.sku,
          description: item.description,
          isActive: true,
          status: "IN_STOCK",
        },
        create: {
          name: item.name,
          slug: item.slug,
          sku: item.sku,
          description: item.description,
          isActive: true,
          isNew: categoryIndex === 0 && productIndex === 0,
          isBestSeller: productIndex === 0,
          isFeatured: categoryIndex === 2 && productIndex === 0,
          status: "IN_STOCK",
        },
      });

      await prisma.productCategory.upsert({
        where: {
          productId_categoryId: {
            productId: product.id,
            categoryId: category.id,
          },
        },
        update: {},
        create: { productId: product.id, categoryId: category.id },
      });
      await prisma.productSubCategory.upsert({
        where: {
          productId_subCategoryId: {
            productId: product.id,
            subCategoryId: subcategory.id,
          },
        },
        update: {},
        create: { productId: product.id, subCategoryId: subcategory.id },
      });

      const variants = [
        {
          sku: `${item.sku}-NAVY-M`,
          price: item.price,
          compareAtPrice: item.compareAtPrice,
          images: [],
          options: [
            { name: "Color", value: "Navy Blue", image: "" },
            { name: "Size", value: "M", image: "" },
          ],
        },
        {
          sku: `${item.sku}-BLACK-L`,
          price: item.price,
          compareAtPrice: item.compareAtPrice,
          images: [],
          options: [
            { name: "Color", value: "Black", image: "" },
            { name: "Size", value: "L", image: "" },
          ],
        },
      ];

      for (const variant of variants) {
        await prisma.productVariant.upsert({
          where: { sku: variant.sku },
          update: {
            productId: product.id,
            price: variant.price,
            compareAtPrice: variant.compareAtPrice,
            images: variant.images,
            options: variant.options,
            isActive: true,
          },
          create: {
            ...variant,
            productId: product.id,
            isActive: true,
          },
        });
      }
    }
  }

  const categorySlugs = catalog.map(({ category }) => category.slug);
  const subcategorySlugs = catalog.map(({ subcategory }) => subcategory.slug);
  const productSlugs = catalog.flatMap(({ products }) =>
    products.map(({ slug }) => slug),
  );
  const [categories, subcategoryCount, products] = await Promise.all([
    prisma.category.findMany({
      where: { slug: { in: categorySlugs } },
      select: { id: true },
    }),
    prisma.subCategory.count({
      where: { slug: { in: subcategorySlugs } },
    }),
    prisma.product.findMany({
      where: { slug: { in: productSlugs } },
      select: { id: true },
    }),
  ]);
  const [productAssignments, variantCount] = await Promise.all([
    prisma.productCategory.groupBy({
      by: ["categoryId"],
      where: {
        categoryId: { in: categories.map(({ id }) => id) },
        productId: { in: products.map(({ id }) => id) },
      },
      _count: { _all: true },
    }),
    prisma.productVariant.count({
      where: { productId: { in: products.map(({ id }) => id) } },
    }),
  ]);

  if (
    categories.length !== catalog.length ||
    subcategoryCount !== catalog.length ||
    products.length !== catalog.length * 2 ||
    variantCount !== catalog.length * 4 ||
    productAssignments.length !== catalog.length ||
    productAssignments.some(({ _count }) => _count._all !== 2)
  ) {
    throw new Error(
      "Catalog seed verification failed; expected 10/10/20/40 records",
    );
  }

  console.log(
    `Catalog seed verified: ${categories.length} categories, ${subcategoryCount} subcategories, ${products.length} products, ${variantCount} variants; 2 products per category.`,
  );
}

seedCatalog()
  .catch((error: unknown) => {
    console.error("Catalog seed failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await disconnectDB();
  });
