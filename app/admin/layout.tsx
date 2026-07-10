"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, ShoppingCart, MessageSquare, Gamepad2, ImageIcon, Star, Settings } from "lucide-react";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const navs = [
    { label: "Dashboard", href: "/admin", icon: <LayoutDashboard size={18} /> },
    { label: "Pesanan", href: "/admin/orders", icon: <ShoppingCart size={18} /> },
    { label: "Nego", href: "/admin/nego", icon: <MessageSquare size={18} /> },
    { label: "Layanan", href: "/admin/services", icon: <Gamepad2 size={18} /> },
    { label: "Banner Promo", href: "/admin/banners", icon: <ImageIcon size={18} /> },
    { label: "Testimoni", href: "/admin/testimoni", icon: <Star size={18} /> },
    { label: "Pengaturan", href: "/admin/settings", icon: <Settings size={18} /> },
  ];

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      {/* Admin Top Nav */}
      <div style={{
        marginTop: 64,
        background: "var(--bg-secondary)",
        backdropFilter: "blur(12px)",
        borderBottom: "1px solid var(--border)",
        padding: "0 24px",
        position: "sticky",
        top: 64,
        zIndex: 40,
      }}>
        <div style={{ maxWidth: 1000, margin: "0 auto", display: "flex", gap: 8, overflowX: "auto" }}>
          {navs.map(nav => {
            const isActive = pathname === nav.href || (nav.href !== "/admin" && pathname.startsWith(nav.href));
            return (
              <Link
                key={nav.href}
                href={nav.href}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "16px 20px",
                  color: isActive ? "var(--accent-primary)" : "var(--text-secondary)",
                  borderBottom: isActive ? "2px solid var(--accent-primary)" : "2px solid transparent",
                  textDecoration: "none",
                  fontWeight: isActive ? 700 : 500,
                  fontSize: 14,
                  whiteSpace: "nowrap",
                  transition: "all 0.2s"
                }}
              >
                {nav.icon}
                {nav.label}
              </Link>
            );
          })}
        </div>
      </div>

      {/* Main Content */}
      <div style={{ flex: 1, padding: "32px 24px" }}>
        <div style={{ maxWidth: 1000, margin: "0 auto" }}>
          {children}
        </div>
      </div>
    </div>
  );
}
