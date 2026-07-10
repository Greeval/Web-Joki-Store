import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import { QrCode, MessageCircle, Wallet } from "lucide-react";
import Link from "next/link";

type Props = {
  params: Promise<{ orderId: string }>;
};

function formatIDR(amount: number): string {
  return `Rp ${amount.toLocaleString("id-ID")}`;
}

export default async function PaymentPage({ params }: Props) {
  const { orderId } = await params;

  const order = await prisma.order.findUnique({
    where: { id: Number(orderId) },
    include: {
      payments: true,
      items: { include: { item: { include: { category: { include: { game: true } } } } } },
    },
  });

  if (!order || order.payments.length === 0) notFound();

  const payment = order.payments[0];
  const item = order.items[0]?.item;
  const game = item?.category.game;

  // Ambil config dari DB untuk nomor payment dan WA
  const configs = await prisma.siteConfig.findMany();
  const map: Record<string, string> = {};
  configs.forEach(c => map[c.key] = c.value);

  const waNumber = map["wa_number"] || "6281234567890";
  const qrisUrl = map["pay_qris"];
  const dana = map["pay_dana"];
  const gopay = map["pay_gopay"];
  const ovo = map["pay_ovo"];
  const mandiri = map["pay_mandiri"];

  const rawWaText = `Halo admin, saya mau konfirmasi pembayaran.\n\nOrder ID: *#${order.id}*\nGame: ${game?.nama}\nKategori: ${item?.category.nama}\nItem: ${item?.nama}\nTotal: *${formatIDR(payment.jumlah)}*\n\nBerikut saya lampirkan screenshot bukti transfer dan detail akun saya.`;
  const waText = encodeURIComponent(rawWaText);

  return (
    <div style={{ minHeight: "80vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "40px 24px" }}>
      <div style={{ width: "100%", maxWidth: 480, background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "var(--radius-xl)", overflow: "hidden", boxShadow: "0 20px 40px rgba(0,0,0,0.4)" }}>
        
        {/* Header */}
        <div style={{ padding: "32px 32px 24px", textAlign: "center", background: "var(--gradient-card)" }}>
          <div style={{ display: "inline-flex", background: "rgba(255,255,255,0.1)", padding: 12, borderRadius: 16, marginBottom: 16 }}>
            <Wallet size={32} color="var(--accent-cyan)" />
          </div>
          <h1 style={{ fontSize: 22, fontWeight: 800, marginBottom: 8, color: "white" }}>Pembayaran</h1>
          <p style={{ color: "var(--text-secondary)", fontSize: 14 }}>Order #{order.id}</p>
        </div>

        {/* Content */}
        <div style={{ padding: "0 32px 32px" }}>
          <div style={{ textAlign: "center", marginBottom: 32 }}>
            <div style={{ fontSize: 13, color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 }}>Total Transfer</div>
            <div style={{ fontSize: 40, fontWeight: 900, color: "var(--accent-cyan)" }}>
              {formatIDR(payment.jumlah)}
            </div>
          </div>

          <div style={{ background: "rgba(255,255,255,0.03)", borderRadius: "var(--radius-md)", padding: 20, marginBottom: 24, border: "1px solid rgba(255,255,255,0.05)" }}>
            <h3 style={{ fontSize: 14, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 16, textTransform: "uppercase", letterSpacing: 1 }}>Metode Pembayaran</h3>
            
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {dana && (
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingBottom: 12, borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                  <span style={{ fontWeight: 600, color: "#118EEA" }}>DANA</span>
                  <span style={{ fontWeight: 700, fontSize: 15 }}>{dana}</span>
                </div>
              )}
              {gopay && (
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingBottom: 12, borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                  <span style={{ fontWeight: 600, color: "#00AED6" }}>GOPAY</span>
                  <span style={{ fontWeight: 700, fontSize: 15 }}>{gopay}</span>
                </div>
              )}
              {ovo && (
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingBottom: 12, borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                  <span style={{ fontWeight: 600, color: "#4C3494" }}>OVO</span>
                  <span style={{ fontWeight: 700, fontSize: 15 }}>{ovo}</span>
                </div>
              )}
              {mandiri && (
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingBottom: 12, borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                  <span style={{ fontWeight: 600, color: "#003E7E" }}>MANDIRI</span>
                  <span style={{ fontWeight: 700, fontSize: 15 }}>{mandiri}</span>
                </div>
              )}
              {qrisUrl && (
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: 8 }}>
                  <span style={{ fontWeight: 600, color: "#ED2B2A" }}>QRIS</span>
                  <a href={qrisUrl} target="_blank" rel="noreferrer" style={{ color: "var(--accent-cyan)", fontSize: 13, display: "flex", alignItems: "center", gap: 4 }}>
                    <QrCode size={14} /> Lihat QRIS
                  </a>
                </div>
              )}
            </div>
            
            <p style={{ fontSize: 12, color: "var(--text-tertiary)", marginTop: 16, textAlign: "center" }}>
              *Jika transfer dari Bank ke E-Wallet mohon ditambah biaya admin Rp 1.000 (jika ada).
            </p>
          </div>

          <Link href={`https://wa.me/${waNumber}?text=${waText}`} target="_blank" style={{ textDecoration: "none" }}>
            <button className="btn-primary" style={{ width: "100%", justifyContent: "center", padding: "16px", background: "#25D366", color: "white", display: "flex", gap: 8, alignItems: "center", fontSize: 15 }}>
              <MessageCircle size={20} />
              Konfirmasi via WhatsApp
            </button>
          </Link>
          <p style={{ textAlign: "center", fontSize: 13, color: "var(--text-muted)", marginTop: 16 }}>
            Kirim screenshot bukti transfer dan detail akun Anda (Username/Pass) melalui WhatsApp admin.
          </p>

        </div>
      </div>
    </div>
  );
}
