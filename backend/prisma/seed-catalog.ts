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
        description: "A versatile cotton Oxford shirt cut for everyday wear.",
        baseImage:
          "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=900&q=80",
        gallery: [
          "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=900&q=80",
          "https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=900&q=80",
          "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=900&q=80",
        ],
        price: "1890.00",
        compareAtPrice: "2290.00",
      },
      {
        name: "Classic Linen Shirt",
        slug: "classic-linen-shirt",
        sku: "MEN-SHIRT-002",
        description:
          "A lightweight linen-blend shirt with a relaxed, polished fit.",
        baseImage:
          "https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=900&q=80",
        gallery: [
          "https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=900&q=80",
          "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=900&q=80",
          "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=900&q=80",
        ],
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
        baseImage:
          "https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=900&q=80",
        gallery: [
          "https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=900&q=80",
          "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=900&q=80",
          "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=900&q=80",
        ],
        price: "2790.00",
        compareAtPrice: "3290.00",
      },
      {
        name: "Soft Cotton Kurti",
        slug: "soft-cotton-kurti",
        sku: "WOM-DRESS-002",
        description: "A breathable cotton kurti with an easy, graceful fit.",
        baseImage:
          "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=900&q=80",
        gallery: [
          "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=900&q=80",
          "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=900&q=80",
          "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=900&q=80",
        ],
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
        baseImage:
          "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=900&q=80",
        gallery: [
          "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=900&q=80",
          "https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?auto=format&fit=crop&w=900&q=80",
          "https://images.unsplash.com/photo-1608231387042-66d1773070a5?auto=format&fit=crop&w=900&q=80",
        ],
        price: "3490.00",
        compareAtPrice: "3990.00",
      },
      {
        name: "Canvas Low Tops",
        slug: "canvas-low-tops",
        sku: "SHO-SNEAK-002",
        description: "Classic canvas low tops made for daily comfort.",
        baseImage:
          "https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?auto=format&fit=crop&w=900&q=80",
        gallery: [
          "https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?auto=format&fit=crop&w=900&q=80",
          "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=900&q=80",
          "https://images.unsplash.com/photo-1511556820780-d912e42b4980?auto=format&fit=crop&w=900&q=80",
        ],
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
        baseImage:
          "https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=900&q=80",
        gallery: [
          "https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=900&q=80",
          "https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?auto=format&fit=crop&w=900&q=80",
          "https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&w=900&q=80",
        ],
        price: "1590.00",
        compareAtPrice: "1890.00",
      },
      {
        name: "Compact Crossbody Bag",
        slug: "compact-crossbody-bag",
        sku: "BAG-XBODY-001",
        description: "A compact crossbody with practical everyday storage.",
        baseImage:
          "https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&w=900&q=80",
        gallery: [
          "https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&w=900&q=80",
          "https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=900&q=80",
          "https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?auto=format&fit=crop&w=900&q=80",
        ],
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
        baseImage:
          "https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=900&q=80",
        gallery: [
          "https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=900&q=80",
          "https://images.unsplash.com/photo-1571781926291-c477ebfd024b?auto=format&fit=crop&w=900&q=80",
          "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=900&q=80",
        ],
        price: "990.00",
        compareAtPrice: "1190.00",
      },
      {
        name: "Gentle Cleanser",
        slug: "gentle-cleanser",
        sku: "BEA-SKIN-002",
        description: "A gentle face cleanser for a fresh, comfortable finish.",
        baseImage:
          "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=900&q=80",
        gallery: [
          "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=900&q=80",
          "https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=900&q=80",
          "https://images.unsplash.com/photo-1571781926291-c477ebfd024b?auto=format&fit=crop&w=900&q=80",
        ],
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
        baseImage:
          "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=900&q=80",
        gallery: [
          "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=900&q=80",
          "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=900&q=80",
          "https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=900&q=80",
        ],
        price: "790.00",
        compareAtPrice: "990.00",
      },
      {
        name: "Ceramic Table Vase",
        slug: "ceramic-table-vase",
        sku: "HOM-DECOR-002",
        description: "A minimal ceramic vase for shelves and dining tables.",
        baseImage:
          "https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=900&q=80",
        gallery: [
          "https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=900&q=80",
          "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=900&q=80",
          "https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=900&q=80",
        ],
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
        baseImage:
          "https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=900&q=80",
        gallery: [
          "https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=900&q=80",
          "https://images.unsplash.com/photo-1518444065439-e933c06ce9cd?auto=format&fit=crop&w=900&q=80",
          "https://images.unsplash.com/photo-1583394838336-acd977736f90?auto=format&fit=crop&w=900&q=80",
        ],
        price: "3290.00",
        compareAtPrice: "3790.00",
      },
      {
        name: "Portable Bluetooth Speaker",
        slug: "portable-bluetooth-speaker",
        sku: "ELE-AUDIO-002",
        description: "A portable speaker for music at home or on the go.",
        baseImage:
          "https://images.unsplash.com/photo-1518444065439-e933c06ce9cd?auto=format&fit=crop&w=900&q=80",
        gallery: [
          "https://images.unsplash.com/photo-1518444065439-e933c06ce9cd?auto=format&fit=crop&w=900&q=80",
          "https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=900&q=80",
          "https://images.unsplash.com/photo-1583394838336-acd977736f90?auto=format&fit=crop&w=900&q=80",
        ],
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
        baseImage:
          "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=900&q=80",
        gallery: [
          "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=900&q=80",
          "https://images.unsplash.com/photo-1519345182560-3f2917c472ef?auto=format&fit=crop&w=900&q=80",
          "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=900&q=80",
        ],
        price: "690.00",
        compareAtPrice: "850.00",
      },
      {
        name: "Kids Everyday Hoodie",
        slug: "kids-everyday-hoodie",
        sku: "KID-HOOD-001",
        description: "A cozy pullover hoodie for cooler days and playtime.",
        baseImage:
          "https://images.unsplash.com/photo-1519345182560-3f2917c472ef?auto=format&fit=crop&w=900&q=80",
        gallery: [
          "https://images.unsplash.com/photo-1519345182560-3f2917c472ef?auto=format&fit=crop&w=900&q=80",
          "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=900&q=80",
          "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=900&q=80",
        ],
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
        baseImage:
          "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=900&q=80",
        gallery: [
          "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=900&q=80",
          "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=900&q=80",
          "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=900&q=80",
        ],
        price: "1190.00",
        compareAtPrice: "1490.00",
      },
      {
        name: "Grip Training Gloves",
        slug: "grip-training-gloves",
        sku: "SPO-GLOVE-001",
        description: "Comfortable training gloves with a secure grip.",
        baseImage:
          "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=900&q=80",
        gallery: [
          "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=900&q=80",
          "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=900&q=80",
          "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=900&q=80",
        ],
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
        baseImage:
          "https://images.unsplash.com/photo-1617038220319-276d3cfab638?auto=format&fit=crop&w=900&q=80",
        gallery: [
          "https://images.unsplash.com/photo-1617038220319-276d3cfab638?auto=format&fit=crop&w=900&q=80",
          "https://images.unsplash.com/photo-1617038220319-276d3cfab638?auto=format&fit=crop&w=900&q=80",
          "https://images.unsplash.com/photo-1535632787350-4e68ef0ac584?auto=format&fit=crop&w=900&q=80",
        ],
        price: "1390.00",
        compareAtPrice: "1690.00",
      },
      {
        name: "Classic Hoop Earrings",
        slug: "classic-hoop-earrings",
        sku: "JEW-HOOP-001",
        description: "Lightweight hoops with a timeless everyday profile.",
        baseImage:
          "https://images.unsplash.com/photo-1535632787350-4e68ef0ac584?auto=format&fit=crop&w=900&q=80",
        gallery: [
          "https://images.unsplash.com/photo-1535632787350-4e68ef0ac584?auto=format&fit=crop&w=900&q=80",
          "https://images.unsplash.com/photo-1617038220319-276d3cfab638?auto=format&fit=crop&w=900&q=80",
          "https://images.unsplash.com/photo-1523170335258-f5ed11844a49?auto=format&fit=crop&w=900&q=80",
        ],
        price: "990.00",
        compareAtPrice: "1190.00",
      },
    ],
  },
] as const;

