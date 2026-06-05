import { NextRequest, NextResponse } from "next/server";
import { getSheetsClient, SHEET_ID } from "@/lib/googleSheets";

export async function POST(request: NextRequest) {
  try {
    const { nim, timestamp, keterangan } = await request.json();

    if (!nim) {
      return NextResponse.json({ error: "NIM tidak ada" }, { status: 400 });
    }

    const sheets = await getSheetsClient();

    // Cek apakah tab "log_blur" sudah ada, kalau belum buat
    const spreadsheet = await sheets.spreadsheets.get({
      spreadsheetId: SHEET_ID,
    });

    const sheetNames = spreadsheet.data.sheets?.map(
      (s) => s.properties?.title
    );

    if (!sheetNames?.includes("log_blur")) {
      await sheets.spreadsheets.batchUpdate({
        spreadsheetId: SHEET_ID,
        requestBody: {
          requests: [
            {
              addSheet: {
                properties: { title: "log_blur" },
              },
            },
          ],
        },
      });

      // Tambah header
      await sheets.spreadsheets.values.update({
        spreadsheetId: SHEET_ID,
        range: "log_blur!A1:C1",
        valueInputOption: "RAW",
        requestBody: {
          values: [["nim", "timestamp", "keterangan"]],
        },
      });
    }

    // Log kejadian
    await sheets.spreadsheets.values.append({
      spreadsheetId: SHEET_ID,
      range: "log_blur!A:C",
      valueInputOption: "RAW",
      requestBody: {
        values: [[nim, timestamp, keterangan || "tab_blur"]],
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error log blur:", error);
    return NextResponse.json({ error: "Gagal mencatat log" }, { status: 500 });
  }
}
