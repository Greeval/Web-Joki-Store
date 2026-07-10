import { prisma } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { categoryId, nama, tipe, hargaBatch, jumlahBatch, hargaPaket, satuanLabel, deskripsi, refundPolicy, variants, tiers } = body;
  if (!categoryId || !nama) return NextResponse.json({ error: "categoryId dan nama wajib" }, { status: 400 });

  const item = await prisma.item.create({
    data: {
      categoryId: Number(categoryId),
      nama,
      tipe: tipe || "satuan",
      hargaBatch: hargaBatch ? Number(hargaBatch) : null,
      jumlahBatch: jumlahBatch ? Number(jumlahBatch) : null,
      hargaPaket: hargaPaket ? Number(hargaPaket) : null,
      satuanLabel: satuanLabel || null,
      deskripsi: deskripsi || null,
      refundPolicy: refundPolicy || "no_refund",
      variants: {
        create: variants ? variants.map((v: any) => ({ nama: v.nama, harga: Number(v.harga) })) : []
      },
      tiers: {
        create: tiers ? tiers.map((t: any) => ({ minQty: Number(t.minQty), maxQty: Number(t.maxQty), harga: Number(t.harga) })) : []
      }
    }
  });
  return NextResponse.json(item, { status: 201 });
}
