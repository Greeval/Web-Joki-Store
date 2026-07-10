"use client";

import { useState, useEffect } from "react";
import { Plus, Trash2, Pencil, X, Check, ToggleLeft, ToggleRight, Star, UserCircle } from "lucide-react";

type Testimoni = {
  id: number;
  nama: string;
  avatarUrl: string | null;
  game: string | null;
  rating: number;
  pesan: string;
  isActive: boolean;
  orderId: number | null;
  createdAt: string;
};

const EMPTY: Partial<Testimoni> = {
  nama: "",
  avatarUrl: "",
  game: "",
  rating: 5,
  pesan: "",
  isActive: true,
};

export default function AdminTestimoniPage() {
  const [testimoni, setTestimoni] = useState<Testimoni[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<{ open: boolean; data: Partial<Testimoni> & { id?: number } }>({
    open: false,
    data: { ...EMPTY },
  });
  const [saving, setSaving] = useState(false);

  const fetchTestimoni = async () => {
    setLoading(true);
    const res = await fetch("/api/admin/testimoni");
    const data = await res.json();
    setTestimoni(data);
    setLoading(false);
  };

  useEffect(() => { fetchTestimoni(); }, []);

  const openAdd = () => setModal({ open: true, data: { ...EMPTY } });
  const openEdit = (t: Testimoni) => setModal({ open: true, data: { ...t } });
  const closeModal = () => setModal({ open: false, data: { ...EMPTY } });

  const handleField = (field: string, value: any) => {
    setModal((prev) => ({ ...prev, data: { ...prev.data, [field]: value } }));
  };

  const handleSave = async () => {
    const d = modal.data;
    if (!d.nama?.trim() || !d.pesan?.trim()) return alert("Nama dan isi pesan wajib diisi!");
    if (!d.rating || d.rating < 1 || d.rating > 5) return alert("Rating harus 1-5 bintang!");

    setSaving(true);
    const isEdit = !!d.id;
    const url = isEdit ? `/api/admin/testimoni/${d.id}` : "/api/admin/testimoni";
    const method = isEdit ? "PUT" : "POST";

    await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(d),
    });
    setSaving(false);
    closeModal();
    fetchTestimoni();
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Yakin hapus testimoni ini?")) return;
    await fetch(`/api/admin/testimoni/${id}`, { method: "DELETE" });
    fetchTestimoni();
  };

  const toggleActive = async (t: Testimoni) => {
    await fetch(`/api/admin/testimoni/${t.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...t, isActive: !t.isActive }),
    });
    fetchTestimoni();
  };

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Kelola Testimoni</h1>
          <p className="admin-page-sub">
            Review dan testimoni dari pelanggan. Tentukan mana yang tampil di website.
          </p>
        </div>
        <button className="btn-primary" onClick={openAdd}>
          <Plus size={16} /> Tambah Manual
        </button>
      </div>

      {loading ? (
        <div>Memuat...</div>
      ) : testimoni.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">⭐</div>
          <div className="empty-state-title">Belum ada testimoni</div>
          <button className="btn-primary" onClick={openAdd} style={{ marginTop: 16 }}>Tambah Manual</button>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 16 }}>
          {testimoni.map((t) => (
            <div key={t.id} style={{
              background: "var(--bg-card)",
              border: "1px solid var(--border)",
              borderRadius: "var(--radius-lg)",
              padding: 20,
              opacity: t.isActive ? 1 : 0.5,
              position: "relative"
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
                <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                  {t.avatarUrl ? (
                    <img src={t.avatarUrl} alt={t.nama} style={{ width: 40, height: 40, borderRadius: "50%", objectFit: "cover" }} />
                  ) : (
                    <UserCircle size={40} color="var(--text-muted)" />
                  )}
                  <div>
                    <div style={{ fontWeight: 700, color: "var(--text-primary)" }}>{t.nama}</div>
                    <div style={{ fontSize: 12, color: "var(--text-muted)" }}>
                      {t.orderId ? `Order #${t.orderId}` : t.game || "General"}
                    </div>
                  </div>
                </div>
                <div style={{ display: "flex", gap: 2, color: "#fbbf24" }}>
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} size={14} fill={i < t.rating ? "currentColor" : "none"} />
                  ))}
                </div>
              </div>
              <p style={{ fontSize: 14, color: "var(--text-secondary)", lineHeight: 1.5, marginBottom: 16, fontStyle: "italic" }}>
                "{t.pesan}"
              </p>
              
              <div style={{ display: "flex", gap: 8, borderTop: "1px solid var(--border)", paddingTop: 16 }}>
                <button 
                  onClick={() => toggleActive(t)}
                  style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, padding: 8, background: "transparent", border: "1px solid var(--border)", borderRadius: "var(--radius-sm)", color: t.isActive ? "var(--accent-primary)" : "var(--text-muted)", cursor: "pointer" }}
                >
                  {t.isActive ? <ToggleRight size={16} /> : <ToggleLeft size={16} />}
                  {t.isActive ? "Tampil" : "Disembunyikan"}
                </button>
                <button onClick={() => openEdit(t)} style={{ padding: 8, background: "transparent", border: "1px solid var(--border)", borderRadius: "var(--radius-sm)", color: "var(--text-secondary)", cursor: "pointer" }}>
                  <Pencil size={16} />
                </button>
                <button onClick={() => handleDelete(t.id)} style={{ padding: 8, background: "rgba(239, 68, 68, 0.1)", border: "1px solid rgba(239, 68, 68, 0.2)", borderRadius: "var(--radius-sm)", color: "#ef4444", cursor: "pointer" }}>
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {modal.open && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">{modal.data.id ? "Edit Testimoni" : "Tambah Testimoni"}</h2>
              <button className="modal-close" onClick={closeModal}><X size={18} /></button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label className="form-label">Nama <span style={{color: "var(--accent-primary)"}}>*</span></label>
                <input className="form-input" value={modal.data.nama || ""} onChange={(e) => handleField("nama", e.target.value)} />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <div className="form-group">
                  <label className="form-label">Game (opsional)</label>
                  <input className="form-input" value={modal.data.game || ""} onChange={(e) => handleField("game", e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">Rating (1-5) <span style={{color: "var(--accent-primary)"}}>*</span></label>
                  <input type="number" min="1" max="5" className="form-input" value={modal.data.rating || 5} onChange={(e) => handleField("rating", Number(e.target.value))} />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Pesan Ulasan <span style={{color: "var(--accent-primary)"}}>*</span></label>
                <textarea className="form-input" rows={4} value={modal.data.pesan || ""} onChange={(e) => handleField("pesan", e.target.value)}></textarea>
              </div>
              <div className="form-group" style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <label className="form-label" style={{ margin: 0 }}>Tampilkan di Website</label>
                <button type="button" onClick={() => handleField("isActive", !modal.data.isActive)} style={{ background: "none", border: "none", cursor: "pointer", color: modal.data.isActive ? "var(--accent-primary)" : "var(--text-muted)" }}>
                  {modal.data.isActive ? <ToggleRight size={32} /> : <ToggleLeft size={32} />}
                </button>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-ghost" onClick={closeModal}>Batal</button>
              <button className="btn-primary" onClick={handleSave} disabled={saving}>{saving ? "Menyimpan..." : "Simpan"}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
