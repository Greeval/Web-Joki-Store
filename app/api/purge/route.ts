import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(req: NextRequest) {
  // Validasi secret header - WAJIB, tidak boleh kosong
  const authHeader = req.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret) {
    return NextResponse.json({ error: "Server misconfiguration: CRON_SECRET not set" }, { status: 500 });
  }

  if (authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000); // 24 jam lalu

  try {
    // Hapus NegoMessage dulu (child dari NegoThread)
    // lalu NegoThread (child dari OrderItem)
    // lalu Orders (dan seluruh relasinya via onDelete: Cascade)
    const deletedOrders = await prisma.order.deleteMany({
      where: {
        createdAt: { lt: cutoff },
      },
    });

    return NextResponse.json({
      success: true,
      deleted: {
        orders: deletedOrders.count,
      },
      cutoff: cutoff.toISOString(),
      runAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("[PURGE ERROR]", error);
    return NextResponse.json(
      { error: "Purge failed", detail: String(error) },
      { status: 500 }
    );
  }
}
