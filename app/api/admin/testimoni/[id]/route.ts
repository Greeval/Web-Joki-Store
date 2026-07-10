import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const id = Number(params.id);
  const body = await req.json();
  const { nama, avatarUrl, game, rating, pesan, isActive, orderId } = body;

  const t = await prisma.testimoni.update({
    where: { id },
    data: {
      nama, avatarUrl: avatarUrl || null, game: game || null,
      rating: Number(rating), pesan,
      isActive: isActive ?? true,
      orderId: orderId ? Number(orderId) : null,
    },
  });
  return NextResponse.json(t);
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  await prisma.testimoni.delete({ where: { id: Number(params.id) } });
  return NextResponse.json({ ok: true });
}
