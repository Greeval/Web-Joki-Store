import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// GET — ambil semua testimoni (admin: semua, publik: isActive)
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const publik = searchParams.get("publik") === "1";

  const testimoni = await prisma.testimoni.findMany({
    where: publik ? { isActive: true } : undefined,
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(testimoni);
}

// POST — buat testimoni baru (admin)
export async function POST(req: NextRequest) {
  const body = await req.json();
  const { nama, avatarUrl, game, rating, pesan, isActive, orderId } = body;

  if (!nama?.trim() || !pesan?.trim()) {
    return NextResponse.json({ error: "Nama dan pesan wajib diisi" }, { status: 400 });
  }
  if (rating < 1 || rating > 5) {
    return NextResponse.json({ error: "Rating harus antara 1–5" }, { status: 400 });
  }

  const t = await prisma.testimoni.create({
    data: {
      nama: nama.trim(),
      avatarUrl: avatarUrl || null,
      game: game || null,
      rating: Number(rating),
      pesan: pesan.trim(),
      isActive: isActive ?? true,
      orderId: orderId ? Number(orderId) : null,
    },
  });
  return NextResponse.json(t, { status: 201 });
}
