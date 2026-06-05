import { NextRequest, NextResponse } from "next/server";
import { getSheetsClient, SHEET_ID, SHEET_NAMES } from "@/lib/googleSheets";

function checkAdminAuth(request: NextRequest) {
  const cookie = request.cookies.get("admin_session");
  return cookie?.value === "authenticated";
}

export async function GET(request: NextRequest) {
  if (!checkAdminAuth(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const sheets = await getSheetsClient();
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: `${SHEET_NAMES.HASIL}!A2:D1000`,
    });

    const rows = response.data.values || [];
    const hasil = rows.map((row, index) => ({
      no: index + 1,
      nim: row[0],
      skor: Number(row[1]),
      total_soal: Number(row[2]),
      timestamp: row[3],
    }));

    // Statistik
    const totalPeserta = hasil.length;
    const rataRata = totalPeserta > 0
      ? Math.round(hasil.reduce((sum, h) => sum + h.skor, 0) / totalPeserta)
      : 0;
    const tertinggi = totalPeserta > 0 ? Math.max(...hasil.map((h) => h.skor)) : 0;
    const terendah = totalPeserta > 0 ? Math.min(...hasil.map((h) => h.skor)) : 0;
    const lulus = hasil.filter((h) => h.skor >= 55).length;

    return NextResponse.json({
      hasil,
      statistik: { totalPeserta, rataRata, tertinggi, terendah, lulus },
    });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
