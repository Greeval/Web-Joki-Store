"use server";

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";

// ─── Customer: Mulai nego dari halaman item ───────────────────────────────
export async function bukaNegoThread(formData: FormData) {
  const itemId = parseInt(formData.get("itemId") as string);
  const hargaTawar = parseFloat(formData.get("hargaTawar") as string);
  const pesan = formData.get("pesan") as string;

  if (!itemId || !hargaTawar || !pesan) {
    throw new Error("Semua field harus diisi.");
  }

  // Ambil customer pertama (demo)
  const customer = await prisma.user.findFirst({ where: { role: "customer" } });
  if (!customer) throw new Error("User tidak ditemukan.");

  // Buat Order sementara (status nego)
  const order = await prisma.order.create({
    data: {
      userId: customer.id,
      status: "negotiating",
    },
  });

  // Buat OrderItem
  const orderItem = await prisma.orderItem.create({
    data: {
      orderId: order.id,
      itemId,
      jumlah: 1,
      hargaFinal: hargaTawar,
    },
  });

  // Buat NegoThread
  const thread = await prisma.negoThread.create({
    data: {
      orderItemId: orderItem.id,
      status: "pending",
      messages: {
        create: {
          senderRole: "customer",
          pesan,
          hargaDiajukan: hargaTawar,
        },
      },
    },
  });

  revalidatePath("/nego");
  return { threadId: thread.id };
}

// ─── Kirim pesan di thread yang ada ───────────────────────────────────────
export async function kirimPesanNego(formData: FormData) {
  const threadId = parseInt(formData.get("threadId") as string);
  const senderRole = formData.get("senderRole") as string;
  const pesan = formData.get("pesan") as string;
  const hargaDiajukanStr = formData.get("hargaDiajukan") as string;
  const hargaDiajukan = hargaDiajukanStr ? parseFloat(hargaDiajukanStr) : null;

  if (!threadId || !senderRole || !pesan) {
    throw new Error("Pesan tidak boleh kosong.");
  }

  await prisma.negoMessage.create({
    data: {
      threadId,
      senderRole,
      pesan,
      hargaDiajukan,
    },
  });

  // Jika admin membalas dengan harga, ubah status thread ke "counter"
  if (senderRole === "admin" && hargaDiajukan) {
    await prisma.negoThread.update({
      where: { id: threadId },
      data: { status: "counter" },
    });
  } else if (senderRole === "customer" && hargaDiajukan) {
    await prisma.negoThread.update({
      where: { id: threadId },
      data: { status: "pending" },
    });
  }

  revalidatePath(`/nego/${threadId}`);
}

// ─── Admin: Approve (Deal) atau Tolak nego ─────────────────────────────────
export async function resolveNego(formData: FormData) {
  const threadId = parseInt(formData.get("threadId") as string);
  const action = formData.get("action") as string; // "deal" | "rejected"
  const hargaFinalStr = formData.get("hargaFinal") as string;
  const hargaFinal = hargaFinalStr ? parseFloat(hargaFinalStr) : null;

  if (!threadId || !action) {
    throw new Error("Data tidak lengkap.");
  }

  const thread = await prisma.negoThread.findUnique({
    where: { id: threadId },
    include: { 
      orderItem: true,
      messages: {
        orderBy: { createdAt: 'desc' },
        take: 1
      }
    },
  });
  if (!thread) throw new Error("Thread tidak ditemukan.");

  if (action === "deal") {
    // Gunakan hargaFinal yang diketik admin, jika kosong gunakan harga terakhir yang diajukan di chat
    const lastProposed = thread.messages[0]?.hargaDiajukan;
    const hargaDisepakati = hargaFinal ?? lastProposed ?? thread.orderItem.hargaFinal;

    await prisma.negoThread.update({
      where: { id: threadId },
      data: { status: "deal", hargaDisepakati },
    });

    // Update harga di orderItem
    await prisma.orderItem.update({
      where: { id: thread.orderItemId },
      data: { hargaFinal: hargaDisepakati },
    });

    // Ubah status order ke pending_payment (siap bayar)
    await prisma.order.update({
      where: { id: thread.orderItem.orderId },
      data: { status: "pending_payment" },
    });

    // Kirim pesan konfirmasi deal
    await prisma.negoMessage.create({
      data: {
        threadId,
        senderRole: "admin",
        pesan: `✅ Deal! Harga disepakati Rp ${hargaDisepakati.toLocaleString("id-ID")}. Silakan lanjut ke pembayaran.`,
        hargaDiajukan: hargaDisepakati,
      },
    });
  } else {
    await prisma.negoThread.update({
      where: { id: threadId },
      data: { status: "rejected" },
    });

    await prisma.negoMessage.create({
      data: {
        threadId,
        senderRole: "admin",
        pesan: "❌ Maaf, harga tidak bisa kami sepakati. Silakan cek pricelist kami.",
      },
    });

    await prisma.order.update({
      where: { id: thread.orderItem.orderId },
      data: { status: "cancelled" },
    });
  }

  revalidatePath(`/nego/${threadId}`);
  revalidatePath("/admin/nego");
}
