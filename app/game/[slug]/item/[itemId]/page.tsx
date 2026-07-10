import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, AlertTriangle, Info, MessageCircle } from "lucide-react";
import ItemPriceCalculator from "@/components/ItemPriceCalculator";
import NegoForm from "@/components/NegoForm";
import type { Metadata } from "next";

type Props = { params: Promise<{ slug: string; itemId: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { itemId, slug } = await params;
  const item = await prisma.item.findUnique({
    where: { id: Number(itemId) },
    include: { category: { include: { game: true } } },
  });
  if (!item) return { title: "Item tidak ditemukan" };
  return {
    title: `${item.nama} – ${item.category.game.nama} – Greeval Store`,
    description: item.deskripsi ?? `Jasa joki ${item.nama} di Greeval Store`,
  };
}

export default async function ItemDetailPage({ params }: Props) {
  const { slug, itemId } = await params;

  const item = await prisma.item.findUnique({
    where: { id: Number(itemId) },
    include: {
      category: { include: { game: true } },
      tiers: { orderBy: { minQty: "asc" } },
      variants: true,
      prerequisites: true,
    },
  });

  if (!item) notFound();
  if (item.category.game.slug !== slug) notFound();

  const game = item.category.game;

  function formatIDR(amount: number): string {
    if (amount >= 1000000) return `Rp ${(amount / 1000000).toFixed(amount % 1000000 === 0 ? 0 : 1)} jt`;
    if (amount >= 1000) return `Rp ${(amount / 1000).toFixed(amount % 1000 === 0 ? 0 : 1)}K`;
    return `Rp ${amount.toLocaleString("id-ID")}`;
  }

  function RefundInfo({ policy }: { policy: string }) {
    if (policy === "no_refund") {
      return (
        <div style={{ display: "flex", alignItems: "center", gap: 8, color: "#f87171", fontSize: 13 }}>
          <AlertTriangle size={14} />
          <strong>No Refund</strong> — Pembayaran tidak dapat dikembalikan setelah order diproses
        </div>
      );
    }
    if (policy === "partial_50") {
      return (
        <div style={{ display: "flex", alignItems: "center", gap: 8, color: "#fbbf24", fontSize: 13 }}>
          <Info size={14} />
          <strong>Refund 50%</strong> — Dapat dikembalikan 50% jika pekerjaan belum dimulai
        </div>
      );
    }
    return (
      <div style={{ display: "flex", alignItems: "center", gap: 8, color: "#4ade80", fontSize: 13 }}>
        <Info size={14} />
        <strong>Full Refund</strong> — Garansi uang kembali penuh jika pekerjaan tidak selesai
      </div>
    );
  }

  return (
    <>
      <div style={{ marginTop: 64, background: "var(--bg-secondary)", borderBottom: "1px solid var(--border)", padding: "12px 40px" }}>
        <div className="breadcrumb">
          <Link href="/">Beranda</Link>
          <span className="breadcrumb-sep">/</span>
          <Link href={`/game/${slug}?tab=${item.categoryId}`}>{game.nama}</Link>
          <span className="breadcrumb-sep">/</span>
          <Link href={`/game/${slug}?tab=${item.categoryId}`}>{item.category.nama}</Link>
          <span className="breadcrumb-sep">/</span>
          <span style={{ color: "var(--text-primary)" }}>{item.nama}</span>
        </div>
      </div>

      <div className="item-detail">
        {/* HEADER */}
        <div className="item-detail-header">
          <h1 className="item-detail-title">{item.nama}</h1>
          <span className={`item-type-badge item-type-${item.tipe}`} style={{ marginTop: 6 }}>
            {item.tipe === "paket" ? "Paket" : "Satuan"}
          </span>
        </div>

        {/* PRICE CALCULATOR — CLIENT COMPONENT */}
        <ItemPriceCalculator
          slug={slug}
          itemId={item.id}
          tipe={item.tipe}
          hargaPaket={item.hargaPaket}
          hargaBatch={item.hargaBatch}
          jumlahBatch={item.jumlahBatch}
          satuanLabel={item.satuanLabel}
          tiers={item.tiers.map((t) => ({
            id: t.id,
            minQty: t.minQty,
            maxQty: t.maxQty,
            harga: t.harga,
          }))}
          variants={item.variants?.map(v => ({ id: v.id, nama: v.nama, harga: v.harga })) || []}
        />

        {/* NEGO SECTION */}
        <div style={{
          background: "var(--bg-secondary)",
          border: "1px solid var(--border)",
          borderRadius: "var(--radius-lg)",
          padding: "20px 24px",
          marginTop: 8,
          marginBottom: 24,
        }}>
          <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 8, display: "flex", alignItems: "center", gap: 8 }}>
            <MessageCircle size={16} style={{ color: "var(--accent-primary)" }} />
            Mau nego harga?
          </div>
          <p style={{ fontSize: 13, color: "var(--text-secondary)", marginBottom: 12, lineHeight: 1.5 }}>
            Harga di atas adalah harga normal. Kalau kamu mau order banyak atau punya budget terbatas, bisa ajukan nego langsung ke admin.
          </p>
          <Link
            href={`/nego/baru?itemId=${item.id}`}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              padding: "8px 18px",
              borderRadius: 8,
              border: "1px solid var(--accent-primary)",
              color: "var(--accent-primary)",
              fontWeight: 600,
              fontSize: 13,
              textDecoration: "none",
              transition: "background 0.2s",
            }}
          >
            <MessageCircle size={14} />
            Ajukan Nego Harga
          </Link>
        </div>

        {/* DESKRIPSI */}
        {item.deskripsi && (
          <div className="desc-section">
            <div className="desc-title">📋 Deskripsi Layanan</div>
            <div className="desc-text">{item.deskripsi}</div>
          </div>
        )}

        {/* PREREQUISITES */}
        {item.prerequisites.length > 0 && (
          <div className="prerequisites-section">
            <div className="prerequisites-title">
              <AlertTriangle size={16} />
              Syarat Akun (Wajib Dibaca)
            </div>
            <p style={{ fontSize: 13, color: "var(--text-secondary)", marginBottom: 16, lineHeight: 1.5 }}>
              Centang semua syarat di bawah untuk konfirmasi bahwa akun kamu sudah memenuhi persyaratan sebelum order.
            </p>
            {item.prerequisites.map((req) => (
              <label key={req.id} className="prerequisite-item">
                <input type="checkbox" required={req.wajibDicentang} />
                <span>{req.deskripsiSyarat}</span>
              </label>
            ))}
          </div>
        )}

        {/* REFUND POLICY */}
        <div className="desc-section" style={{ marginBottom: 32 }}>
          <div className="desc-title">💰 Kebijakan Refund</div>
          <RefundInfo policy={item.refundPolicy} />
        </div>

      </div>

      <footer className="footer">
        <div className="footer-brand">Greeval Store</div>
        <p className="footer-text">© 2026 Greeval Store · All rights reserved</p>
      </footer>
    </>
  );
}
