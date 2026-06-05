"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function HomePage() {
  const router = useRouter();
  const [nim, setNim] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const nimRegex = /^[0-9]{8,12}$/;

  function handleSubmit() {
    setError("");

    if (!nim.trim()) {
      setError("NIM tidak boleh kosong");
      return;
    }

    if (!nimRegex.test(nim.trim())) {
      setError("Format NIM tidak valid (8-12 digit angka)");
      return;
    }

    setLoading(true);
    sessionStorage.setItem("quiz_nim", nim.trim());
    router.push("/quiz");
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-950 to-indigo-900 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Quiz Responsi</h1>
          <p className="text-gray-500 mt-1 text-sm">Masukkan NIM kamu untuk memulai</p>
        </div>

        {/* Form */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              NIM Mahasiswa
            </label>
            <input
              type="text"
              value={nim}
              onChange={(e) => setNim(e.target.value.replace(/\D/g, ""))}
              onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
              placeholder="Contoh: 12345678"
              maxLength={12}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl text-gray-900 text-lg tracking-widest focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
            {error && (
              <p className="text-red-500 text-sm mt-1">{error}</p>
            )}
          </div>

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 text-white font-semibold py-3 rounded-xl transition-colors duration-200 text-base"
          >
            {loading ? "Memuat soal..." : "Mulai Quiz →"}
          </button>
        </div>

        {/* Warning */}
        <div className="mt-6 bg-amber-50 border border-amber-200 rounded-xl p-4">
          <p className="text-amber-800 text-xs font-medium mb-1">⚠️ Perhatian</p>
          <ul className="text-amber-700 text-xs space-y-1">
            <li>• Pastikan NIM yang kamu masukkan benar</li>
            <li>• Setiap NIM hanya bisa mengerjakan 1x</li>
            <li>• Jangan berpindah tab selama mengerjakan</li>
            <li>• Quiz akan otomatis submit jika waktu habis</li>
          </ul>
        </div>
      </div>
    </main>
  );
}
