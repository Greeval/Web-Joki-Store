import { prisma } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();
  const { nama, displayType, urutan } = body;
  const category = await prisma.category.update({
    where: { id: Number(id) },
    data: { nama, displayType, urutan }
  });
  return NextResponse.json(category);
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await prisma.category.delete({ where: { id: Number(id) } });
  return NextResponse.json({ ok: true });
}
