import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// POST — customer submit rating setelah order selesai
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const orderId = Number(id);
  const body = await req.json();
  const { rating, ratingNote } = body;

  if (!rating || rating < 1 || rating > 5) {
    return NextResponse.json({ error: "Rating harus antara 1–5" }, { status: 400 });
  }

  // Pastikan order ada dan statusnya completed
  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order) return NextResponse.json({ error: "Order tidak ditemukan" }, { status: 404 });
  if (order.status !== "completed") {
    return NextResponse.json({ error: "Order belum selesai" }, { status: 400 });
  }
  if (order.rating) {
    return NextResponse.json({ error: "Order sudah pernah diberi rating" }, { status: 409 });
  }

  // Simpan rating ke order
  const updated = await prisma.order.update({
    where: { id: orderId },
    data: { rating: Number(rating), ratingNote: ratingNote || null },
  });

  // Otomatis buat testimoni dari rating ini (jika rating >= 4)
  if (Number(rating) >= 4 && ratingNote?.trim()) {
    await prisma.testimoni.upsert({
      where: { orderId },
      update: { rating: Number(rating), pesan: ratingNote.trim(), isActive: false },
      create: {
        orderId,
        nama: `Customer #${orderId}`,
        rating: Number(rating),
        pesan: ratingNote.trim(),
        isActive: false, // Admin harus approve dulu sebelum tampil
      },
    });
  }

  return NextResponse.json({ ok: true, rating: updated.rating });
}

// GET — cek apakah order sudah dirating (untuk disable form)
export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const order = await prisma.order.findUnique({
    where: { id: Number(id) },
    select: { rating: true, ratingNote: true, status: true },
  });
  if (!order) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(order);
}
