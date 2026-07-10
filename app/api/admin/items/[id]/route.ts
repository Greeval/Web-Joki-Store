import { prisma } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();
  const { nama, tipe, hargaBatch, jumlahBatch, hargaPaket, satuanLabel, deskripsi, refundPolicy, variants, tiers } = body;

  const item = await prisma.item.update({
    where: { id: Number(id) },
    data: {
      nama,
      tipe,
      hargaBatch: hargaBatch ? Number(hargaBatch) : null,
      jumlahBatch: jumlahBatch ? Number(jumlahBatch) : null,
      hargaPaket: hargaPaket ? Number(hargaPaket) : null,
      satuanLabel: satuanLabel || null,
      deskripsi: deskripsi || null,
      refundPolicy: refundPolicy || "no_refund",
      variants: {
        deleteMany: {},
        create: variants ? variants.map((v: any) => ({ nama: v.nama, harga: Number(v.harga) })) : []
      },
      tiers: {
        deleteMany: {},
        create: tiers ? tiers.map((t: any) => ({ minQty: Number(t.minQty), maxQty: Number(t.maxQty), harga: Number(t.harga) })) : []
      }
    }
  });
  return NextResponse.json(item);
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await prisma.item.delete({ where: { id: Number(id) } });
  return NextResponse.json({ ok: true });
}
