import { NextResponse } from "next/server";
import { getSheetsClient, SHEET_ID, SHEET_NAMES } from "@/lib/googleSheets";
import { LeaderboardEntry } from "@/types";

export async function GET() {
  try {
    const sheets = await getSheetsClient();
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: `${SHEET_NAMES.HASIL}!A2:D1000`,
    });

    const rows = response.data.values;
    if (!rows || rows.length === 0) {
      return NextResponse.json({ leaderboard: [] });
    }

    const entries = rows.map((row) => ({
      nim: row[0],
      skor: Number(row[1]),
      total_soal: Number(row[2]),
      timestamp: row[3],
    }));

    // Sort: skor tertinggi dulu, kalau sama sort by timestamp tercepat
    entries.sort((a, b) => {
      if (b.skor !== a.skor) return b.skor - a.skor;
      return new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
    });

    // Tambah ranking + ambil top 50
    const leaderboard: LeaderboardEntry[] = entries
      .slice(0, 50)
      .map((entry, index) => ({
        rank: index + 1,
        ...entry,
      }));

    return NextResponse.json({ leaderboard });
  } catch (error) {
    console.error("Error leaderboard:", error);
    return NextResponse.json({ error: "Gagal mengambil leaderboard" }, { status: 500 });
  }
}
