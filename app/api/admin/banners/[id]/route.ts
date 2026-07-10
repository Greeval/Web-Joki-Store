import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// PUT — update banner
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const id = Number(params.id);
  const body = await req.json();
  const { title, subtitle, badge, imageUrl, linkUrl, urutan, isActive } = body;

  const banner = await prisma.promoBanner.update({
    where: { id },
    data: {
      title,
      subtitle: subtitle ?? null,
      badge: badge ?? null,
      imageUrl,
      linkUrl: linkUrl ?? null,
      urutan: urutan ?? 0,
      isActive: isActive ?? true,
    },
  });
  return NextResponse.json(banner);
}

// DELETE — hapus banner
export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const id = Number(params.id);
  await prisma.promoBanner.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
