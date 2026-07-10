import Link from "next/link";
import { Zap, Shield, Star, Clock } from "lucide-react";
import HomeSearch from "@/components/HomeSearch";
import PromoCarousel from "@/components/PromoCarousel";
import StatsBar from "@/components/StatsBar";
import TestimoniList from "@/components/TestimoniList";
import { prisma } from "@/lib/db";

export default async function HomePage() {
  const games = await prisma.game.findMany({
    include: {
      _count: { select: { categories: true } },
    },
    orderBy: [{ isPopuler: "desc" }, { nama: "asc" }],
  });

  return (
    <>
      <section className="hero">
        <div className="hero-inner">
          <div className="hero-text">
            <h1>
              Mau Joki? ya di
              <br />
              <span className="highlight">Greeval Store</span>
            </h1>
          </div>
          <div className="hero-carousel-wrapper">
            <PromoCarousel />
          </div>
        </div>
      </section>

      <StatsBar gameCount={games.length} />

      <section className="section" id="games">
        <div className="section-header">
          <div>
            <h2 className="section-title">
              Pilih <span>Game</span> Kamu
            </h2>
            <p className="section-subtitle">
              {games.length} game tersedia • Harga transparan tanpa negosiasi manual
            </p>
          </div>
          <HomeSearch />
        </div>

        {games.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">🎮</div>
            <div className="empty-state-title">Belum ada game tersedia</div>
          </div>
        ) : (
          <div className="game-grid" id="game-grid">
            {games.map((game) => (
              <Link
                key={game.id}
                href={`/game/${game.slug}`}
                className="game-card"
              >
                {game.coverImageUrl ? (
                  <img
                    src={game.coverImageUrl}
                    alt={game.nama}
                    className="game-card-image"
                  />
                ) : (
                  <div
                    className="game-card-image"
                    style={{
                      background: "var(--bg-secondary)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "48px",
                      border: "1px solid var(--border)"
                    }}
                  >
                    🎮
                  </div>
                )}
                <div className="game-card-overlay">
                  <div className="game-card-name">{game.nama}</div>
                  <div className="game-card-meta">
                    <span className="badge-category-count">
                      {game._count.categories} kategori
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      <section className="section" style={{ borderTop: "1px solid var(--border)" }}>
        <h2 className="section-title" style={{ textAlign: "center", marginBottom: 40 }}>
          Kenapa Pilih <span>Greeval Store?</span>
        </h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 20 }}>
          {[
            {
              icon: <Shield size={24} />,
              title: "Akun Aman Terjaga",
              desc: "Kredensial akun dienkripsi dan dihapus permanen setelah order selesai. Privasi kamu prioritas kami.",
              color: "var(--accent-primary)",
            },
            {
              icon: <Zap size={24} />,
              title: "Harga Transparan",
              desc: "Semua harga tertera jelas di katalog. Tidak ada biaya tersembunyi atau negosiasi manual via WA.",
              color: "var(--accent-primary)",
            },
            {
              icon: <Star size={24} />,
              title: "Joki Berpengalaman",
              desc: "Tim joki yang berdedikasi dengan pengalaman luas di berbagai game gacha populer.",
              color: "var(--accent-secondary)",
            },
            {
              icon: <Clock size={24} />,
              title: "Update Status Real-time",
              desc: "Pantau progress pengerjaan order kamu dari dashboard. Notifikasi di setiap tahap.",
              color: "var(--accent-secondary)",
            },
          ].map((item, i) => (
            <div
              key={i}
              style={{
                background: "var(--bg-card)",
                border: "1px solid var(--border)",
                borderRadius: "var(--radius-lg)",
                padding: "24px",
              }}
            >
              <div
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: "var(--radius-md)",
                  background: item.color === "var(--accent-primary)" ? "rgba(74, 107, 85, 0.08)" : "rgba(201, 130, 99, 0.08)",
                  border: `1px solid ${item.color === "var(--accent-primary)" ? "rgba(74, 107, 85, 0.2)" : "rgba(201, 130, 99, 0.2)"}`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: item.color,
                  marginBottom: 16,
                }}
              >
                {item.icon}
              </div>
              <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 8 }}>
                {item.title}
              </div>
              <div style={{ fontSize: 14, color: "var(--text-secondary)", lineHeight: 1.6 }}>
                {item.desc}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="section">
        <h2 className="section-title" style={{ textAlign: "center", marginBottom: 40 }}>
          Apa Kata <span>Pelanggan</span>
        </h2>
        <TestimoniList />
      </section>

      <footer className="footer">
        <div className="footer-brand">Greeval Store</div>
        <p className="footer-text">
          © 2026 Greeval Store · Jasa Joki Game Multi-Platform · All rights reserved
        </p>
      </footer>
    </>
  );
}
