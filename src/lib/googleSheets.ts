import { google } from "googleapis";

function getGoogleAuth() {
  const privateKey = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n");

  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      private_key: privateKey,
    },
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });

  return auth;
}

export async function getSheetsClient() {
  const auth = getGoogleAuth();
  const sheets = google.sheets({ version: "v4", auth });
  return sheets;
}

export const SHEET_ID = process.env.GOOGLE_SHEET_ID!;

export const SHEET_NAMES = {
  SOAL: "soal",
  HASIL: "hasil",
} as const;
