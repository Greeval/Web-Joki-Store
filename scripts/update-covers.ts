import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const updates = [
    { slug: "genshin-impact", coverImageUrl: "/cover-genshin.png" },
    { slug: "honkai-star-rail", coverImageUrl: "/cover-hsr.png" },
    { slug: "zenless-zone-zero", coverImageUrl: "/cover-zzz.png" },
    { slug: "wuthering-waves", coverImageUrl: "/cover-wuwa.png" },
  ];

  for (const update of updates) {
    const result = await prisma.game.updateMany({
      where: { slug: update.slug },
      data: { coverImageUrl: update.coverImageUrl },
    });
    if (result.count > 0) {
      console.log(`✓ Updated cover for: ${update.slug}`);
    } else {
      // Game belum ada di DB, insert
      await prisma.game.upsert({
        where: { slug: update.slug },
        update: { coverImageUrl: update.coverImageUrl },
        create: {
          slug: update.slug,
          nama: update.slug
            .split("-")
            .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
            .join(" "),
          coverImageUrl: update.coverImageUrl,
          isPopuler: true,
        },
      });
      console.log(`✓ Created/updated: ${update.slug}`);
    }
  }

  console.log("\nSemua cover image berhasil diupdate!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
