import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const file = formData.get("file") as File | null;

  if (!file) {
    return NextResponse.json({ error: "Tidak ada file" }, { status: 400 });
  }

  // Validasi tipe file
  const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
  if (!allowedTypes.includes(file.type)) {
    return NextResponse.json({ error: "Tipe file tidak didukung. Gunakan JPG, PNG, atau WebP." }, { status: 400 });
  }

  // Validasi ukuran (max 5MB)
  if (file.size > 5 * 1024 * 1024) {
    return NextResponse.json({ error: "Ukuran file maksimal 5MB" }, { status: 400 });
  }

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  // Nama file unik pakai timestamp
  const ext = file.name.split(".").pop() || "jpg";
  const fileName = `banner_${Date.now()}.${ext}`;
  const uploadDir = path.join(process.cwd(), "public", "banners");

  // Buat folder jika belum ada
  await mkdir(uploadDir, { recursive: true });

  const filePath = path.join(uploadDir, fileName);
  await writeFile(filePath, buffer);

  // Return URL path yang bisa dipakai di <img src>
  return NextResponse.json({ url: `/banners/${fileName}` });
}
