import { prisma } from "@/lib/db";
import { updateOrderStatus } from "@/app/actions/admin";
import { ShoppingCart, ShieldCheck } from "lucide-react";
import Link from "next/link";
import PurgeBanner from "@/components/PurgeBanner";

export default async function AdminOrdersPage() {
  const orders = await prisma.order.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      user: true,
      items: { include: { item: { include: { category: { include: { game: true } } } } } },
      payments: true,
      credentials: true,
    }
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending_payment": return "#d97706";
      case "waiting_account_data": return "#0891b2";
      case "in_progress": return "#6d28d9";
      case "completed": return "#16a34a";
      case "negotiating": return "var(--accent-primary)";
      default: return "#475569";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "pending_payment": return "Belum Bayar";
      case "waiting_account_data": return "Cek Akun";
      case "in_progress": return "Dikerjakan";
      case "completed": return "Selesai";
      case "negotiating": return "Nego";
      case "cancelled": return "Batal";
      default: return status;
    }
  };

  return (
    <div>
      <PurgeBanner label="pesanan" />
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 32 }}>
        <ShoppingCart size={28} style={{ color: "var(--accent-purple)" }} />
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 800, margin: 0 }}>Manajemen Pesanan</h1>
          <p style={{ color: "var(--text-secondary)", fontSize: 13, margin: 0 }}>
            Pantau dan update status pengerjaan joki
          </p>
        </div>
      </div>

      <div className="glass-card" style={{ padding: 24, overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", minWidth: 800 }}>
          <thead>
            <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.1)", color: "var(--text-tertiary)" }}>
              <th style={{ padding: "12px", fontWeight: 600, fontSize: 13 }}>Order ID</th>
              <th style={{ padding: "12px", fontWeight: 600, fontSize: 13 }}>Tanggal</th>
              <th style={{ padding: "12px", fontWeight: 600, fontSize: 13 }}>Customer</th>
              <th style={{ padding: "12px", fontWeight: 600, fontSize: 13 }}>Game & Item</th>
              <th style={{ padding: "12px", fontWeight: 600, fontSize: 13 }}>Payment</th>
              <th style={{ padding: "12px", fontWeight: 600, fontSize: 13 }}>Akun</th>
              <th style={{ padding: "12px", fontWeight: 600, fontSize: 13 }}>Status & Aksi</th>
            </tr>
          </thead>
          <tbody>
            {orders.map(o => {
              const item = o.items[0]?.item;
              const payment = o.payments[0];
              const isPaid = payment?.status === "paid";
              const hasCreds = !!o.credentials;

              return (
                <tr key={o.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                  <td style={{ padding: "16px 12px", fontSize: 14, fontWeight: 600 }}>#{o.id}</td>
                  <td style={{ padding: "16px 12px", fontSize: 13, color: "var(--text-secondary)" }}>
                    {o.createdAt.toLocaleDateString("id-ID", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                  </td>
                  <td style={{ padding: "16px 12px", fontSize: 14 }}>{o.user.nama}</td>
                  <td style={{ padding: "16px 12px", fontSize: 14 }}>
                    <div style={{ fontSize: 12, color: "var(--text-secondary)", marginBottom: 2 }}>{item?.category.game.nama}</div>
                    <div style={{ fontWeight: 600 }}>{item?.nama}</div>
                  </td>
                  <td style={{ padding: "16px 12px", fontSize: 13 }}>
                    <span style={{ color: isPaid ? "#16a34a" : "#d97706", fontWeight: 600 }}>
                      {isPaid ? "Lunas" : "Pending"}
                    </span>
                    <div style={{ fontSize: 12, color: "var(--text-tertiary)", marginTop: 2 }}>Rp {o.items[0]?.hargaFinal.toLocaleString("id-ID")}</div>
                  </td>
                  <td style={{ padding: "16px 12px", fontSize: 13 }}>
                    {hasCreds ? <span style={{ color: "var(--accent-cyan)", display: "flex", gap: 4, alignItems: "center" }}><ShieldCheck size={14} /> Tersimpan</span> : <span style={{ color: "var(--text-tertiary)" }}>-</span>}
                  </td>
                  <td style={{ padding: "16px 12px" }}>
                    <form action={updateOrderStatus} style={{ display: "flex", gap: 8, alignItems: "center" }}>
                      <input type="hidden" name="orderId" value={o.id} />
                      <select 
                        name="status" 
                        defaultValue={o.status}
                        className="form-input"
                        style={{ 
                          padding: "6px 12px", 
                          fontSize: 13, 
                          color: getStatusColor(o.status), 
                          borderColor: getStatusColor(o.status) + "55",
                          background: getStatusColor(o.status) + "11",
                          fontWeight: 600,
                          width: 140
                        }}
                      >
                        <option value="negotiating">Nego</option>
                        <option value="pending_payment">Belum Bayar</option>
                        <option value="waiting_account_data">Cek Akun</option>
                        <option value="in_progress">Dikerjakan</option>
                        <option value="completed">Selesai</option>
                        <option value="cancelled">Batal</option>
                      </select>
                      <button type="submit" className="btn-primary" style={{ padding: "6px 12px", fontSize: 12 }}>Update</button>
                      <Link href={`/orders/${o.id}`} target="_blank" style={{ color: "var(--accent-cyan)", fontSize: 12, marginLeft: 8, textDecoration: "none" }}>Detail ↗</Link>
                    </form>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {orders.length === 0 && <div style={{ padding: 40, textAlign: "center", color: "var(--text-tertiary)" }}>Belum ada pesanan masuk.</div>}
      </div>
    </div>
  );
}