async function seedCatalog(): Promise<void> {
  await connectDB();

  await prisma.$transaction(async (transaction) => {
    await transaction.orderItem.deleteMany();
    await transaction.product.deleteMany();
  });

  for (const entry of catalog) {
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

    for (const [index, item] of entry.products.entries()) {
      const product = await prisma.product.create({
        data: {
          name: item.name,
          slug: item.slug,
          sku: item.sku,
          description: item.description,
          baseImage: item.baseImage,
          isActive: true,
          isNew: index === 0,
          isBestSeller: index === 0,
          isFeatured: index === 0,
          status: "IN_STOCK",
          categories: {
            create: {
              category: { connect: { id: category.id } },
            },
          },
          subCategories: {
            create: {
              subCategory: { connect: { id: subcategory.id } },
            },
          },
        },
      });

      const variantData = [
        {
          sku: `${item.sku}-NAVY-M`,
          price: item.price,
          compareAtPrice: item.compareAtPrice,
          images:
            item.gallery.length >= 2
              ? [item.gallery[0], item.gallery[1]]
              : item.gallery,
          options: [
            { name: "Color", value: "Navy Blue", image: item.gallery[0] },
            { name: "Size", value: "M", image: "" },
          ],
        },
        {
          sku: `${item.sku}-STONE-L`,
          price: item.price,
          compareAtPrice: item.compareAtPrice,
          images:
            item.gallery.length >= 3
              ? [item.gallery[1], item.gallery[2]]
              : item.gallery,
          options: [
            { name: "Color", value: "Stone", image: item.gallery[1] },
            { name: "Size", value: "L", image: "" },
          ],
        },
      ];

      await prisma.productVariant.createMany({
        data: variantData.map((variant) => ({
          productId: product.id,
          sku: variant.sku,
          price: variant.price,
          compareAtPrice: variant.compareAtPrice,
          images: variant.images,
          options: variant.options,
          isActive: true,
        })),
      });
    }
  }

  const productCount = await prisma.product.count();
  const variantCount = await prisma.productVariant.count();
  const orderItemCount = await prisma.orderItem.count();

  if (
    productCount !==
      catalog.reduce((sum, entry) => sum + entry.products.length, 0) ||
    variantCount !==
      catalog.reduce((sum, entry) => sum + entry.products.length * 2, 0) ||
    orderItemCount !== 0
  ) {
    throw new Error("Catalog reset verification failed after reseeding.");
  }

  console.log(
    `Catalog reset complete: ${productCount} products, ${variantCount} variants, ${orderItemCount} order items remaining.`,
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
