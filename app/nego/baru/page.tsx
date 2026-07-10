import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import NegoForm from "@/components/NegoForm";
import { ArrowLeft, MessageSquare } from "lucide-react";
import Link from "next/link";

interface Props {
  searchParams: Promise<{ itemId?: string }>;
}

export default async function NegoBaruPage({ searchParams }: Props) {
  const { itemId } = await searchParams;

  if (!itemId) notFound();

  const item = await prisma.item.findUnique({
    where: { id: parseInt(itemId) },
    include: { category: { include: { game: true } } },
  });

  if (!item) notFound();

  const hargaNormal = item.hargaPaket ?? item.hargaBatch ?? 0;

  return (
    <main style={{ minHeight: "100vh", paddingTop: 100, paddingBottom: 60 }}>
      <div style={{ maxWidth: 640, margin: "0 auto", padding: "0 24px" }}>
        {/* Back */}
        <Link
          href={`/game/${item.category.game.slug}/item/${item.id}`}
          style={{ display: "inline-flex", alignItems: "center", gap: 6, color: "var(--text-secondary)", textDecoration: "none", fontSize: 14, marginBottom: 28 }}
        >
          <ArrowLeft size={15} /> Kembali ke Detail Item
        </Link>

        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 28 }}>
          <MessageSquare size={22} style={{ color: "var(--accent-purple)" }} />
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 800, margin: 0 }}>Ajukan Nego Harga</h1>
            <p style={{ color: "var(--text-secondary)", fontSize: 13, margin: 0 }}>
              {item.category.game.nama} · {item.category.nama}
            </p>
          </div>
        </div>

        <NegoForm
          itemId={item.id}
          itemNama={item.nama}
          hargaNormal={hargaNormal}
        />

        <div style={{
          marginTop: 24,
          background: "rgba(6,182,212,0.06)",
          border: "1px solid rgba(6,182,212,0.2)",
          borderRadius: 12,
          padding: "14px 18px",
          fontSize: 13,
          color: "var(--text-secondary)",
          lineHeight: 1.6,
        }}>
          💡 <strong>Cara Kerja Nego:</strong> Setelah kamu kirim penawaran, admin Greeval akan membalas dalam waktu singkat. Jika harga disepakati, kamu akan dapat link langsung untuk pembayaran dengan harga yang sudah nego'd.
        </div>
      </div>
    </main>
  );
}
