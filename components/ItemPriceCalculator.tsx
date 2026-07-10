"use client";

import { useState } from "react";

type Tier = { id: number; minQty: number; maxQty: number; harga: number };
type Variant = { id: number; nama: string; harga: number };

type Props = {
  tipe: string;
  hargaPaket: number | null;
  hargaBatch: number | null;
  jumlahBatch: number | null;
  satuanLabel: string | null;
  tiers: Tier[];
  variants?: Variant[];
  slug: string;
  itemId: number;
};

function formatIDR(amount: number): string {
  if (amount >= 1000000) return `Rp ${(amount / 1000000).toFixed(amount % 1000000 === 0 ? 0 : 1)} jt`;
  if (amount >= 1000) return `Rp ${(amount / 1000).toFixed(amount % 1000 === 0 ? 0 : 1)}K`;
  return `Rp ${amount.toLocaleString("id-ID")}`;
}

function getActiveTier(tiers: Tier[], qty: number): Tier | null {
  return tiers.find((t) => qty >= t.minQty && qty <= t.maxQty) ?? null;
}

export default function ItemPriceCalculator(props: Props) {
  const hasVariants = (props.variants?.length ?? 0) > 0;

  const [qty, setQty] = useState(1);
  const [selectedVariantId, setSelectedVariantId] = useState<number | null>(
    hasVariants ? props.variants![0].id : null
  );

  const selectedVariant = hasVariants
    ? props.variants!.find((v) => v.id === selectedVariantId) ?? props.variants![0]
    : null;

  const activeTier = getActiveTier(props.tiers, qty);

  // Hitung harga final
  let price = 0;
  // Jika tipe paket, quantity paksa jadi 1
  const effectiveQty = props.tipe === "paket" ? 1 : qty;

  if (hasVariants && selectedVariant) {
    // Variant = harga per durasi × effectiveQty
    price = selectedVariant.harga * effectiveQty;
  } else if (props.tipe === "paket") {
    price = props.hargaPaket ?? 0;
  } else if (props.tiers.length > 0) {
    const tier = activeTier;
    const tierPricePerUnit = tier ? tier.harga : props.tiers[props.tiers.length - 1].harga;
    price = tierPricePerUnit * effectiveQty;
  } else {
    const rate = (props.hargaBatch ?? 0) / (props.jumlahBatch ?? 1);
    price = Math.ceil(rate * effectiveQty);
  }

  const unit = props.satuanLabel ?? "unit";

  return (
    <div className="price-card">

      {/* ===== CASE 1: Ada Variants (pilih durasi + qty) ===== */}
      {hasVariants ? (
        <>
          <div style={{ marginBottom: 16 }}>
            <div className="price-card-label" style={{ marginBottom: 8 }}>Pilih Durasi / Varian:</div>
            <select
              value={selectedVariantId || ""}
              onChange={(e) => setSelectedVariantId(Number(e.target.value))}
              style={{
                width: "100%", padding: "10px 14px", borderRadius: 10,
                background: "rgba(0,0,0,0.02)", border: "1px solid rgba(0,0,0,0.08)",
                color: "white", fontSize: 15, outline: "none", cursor: "pointer",
                fontWeight: 600,
              }}
            >
              {props.variants!.map(v => (
                <option key={v.id} value={v.id} style={{ background: "#18181b", color: "white" }}>
                  {v.nama} — {formatIDR(v.harga)} {(props.tipe === "satuan" || props.tipe === "both") ? "/ paket" : ""}
                </option>
              ))}
            </select>
          </div>

          {(props.tipe === "satuan" || props.tipe === "both") && (
            <div className="qty-input-container" style={{ marginTop: 8 }}>
              <span className="qty-label">Jumlah ({unit}):</span>
              <div className="qty-control">
                <button className="qty-btn" onClick={() => setQty(Math.max(1, qty - 1))}>−</button>
                <input
                  type="number"
                  className="qty-value"
                  value={qty}
                  min={1}
                  onChange={(e) => setQty(Math.max(1, Number(e.target.value)))}
                />
                <button className="qty-btn" onClick={() => setQty(qty + 1)}>+</button>
              </div>
            </div>
          )}

          <div className="price-estimate">
            {(props.tipe === "satuan" || props.tipe === "both") ? (
              <span className="price-estimate-label">
                {qty} {unit} × {selectedVariant ? formatIDR(selectedVariant.harga) : "—"}:
              </span>
            ) : (
              <span className="price-estimate-label">Harga Final:</span>
            )}
            <span className="price-estimate-amount">{formatIDR(price)}</span>
          </div>
        </>

      ) : props.tipe === "paket" ? (
        /* ===== CASE 2: Paket flat (misal: Abyss) ===== */
        <>
          <div className="price-card-label">Harga Paket</div>
          <div className="price-card-amount">{formatIDR(price)}</div>
          <div className="price-card-unit">Flat — tidak berdasarkan jumlah</div>
        </>

      ) : (
        /* ===== CASE 3: Satuan / Tiered tanpa variant ===== */
        <>
          <div className="price-card-label">Rate Harga</div>
          {props.tiers.length > 0 ? (
            <>
              <div className="price-card-amount">
                {formatIDR(activeTier?.harga ?? props.tiers[0].harga)}
              </div>
              <div className="price-card-unit">
                per paket {activeTier ? `(${activeTier.minQty}–${activeTier.maxQty} ${unit})` : "(diluar tier)"}
              </div>
            </>
          ) : (
            <>
              <div className="price-card-amount">{formatIDR(props.hargaBatch ?? 0)}</div>
              <div className="price-card-unit">
                per {props.jumlahBatch} {unit}
              </div>
            </>
          )}

          <div className="qty-input-container" style={{ marginTop: 20 }}>
            <span className="qty-label">Jumlah ({unit}):</span>
            <div className="qty-control">
              <button className="qty-btn" onClick={() => setQty(Math.max(1, qty - 1))}>−</button>
              <input
                type="number"
                className="qty-value"
                value={qty}
                min={1}
                onChange={(e) => setQty(Math.max(1, Number(e.target.value)))}
              />
              <button className="qty-btn" onClick={() => setQty(qty + 1)}>+</button>
            </div>
          </div>

          <div className="price-estimate">
            <span className="price-estimate-label">
              Estimasi harga untuk {qty} {unit}:
            </span>
            <span className="price-estimate-amount">{formatIDR(price)}</span>
          </div>

          {props.tiers.length > 0 && (
            <>
              <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text-secondary)", marginBottom: 12, marginTop: 20 }}>
                📊 Tabel Harga Tiered
              </div>
              <table className="tier-table">
                <thead>
                  <tr>
                    <th>Rentang Jumlah</th>
                    <th>Harga</th>
                  </tr>
                </thead>
                <tbody>
                  {props.tiers.map((tier) => (
                    <tr key={tier.id} className={activeTier?.id === tier.id ? "tier-active" : ""}>
                      <td>
                        {tier.minQty} – {tier.maxQty} {unit}
                        {activeTier?.id === tier.id && (
                          <span style={{ marginLeft: 8, fontSize: 10, background: "rgba(74, 107, 85, 0.15)", color: "var(--accent-primary)", padding: "2px 8px", borderRadius: "100px", fontWeight: 700 }}>
                            ← Aktif
                          </span>
                        )}
                      </td>
                      <td style={{ fontWeight: activeTier?.id === tier.id ? 700 : 400 }}>
                        {formatIDR(tier.harga)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </>
          )}
        </>
      )}

      {/* CALL TO ACTION */}
      <div style={{ marginTop: 24, paddingTop: 24, borderTop: "1px solid var(--border)", textAlign: "center" }}>
        <a
          href={`/game/${props.slug}/item/${props.itemId}/checkout?qty=${qty}${selectedVariantId ? `&variantId=${selectedVariantId}` : ""}`}
          className="btn-primary"
          style={{ width: "100%", justifyContent: "center", padding: "14px 24px", fontSize: 16 }}
        >
          Lanjut ke Checkout
        </a>
      </div>
    </div>
  );
}
