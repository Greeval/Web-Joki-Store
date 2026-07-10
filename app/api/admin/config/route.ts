import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// GET — ambil config (orderBaseCount)
export async function GET() {
  const configs = await prisma.siteConfig.findMany();
  const map: Record<string, string> = {};
  configs.forEach((c) => (map[c.key] = c.value));
  return NextResponse.json(map);
}

// POST — upsert satu atau banyak config
export async function POST(req: NextRequest) {
  const body = await req.json() as Record<string, string>;
  const ops = Object.entries(body).map(([key, value]) =>
    prisma.siteConfig.upsert({
      where: { key },
      update: { value: String(value) },
      create: { key, value: String(value) },
    })
  );
  await Promise.all(ops);
  return NextResponse.json({ ok: true });
}
