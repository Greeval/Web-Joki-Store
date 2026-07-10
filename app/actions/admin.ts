"use server";

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function updateOrderStatus(formData: FormData) {
  const orderId = parseInt(formData.get("orderId") as string);
  const status = formData.get("status") as string;

  if (!orderId || !status) throw new Error("Missing parameters");

  await prisma.order.update({
    where: { id: orderId },
    data: { status }
  });

  revalidatePath("/admin/orders");
  revalidatePath(`/orders/${orderId}`);
}
