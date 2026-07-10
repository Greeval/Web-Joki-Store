const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function main() {
  console.log("Menghapus data lama...");
  await prisma.user.deleteMany();
  await prisma.game.deleteMany();

  console.log("Membuat admin & customer demo...");
  await prisma.user.createMany({
    data: [
      { nama: 'Admin Greeval', email: 'admin@greeval.com', passwordHash: 'hash_admin_123', role: 'admin' },
      { nama: 'Kamu', email: 'customer@demo.com', passwordHash: 'hash_cust_123', role: 'customer' }
    ]
  });

  const gamesData = [
    {
      nama: 'Genshin Impact',
      slug: 'genshin-impact',
      cover: '/cover-genshin.jpg',
      files: ['genshin_impact_price_list.json']
    },
    {
      nama: 'Honkai Star Rail',
      slug: 'honkai-star-rail',
      cover: '/cover-hsr.jpg',
      files: ['honkai_star_rail_price_list.json', 'honkai_star_rail_price_list_lengkap.json']
    },
    {
      nama: 'Zenless Zone Zero',
      slug: 'zenless-zone-zero',
      cover: '/cover-zzz.jpg',
      files: ['zenless_zone_zero_price_list.json']
    },
    {
      nama: 'Wuthering Waves',
      slug: 'wuthering-waves',
      cover: '/cover-wuwa.jpg',
      files: ['wuthering_waves_price_list.json', 'wuthering_waves_price_list_lengkap.json']
    }
  ];

  for (const gameDef of gamesData) {
    console.log(`\nMemproses game: ${gameDef.nama}`);
    const game = await prisma.game.create({
      data: {
        nama: gameDef.nama,
        slug: gameDef.slug,
        coverImageUrl: gameDef.cover,
        isPopuler: true
      }
    });

    for (const file of gameDef.files) {
      const filePath = path.join(__dirname, 'data', file);
      if (!fs.existsSync(filePath)) {
        console.log(`⚠️ File ${file} tidak ditemukan, melewatinya...`);
        continue;
      }

      const json = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
      let urutan = 1;

      for (const catData of json.categories) {
        // Skip kategori yang namanya sama dengan nama game (false positive dari parser)
        if (catData.nama.toLowerCase() === gameDef.nama.toLowerCase()) continue;
        // Skip kategori kosong
        if (!catData.items || catData.items.length === 0) continue;

        // Normalisasi: gabungkan semua Eksplorasi & Sub region → satu kategori "Eksplorasi"
        const isEksplorasi = /^eksplorasi|^sub region/i.test(catData.nama.trim());
        const namaKategori = isEksplorasi ? 'Eksplorasi' : catData.nama;

        // Prefix nama item dengan nama region jika ini eksplorasi gabungan
        const regionPrefix = isEksplorasi ? catData.nama.replace(/^eksplorasi\s*/i, '').replace(/^sub region\s*/i, '[Sub] ').trim() : '';

        // Cek jika kategori sudah ada (karena gabungan file/merge eksplorasi)
        let category = await prisma.category.findFirst({
          where: { gameId: game.id, nama: namaKategori }
        });

        if (!category) {
          category = await prisma.category.create({
            data: {
              gameId: game.id,
              nama: namaKategori,
              displayType: 'tab',
              urutan: urutan++
            }
          });
        }

        for (const itemData of catData.items) {
          // Prefix nama item dengan region untuk eksplorasi
          const namaItem = regionPrefix
            ? `[${regionPrefix}] ${itemData.nama}`
            : itemData.nama;
          const deskripsi = catData.deskripsi || '';
          
          if (itemData.tiers && itemData.tiers.length > 0) {
            // Tipe Paket/Tier
            const item = await prisma.item.create({
              data: {
                categoryId: category.id,
                nama: namaItem,
                tipe: 'satuan',
                deskripsi: deskripsi,
                satuanLabel: 'paket'
              }
            });

            const tierInserts = itemData.tiers.map(t => ({
              itemId: item.id,
              minQty: 1,
              maxQty: 1,
              harga: typeof t.harga === 'number' ? t.harga : 0
            }));
            
            await prisma.itemTier.createMany({ data: tierInserts });
            
            // Ubah deskripsi tambahan untuk memperlihatkan label tier krn kita buat satuan
            await prisma.item.update({
              where: { id: item.id },
              data: { deskripsi: deskripsi + '\n(Varian: ' + itemData.tiers.map(t => t.label + ' - ' + t.rawText).join(', ') + ')' }
            });
            
          } else {
            // Tipe Satuan/Paket Biasa
            const isComplex = itemData.isComplex || (itemData.variants && itemData.variants.length > 0);
            const harga = typeof itemData.harga === 'number' ? itemData.harga : (itemData.variants ? Math.min(...itemData.variants.map(v => typeof v.harga === 'number' ? v.harga : 10000)) : 10000);
            
            const createdItem = await prisma.item.create({
              data: {
                categoryId: category.id,
                nama: namaItem,
                tipe: isComplex ? 'paket' : 'satuan',
                hargaBatch: isComplex ? null : harga,
                jumlahBatch: isComplex ? null : 1,
                hargaPaket: isComplex ? harga : null,
                deskripsi: deskripsi + (itemData.rawText ? `\nNote: ${itemData.rawText}` : ''),
                satuanLabel: isComplex ? null : 'pesanan'
              }
            });

            if (itemData.variants && itemData.variants.length > 0) {
              const variantInserts = itemData.variants.map(v => ({
                itemId: createdItem.id,
                nama: String(v.nama),
                harga: typeof v.harga === 'number' ? v.harga : 0
              }));
              await prisma.itemVariant.createMany({ data: variantInserts });
            }
          }
        }
      }
    }
  }

  console.log("\n✅ Database berhasil di-seed dengan data JSON HTML!");
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
