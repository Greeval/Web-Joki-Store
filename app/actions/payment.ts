"use server";

import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";

export async function processMockPayment(formData: FormData) {
  const orderId = Number(formData.get("orderId"));
  
  // 1. Update Payment status
  await prisma.payment.updateMany({
    where: { orderId },
    data: { status: "paid", paidAt: new Date() },
  });

  // 2. Update Order status
  await prisma.order.update({
    where: { id: orderId },
    data: { status: "waiting_account_data" }, // Tahap selanjutnya (asumsikan joki akan cek akun)
  });

  // Redirect ke halaman sukses (dashboard order detail)
  redirect(`/orders/${orderId}`);
}
