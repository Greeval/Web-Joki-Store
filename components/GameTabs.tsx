"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ChevronDown, MessageCircle } from "lucide-react";

type ItemTier = {
  id: number;
  minQty: number;
  maxQty: number;
  harga: number;
};

type Item = {
  id: number;
  nama: string;
  tipe: string;
  satuanLabel: string | null;
  hargaBatch: number | null;
  jumlahBatch: number | null;
  hargaPaket: number | null;
  refundPolicy: string;
  deskripsi: string | null;
  tiers: ItemTier[];
  variants?: { id: number; nama: string; harga: number }[];
  prerequisites: { id: number; deskripsiSyarat: string; wajibDicentang: boolean }[];
};

type Category = {
  id: number;
  nama: string;
  displayType: string;
  items: Item[];
};

function formatIDR(amount: number): string {
  if (amount >= 1000000) return `Rp ${(amount / 1000000).toFixed(amount % 1000000 === 0 ? 0 : 1)}jt`;
  if (amount >= 1000) return `Rp ${(amount / 1000).toFixed(amount % 1000 === 0 ? 0 : 1)}K`;
  return `Rp ${amount.toLocaleString("id-ID")}`;
}

function getPriceDisplay(item: Item): { label: string; unit: string } {
  if (item.tipe === "paket") {
    return {
      label: formatIDR(item.hargaPaket ?? 0),
      unit: "flat / paket",
    };
  }
  if (item.variants && item.variants.length > 0) {
    const minPrice = Math.min(...item.variants.map((v) => v.harga));
    const maxPrice = Math.max(...item.variants.map((v) => v.harga));
    return {
      label: minPrice === maxPrice ? formatIDR(minPrice) : `${formatIDR(minPrice)} – ${formatIDR(maxPrice)}`,
      unit: `per ${item.satuanLabel ?? "paket"}`,
    };
  }
  if (item.tiers.length > 0) {
    const minPrice = Math.min(...item.tiers.map((t) => t.harga));
    const maxPrice = Math.max(...item.tiers.map((t) => t.harga));
    return {
      label: minPrice === maxPrice ? formatIDR(minPrice) : `${formatIDR(minPrice)} – ${formatIDR(maxPrice)}`,
      unit: `per paket (tiered)`,
    };
  }
  const rate = (item.hargaBatch ?? 0) / (item.jumlahBatch ?? 1);
  return {
    label: formatIDR(item.hargaBatch ?? 0),
    unit: `per ${item.jumlahBatch} ${item.satuanLabel ?? "unit"}`,
  };
}

function RefundBadge({ policy }: { policy: string }) {
  if (policy === "no_refund") return <span className="refund-badge refund-no">✕ No Refund</span>;
  if (policy === "partial_50") return <span className="refund-badge refund-partial">◑ Refund 50%</span>;
  return <span className="refund-badge refund-full">✓ Full Refund</span>;
}

function ItemCard({ item, gameSlug }: { item: Item; gameSlug: string }) {
  const price = getPriceDisplay(item);
  return (
    <div className="item-card">
      <div className="item-card-header">
        <div className="item-card-name">{item.nama}</div>
        <span className={`item-type-badge item-type-${item.tipe}`}>
          {item.tipe === "paket" ? "Paket" : "Satuan"}
        </span>
      </div>
      {item.deskripsi && (
        <div className="item-card-desc">{item.deskripsi}</div>
      )}
      <div className="item-card-price">
        <span className="price-amount">{price.label}</span>
        <span className="price-unit">{price.unit}</span>
      </div>
      {item.tiers.length > 0 && (
        <div style={{ fontSize: 11, color: "var(--accent-cyan-light)", marginTop: 4, fontWeight: 600 }}>
          📊 Tiered pricing tersedia
        </div>
      )}
      <div className="item-card-footer">
        <RefundBadge policy={item.refundPolicy} />
        <Link href={`/game/${gameSlug}/item/${item.id}`} className="btn-order">
          <MessageCircle size={13} />
          Detail & Pesan
        </Link>
      </div>
    </div>
  );
}

