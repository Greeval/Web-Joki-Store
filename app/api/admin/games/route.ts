import { prisma } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  const games = await prisma.game.findMany({
    include: {
      categories: {
        orderBy: { urutan: "asc" },
        include: { _count: { select: { items: true } } }
      }
    },
    orderBy: { id: "asc" }
  });
  return NextResponse.json(games);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { nama, slug, coverImageUrl, isPopuler } = body;
  if (!nama || !slug) return NextResponse.json({ error: "nama dan slug wajib diisi" }, { status: 400 });

  const game = await prisma.game.create({
    data: { nama, slug: slug.toLowerCase().replace(/\s+/g, "-"), coverImageUrl: coverImageUrl || null, isPopuler: isPopuler ?? false }
  });
  return NextResponse.json(game, { status: 201 });
}
