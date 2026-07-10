"use client";

import { useState } from "react";
import { Star, CheckCircle } from "lucide-react";

export default function OrderRatingForm({ orderId, initialRating, initialNote }: { orderId: number, initialRating: number | null, initialNote: string | null }) {
  const [rating, setRating] = useState(initialRating || 0);
  const [hover, setHover] = useState(0);
  const [note, setNote] = useState(initialNote || "");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(initialRating !== null);

  const handleSubmit = async () => {
    if (rating === 0) return alert("Pilih minimal 1 bintang");
    setSubmitting(true);
    const res = await fetch(`/api/orders/${orderId}/rating`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ rating, ratingNote: note })
    });
    setSubmitting(false);
    if (res.ok) {
      setDone(true);
    } else {
      const data = await res.json();
      alert(data.error || "Gagal mengirim rating");
    }
  };

  if (done) {
    return (
      <div style={{ background: "rgba(74, 107, 85, 0.1)", border: "1px solid rgba(74, 107, 85, 0.3)", borderRadius: "var(--radius-lg)", padding: 20, textAlign: "center", marginTop: 24 }}>
        <CheckCircle size={32} color="var(--accent-primary)" style={{ margin: "0 auto 12px" }} />
        <h3 style={{ fontSize: 18, fontWeight: 700, color: "var(--accent-primary)", marginBottom: 8 }}>Terima Kasih atas Ulasan Anda!</h3>
        <div style={{ display: "flex", justifyContent: "center", gap: 4, marginBottom: 12 }}>
          {Array.from({ length: 5 }).map((_, i) => (
             <Star key={i} size={20} fill={i < (initialRating || rating) ? "#fbbf24" : "none"} color={i < (initialRating || rating) ? "#fbbf24" : "var(--text-muted)"} />
          ))}
        </div>
        {(initialNote || note) && (
          <p style={{ fontSize: 14, color: "var(--text-secondary)", fontStyle: "italic" }}>"{initialNote || note}"</p>
        )}
      </div>
    );
  }

  return (
    <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "var(--radius-lg)", padding: 24, marginTop: 24 }}>
      <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>Order Selesai!</h3>
      <p style={{ fontSize: 14, color: "var(--text-secondary)", marginBottom: 20 }}>
        Bagaimana layanan joki kami? Berikan penilaian agar kami bisa terus melayani dengan baik.
      </p>
      
      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        {Array.from({ length: 5 }).map((_, i) => (
          <button 
            key={i}
            onMouseEnter={() => setHover(i + 1)}
            onMouseLeave={() => setHover(0)}
            onClick={() => setRating(i + 1)}
            style={{ background: "transparent", border: "none", cursor: "pointer", padding: 0 }}
          >
            <Star size={32} fill={i < (hover || rating) ? "#fbbf24" : "none"} color={i < (hover || rating) ? "#fbbf24" : "var(--text-muted)"} style={{ transition: "all 0.2s" }} />
          </button>
        ))}
      </div>

      <textarea
        className="form-input"
        placeholder="Tuliskan pengalaman kamu menggunakan jasa kami (opsional)"
        rows={3}
        value={note}
        onChange={(e) => setNote(e.target.value)}
        style={{ marginBottom: 16 }}
      />

      <button className="btn-primary" onClick={handleSubmit} disabled={submitting || rating === 0}>
        {submitting ? "Mengirim..." : "Kirim Ulasan"}
      </button>
    </div>
  );
}
