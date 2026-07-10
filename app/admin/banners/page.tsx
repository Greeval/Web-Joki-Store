"use client";

import { useState, useEffect, useRef } from "react";
import {
  Plus, Trash2, Pencil, X, Check, Upload, GripVertical,
  ToggleLeft, ToggleRight, Eye, EyeOff, ImageIcon
} from "lucide-react";

type Banner = {
  id: number;
  title: string;
  subtitle: string | null;
  badge: string | null;
  imageUrl: string;
  linkUrl: string | null;
  urutan: number;
  isActive: boolean;
};

const EMPTY: Omit<Banner, "id" | "createdAt"> = {
  title: "",
  subtitle: "",
  badge: "",
  imageUrl: "",
  linkUrl: "",
  urutan: 0,
  isActive: true,
};

export default function AdminBannersPage() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<{ open: boolean; data: Partial<Banner> & { id?: number } }>({
    open: false,
    data: { ...EMPTY },
  });
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [preview, setPreview] = useState<string>("");
  const fileRef = useRef<HTMLInputElement>(null);

  const fetchBanners = async () => {
    setLoading(true);
    const res = await fetch("/api/admin/banners");
    const data = await res.json();
    setBanners(data);
    setLoading(false);
  };

  useEffect(() => { fetchBanners(); }, []);

  const openAdd = () => {
    setModal({ open: true, data: { ...EMPTY } });
    setPreview("");
  };

  const openEdit = (b: Banner) => {
    setModal({ open: true, data: { ...b } });
    setPreview(b.imageUrl);
  };

  const closeModal = () => {
    setModal({ open: false, data: { ...EMPTY } });
    setPreview("");
  };

  const handleField = (field: string, value: string | boolean | number) => {
    setModal((prev) => ({ ...prev, data: { ...prev.data, [field]: value } }));
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Preview lokal
    const reader = new FileReader();
    reader.onload = (ev) => setPreview(ev.target?.result as string);
    reader.readAsDataURL(file);

    // Upload ke server
    setUploading(true);
    const form = new FormData();
    form.append("file", file);
    const res = await fetch("/api/admin/banners/upload", { method: "POST", body: form });
    const data = await res.json();
    setUploading(false);
    if (data.url) {
      handleField("imageUrl", data.url);
    } else {
      alert("Upload gagal: " + (data.error || "Unknown error"));
    }
  };

  const handleSave = async () => {
    const d = modal.data;
    if (!d.title?.trim()) return alert("Judul banner wajib diisi!");
    if (!d.imageUrl?.trim()) return alert("Gambar banner wajib diupload!");

    setSaving(true);
    const isEdit = !!d.id;
    const url = isEdit ? `/api/admin/banners/${d.id}` : "/api/admin/banners";
    const method = isEdit ? "PUT" : "POST";

    await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(d),
    });
    setSaving(false);
    closeModal();
    fetchBanners();
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Yakin hapus banner ini?")) return;
    await fetch(`/api/admin/banners/${id}`, { method: "DELETE" });
    fetchBanners();
  };

  const toggleActive = async (b: Banner) => {
    await fetch(`/api/admin/banners/${b.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...b, isActive: !b.isActive }),
    });
    fetchBanners();
  };

  return (
    <div className="admin-page">
      {/* Header */}
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Kelola Banner Promo</h1>
          <p className="admin-page-sub">
            Gambar yang ditampilkan pada carousel di halaman utama website.
          </p>
        </div>
        <button className="btn-primary" onClick={openAdd}>
          <Plus size={16} /> Tambah Banner
        </button>
      </div>

      {/* List */}
      {loading ? (
        <div className="banner-grid">
          {[1, 2, 3].map((i) => (
            <div key={i} className="skeleton" style={{ height: 200, borderRadius: 12 }} />
          ))}
        </div>
      ) : banners.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">🖼️</div>
          <div className="empty-state-title">Belum ada banner</div>
          <p style={{ color: "var(--text-muted)", marginBottom: 24 }}>
            Tambah banner pertama untuk ditampilkan di carousel halaman utama.
          </p>
          <button className="btn-primary" onClick={openAdd}>
            <Plus size={16} /> Tambah Banner
          </button>
        </div>
      ) : (
        <div className="banner-grid">
          {banners.map((b, idx) => (
            <div key={b.id} className={`banner-card ${!b.isActive ? "banner-card-inactive" : ""}`}>
              {/* Thumbnail */}
              <div className="banner-thumb">
                {b.imageUrl ? (
                  <img src={b.imageUrl} alt={b.title} />
                ) : (
                  <div className="banner-thumb-placeholder">
                    <ImageIcon size={32} />
                  </div>
                )}
                {/* Badge */}
                {b.badge && (
                  <span className="banner-badge-chip">{b.badge}</span>
                )}
                {/* Inactive overlay */}
                {!b.isActive && (
                  <div className="banner-inactive-overlay">
                    <EyeOff size={20} />
                    <span>Disembunyikan</span>
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="banner-info">
                <div className="banner-order-chip">#{idx + 1}</div>
                <div className="banner-title">{b.title}</div>
                {b.subtitle && <div className="banner-subtitle">{b.subtitle}</div>}
                {b.linkUrl && (
                  <div className="banner-link">🔗 {b.linkUrl}</div>
                )}
              </div>

              {/* Actions */}
              <div className="banner-actions">
                <button
                  className="banner-action-btn"
                  title={b.isActive ? "Sembunyikan" : "Tampilkan"}
                  onClick={() => toggleActive(b)}
                >
                  {b.isActive ? <Eye size={15} /> : <EyeOff size={15} />}
                </button>
                <button
                  className="banner-action-btn"
                  title="Edit"
                  onClick={() => openEdit(b)}
                >
                  <Pencil size={15} />
                </button>
                <button
                  className="banner-action-btn banner-action-danger"
                  title="Hapus"
                  onClick={() => handleDelete(b.id)}
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {modal.open && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-box" style={{ maxWidth: 560 }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">
                {modal.data.id ? "Edit Banner" : "Tambah Banner Baru"}
              </h2>
              <button className="modal-close" onClick={closeModal}><X size={18} /></button>
            </div>

            <div className="modal-body">
              {/* Upload gambar */}
              <div className="form-group">
                <label className="form-label">Gambar Banner <span style={{ color: "var(--accent-primary)" }}>*</span></label>
                <div
                  className="banner-upload-zone"
                  onClick={() => fileRef.current?.click()}
                  style={{ backgroundImage: preview ? `url(${preview})` : undefined }}
                >
                  {preview ? (
                    <div className="banner-upload-overlay">
                      <Upload size={20} />
                      <span>{uploading ? "Mengupload..." : "Klik untuk ganti gambar"}</span>
                    </div>
                  ) : (
                    <div className="banner-upload-placeholder">
                      <ImageIcon size={32} />
                      <span>{uploading ? "Mengupload..." : "Klik untuk upload gambar"}</span>
                      <span className="banner-upload-hint">JPG, PNG, WebP — maks 5MB</span>
                    </div>
                  )}
                </div>
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  style={{ display: "none" }}
                  onChange={handleFileUpload}
                />
                {/* Atau masukkan URL */}
                <div style={{ marginTop: 8, display: "flex", gap: 8, alignItems: "center" }}>
                  <span style={{ fontSize: 12, color: "var(--text-muted)", whiteSpace: "nowrap" }}>Atau URL:</span>
                  <input
                    className="form-input"
                    placeholder="https://... atau /banners/gambar.jpg"
                    value={modal.data.imageUrl || ""}
                    onChange={(e) => {
                      handleField("imageUrl", e.target.value);
                      setPreview(e.target.value);
                    }}
                    style={{ flex: 1 }}
                  />
                </div>
              </div>

              {/* Judul */}
              <div className="form-group">
                <label className="form-label">Judul Banner <span style={{ color: "var(--accent-primary)" }}>*</span></label>
                <input
                  className="form-input"
                  placeholder="Contoh: Genshin Impact — Joki Event Natlan"
                  value={modal.data.title || ""}
                  onChange={(e) => handleField("title", e.target.value)}
                />
              </div>

              {/* Subtitle */}
              <div className="form-group">
                <label className="form-label">Deskripsi Singkat</label>
                <input
                  className="form-input"
                  placeholder="Contoh: Clear event mingguan, farming material, dan daily commission."
                  value={modal.data.subtitle || ""}
                  onChange={(e) => handleField("subtitle", e.target.value)}
                />
              </div>

              {/* Badge & Urutan */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <div className="form-group">
                  <label className="form-label">Label Badge</label>
                  <input
                    className="form-input"
                    placeholder="Event Aktif / Promo / Baru"
                    value={modal.data.badge || ""}
                    onChange={(e) => handleField("badge", e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Urutan</label>
                  <input
                    className="form-input"
                    type="number"
                    min={0}
                    value={modal.data.urutan ?? 0}
                    onChange={(e) => handleField("urutan", Number(e.target.value))}
                  />
                </div>
              </div>

              {/* Link */}
              <div className="form-group">
                <label className="form-label">Link URL (opsional)</label>
                <input
                  className="form-input"
                  placeholder="https://wa.me/62xxx atau /games/genshin"
                  value={modal.data.linkUrl || ""}
                  onChange={(e) => handleField("linkUrl", e.target.value)}
                />
              </div>

              {/* Toggle Aktif */}
              <div className="form-group" style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <label className="form-label" style={{ margin: 0 }}>Tampilkan di website</label>
                <button
                  type="button"
                  onClick={() => handleField("isActive", !modal.data.isActive)}
                  style={{
                    background: "none", border: "none", cursor: "pointer",
                    color: modal.data.isActive ? "var(--accent-primary)" : "var(--text-muted)"
                  }}
                >
                  {modal.data.isActive
                    ? <ToggleRight size={32} />
                    : <ToggleLeft size={32} />
                  }
                </button>
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn-ghost" onClick={closeModal}>Batal</button>
              <button className="btn-primary" onClick={handleSave} disabled={saving || uploading}>
                {saving ? "Menyimpan..." : <><Check size={15} /> Simpan Banner</>}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
