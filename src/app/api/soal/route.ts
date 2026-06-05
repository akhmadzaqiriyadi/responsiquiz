import { NextResponse } from "next/server";
import { getSheetsClient, SHEET_ID, SHEET_NAMES } from "@/lib/googleSheets";
import { SoalRaw, Soal } from "@/types";

function shuffleArray<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function transformSoal(raw: SoalRaw): Soal {
  const opsiOriginal = [
    { key: "a" as const, text: raw.opsi_a },
    { key: "b" as const, text: raw.opsi_b },
    { key: "c" as const, text: raw.opsi_c },
    { key: "d" as const, text: raw.opsi_d },
  ];

  // Acak urutan opsi
  const opsiAcak = shuffleArray(opsiOriginal);

  // Cari jawaban benar setelah diacak (berdasarkan key asli)
  const jawabanBenarKey = raw.jawaban_benar;

  return {
    id: raw.id,
    pertanyaan: raw.pertanyaan,
    opsi: opsiAcak,
    jawaban_benar: jawabanBenarKey,
  };
}

export async function GET() {
  try {
    const sheets = await getSheetsClient();
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: `${SHEET_NAMES.SOAL}!A2:G1000`,
    });

    const rows = response.data.values;
    if (!rows || rows.length === 0) {
      return NextResponse.json({ error: "Tidak ada soal tersedia" }, { status: 404 });
    }

    const soalRaw: SoalRaw[] = rows.map((row) => ({
      id: row[0],
      pertanyaan: row[1],
      opsi_a: row[2],
      opsi_b: row[3],
      opsi_c: row[4],
      opsi_d: row[5],
      jawaban_benar: row[6] as "a" | "b" | "c" | "d",
    }));

    // Acak urutan soal
    const soalAcak = shuffleArray(soalRaw).map(transformSoal);

    return NextResponse.json({ soal: soalAcak });
  } catch (error) {
    console.error("Error fetching soal:", error);
    return NextResponse.json({ error: "Gagal mengambil soal" }, { status: 500 });
  }
}