function AccordionSection({ category, gameSlug }: { category: Category; gameSlug: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ padding: "0 40px 8px" }}>
      <div className="accordion-item">
        <button
          className="accordion-header"
          onClick={() => setOpen(!open)}
          id={`accordion-${category.id}`}
        >
          <span>
            {category.nama}
            <span style={{ color: "var(--text-muted)", fontSize: 13, fontWeight: 400, marginLeft: 8 }}>
              ({category.items.length} item)
            </span>
          </span>
          <ChevronDown
            size={18}
            className={`accordion-chevron ${open ? "open" : ""}`}
          />
        </button>
        {open && (
          <div className="accordion-content open">
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
                gap: 16,
                paddingTop: 8,
              }}
            >
              {category.items.map((item) => (
                <ItemCard key={item.id} item={item} gameSlug={gameSlug} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function GameTabs({
  categories,
  gameSlug,
  initialTab,
}: {
  categories: Category[];
  gameSlug: string;
  initialTab?: number;
}) {
  const tabCategories = categories.filter((c) => c.displayType === "tab");
  const accordionCategories = categories.filter((c) => c.displayType === "accordion");

  const allTabs = [
    ...tabCategories,
    ...(accordionCategories.length > 0
      ? [{ id: -1, nama: "Explore Map", displayType: "accordion", items: [] }]
      : []),
  ];

  const router = useRouter();

  const [activeTab, setActiveTab] = useState(
    initialTab !== undefined 
      ? initialTab 
      : tabCategories.length > 0 ? tabCategories[0].id : -1
  );

  useEffect(() => {
    if (initialTab !== undefined) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  const handleTabChange = (catId: number) => {
    setActiveTab(catId);
    router.replace(`?tab=${catId}`, { scroll: false });
  };

  const activeCategory = tabCategories.find((c) => c.id === activeTab);

  return (
    <>
      <div className="tabs-container">
        {tabCategories.map((cat) => (
          <button
            key={cat.id}
            className={`tab-btn ${activeTab === cat.id ? "active" : ""}`}
            onClick={() => handleTabChange(cat.id)}
            id={`tab-${cat.id}`}
          >
            {cat.nama}
            <span
              style={{
                fontSize: 11,
                background: activeTab === cat.id ? "rgba(74, 107, 85, 0.15)" : "rgba(0, 0, 0, 0.04)",
                color: activeTab === cat.id ? "var(--accent-primary)" : "var(--text-muted)",
                padding: "2px 8px",
                borderRadius: "100px",
                fontWeight: 600,
              }}
            >
              {cat.items.length}
            </span>
          </button>
        ))}
        {accordionCategories.length > 0 && (
          <button
            className={`tab-btn ${activeTab === -1 ? "active" : ""}`}
            onClick={() => handleTabChange(-1)}
            id="tab-explore"
          >
            Explore Map
            <span
              style={{
                fontSize: 11,
                background: activeTab === -1 ? "rgba(74, 107, 85, 0.15)" : "rgba(0, 0, 0, 0.04)",
                color: activeTab === -1 ? "var(--accent-purple-light)" : "var(--text-muted)",
                padding: "2px 8px",
                borderRadius: "100px",
                fontWeight: 600,
              }}
            >
              {accordionCategories.reduce((acc, c) => acc + c.items.length, 0)}
            </span>
          </button>
        )}
      </div>

      {/* TAB CONTENT */}
      {activeTab !== -1 && activeCategory && (
        <div className="items-grid">
          {activeCategory.items.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">📦</div>
              <div className="empty-state-title">Belum ada item di kategori ini</div>
            </div>
          ) : (
            activeCategory.items.map((item) => (
              <ItemCard key={item.id} item={item} gameSlug={gameSlug} />
            ))
          )}
        </div>
      )}

      {/* ACCORDION CONTENT */}
      {activeTab === -1 && (
        <div style={{ paddingTop: 24, paddingBottom: 40 }}>
          {accordionCategories.map((cat) => (
            <AccordionSection key={cat.id} category={cat} gameSlug={gameSlug} />
          ))}
        </div>
      )}
    </>
  );
}
