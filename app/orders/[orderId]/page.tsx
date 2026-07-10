import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, Package, Shield, Info, Activity } from "lucide-react";
import OrderRatingForm from "@/components/OrderRatingForm";

type Props = {
  params: Promise<{ orderId: string }>;
};

function formatIDR(amount: number): string {
  return `Rp ${amount.toLocaleString("id-ID")}`;
}

export default async function OrderDetailPage({ params }: Props) {
  const { orderId } = await params;

  const order = await prisma.order.findUnique({
    where: { id: Number(orderId) },
    include: {
      items: { include: { item: { include: { category: { include: { game: true } } } } } },
      payments: true,
      credentials: true,
    },
  });

  if (!order) notFound();

  const orderItem = order.items[0];
  const item = orderItem.item;
  const game = item.category.game;
  const payment = order.payments[0];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending_payment": return "#d97706";
      case "waiting_account_data": return "#0891b2";
      case "in_progress": return "#6d28d9";
      case "completed": return "#16a34a";
      default: return "#475569";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "pending_payment": return "Menunggu Pembayaran";
      case "waiting_account_data": return "Menunggu Cek Akun";
      case "in_progress": return "Sedang Dikerjakan";
      case "completed": return "Selesai";
      default: return status;
    }
  };

  return (
    <>
      <div style={{ marginTop: 64, background: "var(--bg-secondary)", borderBottom: "1px solid var(--border)", padding: "12px 40px" }}>
        <Link href="/" style={{ display: "inline-flex", alignItems: "center", gap: 6, color: "var(--text-secondary)", textDecoration: "none", fontSize: 14 }}>
          <ChevronLeft size={16} />
          Kembali ke Beranda
        </Link>
      </div>

      <div className="section" style={{ maxWidth: 800 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 32 }}>
          <div>
            <h1 style={{ fontSize: 32, fontWeight: 800, marginBottom: 8 }}>Order #{order.id}</h1>
            <p style={{ color: "var(--text-secondary)" }}>{order.createdAt.toLocaleString("id-ID")}</p>
          </div>
          <div style={{ background: `${getStatusColor(order.status)}22`, color: getStatusColor(order.status), border: `1px solid ${getStatusColor(order.status)}44`, padding: "6px 16px", borderRadius: 100, fontWeight: 700, fontSize: 13, display: "flex", alignItems: "center", gap: 6 }}>
            <Activity size={14} />
            {getStatusLabel(order.status)}
          </div>
        </div>

        <div className="desc-section" style={{ padding: 24 }}>
          <div className="desc-title" style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 20 }}>
            <Package size={18} color="var(--accent-cyan)" />
            Detail Layanan
          </div>
          <div style={{ display: "flex", gap: 16 }}>
            {game.coverImageUrl && (
              <img src={game.coverImageUrl} alt={game.nama} style={{ width: 80, height: 80, borderRadius: 12, objectFit: "cover" }} />
            )}
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, color: "var(--text-secondary)", marginBottom: 4 }}>{game.nama} — {item.category.nama}</div>
              <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>{item.nama}</div>
              <div style={{ fontSize: 14, color: "var(--text-muted)", display: "flex", gap: 16 }}>
                <span>Qty: <strong>{orderItem.jumlah}</strong></span>
                <span>Harga: <strong>{formatIDR(orderItem.hargaFinal)}</strong></span>
              </div>
            </div>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, marginBottom: 24 }}>
          <div className="desc-section" style={{ padding: 24, marginBottom: 0 }}>
            <div className="desc-title" style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
              <Shield size={18} color="var(--accent-purple)" />
              Status Pembayaran
            </div>
            <div style={{ marginBottom: 12 }}>
              <div style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 4 }}>Metode</div>
              <div style={{ fontSize: 15, fontWeight: 600 }}>Tripay Gateway</div>
            </div>
            <div style={{ marginBottom: 12 }}>
              <div style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 4 }}>Status</div>
              <div style={{ fontSize: 15, fontWeight: 600, color: payment?.status === "paid" ? "#16a34a" : "#d97706" }}>
                {!payment ? "Menunggu Nego Deal" : payment.status === "paid" ? "Lunas" : "Belum Dibayar"}
              </div>
            </div>
            {payment?.status === "pending" && (
              <Link href={`/payment/${order.id}`} className="btn-secondary" style={{ width: "100%", justifyContent: "center", marginTop: 8, padding: 8, fontSize: 13 }}>
                Lanjutkan Pembayaran
              </Link>
            )}
          </div>

          <div className="desc-section" style={{ padding: 24, marginBottom: 0 }}>
            <div className="desc-title" style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
              <Info size={18} color="var(--accent-gold)" />
              Informasi Tambahan
            </div>
            <div style={{ marginBottom: 12 }}>
              <div style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 4 }}>Kredensial Akun</div>
              <div style={{ fontSize: 14, fontWeight: 500, color: "var(--text-secondary)" }}>
                {order.credentials ? "Telah diamankan (Encrypted)" : "Belum ada data"}
              </div>
            </div>
            <div>
              <div style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 4 }}>Catatan Order</div>
              <div style={{ fontSize: 14, color: "var(--text-secondary)", fontStyle: orderItem.catatan ? "normal" : "italic" }}>
                {orderItem.catatan || "Tidak ada catatan"}
              </div>
            </div>
          </div>
        </div>

        {order.status === "waiting_account_data" && (
          <div style={{ background: "rgba(6, 182, 212, 0.1)", border: "1px solid rgba(6, 182, 212, 0.3)", borderRadius: "var(--radius-lg)", padding: 20, display: "flex", gap: 16, alignItems: "flex-start" }}>
            <Info size={24} color="var(--accent-cyan)" style={{ flexShrink: 0 }} />
            <div>
              <div style={{ fontWeight: 700, color: "var(--accent-cyan)", marginBottom: 4 }}>Pembayaran Diterima</div>
              <div style={{ fontSize: 14, color: "var(--text-secondary)" }}>
                Tim joki kami akan segera mengecek kredensial akun kamu. Jika semuanya aman, status akan berubah menjadi "Sedang Dikerjakan". Silakan pantau halaman ini untuk update.
              </div>
            </div>
          </div>
        )}
        {order.status === "completed" && (
          <OrderRatingForm 
            orderId={order.id} 
            initialRating={order.rating} 
            initialNote={order.ratingNote} 
          />
        )}
      </div>
    </>
  );
}
