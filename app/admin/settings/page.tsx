"use client";

import { useState, useEffect } from "react";
import { Save, Check } from "lucide-react";

export default function AdminSettingsPage() {
  const [configs, setConfigs] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/admin/config")
      .then((r) => r.json())
      .then((data) => {
        setConfigs(data);
        setLoading(false);
      });
  }, []);

  const handleSave = async () => {
    setSaving(true);
    await fetch("/api/admin/config", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(configs),
    });
    setSaving(false);
    alert("Pengaturan berhasil disimpan!");
  };

  const handleChange = (key: string, value: string) => {
    setConfigs((prev) => ({ ...prev, [key]: value }));
  };

  if (loading) return <div>Memuat...</div>;

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Pengaturan Website</h1>
          <p className="admin-page-sub">
            Atur variabel dan konfigurasi global untuk website ini.
          </p>
        </div>
      </div>

      <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "var(--radius-lg)", padding: 24, maxWidth: 600 }}>
        <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>Statistik Tampilan (Offset)</h2>
        <p style={{ fontSize: 14, color: "var(--text-secondary)", marginBottom: 24 }}>
          Angka ini akan ditambahkan ke total order yang berstatus "Selesai" di database. Gunakan ini jika kamu punya riwayat order sebelum menggunakan website ini.
        </p>
        
        <div className="form-group">
          <label className="form-label">Tambahan Angka Order Selesai</label>
          <input
            type="number"
            className="form-input"
            value={configs["orderBaseCount"] || "0"}
            onChange={(e) => handleChange("orderBaseCount", e.target.value)}
          />
        </div>

        <h2 style={{ fontSize: 16, fontWeight: 700, marginTop: 40, marginBottom: 16, paddingTop: 32, borderTop: "1px solid var(--border)" }}>Pengaturan Pembayaran & Kontak</h2>
        <p style={{ fontSize: 14, color: "var(--text-secondary)", marginBottom: 24 }}>
          Informasi ini akan ditampilkan kepada pelanggan di halaman pembayaran dan untuk tombol konfirmasi otomatis via WhatsApp.
        </p>

        <div className="form-group">
          <label className="form-label">Nomor WhatsApp Admin (Pakai awalan 62, misal 62812345678)</label>
          <input
            className="form-input"
            placeholder="62812345678"
            value={configs["wa_number"] || ""}
            onChange={(e) => handleChange("wa_number", e.target.value)}
          />
        </div>
        
        <div className="form-group">
          <label className="form-label">Link Gambar QRIS (Kosongkan jika tidak ada)</label>
          <input
            className="form-input"
            placeholder="https://... atau /qris.jpg"
            value={configs["pay_qris"] || ""}
            onChange={(e) => handleChange("pay_qris", e.target.value)}
          />
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          <div className="form-group">
            <label className="form-label">No. DANA</label>
            <input className="form-input" value={configs["pay_dana"] || ""} onChange={(e) => handleChange("pay_dana", e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">No. GOPAY</label>
            <input className="form-input" value={configs["pay_gopay"] || ""} onChange={(e) => handleChange("pay_gopay", e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">No. OVO</label>
            <input className="form-input" value={configs["pay_ovo"] || ""} onChange={(e) => handleChange("pay_ovo", e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">No. Rekening Mandiri</label>
            <input className="form-input" value={configs["pay_mandiri"] || ""} onChange={(e) => handleChange("pay_mandiri", e.target.value)} />
          </div>
        </div>

        <button className="btn-primary" onClick={handleSave} disabled={saving} style={{ marginTop: 16 }}>
          {saving ? "Menyimpan..." : <><Save size={16} /> Simpan Pengaturan</>}
        </button>
      </div>
    </div>
  );
}
