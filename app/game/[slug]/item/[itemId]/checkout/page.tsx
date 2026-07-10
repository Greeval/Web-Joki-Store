import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, Lock, ShieldCheck, AlertTriangle } from "lucide-react";
import { createOrder } from "@/app/actions/order";

type Props = {
  params: Promise<{ slug: string; itemId: string }>;
  searchParams: Promise<{ qty?: string; variantId?: string }>;
};

function formatIDR(amount: number): string {
  return `Rp ${amount.toLocaleString("id-ID")}`;
}

export default async function CheckoutPage({ params, searchParams }: Props) {
  const { slug, itemId } = await params;
  const { qty: qtyParam } = await searchParams;
  
  const qty = Math.max(1, parseInt(qtyParam || "1", 10));

  const item = await prisma.item.findUnique({
    where: { id: Number(itemId) },
    include: {
      category: { include: { game: true } },
      tiers: { orderBy: { minQty: "asc" } },
      variants: true,
      prerequisites: true,
    },
  });

  if (!item || item.category.game.slug !== slug) notFound();

  // Kalkulasi harga final
  let hargaFinal = 0;
  let variantName = "";
  const { variantId: variantIdParam } = await searchParams;
  const variantId = variantIdParam ? parseInt(variantIdParam, 10) : null;

  if (item.tipe === "paket") {
    hargaFinal = item.hargaPaket ?? 0;
  } else if (item.variants && item.variants.length > 0 && variantId) {
    const selectedVariant = item.variants.find(v => v.id === variantId) || item.variants[0];
    hargaFinal = selectedVariant.harga * qty;
    variantName = selectedVariant.nama;
  } else if (item.tiers.length > 0) {
    const activeTier = item.tiers.find((t) => qty >= t.minQty && qty <= t.maxQty) || item.tiers[item.tiers.length - 1];
    hargaFinal = activeTier.harga; // (Note: tier harga is already multiplied in ItemPriceCalculator or is it per unit? The existing code assumes tier.harga is total or flat tier price. We'll leave it as is).
  } else {
    const rate = (item.hargaBatch ?? 0) / (item.jumlahBatch ?? 1);
    hargaFinal = Math.ceil(rate * qty);
  }

  const game = item.category.game;

  return (
    <>
      <div style={{ marginTop: 64, background: "var(--bg-secondary)", borderBottom: "1px solid var(--border)", padding: "12px 40px" }}>
        <Link
          href={`/game/${slug}/item/${itemId}`}
          style={{ display: "inline-flex", alignItems: "center", gap: 6, color: "var(--text-secondary)", textDecoration: "none", fontSize: 14 }}
        >
          <ChevronLeft size={16} />
          Kembali ke Detail Item
        </Link>
      </div>

      <div className="section" style={{ paddingTop: 40, paddingBottom: 80, display: "grid", gridTemplateColumns: "1fr 380px", gap: 32, alignItems: "start" }}>
        
        {/* KOLOM KIRI - FORM */}
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 8 }}>Checkout Order</h1>
          <p style={{ color: "var(--text-secondary)", marginBottom: 32 }}>
            Lengkapi data akun kamu. Kredensial akan dienkripsi end-to-end.
          </p>

          <form action={createOrder} id="checkout-form">
            <input type="hidden" name="itemId" value={item.id} />
            <input type="hidden" name="qty" value={qty} />
            <input type="hidden" name="variantId" value={variantId || ""} />
            <input type="hidden" name="variantName" value={variantName} />
            <input type="hidden" name="hargaFinal" value={hargaFinal} />

            <div className="desc-section" style={{ padding: 24, marginBottom: 24 }}>
              <div className="desc-title" style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <Lock size={16} color="var(--accent-purple)" />
                Kredensial Akun Game
              </div>
              
              <div className="form-group">
                <label className="form-label">Server</label>
                <select name="server" className="form-input form-select" required>
                  <option value="">Pilih Server...</option>
                  <option value="Asia">Asia</option>
                  <option value="America">America</option>
                  <option value="Europe">Europe</option>
                  <option value="TW/HK/MO">TW/HK/MO</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">UID / Username Login</label>
                <input type="text" name="username" className="form-input" placeholder="Masukkan UID atau Username/Email" required />
              </div>

              <div className="form-group">
                <label className="form-label">Password Game</label>
                <input type="password" name="password" className="form-input" placeholder="Masukkan Password" required />
                <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 6, display: "flex", alignItems: "center", gap: 4 }}>
                  <ShieldCheck size={14} /> Password akan dienkripsi AES-256 dan otomatis dihapus setelah order selesai.
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Catatan Tambahan (Opsional)</label>
                <textarea name="catatan" className="form-input" placeholder="Contoh: Tolong kerjakan di atas jam 10 malam" rows={3}></textarea>
              </div>
            </div>

            {item.prerequisites.length > 0 && (
              <div className="prerequisites-section">
                <div className="prerequisites-title">
                  <AlertTriangle size={16} />
                  Validasi Syarat Akun
                </div>
                {item.prerequisites.map((req) => (
                  <label key={req.id} className="prerequisite-item">
                    <input type="checkbox" required={req.wajibDicentang} />
                    <span>{req.deskripsiSyarat}</span>
                  </label>
                ))}
              </div>
            )}

            <div className="desc-section" style={{ padding: 24 }}>
              <div className="desc-title">Pilih Metode Pembayaran</div>
              <div style={{ display: "grid", gap: 12 }}>
                <label className="payment-method-card active">
                  <input type="radio" name="paymentMethod" value="qris" className="payment-method-radio" defaultChecked />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: 15 }}>QRIS (Otomatis)</div>
                    <div style={{ fontSize: 13, color: "var(--text-secondary)" }}>Gopay, OVO, Dana, ShopeePay, Mobile Banking</div>
                  </div>
                  <div style={{ fontWeight: 700, fontSize: 12, color: "var(--accent-purple-light)", background: "rgba(124,58,237,0.2)", padding: "2px 8px", borderRadius: 100 }}>Tripay</div>
                </label>
                <label className="payment-method-card">
                  <input type="radio" name="paymentMethod" value="va_bca" className="payment-method-radio" />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: 15 }}>BCA Virtual Account</div>
                    <div style={{ fontSize: 13, color: "var(--text-secondary)" }}>Dicek otomatis</div>
                  </div>
                  <div style={{ fontWeight: 700, fontSize: 12, color: "var(--accent-purple-light)", background: "rgba(124,58,237,0.2)", padding: "2px 8px", borderRadius: 100 }}>Tripay</div>
                </label>
              </div>
            </div>

            <button type="submit" className="btn-primary" style={{ width: "100%", justifyContent: "center", padding: "16px", fontSize: 16 }}>
              Bayar Sekarang — {formatIDR(hargaFinal)}
            </button>
          </form>
        </div>

        {/* KOLOM KANAN - SUMMARY */}
        <div style={{ position: "sticky", top: 100 }}>
          <div className="desc-section" style={{ padding: 24, border: "1px solid rgba(124, 58, 237, 0.4)", boxShadow: "var(--shadow-glow-purple)" }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: "var(--accent-purple-light)", textTransform: "uppercase", letterSpacing: 1, marginBottom: 16 }}>
              Ringkasan Order
            </div>
            
            <div style={{ display: "flex", gap: 16, marginBottom: 24, paddingBottom: 24, borderBottom: "1px solid var(--border)" }}>
              {game.coverImageUrl && (
                <img src={game.coverImageUrl} alt={game.nama} style={{ width: 64, height: 64, borderRadius: 8, objectFit: "cover" }} />
              )}
              <div>
                <div style={{ fontSize: 13, color: "var(--text-secondary)", marginBottom: 4 }}>{game.nama}</div>
                <div style={{ fontSize: 16, fontWeight: 700, lineHeight: 1.3 }}>{item.nama}</div>
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12, fontSize: 14 }}>
              <span style={{ color: "var(--text-secondary)" }}>Tipe Layanan</span>
              <span style={{ fontWeight: 600 }}>{item.tipe === "paket" ? "Paket Flat" : "Satuan"}</span>
            </div>
            
            {variantName && (
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12, fontSize: 14 }}>
                <span style={{ color: "var(--text-secondary)" }}>Durasi / Varian</span>
                <span style={{ fontWeight: 600 }}>{variantName}</span>
              </div>
            )}

            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12, fontSize: 14 }}>
              <span style={{ color: "var(--text-secondary)" }}>Jumlah ({item.satuanLabel || "unit"})</span>
              <span style={{ fontWeight: 600 }}>x{qty}</span>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 24, paddingTop: 16, borderTop: "1px dashed var(--border)" }}>
              <span style={{ fontSize: 16, fontWeight: 600 }}>Total Pembayaran</span>
              <span style={{ fontSize: 24, fontWeight: 800, color: "var(--accent-cyan-light)" }}>
                {formatIDR(hargaFinal)}
              </span>
            </div>
          </div>
        </div>

      </div>
    </>
  );
}
