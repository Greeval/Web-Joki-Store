import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// GET — ambil semua banner (urut ascending)
export async function GET() {
  const banners = await prisma.promoBanner.findMany({
    orderBy: { urutan: "asc" },
  });
  return NextResponse.json(banners);
}

// POST — buat banner baru
export async function POST(req: NextRequest) {
  const body = await req.json();
  const { title, subtitle, badge, imageUrl, linkUrl, urutan, isActive } = body;

  if (!title || !imageUrl) {
    return NextResponse.json({ error: "title dan imageUrl wajib diisi" }, { status: 400 });
  }

  const banner = await prisma.promoBanner.create({
    data: {
      title,
      subtitle: subtitle || null,
      badge: badge || null,
      imageUrl,
      linkUrl: linkUrl || null,
      urutan: urutan ?? 0,
      isActive: isActive ?? true,
    },
  });
  return NextResponse.json(banner, { status: 201 });
}
