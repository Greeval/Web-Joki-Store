import { prisma } from "@/lib/db";
import { DollarSign, ShoppingCart, Users, Activity } from "lucide-react";
import Link from "next/link";
import PurgeBanner from "@/components/PurgeBanner";

export default async function AdminDashboard() {
  const orders = await prisma.order.findMany({
    include: { payments: true },
  });

  const totalRevenue = orders.reduce((sum, o) => {
    const paid = o.payments.find(p => p.status === "paid");
    return sum + (paid ? paid.jumlah : 0);
  }, 0);

  const activeOrders = orders.filter(o => o.status === "in_progress" || o.status === "waiting_account_data").length;
  const totalUsers = await prisma.user.count();

  const recentOrders = await prisma.order.findMany({
    take: 5,
    orderBy: { createdAt: "desc" },
    include: {
      user: true,
      items: { include: { item: true } },
      payments: true,
    }
  });

  return (
    <div>
      <PurgeBanner label="data pesanan dan nego" />
      <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 8 }}>Dashboard Overview</h1>
      <p style={{ color: "var(--text-secondary)", marginBottom: 32 }}>Ringkasan performa Greeval Store</p>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16, marginBottom: 40 }}>
        <StatCard title="Total Pendapatan" value={`Rp ${totalRevenue.toLocaleString("id-ID")}`} icon={<DollarSign size={20} />} color="var(--accent-green, #10b981)" />
        <StatCard title="Pesanan Aktif" value={activeOrders.toString()} icon={<Activity size={20} />} color="var(--accent-cyan)" />
        <StatCard title="Total Pesanan" value={orders.length.toString()} icon={<ShoppingCart size={20} />} color="var(--accent-purple)" />
        <StatCard title="Total Pengguna" value={totalUsers.toString()} icon={<Users size={20} />} color="var(--accent-gold, #f59e0b)" />
      </div>

      <div className="glass-card" style={{ padding: 24 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, margin: 0 }}>Pesanan Terbaru</h2>
          <Link href="/admin/orders" style={{ fontSize: 13, color: "var(--accent-cyan)", textDecoration: "none", fontWeight: 600 }}>Lihat Semua →</Link>
        </div>
        
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.1)", color: "var(--text-tertiary)" }}>
                <th style={{ padding: "12px 16px", fontWeight: 600, fontSize: 13 }}>ID</th>
                <th style={{ padding: "12px 16px", fontWeight: 600, fontSize: 13 }}>Customer</th>
                <th style={{ padding: "12px 16px", fontWeight: 600, fontSize: 13 }}>Item</th>
                <th style={{ padding: "12px 16px", fontWeight: 600, fontSize: 13 }}>Status</th>
                <th style={{ padding: "12px 16px", fontWeight: 600, fontSize: 13 }}>Tgl Order</th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.map(o => (
                <tr key={o.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                  <td style={{ padding: "16px", fontSize: 14 }}>#{o.id}</td>
                  <td style={{ padding: "16px", fontSize: 14 }}>{o.user.nama}</td>
                  <td style={{ padding: "16px", fontSize: 14 }}>{o.items[0]?.item.nama}</td>
                  <td style={{ padding: "16px", fontSize: 14 }}>
                    <span style={{ padding: "4px 10px", borderRadius: 12, fontSize: 12, background: "rgba(255,255,255,0.1)", fontWeight: 600 }}>
                      {o.status.replace(/_/g, " ")}
                    </span>
                  </td>
                  <td style={{ padding: "16px", fontSize: 13, color: "var(--text-secondary)" }}>
                    {o.createdAt.toLocaleDateString("id-ID")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {recentOrders.length === 0 && <div style={{ padding: 24, textAlign: "center", color: "var(--text-tertiary)" }}>Belum ada pesanan.</div>}
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon, color }: { title: string, value: string, icon: React.ReactNode, color: string }) {
  return (
    <div className="glass-card" style={{ padding: "20px 24px", display: "flex", alignItems: "center", gap: 16 }}>
      <div style={{ width: 48, height: 48, borderRadius: 12, background: `${color}22`, color: color, display: "flex", alignItems: "center", justifyContent: "center" }}>
        {icon}
      </div>
      <div>
        <div style={{ fontSize: 13, color: "var(--text-secondary)", marginBottom: 4 }}>{title}</div>
        <div style={{ fontSize: 24, fontWeight: 800 }}>{value}</div>
      </div>
    </div>
  );
}
