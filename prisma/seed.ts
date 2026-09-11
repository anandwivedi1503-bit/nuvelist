import { config } from "dotenv";
import { PrismaClient } from "@prisma/client";

config();
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const cleanserCategory = await prisma.category.upsert({
    where: { slug: "cleanse" },
    update: {},
    create: {
      slug: "cleanse",
      name: "Cleanse",
      description: "Barrier-respecting gels that clean without stripping.",
    },
  });
  const lipCategory = await prisma.category.upsert({
    where: { slug: "lips" },
    update: {},
    create: {
      slug: "lips",
      name: "Lips",
      description: "Peptide treatments for softer, healthier, protected lips.",
    },
  });
  const ritualCategory = await prisma.category.upsert({
    where: { slug: "rituals" },
    update: {},
    create: {
      slug: "rituals",
      name: "Rituals",
      description: "Clinically paired routines for daily barrier care.",
    },
  });

  const cleanser = await prisma.product.upsert({
    where: { slug: "daily-barrier-cleanser" },
    update: {},
    create: {
      slug: "daily-barrier-cleanser",
      sku: "NVL-DBC-150",
      name: "Daily Barrier Cleanser",
      tagline: "Cleanse & protect. Gel to soft foam.",
      description:
        "A gentle gel cleanser for all skin types, including sensitive skin. Ceramides, amino acids and panthenol lift dirt and impurities without disrupting moisture — so the barrier stays calm, hydrated and resilient. Fragrance free, pH balanced, dermatologically tested.",
      howToUse:
        "AM and PM. Wet face, pump a pearl-size amount, emulsify into a soft foam and massage for 30 seconds. Rinse with lukewarm water. Follow with your serum or moisturiser.",
      ingredients:
        "Aqua, Mild Amino Acid Surfactants, Ceramide NP, Ceramide AP, Panthenol, Beta-Glucan, Glycerin, Sodium PCA, Allantoin, pH adjusters. Fragrance free.",
      volume: "150 ml e 5.07 fl. oz.",
      pricePaise: 149900,
      mrpPaise: 179900,
      gstPercent: 18,
      stock: 240,
      featured: true,
      image: "/images/cleanser-hero.jpg",
      gallery: JSON.stringify(["/images/cleanser-hero.jpg", "/images/cleanser-campaign.jpg"]),
      claims: JSON.stringify([
        "91% users felt clean, soothed & comfortable after 1 week*",
        "Dermatologically tested",
        "pH balanced",
        "Fragrance free",
        "Suitable for all skin types",
      ]),
      actives: JSON.stringify([
        { name: "Ceramide Complex", benefit: "Strengthens and repairs the skin barrier" },
        { name: "Amino Acids", benefit: "Gently cleanse and help maintain moisture" },
        { name: "Panthenol", benefit: "Hydrates, soothes and supports healing" },
        { name: "Beta-Glucan", benefit: "Calms redness and reduces irritation" },
        { name: "Glycerin", benefit: "Attracts moisture and keeps skin soft" },
        { name: "Sodium PCA", benefit: "Helps maintain skin hydration" },
      ]),
      categoryId: cleanserCategory.id,
    },
  });

  const lip = await prisma.product.upsert({
    where: { slug: "peptide-lip-repair" },
    update: {},
    create: {
      slug: "peptide-lip-repair",
      sku: "NVL-PLR-10",
      name: "Peptide Lip Repair",
      tagline: "Repair. Plump. Protect.",
      description:
        "A clinical lip treatment with peptides, ceramides, hyaluronic acid and panthenol. Softens texture, locks in moisture and supports the delicate lip barrier — so lips feel healthier, smoother and comfortably plump. Fragrance free and suitable for sensitive lips.",
      howToUse:
        "Apply a thin layer to clean lips, morning and night, and as needed through the day. Use before lipstick as a protective base.",
      ingredients:
        "Hydrogenated oils, Peptides, Ceramide NP, Sodium Hyaluronate, Panthenol, Vitamin E, Beeswax alternative esters. Fragrance free.",
      volume: "10 ml e 0.34 fl. oz.",
      pricePaise: 119900,
      mrpPaise: 139900,
      gstPercent: 18,
      stock: 320,
      featured: true,
      image: "/images/lip-product.jpg",
      gallery: JSON.stringify(["/images/lip-product.jpg", "/images/lip-hero.jpg"]),
      claims: JSON.stringify([
        "93% users felt softer, smoother & healthier lips in 7 days*",
        "Dermatologically tested",
        "Suitable for sensitive lips",
        "Fragrance free",
      ]),
      actives: JSON.stringify([
        { name: "Peptides", benefit: "Boost collagen and improve lip texture" },
        { name: "Ceramides", benefit: "Repair barrier and lock in moisture" },
        { name: "Hyaluronic Acid", benefit: "Deep hydration for soft, smooth, plump lips" },
        { name: "Panthenol", benefit: "Soothe dryness and support healing" },
      ]),
      categoryId: lipCategory.id,
    },
  });

  await prisma.product.upsert({
    where: { slug: "clinical-ritual-duo" },
    update: {},
    create: {
      slug: "clinical-ritual-duo",
      sku: "NVL-RITUAL-01",
      name: "Clinical Ritual Duo",
      tagline: "Cleanse. Repair. The complete AM/PM pair.",
      description:
        "The Nuvelist ritual in one set: Daily Barrier Cleanser to purify without stripping, and Peptide Lip Repair to restore delicate lip skin. A considered introduction to clinical actives that care.",
      howToUse: "Use the cleanser twice daily. Finish with Peptide Lip Repair on clean lips.",
      ingredients: "See individual products for full INCI lists.",
      volume: "150 ml + 10 ml",
      pricePaise: 249900,
      mrpPaise: 319800,
      gstPercent: 18,
      stock: 80,
      featured: true,
      image: "/images/cleanser-campaign.jpg",
      gallery: JSON.stringify([
        "/images/cleanser-campaign.jpg",
        "/images/lip-product.jpg",
        "/images/lip-hero.jpg",
      ]),
      claims: JSON.stringify(["Save vs buying separately", "Free shipping", "Best for first ritual"]),
      actives: JSON.stringify([
        { name: "Barrier cleanse", benefit: "Ceramides + amino acids + panthenol" },
        { name: "Lip repair", benefit: "Peptides + ceramides + HA" },
      ]),
      categoryId: ritualCategory.id,
    },
  });

  await prisma.coupon.upsert({
    where: { code: "GLOW10" },
    update: {},
    create: {
      code: "GLOW10",
      description: "10% off your first ritual",
      percentOff: 10,
      minPaise: 99900,
      active: true,
    },
  });

  const adminEmail = (process.env.ADMIN_EMAIL || "leo.a@example.org").toLowerCase();
  const adminPassword = process.env.ADMIN_PASSWORD || "Nuvelist@Admin1";
  const passwordHash = await bcrypt.hash(adminPassword, 12);
  await prisma.user.upsert({
    where: { email: adminEmail },
    update: { role: "ADMIN", passwordHash },
    create: {
      email: adminEmail,
      passwordHash,
      name: "Nuvelist Admin",
      phone: "9876543210",
      role: "ADMIN",
    },
  });

  const demo = await prisma.user.upsert({
    where: { email: "guest@nuvelist.in" },
    update: {},
    create: {
      email: "guest@nuvelist.in",
      passwordHash: await bcrypt.hash("Guest@1234", 12),
      name: "Aisha Sharma",
      phone: "9810012345",
      role: "CUSTOMER",
    },
  });

  await prisma.review.deleteMany({ where: { userId: demo.id } });
  await prisma.review.createMany({
    data: [
      {
        userId: demo.id,
        productId: cleanser.id,
        rating: 5,
        title: "Does not strip — finally",
        body: "My combination skin feels clean but still comfortable. No tightness after washing.",
        approved: true,
      },
      {
        userId: demo.id,
        productId: lip.id,
        rating: 5,
        title: "Night-and-day texture",
        body: "Used it for a week. Lips look smoother in the morning and lipstick sits better.",
        approved: true,
      },
    ],
  });

  console.log("Seed complete.");
  console.log(`Admin login: ${adminEmail} / (ADMIN_PASSWORD)`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
