# Quiz Responsi

Aplikasi quiz untuk responsi mahasiswa berbasis Next.js 16 + Google Sheets.

## Setup Google Service Account
1. Buka https://console.cloud.google.com
2. Buat project baru atau pilih project yang ada
3. Enable Google Sheets API
4. Buat Service Account: IAM & Admin → Service Accounts → Create
5. Buat key JSON untuk service account tersebut
6. Salin `client_email` ke `GOOGLE_SERVICE_ACCOUNT_EMAIL`
7. Salin `private_key` ke `GOOGLE_PRIVATE_KEY`
8. Buka Google Sheet kamu → Share → tambahkan email service account dengan role Editor
9. Salin Sheet ID dari URL (bagian antara /d/ dan /edit) ke `GOOGLE_SHEET_ID`

## Setup Project
1. Clone repo
2. Copy `.env.example` ke `.env.local` dan isi semua variabel
3. `npm install`
4. `npm run dev`

## Struktur Google Sheet
- Tab `soal`: id, pertanyaan, opsi_a, opsi_b, opsi_c, opsi_d, jawaban_benar
- Tab `hasil`: nim, skor, total_soal, timestamp
