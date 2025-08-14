import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const shopCategories = [
  {
    name: "ROBES",
    subcategories: [],
  },
  {
    name: "LINGERIE",
    subcategories: [
      "NUISETTE ET PEIGNOIR SATIN",
      "NIGHTIE",
      "SOUS VETEMENTS",
      "SPORTSWEAR",
    ],
  },
  {
    name: "PYJAMAS",
    subcategories: [
      "Haut + Pantalon",
      "Pyjama Short",
      "3 PIECES",
      "Pyjama Long",
      "Pyjamas Satin",
      "Body & Colon",
    ],
  },
  {
    name: "SANDALES",
    subcategories: [],
  },
  {
    name: "SERVIETTES",
    subcategories: [],
  },
  
  {
    name: "BURKINI",
    subcategories: [],
  },
  {
    name: "HOMME",
    subcategories: [],
  },
  {
    name: "KIDS",
    subcategories: [],
  },
  {
    name: "ACCESSOIRES",
    subcategories: [],
  },
  {
    name: "SOLDES",
    subcategories: [],
  },
];

async function main() {
  for (const category of shopCategories) {
    const slug = category.name.toLowerCase().replace(/\s+/g, "-");

    const existing = await prisma.category.findFirst({ where: { slug } });

    if (!existing) {
      const parent = await prisma.category.create({
        data: {
          name: category.name,
          slug,
        },
      });
      console.log(`✅ Created category: ${category.name}`);

      if (category.subcategories.length > 0) {
        for (const sub of category.subcategories) {
          const subSlug = `${slug}-${sub.toLowerCase().replace(/\s+/g, "-")}`;
          const subExists = await prisma.category.findFirst({
            where: { slug: subSlug },
          });

          if (!subExists) {
            await prisma.category.create({
              data: {
                name: sub,
                slug: subSlug,
                parentId: parent.id,
              },
            });
            console.log(`  ↳ Subcategory created: ${sub}`);
          } else {
            console.log(`  ↳ Subcategory already exists: ${sub}`);
          }
        }
      }
    } else {
      console.log(`⚠️ Category already exists: ${category.name}`);
    }
  }
}

main()
  .catch((e) => {
    console.error("❌ Error seeding categories:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
