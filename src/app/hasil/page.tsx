"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

type HasilData = {
  nim: string;
  skor: number;
  benar: number;
  totalSoal: number;
  timestamp: string;
};

export default function HasilPage() {
  const router = useRouter();
  const [hasil, setHasil] = useState<HasilData | null>(null);

  useEffect(() => {
    const data = sessionStorage.getItem("quiz_hasil");
    if (!data) {
      router.replace("/");
      return;
    }
    setHasil(JSON.parse(data));
    // Bersihkan session setelah diambil
    sessionStorage.removeItem("quiz_nim");
    sessionStorage.removeItem("quiz_hasil");
  }, [router]);

  if (!hasil) return null;

  const grade =
    hasil.skor >= 85 ? { label: "A", color: "text-green-600", bg: "bg-green-50" } :
    hasil.skor >= 70 ? { label: "B", color: "text-blue-600", bg: "bg-blue-50" } :
    hasil.skor >= 55 ? { label: "C", color: "text-amber-600", bg: "bg-amber-50" } :
    hasil.skor >= 40 ? { label: "D", color: "text-orange-600", bg: "bg-orange-50" } :
                       { label: "E", color: "text-red-600", bg: "bg-red-50" };

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-950 to-indigo-900 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md text-center">
        {/* Grade */}
        <div className={`w-24 h-24 ${grade.bg} rounded-full flex items-center justify-center mx-auto mb-4`}>
          <span className={`text-5xl font-black ${grade.color}`}>{grade.label}</span>
        </div>

        <h1 className="text-2xl font-bold text-gray-900 mb-1">Quiz Selesai!</h1>
        <p className="text-gray-500 text-sm mb-6">NIM: {hasil.nim}</p>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-gray-50 rounded-xl p-4">
            <p className="text-3xl font-black text-indigo-600">{hasil.skor}</p>
            <p className="text-xs text-gray-500 mt-1">Skor</p>
          </div>
          <div className="bg-gray-50 rounded-xl p-4">
            <p className="text-3xl font-black text-green-600">{hasil.benar}</p>
            <p className="text-xs text-gray-500 mt-1">Benar</p>
          </div>
          <div className="bg-gray-50 rounded-xl p-4">
            <p className="text-3xl font-black text-gray-400">{hasil.totalSoal - hasil.benar}</p>
            <p className="text-xs text-gray-500 mt-1">Salah</p>
          </div>
        </div>

        <Link
          href="/leaderboard"
          className="block w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-xl transition-colors duration-200"
        >
          Lihat Leaderboard 🏆
        </Link>
      </div>
    </main>
  );
}
