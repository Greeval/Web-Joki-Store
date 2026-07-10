"use client";

import { useState, useEffect, useCallback } from "react";

type Banner = {
  id: number;
  title: string;
  subtitle: string | null;
  badge: string | null;
  imageUrl: string;
  linkUrl: string | null;
};

// Fallback hardcoded jika DB kosong
const FALLBACK: Banner[] = [
  {
    id: 0,
    title: "Joki Event Bulanan — Semua Game",
    subtitle: "Selesaikan event terbatas waktu tanpa repot. Garansi selesai sebelum deadline.",
    badge: "Event Aktif",
    imageUrl: "/promo-default.jpg",
    linkUrl: null,
  },
];

export default function PromoCarousel() {
  const [slides, setSlides] = useState<Banner[]>([]);
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    fetch("/api/admin/banners")
      .then((r) => r.json())
      .then((data: Banner[]) => {
        const active = data.filter((b: any) => b.isActive !== false);
        setSlides(active.length > 0 ? active : FALLBACK);
      })
      .catch(() => setSlides(FALLBACK));
  }, []);

  const nextSlide = useCallback(() => {
    setCurrent((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
  }, [slides.length]);

  useEffect(() => {
    if (slides.length <= 1) return;
    const timer = setInterval(nextSlide, 5000);
    return () => clearInterval(timer);
  }, [nextSlide, slides.length]);

  if (slides.length === 0) {
    return (
      <div className="carousel-root" style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: 220, color: "var(--text-muted)" }}>
        <span>Memuat banner...</span>
      </div>
    );
  }

  const slide = slides[current];
  const Wrapper = slide.linkUrl
    ? ({ children }: { children: React.ReactNode }) => (
        <a href={slide.linkUrl!} target="_blank" rel="noopener noreferrer" style={{ display: "block", height: "100%" }}>
          {children}
        </a>
      )
    : ({ children }: { children: React.ReactNode }) => <>{children}</>;

  return (
    <div className="carousel-root">
      {/* Track */}
      <div className="carousel-track-container">
        <div
          className="carousel-track"
          style={{ transform: `translateX(-${current * 100}%)` }}
        >
          {slides.map((s, i) => (
            <div key={s.id} className="carousel-slide">
              <Wrapper>
                <img
                  src={s.imageUrl}
                  alt={s.title}
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = "https://placehold.co/640x360/0a0a0b/10b981?text=Banner";
                  }}
                />
              </Wrapper>
            </div>
          ))}
        </div>
      </div>

      {/* Dots indicator — hanya tampil jika lebih dari 1 slide */}
      {slides.length > 1 && (
        <div className="carousel-dots">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              aria-label={`Slide ${i + 1}`}
              className={`carousel-dot ${i === current ? "carousel-dot-active" : "carousel-dot-inactive"}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
