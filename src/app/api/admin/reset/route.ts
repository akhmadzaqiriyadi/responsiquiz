import { NextRequest, NextResponse } from "next/server";
import { getSheetsClient, SHEET_ID, SHEET_NAMES } from "@/lib/googleSheets";

function checkAdminAuth(request: NextRequest) {
  const cookie = request.cookies.get("admin_session");
  return cookie?.value === "authenticated";
}

export async function POST(request: NextRequest) {
  if (!checkAdminAuth(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const sheets = await getSheetsClient();

    // Hapus semua data hasil (baris 2 ke bawah, biarkan header)
    await sheets.spreadsheets.values.clear({
      spreadsheetId: SHEET_ID,
      range: `${SHEET_NAMES.HASIL}!A2:D1000`,
    });

    // Hapus log blur juga kalau ada
    try {
      await sheets.spreadsheets.values.clear({
        spreadsheetId: SHEET_ID,
        range: `log_blur!A2:C1000`,
      });
    } catch {
      // tab log_blur mungkin belum ada, skip
    }

    return NextResponse.json({ success: true, message: "Data quiz berhasil direset" });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
