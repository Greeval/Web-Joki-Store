"use client";

import { useActionState, useRef } from "react";
import { bukaNegoThread } from "@/app/actions/nego";
import { useRouter } from "next/navigation";
import { MessageSquare, DollarSign, Send } from "lucide-react";

interface NegoFormProps {
  itemId: number;
  itemNama: string;
  hargaNormal: number;
}

function formatRp(val: number) {
  return "Rp " + val.toLocaleString("id-ID");
}

export default function NegoForm({ itemId, itemNama, hargaNormal }: NegoFormProps) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);

  async function handleSubmit(formData: FormData) {
    const result = await bukaNegoThread(formData);
    router.push(`/nego/${result.threadId}`);
  }

  return (
    <div className="glass-card" style={{ padding: 32 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
        <MessageSquare size={22} style={{ color: "var(--accent-purple)" }} />
        <h2 style={{ fontSize: 20, fontWeight: 700 }}>Ajukan Harga Nego</h2>
      </div>
      <p style={{ color: "var(--text-secondary)", fontSize: 14, marginBottom: 24 }}>
        Harga normal: <strong style={{ color: "var(--accent-cyan)" }}>{formatRp(hargaNormal)}</strong>. Ajukan harga yang kamu inginkan dan admin akan merespons.
      </p>

      <form ref={formRef} action={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <input type="hidden" name="itemId" value={itemId} />

        <div className="form-group">
          <label className="form-label">Item yang Dinegosiasi</label>
          <input className="form-input" value={itemNama} readOnly style={{ opacity: 0.7 }} />
        </div>

        <div className="form-group">
          <label className="form-label">Harga yang Ditawar (Rp)</label>
          <div style={{ position: "relative" }}>
            <DollarSign size={16} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "var(--text-secondary)" }} />
            <input
              type="number"
              name="hargaTawar"
              className="form-input"
              placeholder={`Contoh: ${Math.floor(hargaNormal * 0.8)}`}
              min={1000}
              max={hargaNormal}
              required
              style={{ paddingLeft: 40 }}
            />
          </div>
          <span style={{ fontSize: 12, color: "var(--text-tertiary)", marginTop: 4, display: "block" }}>
            Diskon maks 50% dari harga normal.
          </span>
        </div>

        <div className="form-group">
          <label className="form-label">Pesan ke Admin</label>
          <textarea
            name="pesan"
            className="form-input"
            rows={4}
            placeholder="Contoh: Min, saya perlu 150 Purpurbloom, bisa harga segitu?"
            required
            style={{ resize: "vertical" }}
          />
        </div>

        <button type="submit" className="btn-primary" style={{ width: "100%", justifyContent: "center", gap: 8 }}>
          <Send size={16} />
          Kirim Penawaran Nego
        </button>
      </form>
    </div>
  );
}
