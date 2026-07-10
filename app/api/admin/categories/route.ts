import { prisma } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { gameId, nama, displayType, urutan } = body;
  if (!gameId || !nama) return NextResponse.json({ error: "gameId dan nama wajib" }, { status: 400 });

  const category = await prisma.category.create({
    data: { gameId: Number(gameId), nama, displayType: displayType || "tab", urutan: urutan ?? 0 }
  });
  return NextResponse.json(category, { status: 201 });
}
