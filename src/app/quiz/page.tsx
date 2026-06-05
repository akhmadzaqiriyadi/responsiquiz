"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { Soal } from "@/types";
import { useAntiCheat } from "@/hooks/useAntiCheat";

const WAKTU_PER_SOAL = 30; // detik per soal

export default function QuizPage() {
  const router = useRouter();
  const [nim, setNim] = useState("");
  const [soal, setSoal] = useState<Soal[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [jawaban, setJawaban] = useState<Record<string, string>>({});
  const [waktu, setWaktu] = useState(WAKTU_PER_SOAL);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [violations, setViolations] = useState(0);
  const [showViolationWarning, setShowViolationWarning] = useState(false);
  const [error, setError] = useState("");
  const submitLock = useRef(false);

  // Submit jawaban
  const handleSubmit = useCallback(async (jawabanFinal: Record<string, string>, soalFinal: Soal[]) => {
    if (submitLock.current) return;
    submitLock.current = true;
    setSubmitting(true);

    try {
      const res = await fetch("/api/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nim: sessionStorage.getItem("quiz_nim"),
          jawaban: jawabanFinal,
          soal: soalFinal,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Gagal submit");
        setSubmitting(false);
        submitLock.current = false;
        return;
      }

      // Simpan hasil ke sessionStorage untuk halaman /hasil
      sessionStorage.setItem("quiz_hasil", JSON.stringify(data));
      router.push("/hasil");
    } catch {
      setError("Koneksi bermasalah, coba lagi");
      setSubmitting(false);
      submitLock.current = false;
    }
  }, [router]);

  // Anti-cheat
  useAntiCheat({
    nim,
    maxViolations: 3,
    onViolation: (count) => {
      setViolations(count);
      setShowViolationWarning(true);
      setTimeout(() => setShowViolationWarning(false), 3000);
    },
    onForceSubmit: () => {
      handleSubmit(jawaban, soal);
    },
  });

  // Load NIM + soal
  useEffect(() => {
    const savedNim = sessionStorage.getItem("quiz_nim");
    if (!savedNim) {
      router.replace("/");
      return;
    }
    setNim(savedNim);

    fetch("/api/soal")
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || "Gagal memuat soal");
        }
        return data;
      })
      .then((data) => {
        if (data.soal) {
          setSoal(data.soal);
        } else {
          throw new Error("Format data soal tidak valid");
        }
        setLoading(false);
      })
      .catch((err: any) => {
        setError(err.message || "Gagal memuat soal");
        setLoading(false);
      });
  }, [router]);

  // Timer countdown per soal
  useEffect(() => {
    if (loading || submitting || soal.length === 0) return;

    setWaktu(WAKTU_PER_SOAL);
    const interval = setInterval(() => {
      setWaktu((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          // Auto next soal atau submit kalau soal terakhir
          setCurrentIndex((idx) => {
            const nextIdx = idx + 1;
            if (nextIdx >= soal.length) {
              handleSubmit(jawaban, soal);
            }
            return Math.min(nextIdx, soal.length - 1);
          });
          return WAKTU_PER_SOAL;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [currentIndex, loading, submitting, soal, jawaban, handleSubmit]);

  function pilihJawaban(soalId: string, key: string) {
    setJawaban((prev) => ({ ...prev, [soalId]: key }));
  }

  function handleNext() {
    if (currentIndex < soal.length - 1) {
      setCurrentIndex((i) => i + 1);
    } else {
      handleSubmit(jawaban, soal);
    }
  }

  const soalSekarang = soal[currentIndex];
  const progress = soal.length > 0 ? ((currentIndex + 1) / soal.length) * 100 : 0;
  const timerColor = waktu <= 10 ? "text-red-600" : waktu <= 20 ? "text-amber-500" : "text-green-600";

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-center text-white">
          <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-lg">Memuat soal...</p>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
        <div className="bg-red-900 text-white rounded-2xl p-8 max-w-md text-center">
          <p className="text-xl font-bold mb-2">Terjadi Kesalahan</p>
          <p className="text-red-200">{error}</p>
        </div>
      </main>
    );
  }

  if (submitting) {
    return (
      <main className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-center text-white">
          <div className="w-12 h-12 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-lg">Menyimpan jawaban...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-950 flex items-center justify-center p-4 select-none">
      {/* Violation Warning */}
      {showViolationWarning && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-red-600 text-white px-6 py-3 rounded-xl shadow-2xl animate-bounce">
          ⚠️ Peringatan {violations}/3 — Jangan berpindah tab!
        </div>
      )}

      <div className="w-full max-w-2xl">
        {/* Header: NIM + Progress + Timer */}
        <div className="flex items-center justify-between mb-4 text-white">
          <div>
            <p className="text-xs text-gray-400">NIM</p>
            <p className="font-mono font-bold">{nim}</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-gray-400">Soal</p>
            <p className="font-bold">{currentIndex + 1} / {soal.length}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-400">Waktu</p>
            <p className={`font-mono text-2xl font-bold ${timerColor}`}>{waktu}s</p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-gray-800 rounded-full h-2 mb-6">
          <div
            className="bg-indigo-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Soal Card */}
        <div className="bg-white rounded-2xl shadow-2xl p-6 mb-4">
          <p className="text-xs text-indigo-600 font-semibold uppercase tracking-wide mb-3">
            Pertanyaan {currentIndex + 1}
          </p>
          <p className="text-gray-900 text-lg font-medium leading-relaxed mb-6">
            {soalSekarang?.pertanyaan}
          </p>

          {/* Opsi */}
          <div className="space-y-3">
            {soalSekarang?.opsi.map((opsi, index) => {
              const dipilih = jawaban[soalSekarang.id] === opsi.key;
              const labelHuruf = ["A", "B", "C", "D"][index];
              return (
                <button
                  key={opsi.key}
                  onClick={() => pilihJawaban(soalSekarang.id, opsi.key)}
                  className={`w-full text-left px-4 py-3 rounded-xl border-2 transition-all duration-150 font-medium
                    ${dipilih
                      ? "border-indigo-600 bg-indigo-50 text-indigo-900"
                      : "border-gray-200 bg-white text-gray-700 hover:border-indigo-300 hover:bg-indigo-50"
                    }`}
                >
                  <span className={`inline-block w-7 h-7 rounded-full text-sm font-bold mr-3 text-center leading-7
                    ${dipilih ? "bg-indigo-600 text-white" : "bg-gray-100 text-gray-600"}`}>
                    {labelHuruf}
                  </span>
                  {opsi.text}
                </button>
              );
            })}
          </div>
        </div>

        {/* Tombol Next / Submit */}
        <button
          onClick={handleNext}
          disabled={!jawaban[soalSekarang?.id]}
          className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-bold py-4 rounded-xl transition-colors duration-200 text-base"
        >
          {currentIndex < soal.length - 1 ? "Soal Berikutnya →" : "Submit Jawaban ✓"}
        </button>

        {/* Violations indicator */}
        {violations > 0 && (
          <p className="text-center text-red-400 text-xs mt-3">
            ⚠️ Pelanggaran: {violations}/3
          </p>
        )}
      </div>
    </main>
  );
}
