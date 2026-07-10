import { Clock } from "lucide-react";

export default function PurgeBanner({ label = "pesanan, nego" }: { label?: string }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        background: "rgba(251, 191, 36, 0.08)",
        border: "1px solid rgba(251, 191, 36, 0.25)",
        borderRadius: 8,
        padding: "10px 16px",
        marginBottom: 24,
        fontSize: 13,
        color: "#fbbf24",
      }}
    >
      <Clock size={15} style={{ flexShrink: 0 }} />
      <span>
        Data {label} dihapus otomatis setelah <strong>24 jam</strong> untuk menjaga privasi.
      </span>
    </div>
  );
}
