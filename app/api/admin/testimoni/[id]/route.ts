import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id: paramId } = await params;
  const id = Number(paramId);
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

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await prisma.testimoni.delete({ where: { id: Number(id) } });
  return NextResponse.json({ ok: true });
}
