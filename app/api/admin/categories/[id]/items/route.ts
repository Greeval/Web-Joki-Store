import { prisma } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  
  const items = await prisma.item.findMany({
    where: { categoryId: Number(id) },
    include: { variants: true, tiers: { orderBy: { minQty: "asc" } } },
    orderBy: { id: "asc" }
  });
  
  return NextResponse.json(items);
}
