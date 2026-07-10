"use client";

import Link from "next/link";
import { useState } from "react";
import { MessageCircle, Gamepad2, Menu, X } from "lucide-react";
import ThemeToggle from "@/components/ThemeToggle";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="navbar">
      <Link href="/" className="navbar-brand">
        <div className="logo-icon">
          <Gamepad2 size={18} />
        </div>
        Greeval Store
      </Link>
      
      {/* Desktop Menu */}
      <div className="navbar-links">
        <Link href="/" className="navbar-link">Beranda</Link>
        <Link href="/#games" className="navbar-link">Games</Link>
        <Link href="/admin" className="navbar-link">Admin</Link>
        <a
          href="https://wa.me/62812345678?text=Halo%20Greeval%20Store%2C%20saya%20ingin%20bertanya%20tentang%20jasa%20joki"
          target="_blank"
          rel="noopener noreferrer"
          className="btn-wa"
        >
          <MessageCircle size={16} />
          WhatsApp
        </a>
      </div>

      <div className="navbar-actions" style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <ThemeToggle />
        <button
          className="menu-toggle-btn"
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Toggle menu"
          style={{
            background: "none",
            border: "none",
            color: "var(--text-primary)",
            cursor: "pointer",
            padding: 4,
            display: "none", // Will be shown on mobile via media query
            alignItems: "center",
            justifyContent: "center"
          }}
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {isOpen && (
        <div className="mobile-menu">
          <Link href="/" className="mobile-link" onClick={() => setIsOpen(false)}>Beranda</Link>
          <Link href="/#games" className="mobile-link" onClick={() => setIsOpen(false)}>Games</Link>
          <Link href="/admin" className="mobile-link" onClick={() => setIsOpen(false)}>Admin</Link>
          <a
            href="https://wa.me/62812345678?text=Halo%20Greeval%20Store%2C%20saya%20ingin%20bertanya%20tentang%20jasa%20joki"
            target="_blank"
            rel="noopener noreferrer"
            className="mobile-btn-wa"
            onClick={() => setIsOpen(false)}
          >
            <MessageCircle size={16} />
            WhatsApp
          </a>
        </div>
      )}
    </nav>
  );
}
