"use server";

import { prisma } from "@/lib/db";
import { encrypt } from "@/lib/crypto";
import { redirect } from "next/navigation";

export async function createOrder(formData: FormData) {
  const itemId = Number(formData.get("itemId"));
  const qty = Number(formData.get("qty"));
  const hargaFinal = Number(formData.get("hargaFinal"));
  const username = formData.get("username") as string;
  const password = formData.get("password") as string;
  const server = formData.get("server") as string;
  let catatan = formData.get("catatan") as string;
  const paymentMethod = formData.get("paymentMethod") as string;
  const variantName = formData.get("variantName") as string;

  if (variantName) {
    catatan = catatan ? `[Varian: ${variantName}] ${catatan}` : `[Varian: ${variantName}]`;
  }
  
  // Ambil user customer pertama dari DB untuk demo
  const user = await prisma.user.findFirst({ where: { role: "customer" } });
  if (!user) throw new Error("User customer tidak ditemukan di database. Silakan jalankan db seed.");
  const userId = user.id;

  if (!itemId || !qty || !hargaFinal || !username || !password || !server) {
    throw new Error("Semua field wajib diisi.");
  }

  // 1. Simpan order utama
  const order = await prisma.order.create({
    data: {
      userId,
      status: "pending_payment",
      items: {
        create: {
          itemId,
          jumlah: qty,
          hargaFinal,
          catatan: catatan || null,
        },
      },
    },
  });

  // 2. Simpan kredensial terenkripsi
  const combinedUsername = `${server} | ${username}`;
  await prisma.accountCredential.create({
    data: {
      orderId: order.id,
      encryptedUsername: encrypt(combinedUsername),
      encryptedPassword: encrypt(password),
      purgeAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // Hapus otomatis 14 hari kemudian (contoh policy)
    },
  });

  // 3. Simpan payment intent (Tripay mock)
  await prisma.payment.create({
    data: {
      orderId: order.id,
      jumlah: hargaFinal,
      status: "pending",
      gatewayRef: `TRX-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    },
  });

  // Redirect ke halaman simulasi payment
  redirect(`/payment/${order.id}`);
}
