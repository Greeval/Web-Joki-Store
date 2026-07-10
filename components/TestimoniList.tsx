"use client";

import { useState, useEffect } from "react";
import { Star, UserCircle, Quote } from "lucide-react";

type Testimoni = {
  id: number;
  nama: string;
  avatarUrl: string | null;
  game: string | null;
  rating: number;
  pesan: string;
  createdAt: string;
};

export default function TestimoniList() {
  const [testimoni, setTestimoni] = useState<Testimoni[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/testimoni?publik=1")
      .then((r) => r.json())
      .then((data) => {
        setTestimoni(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 20 }}>
        {[1, 2, 3].map((i) => (
          <div key={i} className="skeleton" style={{ height: 160, borderRadius: 16 }} />
        ))}
      </div>
    );
  }

  if (testimoni.length === 0) return null;

  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 24 }}>
      {testimoni.map((t) => (
        <div
          key={t.id}
          style={{
            background: "var(--bg-card)",
            border: "1px solid var(--border)",
            borderRadius: "var(--radius-lg)",
            padding: 24,
            position: "relative",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <Quote
            size={48}
            style={{ position: "absolute", top: 16, right: 16, opacity: 0.05, color: "var(--text-primary)" }}
          />
          <div style={{ display: "flex", gap: 4, color: "#fbbf24", marginBottom: 16 }}>
            {Array.from({ length: 5 }).map((_, i) => (
              <Star key={i} size={16} fill={i < t.rating ? "currentColor" : "none"} />
            ))}
          </div>
          <p style={{ fontSize: 15, color: "var(--text-secondary)", lineHeight: 1.6, marginBottom: 24, flex: 1, fontStyle: "italic" }}>
            "{t.pesan}"
          </p>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            {t.avatarUrl ? (
              <img src={t.avatarUrl} alt={t.nama} style={{ width: 40, height: 40, borderRadius: "50%", objectFit: "cover" }} />
            ) : (
              <UserCircle size={40} color="var(--text-muted)" />
            )}
            <div>
              <div style={{ fontWeight: 700, color: "var(--text-primary)", fontSize: 14 }}>{t.nama}</div>
              {t.game && <div style={{ fontSize: 12, color: "var(--accent-primary)" }}>{t.game}</div>}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
