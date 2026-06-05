"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { LeaderboardEntry } from "@/types";

const REFRESH_INTERVAL = 10000; // 10 detik

export default function LeaderboardPage() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  const fetchLeaderboard = useCallback(async () => {
    try {
      const res = await fetch("/api/leaderboard");
      const data = await res.json();
      if (data.leaderboard) {
        setLeaderboard(data.leaderboard);
        setLastUpdate(new Date());
      }
    } catch {
      // silent fail on refresh
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLeaderboard();
    const interval = setInterval(fetchLeaderboard, REFRESH_INTERVAL);
    return () => clearInterval(interval);
  }, [fetchLeaderboard]);

  const medalColor = (rank: number) =>
    rank === 1 ? "🥇" :
    rank === 2 ? "🥈" :
    rank === 3 ? "🥉" : `#${rank}`;

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-950 to-indigo-900 p-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center text-white mb-8 pt-8">
          <h1 className="text-3xl font-black mb-2">🏆 Leaderboard</h1>
          {lastUpdate && (
            <p className="text-indigo-300 text-xs">
              Update terakhir: {lastUpdate.toLocaleTimeString("id-ID")} · auto-refresh 10s
            </p>
          )}
        </div>

        {/* Top 3 Podium */}
        {leaderboard.length >= 3 && (
          <div className="flex items-end justify-center gap-4 mb-8">
            {/* 2nd */}
            <div className="text-center">
              <div className="bg-gray-300 text-gray-900 rounded-t-xl px-6 py-4 h-20 flex flex-col items-center justify-end">
                <p className="font-black text-lg">🥈</p>
                <p className="font-bold text-sm">{leaderboard[1]?.nim}</p>
                <p className="text-xs font-semibold">{leaderboard[1]?.skor}</p>
              </div>
            </div>
            {/* 1st */}
            <div className="text-center">
              <div className="bg-yellow-400 text-yellow-900 rounded-t-xl px-6 py-4 h-28 flex flex-col items-center justify-end">
                <p className="font-black text-2xl">🥇</p>
                <p className="font-bold">{leaderboard[0]?.nim}</p>
                <p className="text-sm font-black">{leaderboard[0]?.skor}</p>
              </div>
            </div>
            {/* 3rd */}
            <div className="text-center">
              <div className="bg-amber-600 text-amber-100 rounded-t-xl px-6 py-4 h-16 flex flex-col items-center justify-end">
                <p className="font-black">🥉</p>
                <p className="font-bold text-sm">{leaderboard[2]?.nim}</p>
                <p className="text-xs font-semibold">{leaderboard[2]?.skor}</p>
              </div>
            </div>
          </div>
        )}

        {/* Full List */}
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          {loading ? (
            <div className="p-12 text-center text-gray-500">
              <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
              Memuat leaderboard...
            </div>
          ) : leaderboard.length === 0 ? (
            <div className="p-12 text-center text-gray-400">
              Belum ada yang mengerjakan quiz
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Rank</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">NIM</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wide">Skor</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wide">Benar</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {leaderboard.map((entry) => (
                  <tr key={entry.nim} className={entry.rank <= 3 ? "bg-yellow-50" : "hover:bg-gray-50"}>
                    <td className="px-4 py-3 font-bold text-gray-700">
                      {typeof medalColor(entry.rank) === "string" && medalColor(entry.rank).startsWith("#")
                        ? <span className="text-gray-500">{medalColor(entry.rank)}</span>
                        : <span>{medalColor(entry.rank)}</span>
                      }
                    </td>
                    <td className="px-4 py-3 font-mono font-semibold text-gray-900">{entry.nim}</td>
                    <td className="px-4 py-3 text-right">
                      <span className="bg-indigo-100 text-indigo-800 font-bold px-2 py-1 rounded-lg text-sm">
                        {entry.skor}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right text-gray-600 text-sm">
                      {entry.skor > 0 ? Math.round((entry.skor / 100) * entry.total_soal) : 0}/{entry.total_soal}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="text-center mt-6">
          <Link href="/" className="text-indigo-300 hover:text-white text-sm transition-colors">
            ← Kembali ke Halaman Utama
          </Link>
        </div>
      </div>
    </main>
  );
}
