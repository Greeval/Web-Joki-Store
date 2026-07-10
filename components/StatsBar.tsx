"use client";

import { useState, useEffect } from "react";

type Stats = {
  orderSelesai: number;
  gameTersedia: number;
  kepuasan: number | null;
  totalRatings: number;
};

function formatCount(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k+`;
  if (n > 0) return `${n}+`;
  return "0";
}

export default function StatsBar({ gameCount }: { gameCount: number }) {
  const [stats, setStats] = useState<Stats>({
    orderSelesai: 0,
    gameTersedia: gameCount,
    kepuasan: null,
    totalRatings: 0,
  });

  useEffect(() => {
    fetch("/api/stats")
      .then((r) => r.json())
      .then((data: Stats) => setStats(data))
      .catch(() => {});
  }, []);

  return (
    <div className="stats-bar">
      <div className="stat-item">
        <div className="stat-value">
          {stats.orderSelesai > 0 ? formatCount(stats.orderSelesai) : "500+"}
        </div>
        <div className="stat-label">Order Selesai</div>
      </div>
      <div className="stat-item">
        <div className="stat-value">{stats.gameTersedia || gameCount}</div>
        <div className="stat-label">Game Tersedia</div>
      </div>
      <div className="stat-item">
        <div className="stat-value">
          {stats.kepuasan !== null ? `${stats.kepuasan}%` : "99%"}
        </div>
        <div className="stat-label">
          Tingkat Kepuasan
          {stats.totalRatings > 0 && (
            <span style={{ fontSize: 10, display: "block", opacity: 0.6 }}>
              dari {stats.totalRatings} ulasan
            </span>
          )}
        </div>
      </div>
      <div className="stat-item">
        <div className="stat-value">24/7</div>
        <div className="stat-label">Siap Dikerjakan</div>
      </div>
    </div>
  );
}
