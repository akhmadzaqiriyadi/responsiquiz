import { NextRequest, NextResponse } from "next/server";
import { getSheetsClient, SHEET_ID, SHEET_NAMES } from "@/lib/googleSheets";
import { Soal } from "@/types";

type SubmitPayload = {
  nim: string;
  jawaban: Record<string, string>; // soalId -> key jawaban yang dipilih (key ASLI: a/b/c/d)
  soal: Soal[];
};

async function cekDuplikatNIM(nim: string): Promise<boolean> {
  const sheets = await getSheetsClient();
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: `${SHEET_NAMES.HASIL}!A2:A1000`,
  });

  const rows = response.data.values;
  if (!rows) return false;

  return rows.some((row) => row[0] === nim);
}

export async function POST(request: NextRequest) {
  try {
    const body: SubmitPayload = await request.json();
    const { nim, jawaban, soal } = body;

    // Validasi input
    if (!nim || !jawaban || !soal) {
      return NextResponse.json({ error: "Data tidak lengkap" }, { status: 400 });
    }

    // Validasi format NIM (sesuaikan regex dengan format NIM kampus kamu)
    const nimRegex = /^[0-9]{10}$/;
    if (!nimRegex.test(nim)) {
      return NextResponse.json({ error: "Format NIM tidak valid" }, { status: 400 });
    }

    // Cek duplikat NIM
    const sudahMengerjakan = await cekDuplikatNIM(nim);
    if (sudahMengerjakan) {
      return NextResponse.json(
        { error: "NIM ini sudah pernah mengerjakan quiz" },
        { status: 409 }
      );
    }

    // Hitung skor
    let benar = 0;
    soal.forEach((s) => {
      const jawabanMahasiswa = jawaban[s.id];
      if (jawabanMahasiswa === s.jawaban_benar) {
        benar++;
      }
    });

    const totalSoal = soal.length;
    const skor = Math.round((benar / totalSoal) * 100);
    const timestamp = new Date().toISOString();

    // Simpan ke Google Sheet
    const sheets = await getSheetsClient();
    await sheets.spreadsheets.values.append({
      spreadsheetId: SHEET_ID,
      range: `${SHEET_NAMES.HASIL}!A:D`,
      valueInputOption: "RAW",
      requestBody: {
        values: [[nim, skor, totalSoal, timestamp]],
      },
    });

    return NextResponse.json({
      success: true,
      nim,
      skor,
      benar,
      totalSoal,
      timestamp,
    });
  } catch (error) {
    console.error("Error submit:", error);
    return NextResponse.json({ error: "Gagal menyimpan hasil" }, { status: 500 });
  }
}
