"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Gamepad2, Plus, Edit2, Trash2, ChevronDown, ChevronRight,
  X, Save, Loader2, FolderOpen, Package
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────
type ItemMini = {
  id: number; nama: string; tipe: string;
  hargaBatch: number | null; jumlahBatch: number | null;
  hargaPaket: number | null; satuanLabel: string | null;
  deskripsi: string | null; refundPolicy: string;
  variants?: { id?: number; nama: string; harga: number }[];
  tiers?: { id?: number; minQty: number; maxQty: number; harga: number }[];
};
type CategoryMini = {
  id: number; nama: string; displayType: string; urutan: number;
  _count: { items: number };
};
type GameFull = {
  id: number; nama: string; slug: string;
  coverImageUrl: string | null; isPopuler: boolean;
  categories: CategoryMini[];
};

// ─── Reusable Modal ────────────────────────────────────────────────────────────
function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 1000,
      background: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)",
      display: "flex", alignItems: "center", justifyContent: "center", padding: 16
    }}>
      <div style={{
        background: "var(--bg-secondary, #0f172a)",
        border: "1px solid rgba(255,255,255,0.12)",
        borderRadius: 16, padding: 28, width: "100%", maxWidth: 520,
        boxShadow: "0 24px 64px rgba(0,0,0,0.6)",
        maxHeight: "90vh", overflowY: "auto"
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, margin: 0 }}>{title}</h2>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-tertiary)", padding: 4 }}>
            <X size={20} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

// ─── Input component ──────────────────────────────────────────────────────────
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <label style={{ fontSize: 13, fontWeight: 600, color: "var(--text-secondary)", display: "block", marginBottom: 6 }}>{label}</label>
      {children}
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width: "100%", padding: "10px 14px", borderRadius: 10,
  background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)",
  color: "var(--text-primary)", fontSize: 14, outline: "none",
  boxSizing: "border-box"
};

const selectStyle: React.CSSProperties = { ...inputStyle, cursor: "pointer" };

