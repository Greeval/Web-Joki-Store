import { prisma } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();
  const { nama, slug, coverImageUrl, isPopuler } = body;
  const game = await prisma.game.update({
    where: { id: Number(id) },
    data: { nama, slug, coverImageUrl, isPopuler }
  });
  return NextResponse.json(game);
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await prisma.game.delete({ where: { id: Number(id) } });
  return NextResponse.json({ ok: true });
}
