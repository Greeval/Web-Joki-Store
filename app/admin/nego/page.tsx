import { prisma } from "@/lib/db";
import NegoThread from "@/components/NegoThread";
import { ShieldCheck, MessageSquare, Clock, CheckCircle, XCircle } from "lucide-react";
import Link from "next/link";
import PurgeBanner from "@/components/PurgeBanner";

export default async function AdminNegoPage() {
  const threads = await prisma.negoThread.findMany({
    include: {
      messages: { orderBy: { createdAt: "desc" }, take: 1 },
      orderItem: {
        include: {
          item: true,
          order: { include: { user: true } },
        },
      },
    },
    orderBy: { id: "desc" },
  });

  const statusIcon = {
    pending: <Clock size={16} style={{ color: "var(--accent-purple)" }} />,
    counter: <MessageSquare size={16} style={{ color: "var(--accent-cyan)" }} />,
    deal: <CheckCircle size={16} style={{ color: "#22c55e" }} />,
    rejected: <XCircle size={16} style={{ color: "#ef4444" }} />,
  } as Record<string, React.ReactNode>;

  const statusLabel: Record<string, { label: string; color: string }> = {
    pending: { label: "Menunggu", color: "var(--accent-purple)" },
    counter: { label: "Ada Penawaran", color: "var(--accent-cyan)" },
    deal: { label: "Deal ✅", color: "#22c55e" },
    rejected: { label: "Ditolak", color: "#ef4444" },
  };

  const active = threads.filter(t => t.status === "pending" || t.status === "counter");
  const done = threads.filter(t => t.status === "deal" || t.status === "rejected");

  return (
    <main style={{ minHeight: "100vh", paddingTop: 100, paddingBottom: 60 }}>
      <div style={{ maxWidth: 900, margin: "0 auto", padding: "0 24px" }}>
        <PurgeBanner label="data nego" />
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 32 }}>
          <ShieldCheck size={28} style={{ color: "var(--accent-purple)" }} />
          <div>
            <h1 style={{ fontSize: 26, fontWeight: 800, margin: 0 }}>Admin: Nego Dashboard</h1>
            <p style={{ color: "var(--text-secondary)", fontSize: 13, margin: 0 }}>
              Kelola semua pengajuan nego dari customer
            </p>
          </div>
        </div>

        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 16, marginBottom: 32 }}>
          {[
            { label: "Total Nego", value: threads.length, color: "var(--accent-purple)" },
            { label: "Perlu Respons", value: active.length, color: "var(--accent-cyan)" },
            { label: "Deal", value: threads.filter(t => t.status === "deal").length, color: "#22c55e" },
            { label: "Ditolak", value: threads.filter(t => t.status === "rejected").length, color: "#ef4444" },
          ].map(s => (
            <div key={s.label} className="glass-card" style={{ padding: "16px 20px", textAlign: "center" }}>
              <div style={{ fontSize: 28, fontWeight: 800, color: s.color }}>{s.value}</div>
              <div style={{ fontSize: 13, color: "var(--text-secondary)", marginTop: 4 }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Perlu respons */}
        {active.length > 0 && (
          <div style={{ marginBottom: 40 }}>
            <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16, color: "var(--accent-cyan)" }}>
              ⚡ Perlu Respons ({active.length})
            </h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {active.map(t => (
                <NegoCard key={t.id} t={t as any} statusIcon={statusIcon} statusLabel={statusLabel} />
              ))}
            </div>
          </div>
        )}

        {/* Selesai */}
        {done.length > 0 && (
          <div>
            <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16, color: "var(--text-secondary)" }}>
              Selesai ({done.length})
            </h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {done.map(t => (
                <NegoCard key={t.id} t={t as any} statusIcon={statusIcon} statusLabel={statusLabel} />
              ))}
            </div>
          </div>
        )}

        {threads.length === 0 && (
          <div className="glass-card" style={{ padding: 60, textAlign: "center" }}>
            <MessageSquare size={40} style={{ color: "var(--text-tertiary)", marginBottom: 12 }} />
            <p style={{ color: "var(--text-secondary)" }}>Belum ada nego masuk.</p>
          </div>
        )}
      </div>
    </main>
  );
}

function NegoCard({ t, statusIcon, statusLabel }: any) {
  const lastMsg = t.messages[0];
  const badge = statusLabel[t.status] ?? { label: t.status, color: "gray" };

  return (
    <Link href={`/admin/nego/${t.id}`} style={{ textDecoration: "none" }}>
      <div className="glass-card" style={{
        padding: "16px 20px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        gap: 16,
        cursor: "pointer",
        transition: "border-color 0.2s",
        borderColor: badge.color + "33",
      }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 4 }}>
            #{t.id} · {t.orderItem.item.nama}
          </div>
          <div style={{ fontSize: 13, color: "var(--text-secondary)" }}>
            Customer: {t.orderItem.order.user?.nama ?? "Unknown"}
          </div>
          {lastMsg && (
            <div style={{ fontSize: 12, color: "var(--text-tertiary)", marginTop: 6, overflow: "hidden", whiteSpace: "nowrap", textOverflow: "ellipsis", maxWidth: 400 }}>
              "{lastMsg.pesan}"
            </div>
          )}
        </div>
        <div style={{ textAlign: "right", flexShrink: 0 }}>
          <span style={{
            background: badge.color + "22",
            color: badge.color,
            border: `1px solid ${badge.color}55`,
            borderRadius: 20,
            padding: "4px 12px",
            fontSize: 12,
            fontWeight: 600,
          }}>
            {statusIcon[t.status]} {badge.label}
          </span>
          {t.hargaDisepakati && (
            <div style={{ fontSize: 13, fontWeight: 700, color: "#22c55e", marginTop: 6 }}>
              Rp {t.hargaDisepakati.toLocaleString("id-ID")}
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