// ─── Delete Confirm ────────────────────────────────────────────────────────────
function ConfirmDelete({ nama, onConfirm, onCancel, loading }: {
  nama: string; onConfirm: () => void; onCancel: () => void; loading: boolean;
}) {
  return (
    <Modal title="Konfirmasi Hapus" onClose={onCancel}>
      <p style={{ color: "var(--text-secondary)", marginBottom: 24, lineHeight: 1.6 }}>
        Yakin ingin menghapus <strong style={{ color: "var(--text-primary)" }}>{nama}</strong>?
        Semua data di dalamnya akan ikut terhapus.
      </p>
      <div style={{ display: "flex", gap: 12, justifyContent: "flex-end" }}>
        <button onClick={onCancel} style={{ padding: "8px 20px", borderRadius: 10, background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.1)", color: "var(--text-primary)", cursor: "pointer", fontWeight: 600, fontSize: 13 }}>
          Batal
        </button>
        <button onClick={onConfirm} disabled={loading} style={{ padding: "8px 20px", borderRadius: 10, background: "#ef4444", border: "none", color: "#fff", cursor: "pointer", fontWeight: 600, fontSize: 13, display: "flex", alignItems: "center", gap: 6 }}>
          {loading ? <Loader2 size={14} className="spin" /> : <Trash2 size={14} />} Hapus
        </button>
      </div>
    </Modal>
  );
}

// ─── Game Modal ────────────────────────────────────────────────────────────────
function GameModal({ game, onSave, onClose }: {
  game?: GameFull | null; onSave: () => void; onClose: () => void;
}) {
  const [nama, setNama] = useState(game?.nama ?? "");
  const [slug, setSlug] = useState(game?.slug ?? "");
  const [cover, setCover] = useState(game?.coverImageUrl ?? "");
  const [populer, setPopuler] = useState(game?.isPopuler ?? false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const autoSlug = (v: string) => v.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");

  async function handleSave() {
    setLoading(true); setError("");
    try {
      const url = game ? `/api/admin/games/${game.id}` : "/api/admin/games";
      const method = game ? "PUT" : "POST";
      const res = await fetch(url, {
        method, headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nama, slug, coverImageUrl: cover || null, isPopuler: populer })
      });
      if (!res.ok) throw new Error((await res.json()).error || "Gagal menyimpan");
      onSave();
    } catch (e: any) { setError(e.message); }
    finally { setLoading(false); }
  }

  return (
    <Modal title={game ? "Edit Game" : "Tambah Game Baru"} onClose={onClose}>
      {error && <div style={{ background: "#ef444422", border: "1px solid #ef4444", borderRadius: 8, padding: "10px 14px", fontSize: 13, color: "#ef4444", marginBottom: 16 }}>{error}</div>}
      <Field label="Nama Game *">
        <input style={inputStyle} value={nama} onChange={e => { setNama(e.target.value); if (!game) setSlug(autoSlug(e.target.value)); }} placeholder="Genshin Impact" />
      </Field>
      <Field label="Slug (URL) *">
        <input style={inputStyle} value={slug} onChange={e => setSlug(autoSlug(e.target.value))} placeholder="genshin-impact" />
        <div style={{ fontSize: 11, color: "var(--text-tertiary)", marginTop: 4 }}>URL: /game/{slug || "..."}</div>
      </Field>
      <Field label="URL Cover Image">
        <input style={inputStyle} value={cover} onChange={e => setCover(e.target.value)} placeholder="/cover-genshin.jpg atau https://..." />
        {cover && <img src={cover} onError={e => (e.currentTarget.style.display = "none")} style={{ marginTop: 8, height: 80, borderRadius: 8, objectFit: "cover" }} />}
      </Field>
      <Field label="Status">
        <label style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer", fontSize: 14 }}>
          <input type="checkbox" checked={populer} onChange={e => setPopuler(e.target.checked)} />
          Tampilkan sebagai game populer
        </label>
      </Field>
      <div style={{ display: "flex", gap: 12, justifyContent: "flex-end", marginTop: 8 }}>
        <button onClick={onClose} style={{ padding: "10px 20px", borderRadius: 10, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", color: "var(--text-primary)", cursor: "pointer", fontWeight: 600, fontSize: 13 }}>Batal</button>
        <button onClick={handleSave} disabled={loading} style={{ padding: "10px 20px", borderRadius: 10, background: "var(--accent-purple, #7c3aed)", border: "none", color: "#fff", cursor: "pointer", fontWeight: 600, fontSize: 13, display: "flex", alignItems: "center", gap: 6 }}>
          {loading ? <Loader2 size={14} /> : <Save size={14} />} Simpan
        </button>
      </div>
    </Modal>
  );
}

// ─── Category Modal ────────────────────────────────────────────────────────────
function CategoryModal({ gameId, category, onSave, onClose }: {
  gameId: number; category?: CategoryMini | null; onSave: () => void; onClose: () => void;
}) {
  const [nama, setNama] = useState(category?.nama ?? "");
  const [displayType, setDisplayType] = useState(category?.displayType ?? "tab");
  const [urutan, setUrutan] = useState(category?.urutan ?? 0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSave() {
    setLoading(true); setError("");
    try {
      const url = category ? `/api/admin/categories/${category.id}` : "/api/admin/categories";
      const method = category ? "PUT" : "POST";
      const res = await fetch(url, {
        method, headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ gameId, nama, displayType, urutan: Number(urutan) })
      });
      if (!res.ok) throw new Error((await res.json()).error || "Gagal menyimpan");
      onSave();
    } catch (e: any) { setError(e.message); }
    finally { setLoading(false); }
  }

  return (
    <Modal title={category ? "Edit Kategori" : "Tambah Kategori"} onClose={onClose}>
      {error && <div style={{ background: "#ef444422", border: "1px solid #ef4444", borderRadius: 8, padding: "10px 14px", fontSize: 13, color: "#ef4444", marginBottom: 16 }}>{error}</div>}
      <Field label="Nama Kategori *">
        <input style={inputStyle} value={nama} onChange={e => setNama(e.target.value)} placeholder="Rawat Akun, Farming, dll." />
      </Field>
      <Field label="Tampilan">
        <select style={selectStyle} value={displayType} onChange={e => setDisplayType(e.target.value)}>
          <option value="tab">Tab (ditampilkan sebagai tab utama)</option>
          <option value="accordion">Accordion (di dalam expand)</option>
        </select>
      </Field>
      <Field label="Urutan Tampil">
        <input type="number" style={inputStyle} value={urutan} onChange={e => setUrutan(Number(e.target.value))} placeholder="0" />
      </Field>
      <div style={{ display: "flex", gap: 12, justifyContent: "flex-end", marginTop: 8 }}>
        <button onClick={onClose} style={{ padding: "10px 20px", borderRadius: 10, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", color: "var(--text-primary)", cursor: "pointer", fontWeight: 600, fontSize: 13 }}>Batal</button>
        <button onClick={handleSave} disabled={loading} style={{ padding: "10px 20px", borderRadius: 10, background: "var(--accent-cyan, #06b6d4)", border: "none", color: "#fff", cursor: "pointer", fontWeight: 600, fontSize: 13, display: "flex", alignItems: "center", gap: 6 }}>
          {loading ? <Loader2 size={14} /> : <Save size={14} />} Simpan
        </button>
      </div>
    </Modal>
  );
}

// ─── Item Modal ────────────────────────────────────────────────────────────────
function ItemModal({ categoryId, item, onSave, onClose }: {
  categoryId: number; item?: ItemMini | null; onSave: () => void; onClose: () => void;
}) {
  const [nama, setNama] = useState(item?.nama ?? "");
  const [tipe, setTipe] = useState(item?.tipe ?? "satuan");
  const [hargaBatch, setHargaBatch] = useState(item?.hargaBatch?.toString() ?? "");
  const [jumlahBatch, setJumlahBatch] = useState(item?.jumlahBatch?.toString() ?? "1");
  const [satuanLabel, setSatuanLabel] = useState(item?.satuanLabel ?? "pesanan");
  const [hargaPaket, setHargaPaket] = useState(item?.hargaPaket?.toString() ?? "");
  const [deskripsi, setDeskripsi] = useState(item?.deskripsi ?? "");
  const [refundPolicy, setRefundPolicy] = useState(item?.refundPolicy ?? "no_refund");
  
  // Tiers and Variants State
  const [variants, setVariants] = useState<{ id?: number; nama: string; harga: number }[]>(
    item?.variants ? [...item.variants] : []
  );
  const [tiers, setTiers] = useState<{ id?: number; minQty: number; maxQty: number; harga: number }[]>(
    item?.tiers ? [...item.tiers] : []
  );

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSave() {
    setLoading(true); setError("");
    try {
      const url = item ? `/api/admin/items/${item.id}` : "/api/admin/items";
      const method = item ? "PUT" : "POST";
      const body: any = { categoryId, nama, tipe, deskripsi, refundPolicy, variants, tiers };
      if (tipe === "satuan") {
        body.hargaBatch = Number(hargaBatch);
        body.jumlahBatch = Number(jumlahBatch);
        body.satuanLabel = satuanLabel;
      } else {
        body.hargaPaket = Number(hargaPaket);
      }
      const res = await fetch(url, {
        method, headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      });
      if (!res.ok) throw new Error((await res.json()).error || "Gagal menyimpan");
      onSave();
    } catch (e: any) { setError(e.message); }
    finally { setLoading(false); }
  }

  return (
    <Modal title={item ? "Edit Item" : "Tambah Item Baru"} onClose={onClose}>
      {error && <div style={{ background: "#ef444422", border: "1px solid #ef4444", borderRadius: 8, padding: "10px 14px", fontSize: 13, color: "#ef4444", marginBottom: 16 }}>{error}</div>}
      <Field label="Nama Item *">
        <input style={inputStyle} value={nama} onChange={e => setNama(e.target.value)} placeholder="Abyss Minor (Lantai 1-3)" />
      </Field>
      <Field label="Tipe Harga">
        <select style={selectStyle} value={tipe} onChange={e => setTipe(e.target.value)}>
          <option value="satuan">Satuan (harga per jumlah tertentu)</option>
          <option value="paket">Paket (harga flat satu paket)</option>
          <option value="both">Keduanya (Varian Paket + Kelipatan Jumlah)</option>
        </select>
      </Field>
      {tipe === "satuan" || tipe === "both" ? (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
          <Field label="Harga (Rp)">
            <input type="number" style={inputStyle} value={hargaBatch} onChange={e => setHargaBatch(e.target.value)} placeholder="15000" />
          </Field>
          <Field label="Per Berapa">
            <input type="number" style={inputStyle} value={jumlahBatch} onChange={e => setJumlahBatch(e.target.value)} placeholder="1" />
          </Field>
          <Field label="Satuan">
            <input style={inputStyle} value={satuanLabel} onChange={e => setSatuanLabel(e.target.value)} placeholder="pesanan" />
          </Field>
        </div>
      ) : (
        <Field label="Harga Paket (Rp)">
          <input type="number" style={inputStyle} value={hargaPaket} onChange={e => setHargaPaket(e.target.value)} placeholder="25000" />
        </Field>
      )}

      {/* VARIANTS SECTION */}
      <div style={{ marginTop: 24, marginBottom: 24, padding: 16, background: "rgba(255,255,255,0.02)", borderRadius: 12, border: "1px dashed rgba(255,255,255,0.1)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <label style={{ fontSize: 13, fontWeight: 600, color: "var(--text-secondary)" }}>Varian Item (Opsional)</label>
          <button onClick={() => setVariants([...variants, { nama: "", harga: 0 }])} style={{ background: "rgba(6,182,212,0.1)", border: "none", borderRadius: 6, color: "var(--accent-cyan)", cursor: "pointer", padding: "4px 8px", fontSize: 11, fontWeight: 600 }}>+ Tambah Varian</button>
        </div>
        {variants.length === 0 && <div style={{ fontSize: 12, color: "var(--text-tertiary)" }}>Tidak ada varian (misal: Lantai 9, Lantai 10).</div>}
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {variants.map((v, i) => (
            <div key={i} style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <input style={{ ...inputStyle, flex: 1 }} value={v.nama} onChange={e => { const n = [...variants]; n[i].nama = e.target.value; setVariants(n); }} placeholder="Nama Varian" />
              <input type="number" style={{ ...inputStyle, width: 140 }} value={v.harga || ""} onChange={e => { const n = [...variants]; n[i].harga = Number(e.target.value); setVariants(n); }} placeholder="Harga (Rp)" />
              <button onClick={() => { const n = [...variants]; n.splice(i, 1); setVariants(n); }} style={{ background: "none", border: "none", color: "#ef4444", cursor: "pointer", padding: 6 }}><Trash2 size={16} /></button>
            </div>
          ))}
        </div>
      </div>

      {/* TIERS SECTION */}
      <div style={{ marginBottom: 24, padding: 16, background: "rgba(255,255,255,0.02)", borderRadius: 12, border: "1px dashed rgba(255,255,255,0.1)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <label style={{ fontSize: 13, fontWeight: 600, color: "var(--text-secondary)" }}>Harga Tier / Bertingkat (Opsional)</label>
          <button onClick={() => setTiers([...tiers, { minQty: 1, maxQty: 10, harga: 0 }])} style={{ background: "rgba(6,182,212,0.1)", border: "none", borderRadius: 6, color: "var(--accent-cyan)", cursor: "pointer", padding: "4px 8px", fontSize: 11, fontWeight: 600 }}>+ Tambah Tier</button>
        </div>
        {tiers.length === 0 && <div style={{ fontSize: 12, color: "var(--text-tertiary)" }}>Tidak ada harga tier (misal: beli 1-50 harga X, 51-100 harga Y).</div>}
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {tiers.map((t, i) => (
            <div key={i} style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <input type="number" style={{ ...inputStyle, width: 80 }} value={t.minQty || ""} onChange={e => { const n = [...tiers]; n[i].minQty = Number(e.target.value); setTiers(n); }} placeholder="Min" />
              <span style={{ color: "var(--text-tertiary)", fontSize: 12 }}>-</span>
              <input type="number" style={{ ...inputStyle, width: 80 }} value={t.maxQty || ""} onChange={e => { const n = [...tiers]; n[i].maxQty = Number(e.target.value); setTiers(n); }} placeholder="Max" />
              <input type="number" style={{ ...inputStyle, flex: 1 }} value={t.harga || ""} onChange={e => { const n = [...tiers]; n[i].harga = Number(e.target.value); setTiers(n); }} placeholder="Harga per Satuan (Rp)" />
              <button onClick={() => { const n = [...tiers]; n.splice(i, 1); setTiers(n); }} style={{ background: "none", border: "none", color: "#ef4444", cursor: "pointer", padding: 6 }}><Trash2 size={16} /></button>
            </div>
          ))}
        </div>
      </div>

      <Field label="Deskripsi / Catatan">
        <textarea style={{ ...inputStyle, minHeight: 80, resize: "vertical" }} value={deskripsi} onChange={e => setDeskripsi(e.target.value)} placeholder="Catatan tambahan untuk layanan ini..." />
      </Field>
      <Field label="Kebijakan Refund">
        <select style={selectStyle} value={refundPolicy} onChange={e => setRefundPolicy(e.target.value)}>
          <option value="no_refund">No Refund</option>
          <option value="partial_50">Refund 50%</option>
          <option value="full_refund">Full Refund</option>
        </select>
      </Field>
      <div style={{ display: "flex", gap: 12, justifyContent: "flex-end", marginTop: 8 }}>
        <button onClick={onClose} style={{ padding: "10px 20px", borderRadius: 10, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", color: "var(--text-primary)", cursor: "pointer", fontWeight: 600, fontSize: 13 }}>Batal</button>
        <button onClick={handleSave} disabled={loading} style={{ padding: "10px 20px", borderRadius: 10, background: "var(--accent-purple, #7c3aed)", border: "none", color: "#fff", cursor: "pointer", fontWeight: 600, fontSize: 13, display: "flex", alignItems: "center", gap: 6 }}>
          {loading ? <Loader2 size={14} /> : <Save size={14} />} Simpan
        </button>
      </div>
    </Modal>
  );
}

// ─── Category Row with items ───────────────────────────────────────────────────
function CategoryRow({ cat, gameId, onRefresh }: { cat: CategoryMini; gameId: number; onRefresh: () => void }) {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<ItemMini[]>([]);
  const [loadingItems, setLoadingItems] = useState(false);
  const [editCat, setEditCat] = useState(false);
  const [deleteCat, setDeleteCat] = useState(false);
  const [addItem, setAddItem] = useState(false);
  const [editItem, setEditItem] = useState<ItemMini | null>(null);
  const [deleteItem, setDeleteItem] = useState<ItemMini | null>(null);
  const [delLoading, setDelLoading] = useState(false);

  const loadItems = useCallback(async () => {
    setLoadingItems(true);
    const res = await fetch(`/api/admin/categories/${cat.id}/items`);
    if (res.ok) setItems(await res.json());
    setLoadingItems(false);
  }, [cat.id]);

  useEffect(() => { if (open) loadItems(); }, [open, loadItems]);

  async function handleDeleteCat() {
    setDelLoading(true);
    await fetch(`/api/admin/categories/${cat.id}`, { method: "DELETE" });
    setDelLoading(false);
    setDeleteCat(false);
    onRefresh();
  }

  async function handleDeleteItem() {
    if (!deleteItem) return;
    setDelLoading(true);
    await fetch(`/api/admin/items/${deleteItem.id}`, { method: "DELETE" });
    setDelLoading(false);
    setDeleteItem(null);
    loadItems();
    onRefresh();
  }

  const fmtHarga = (item: ItemMini) => {
    if (item.tipe === "paket") return `Rp ${(item.hargaPaket || 0).toLocaleString("id-ID")} / paket`;
    return `Rp ${(item.hargaBatch || 0).toLocaleString("id-ID")} / ${item.jumlahBatch} ${item.satuanLabel}`;
  };

  return (
    <>
      {editCat && <CategoryModal gameId={gameId} category={cat} onSave={() => { setEditCat(false); onRefresh(); }} onClose={() => setEditCat(false)} />}
      {deleteCat && <ConfirmDelete nama={cat.nama} loading={delLoading} onConfirm={handleDeleteCat} onCancel={() => setDeleteCat(false)} />}
      {addItem && <ItemModal categoryId={cat.id} onSave={() => { setAddItem(false); loadItems(); onRefresh(); }} onClose={() => setAddItem(false)} />}
      {editItem && <ItemModal categoryId={cat.id} item={editItem} onSave={() => { setEditItem(null); loadItems(); }} onClose={() => setEditItem(null)} />}
      {deleteItem && <ConfirmDelete nama={deleteItem.nama} loading={delLoading} onConfirm={handleDeleteItem} onCancel={() => setDeleteItem(null)} />}

      <div style={{ background: "rgba(0,0,0,0.25)", borderRadius: 12, border: "1px solid rgba(255,255,255,0.07)", overflow: "hidden" }}>
        {/* Category header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 16px" }}>
          <button onClick={() => setOpen(!open)} style={{ display: "flex", alignItems: "center", gap: 10, background: "none", border: "none", cursor: "pointer", color: "var(--text-primary)", textAlign: "left", flex: 1 }}>
            {open ? <ChevronDown size={16} style={{ color: "var(--accent-cyan)" }} /> : <ChevronRight size={16} style={{ color: "var(--text-tertiary)" }} />}
            <FolderOpen size={15} style={{ color: "var(--accent-cyan)", opacity: 0.7 }} />
            <span style={{ fontWeight: 600, fontSize: 14, color: "var(--accent-cyan)" }}>{cat.nama}</span>
            <span style={{ fontSize: 12, color: "var(--text-tertiary)", background: "rgba(255,255,255,0.06)", padding: "2px 8px", borderRadius: 20, marginLeft: 4 }}>
              {cat._count.items} item
            </span>
            <span style={{ fontSize: 11, color: "var(--text-tertiary)", background: "rgba(255,255,255,0.04)", padding: "2px 8px", borderRadius: 20 }}>
              {cat.displayType}
            </span>
          </button>
          <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
            <button onClick={() => setAddItem(true)} title="Tambah Item" style={{ background: "rgba(6,182,212,0.12)", border: "1px solid rgba(6,182,212,0.3)", borderRadius: 8, color: "var(--accent-cyan)", cursor: "pointer", padding: "5px 10px", fontSize: 12, display: "flex", alignItems: "center", gap: 5 }}>
              <Plus size={13} /> Item
            </button>
            <button onClick={() => setEditCat(true)} title="Edit Kategori" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, color: "var(--text-secondary)", cursor: "pointer", padding: 6 }}>
              <Edit2 size={13} />
            </button>
            <button onClick={() => setDeleteCat(true)} title="Hapus Kategori" style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: 8, color: "#ef4444", cursor: "pointer", padding: 6 }}>
              <Trash2 size={13} />
            </button>
          </div>
        </div>

        {/* Items list */}
        {open && (
          <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)", padding: "12px 16px 16px" }}>
            {loadingItems ? (
              <div style={{ display: "flex", alignItems: "center", gap: 8, color: "var(--text-tertiary)", fontSize: 13, padding: "8px 0" }}>
                <Loader2 size={14} className="spin" /> Memuat item...
              </div>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 10 }}>
                {items.map(item => (
                  <div key={item.id} style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 10, padding: "12px 14px", display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 4, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }} title={item.nama}>{item.nama}</div>
                      <div style={{ fontSize: 12, color: "var(--accent-purple-light, #a78bfa)", fontWeight: 600 }}>{fmtHarga(item)}</div>
                      {item.deskripsi && <div style={{ fontSize: 11, color: "var(--text-tertiary)", marginTop: 4, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.deskripsi}</div>}
                    </div>
                    <div style={{ display: "flex", gap: 4, flexShrink: 0 }}>
                      <button onClick={() => setEditItem(item)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-tertiary)", padding: 4 }}><Edit2 size={13} /></button>
                      <button onClick={() => setDeleteItem(item)} style={{ background: "none", border: "none", cursor: "pointer", color: "#ef4444", padding: 4 }}><Trash2 size={13} /></button>
                    </div>
                  </div>
                ))}
                {/* Add item button */}
                <button onClick={() => setAddItem(true)} style={{ background: "rgba(255,255,255,0.02)", border: "1px dashed rgba(255,255,255,0.12)", borderRadius: 10, padding: "12px 14px", color: "var(--text-tertiary)", fontSize: 13, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
                  <Plus size={14} /> Tambah Item
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function AdminServicesPage() {
  const [games, setGames] = useState<GameFull[]>([]);
  const [loading, setLoading] = useState(true);
  const [addGame, setAddGame] = useState(false);
  const [editGame, setEditGame] = useState<GameFull | null>(null);
  const [deleteGame, setDeleteGame] = useState<GameFull | null>(null);
  const [addCat, setAddCat] = useState<number | null>(null); // gameId
  const [delLoading, setDelLoading] = useState(false);
  const [expandedGames, setExpandedGames] = useState<Set<number>>(new Set());

  const fetchGames = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/admin/games");
    if (res.ok) setGames(await res.json());
    setLoading(false);
  }, []);

  useEffect(() => { fetchGames(); }, [fetchGames]);

  const toggleGame = (id: number) => {
    setExpandedGames(prev => {
      const n = new Set(prev);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });
  };

  async function handleDeleteGame() {
    if (!deleteGame) return;
    setDelLoading(true);
    await fetch(`/api/admin/games/${deleteGame.id}`, { method: "DELETE" });
    setDelLoading(false);
    setDeleteGame(null);
    fetchGames();
  }

  return (
    <div>
      {/* Modals */}
      {addGame && <GameModal onSave={() => { setAddGame(false); fetchGames(); }} onClose={() => setAddGame(false)} />}
      {editGame && <GameModal game={editGame} onSave={() => { setEditGame(null); fetchGames(); }} onClose={() => setEditGame(null)} />}
      {deleteGame && <ConfirmDelete nama={deleteGame.nama} loading={delLoading} onConfirm={handleDeleteGame} onCancel={() => setDeleteGame(null)} />}
      {addCat !== null && <CategoryModal gameId={addCat} onSave={() => { setAddCat(null); fetchGames(); }} onClose={() => setAddCat(null)} />}

      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 32 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 44, height: 44, borderRadius: 12, background: "rgba(124,58,237,0.2)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Gamepad2 size={22} style={{ color: "var(--accent-purple)" }} />
          </div>
          <div>
            <h1 style={{ fontSize: 24, fontWeight: 800, margin: 0 }}>Manajemen Layanan</h1>
            <p style={{ color: "var(--text-secondary)", fontSize: 13, margin: 0 }}>Kelola game, kategori, dan item joki</p>
          </div>
        </div>
        <button
          onClick={() => setAddGame(true)}
          style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 20px", borderRadius: 12, background: "var(--accent-purple, #7c3aed)", border: "none", color: "#fff", cursor: "pointer", fontWeight: 700, fontSize: 14 }}
        >
          <Plus size={16} /> Tambah Game
        </button>
      </div>

      {/* Games list */}
      {loading ? (
        <div style={{ textAlign: "center", padding: 60, color: "var(--text-tertiary)", display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
          <Loader2 size={28} className="spin" />
          <span>Memuat data...</span>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {games.map(game => (
            <div key={game.id} className="glass-card" style={{ padding: 0, overflow: "hidden" }}>
              {/* Game header */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "20px 24px", borderBottom: expandedGames.has(game.id) ? "1px solid rgba(255,255,255,0.08)" : "none" }}>
                <button onClick={() => toggleGame(game.id)} style={{ display: "flex", alignItems: "center", gap: 14, background: "none", border: "none", cursor: "pointer", color: "var(--text-primary)", textAlign: "left", flex: 1 }}>
                  {expandedGames.has(game.id) ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                  {game.coverImageUrl ? (
                    <img src={game.coverImageUrl} alt={game.nama} style={{ width: 48, height: 48, borderRadius: 10, objectFit: "cover", flexShrink: 0 }} />
                  ) : (
                    <div style={{ width: 48, height: 48, borderRadius: 10, background: "rgba(124,58,237,0.2)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <Gamepad2 size={22} color="var(--accent-purple)" />
                    </div>
                  )}
                  <div style={{ textAlign: "left" }}>
                    <div style={{ fontSize: 17, fontWeight: 700 }}>{game.nama}</div>
                    <div style={{ fontSize: 12, color: "var(--text-tertiary)", display: "flex", gap: 12, marginTop: 2 }}>
                      <span>/{game.slug}</span>
                      <span>{game.categories.length} kategori</span>
                      <span>{game.categories.reduce((s, c) => s + c._count.items, 0)} item</span>
                      {game.isPopuler && <span style={{ color: "var(--accent-cyan)" }}>★ Populer</span>}
                    </div>
                  </div>
                </button>
                <div style={{ display: "flex", gap: 8 }}>
                  <button onClick={() => setAddCat(game.id)} style={{ display: "flex", alignItems: "center", gap: 6, padding: "7px 14px", borderRadius: 10, background: "rgba(6,182,212,0.1)", border: "1px solid rgba(6,182,212,0.25)", color: "var(--accent-cyan)", cursor: "pointer", fontSize: 13, fontWeight: 600 }}>
                    <Plus size={14} /> Kategori
                  </button>
                  <button onClick={() => setEditGame(game)} style={{ padding: "7px 12px", borderRadius: 10, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", color: "var(--text-secondary)", cursor: "pointer" }}>
                    <Edit2 size={14} />
                  </button>
                  <button onClick={() => setDeleteGame(game)} style={{ padding: "7px 12px", borderRadius: 10, background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", color: "#ef4444", cursor: "pointer" }}>
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>

              {/* Categories */}
              {expandedGames.has(game.id) && (
                <div style={{ padding: "16px 24px 20px", display: "flex", flexDirection: "column", gap: 10 }}>
                  {game.categories.length === 0 ? (
                    <div style={{ textAlign: "center", padding: "24px 0", color: "var(--text-tertiary)", fontSize: 13 }}>
                      Belum ada kategori.
                      <button onClick={() => setAddCat(game.id)} style={{ display: "inline-flex", alignItems: "center", gap: 6, marginLeft: 10, background: "none", border: "none", cursor: "pointer", color: "var(--accent-cyan)", fontSize: 13, fontWeight: 600 }}>
                        <Plus size={13} /> Tambah sekarang
                      </button>
                    </div>
                  ) : (
                    game.categories.map(cat => (
                      <CategoryRow key={cat.id} cat={cat} gameId={game.id} onRefresh={fetchGames} />
                    ))
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .spin { animation: spin 1s linear infinite; }
      `}</style>
    </div>
  );
}
