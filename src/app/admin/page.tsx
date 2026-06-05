"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";

type HasilItem = {
  no: number;
  nim: string;
  skor: number;
  total_soal: number;
  timestamp: string;
};

type Statistik = {
  totalPeserta: number;
  rataRata: number;
  tertinggi: number;
  terendah: number;
  lulus: number;
};

export default function AdminPage() {
  const router = useRouter();
  const [hasil, setHasil] = useState<HasilItem[]>([]);
  const [statistik, setStatistik] = useState<Statistik | null>(null);
  const [loading, setLoading] = useState(true);
  const [resetting, setResetting] = useState(false);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<"skor" | "nim" | "timestamp">("skor");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/hasil");
      if (res.status === 401) {
        router.replace("/admin/login");
        return;
      }
      const data = await res.json();
      setHasil(data.hasil || []);
      setStatistik(data.statistik || null);
      setLastUpdate(new Date());
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 15000);
    return () => clearInterval(interval);
  }, [fetchData]);

  async function handleLogout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.replace("/admin/login");
  }

  async function handleReset() {
    const confirm1 = window.confirm("⚠️ Reset akan menghapus SEMUA data hasil quiz!\n\nLanjutkan?");
    if (!confirm1) return;
    const confirm2 = window.confirm("Yakin? Data yang dihapus tidak bisa dikembalikan.");
    if (!confirm2) return;

    setResetting(true);
    try {
      const res = await fetch("/api/admin/reset", { method: "POST" });
      const data = await res.json();
      if (data.success) {
        alert("✅ Data berhasil direset");
        fetchData();
      }
    } catch {
      alert("Gagal reset");
    } finally {
      setResetting(false);
    }
  }

  function handleExportCSV() {
    if (hasil.length === 0) return;

    const header = ["No", "NIM", "Skor", "Total Soal", "Benar", "Timestamp"];
    const rows = hasil.map((h) => [
      h.no,
      h.nim,
      h.skor,
      h.total_soal,
      Math.round((h.skor / 100) * h.total_soal),
      new Date(h.timestamp).toLocaleString("id-ID"),
    ]);

    const csvContent = [header, ...rows]
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `hasil_quiz_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }

  // Filter + Sort
  const hasilFiltered = hasil
    .filter((h) => h.nim.includes(search))
    .sort((a, b) => {
      let val = 0;
      if (sortBy === "skor") val = a.skor - b.skor;
      else if (sortBy === "nim") val = a.nim.localeCompare(b.nim);
      else val = new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
      return sortDir === "asc" ? val : -val;
    });

  function toggleSort(col: "skor" | "nim" | "timestamp") {
    if (sortBy === col) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortBy(col); setSortDir("desc"); }
  }

  const SortIcon = ({ col }: { col: string }) =>
    sortBy === col ? (sortDir === "asc" ? " ↑" : " ↓") : " ↕";

  const gradeColor = (skor: number) =>
    skor >= 85 ? "bg-green-100 text-green-800" :
    skor >= 70 ? "bg-blue-100 text-blue-800" :
    skor >= 55 ? "bg-amber-100 text-amber-800" :
    "bg-red-100 text-red-800";

  return (
    <main className="min-h-screen bg-slate-100 text-slate-800">
      {/* Navbar */}
      <nav className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="font-bold text-lg">📊 Admin Panel</h1>
          {lastUpdate && (
            <p className="text-slate-400 text-xs">
              Update: {lastUpdate.toLocaleTimeString("id-ID")} · auto 15s
            </p>
          )}
        </div>
        <button
          onClick={handleLogout}
          className="text-slate-300 hover:text-white text-sm transition-colors cursor-pointer"
        >
          Logout →
        </button>
      </nav>

      <div className="max-w-6xl mx-auto p-6 space-y-6">
        {/* Statistik Cards */}
        {statistik && (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {[
              { label: "Total Peserta", value: statistik.totalPeserta, color: "text-slate-800" },
              { label: "Rata-rata", value: statistik.rataRata, color: "text-indigo-700" },
              { label: "Tertinggi", value: statistik.tertinggi, color: "text-green-700" },
              { label: "Terendah", value: statistik.terendah, color: "text-red-700" },
              { label: "Lulus (≥55)", value: statistik.lulus, color: "text-amber-700" },
            ].map((stat) => (
              <div key={stat.label} className="bg-white rounded-xl p-4 shadow-sm text-center">
                <p className={`text-3xl font-black ${stat.color}`}>{stat.value}</p>
                <p className="text-xs text-gray-500 mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        )}

        {/* Actions + Search */}
        <div className="flex flex-wrap gap-3 items-center justify-between">
          <input
            type="text"
            placeholder="Cari NIM..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="px-4 py-2 border border-gray-300 bg-white rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-slate-400 w-48 text-slate-950"
          />
          <div className="flex gap-3">
            <button
              onClick={fetchData}
              className="bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium px-4 py-2 rounded-xl text-sm transition-colors cursor-pointer"
            >
              🔄 Refresh
            </button>
            <button
              onClick={handleExportCSV}
              disabled={hasil.length === 0}
              className="bg-green-600 hover:bg-green-700 disabled:bg-gray-300 text-white font-medium px-4 py-2 rounded-xl text-sm transition-colors cursor-pointer"
            >
              ⬇️ Export CSV
            </button>
            <button
              onClick={handleReset}
              disabled={resetting}
              className="bg-red-600 hover:bg-red-700 disabled:bg-red-300 text-white font-medium px-4 py-2 rounded-xl text-sm transition-colors cursor-pointer"
            >
              {resetting ? "Mereset..." : "🗑️ Reset Quiz"}
            </button>
          </div>
        </div>

        {/* Tabel Hasil */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-12 text-center text-gray-500">
              <div className="w-8 h-8 border-4 border-slate-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
              Memuat data...
            </div>
          ) : hasilFiltered.length === 0 ? (
            <div className="p-12 text-center text-gray-400">
              {search ? `Tidak ada NIM "${search}"` : "Belum ada yang mengerjakan quiz"}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 border-b">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">No</th>
                    <th
                      className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase cursor-pointer hover:text-gray-800"
                      onClick={() => toggleSort("nim")}
                    >
                      NIM<SortIcon col="nim" />
                    </th>
                    <th
                      className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase cursor-pointer hover:text-gray-800"
                      onClick={() => toggleSort("skor")}
                    >
                      Skor<SortIcon col="skor" />
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase">Benar</th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase">Grade</th>
                    <th
                      className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase cursor-pointer hover:text-gray-800"
                      onClick={() => toggleSort("timestamp")}
                    >
                      Waktu Submit<SortIcon col="timestamp" />
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {hasilFiltered.map((h) => {
                    const benar = Math.round((h.skor / 100) * h.total_soal);
                    const grade =
                      h.skor >= 85 ? "A" :
                      h.skor >= 70 ? "B" :
                      h.skor >= 55 ? "C" :
                      h.skor >= 40 ? "D" : "E";
                    return (
                      <tr key={h.nim} className="hover:bg-slate-50 transition-colors">
                        <td className="px-4 py-3 text-gray-400 text-sm">{h.no}</td>
                        <td className="px-4 py-3 font-mono font-semibold text-gray-900">{h.nim}</td>
                        <td className="px-4 py-3 text-center">
                          <span className="font-bold text-gray-900">{h.skor}</span>
                        </td>
                        <td className="px-4 py-3 text-center text-sm text-gray-600">
                          {benar}/{h.total_soal}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className={`px-2 py-1 rounded-lg text-xs font-bold ${gradeColor(h.skor)}`}>
                            {grade}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right text-xs text-gray-500">
                          {new Date(h.timestamp).toLocaleString("id-ID")}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Footer */}
          {hasilFiltered.length > 0 && (
            <div className="px-4 py-3 bg-slate-50 border-t text-xs text-gray-500 text-right">
              Menampilkan {hasilFiltered.length} dari {hasil.length} peserta
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
