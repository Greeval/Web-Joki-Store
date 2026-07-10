"use client";

import { useState } from "react";
import { Search } from "lucide-react";

export default function HomeSearch() {
  const [query, setQuery] = useState("");

  function handleSearch(e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value.toLowerCase();
    setQuery(val);
    const cards = document.querySelectorAll<HTMLElement>(".game-card");
    cards.forEach((card) => {
      const name = card.querySelector(".game-card-name")?.textContent?.toLowerCase() ?? "";
      card.style.display = name.includes(val) ? "block" : "none";
    });
  }

  return (
    <div className="search-container">
      <Search size={16} className="search-icon" />
      <input
        type="text"
        placeholder="Cari game..."
        value={query}
        onChange={handleSearch}
        className="search-input"
        id="search-game"
      />
    </div>
  );
}
