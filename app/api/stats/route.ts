import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  const [orderSelesai, gameTersedia, ratings, config] = await Promise.all([
    prisma.order.count({ where: { status: "completed" } }),
    prisma.game.count(),
    prisma.order.findMany({
      where: { rating: { not: null } },
      select: { rating: true },
    }),
    prisma.siteConfig.findMany(),
  ]);

  // Baca base count offset dari config (admin bisa set riwayat order lama)
  const configMap: Record<string, string> = {};
  config.forEach((c) => (configMap[c.key] = c.value));
  const orderBaseCount = parseInt(configMap["orderBaseCount"] || "0", 10);

  // Hitung tingkat kepuasan dari rata-rata rating
  const totalRatings = ratings.length;
  const avgRating = totalRatings > 0
    ? ratings.reduce((sum, r) => sum + (r.rating ?? 0), 0) / totalRatings
    : null;
  const kepuasan = avgRating !== null
    ? Math.round((avgRating / 5) * 100)
    : null;

  return NextResponse.json({
    orderSelesai: orderSelesai + orderBaseCount,
    gameTersedia,
    kepuasan,        // null jika belum ada rating
    totalRatings,
    avgRating: avgRating ? +avgRating.toFixed(2) : null,
  });
}
