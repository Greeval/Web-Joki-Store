import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import GameTabs from "@/components/GameTabs";
import type { Metadata } from "next";

type Props = { 
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const game = await prisma.game.findUnique({ where: { slug } });
  if (!game) return { title: "Game tidak ditemukan" };
  return {
    title: `${game.nama} – Greeval Store`,
    description: `Layanan joki ${game.nama}: rawat akun, farming material, build character, dan explore map. Harga transparan di Greeval Store.`,
  };
}

export default async function GamePage({ params, searchParams }: Props) {
  const { slug } = await params;
  const search = await searchParams;
  const initialTab = search.tab ? Number(search.tab) : undefined;

  const game = await prisma.game.findUnique({
    where: { slug },
    include: {
      categories: {
        orderBy: { urutan: "asc" },
        include: {
          items: {
            include: {
              tiers: { orderBy: { minQty: "asc" } },
              variants: true,
              prerequisites: true,
            },
            orderBy: { nama: "asc" },
          },
        },
      },
    },
  });

  if (!game) notFound();

  return (
    <>
      {/* GAME HERO */}
      <div className="game-hero" style={{ marginTop: 64 }}>
        {game.coverImageUrl ? (
          <img src={game.coverImageUrl} alt={game.nama} className="game-hero-image" />
        ) : (
          <div
            className="game-hero-image"
            style={{ background: "linear-gradient(135deg, #7c3aed, #06b6d4)" }}
          />
        )}
        <div className="game-hero-content">
          <Link
            href="/"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              color: "rgba(255,255,255,0.6)",
              textDecoration: "none",
              fontSize: 13,
              marginBottom: 12,
              transition: "color 0.2s",
            }}
          >
            <ChevronLeft size={16} />
            Semua Game
          </Link>
          <h1 className="game-hero-title">{game.nama}</h1>
          <p style={{ color: "rgba(255,255,255,0.6)", fontSize: 14 }}>
            {game.categories.length} kategori layanan tersedia
          </p>
        </div>
      </div>

      {/* TABS + ITEMS */}
      <GameTabs categories={game.categories} gameSlug={slug} initialTab={initialTab} />

      <footer className="footer">
        <div className="footer-brand">Greeval Store</div>
        <p className="footer-text">© 2026 Greeval Store · All rights reserved</p>
      </footer>
    </>
  );
}
