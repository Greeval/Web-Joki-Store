import Link from "next/link";

export default function NotFound() {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        padding: "24px",
        background: "var(--bg-primary)",
      }}
    >
      <div style={{ fontSize: 80, marginBottom: 16 }}>🎮</div>
      <h1
        style={{
          fontSize: 48,
          fontWeight: 900,
          background: "linear-gradient(135deg, #7c3aed, #06b6d4)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          backgroundClip: "text",
          marginBottom: 12,
        }}
      >
        404
      </h1>
      <p style={{ fontSize: 18, color: "var(--text-secondary)", marginBottom: 8 }}>
        Halaman tidak ditemukan
      </p>
      <p style={{ fontSize: 14, color: "var(--text-muted)", marginBottom: 32 }}>
        Game atau item yang kamu cari tidak ada atau sudah dipindahkan.
      </p>
      <Link href="/" className="btn-primary">
        ← Kembali ke Beranda
      </Link>
    </div>
  );
}
