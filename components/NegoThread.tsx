"use client";

import { useRef, useState, useTransition } from "react";
import { kirimPesanNego, resolveNego } from "@/app/actions/nego";
import { Send, CheckCircle, XCircle, DollarSign, MessageSquare } from "lucide-react";

interface Message {
  id: number;
  senderRole: string;
  pesan: string;
  hargaDiajukan: number | null;
  createdAt: Date;
}

interface NegoThreadProps {
  thread: {
    id: number;
    status: string;
    hargaDisepakati: number | null;
    messages: Message[];
    orderItem: {
      id: number;
      hargaFinal: number;
      item: { nama: string; hargaPaket: number | null; hargaBatch: number | null };
      order: { id: number };
    };
  };
  viewAs: "customer" | "admin";
}

function formatRp(val: number) {
  return "Rp " + val.toLocaleString("id-ID");
}

function timeAgo(date: Date) {
  const d = new Date(date);
  return d.toLocaleString("id-ID", { hour: "2-digit", minute: "2-digit", day: "2-digit", month: "short" });
}

export default function NegoThread({ thread, viewAs }: NegoThreadProps) {
  const formRef = useRef<HTMLFormElement>(null);
  const resolveRef = useRef<HTMLFormElement>(null);
  const [isPending, startTransition] = useTransition();
  const [hargaCounter, setHargaCounter] = useState("");

  const isDone = thread.status === "deal" || thread.status === "rejected";

  const statusBadge: Record<string, { label: string; color: string }> = {
    pending: { label: "Menunggu Admin", color: "var(--accent-purple)" },
    counter: { label: "Ada Penawaran Balik", color: "var(--accent-cyan)" },
    deal: { label: "Deal ✅", color: "#22c55e" },
    rejected: { label: "Ditolak ❌", color: "#ef4444" },
  };

  const badge = statusBadge[thread.status] ?? { label: thread.status, color: "gray" };

  async function handleSend(formData: FormData) {
    await kirimPesanNego(formData);
    formRef.current?.reset();
  }

  async function handleResolve(formData: FormData) {
    await resolveNego(formData);
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      {/* Header info */}
      <div className="glass-card" style={{ padding: "20px 24px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
          <div>
            <div style={{ fontSize: 13, color: "var(--text-secondary)", marginBottom: 4 }}>Item yang Dinegosiasi</div>
            <div style={{ fontWeight: 700, fontSize: 16 }}>{thread.orderItem.item.nama}</div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 13, color: "var(--text-secondary)", marginBottom: 4 }}>Status Nego</div>
            <span style={{
              background: `${badge.color}22`,
              color: badge.color,
              border: `1px solid ${badge.color}55`,
              borderRadius: 20,
              padding: "4px 14px",
              fontSize: 13,
              fontWeight: 600,
            }}>
              {badge.label}
            </span>
          </div>
        </div>

        {thread.status === "deal" && thread.hargaDisepakati && (
          <div style={{
            marginTop: 16,
            background: "rgba(34,197,94,0.1)",
            border: "1px solid rgba(34,197,94,0.3)",
            borderRadius: 12,
            padding: "12px 16px",
            display: "flex",
            alignItems: "center",
            gap: 10,
          }}>
            <CheckCircle size={18} style={{ color: "#22c55e" }} />
            <span style={{ fontWeight: 600 }}>
              Harga disepakati: {formatRp(thread.hargaDisepakati)}
            </span>
            <a
              href={`/orders/${thread.orderItem.order.id}`}
              className="btn-primary"
              style={{ marginLeft: "auto", padding: "6px 16px", fontSize: 13 }}
            >
              Lanjut ke Order →
            </a>
          </div>
        )}
      </div>

      {/* Chat bubble area */}
      <div className="glass-card" style={{ padding: 24, display: "flex", flexDirection: "column", gap: 16, minHeight: 300 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
          <MessageSquare size={16} style={{ color: "var(--accent-purple)" }} />
          <span style={{ fontWeight: 600, fontSize: 14 }}>Riwayat Percakapan</span>
        </div>

        {thread.messages.map((msg) => {
          const isMe = msg.senderRole === viewAs;
          return (
            <div
              key={msg.id}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: isMe ? "flex-end" : "flex-start",
                gap: 4,
              }}
            >
              <div style={{
                maxWidth: "75%",
                background: isMe
                  ? "linear-gradient(135deg, rgba(124,58,237,0.35), rgba(6,182,212,0.25))"
                  : "rgba(0,0,0,0.04)",
                border: `1px solid ${isMe ? "rgba(124,58,237,0.4)" : "rgba(0,0,0,0.08)"}`,
                borderRadius: isMe ? "16px 4px 16px 16px" : "4px 16px 16px 16px",
                padding: "10px 14px",
              }}>
                <div style={{ fontSize: 11, color: "var(--text-tertiary)", marginBottom: 4, fontWeight: 600, textTransform: "uppercase" }}>
                  {msg.senderRole === "admin" ? "Admin Greeval" : "Kamu"}
                </div>
                <p style={{ fontSize: 14, lineHeight: 1.5, margin: 0 }}>{msg.pesan}</p>
                {msg.hargaDiajukan && (
                  <div style={{
                    marginTop: 8,
                    background: "rgba(6,182,212,0.15)",
                    border: "1px solid rgba(6,182,212,0.3)",
                    borderRadius: 8,
                    padding: "6px 10px",
                    fontSize: 14,
                    fontWeight: 700,
                    color: "var(--accent-cyan)",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                  }}>
                    <DollarSign size={13} />
                    {formatRp(msg.hargaDiajukan)}
                  </div>
                )}
              </div>
              <span style={{ fontSize: 11, color: "var(--text-tertiary)" }}>{timeAgo(msg.createdAt)}</span>
            </div>
          );
        })}

        {thread.messages.length === 0 && (
          <div style={{ textAlign: "center", color: "var(--text-tertiary)", padding: "40px 0" }}>
            Belum ada pesan.
          </div>
        )}
      </div>

      {/* Form kirim pesan (jika masih aktif) */}
      {!isDone && (
        <form ref={formRef} action={handleSend} className="glass-card" style={{ padding: 20, display: "flex", flexDirection: "column", gap: 12 }}>
          <input type="hidden" name="threadId" value={thread.id} />
          <input type="hidden" name="senderRole" value={viewAs} />

          <div style={{ display: "flex", gap: 12 }}>
            <textarea
              name="pesan"
              className="form-input"
              rows={2}
              placeholder={viewAs === "admin" ? "Balas nego customer..." : "Kirim pesan atau ajukan harga baru..."}
              required
              style={{ flex: 1, resize: "none" }}
            />
          </div>

          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <input
              type="number"
              name="hargaDiajukan"
              className="form-input"
              placeholder="Tawar harga (opsional)"
              value={hargaCounter}
              onChange={e => setHargaCounter(e.target.value)}
              style={{ flex: 1 }}
            />
            <button type="submit" className="btn-primary" style={{ padding: "10px 20px", flexShrink: 0 }} disabled={isPending}>
              <Send size={16} />
              {isPending ? "Mengirim..." : "Kirim"}
            </button>
          </div>
        </form>
      )}

      {/* Panel admin: resolve nego */}
      {viewAs === "admin" && !isDone && (
        <div className="glass-card" style={{
          padding: 20,
          background: "linear-gradient(135deg, rgba(124,58,237,0.08), rgba(6,182,212,0.08))",
          border: "1px solid rgba(124,58,237,0.25)",
        }}>
          <div style={{ fontWeight: 600, marginBottom: 12, fontSize: 14 }}>⚡ Panel Resolusi Admin</div>
          <form ref={resolveRef} action={handleResolve} style={{ display: "flex", flexWrap: "wrap", gap: 10, alignItems: "center" }}>
            <input type="hidden" name="threadId" value={thread.id} />
            <input
              type="number"
              name="hargaFinal"
              className="form-input"
              placeholder="Harga final deal (opsional)"
              style={{ flex: 1, minWidth: 180 }}
            />
            <button type="submit" name="action" value="deal" className="btn-primary"
              style={{ background: "linear-gradient(135deg, #22c55e, #16a34a)", padding: "10px 20px" }}>
              <CheckCircle size={15} /> Deal!
            </button>
            <button type="submit" name="action" value="rejected"
              style={{
                background: "rgba(239,68,68,0.15)",
                border: "1px solid rgba(239,68,68,0.4)",
                color: "#ef4444",
                padding: "10px 20px",
                borderRadius: 10,
                cursor: "pointer",
                fontWeight: 600,
                display: "flex",
                alignItems: "center",
                gap: 6,
                fontSize: 14,
              }}>
              <XCircle size={15} /> Tolak
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
