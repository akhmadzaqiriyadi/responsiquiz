export type Soal = {
  id: string;
  pertanyaan: string;
  opsi: {
    key: "a" | "b" | "c" | "d";
    text: string;
  }[];
  jawaban_benar: "a" | "b" | "c" | "d";
};

export type SoalRaw = {
  id: string;
  pertanyaan: string;
  opsi_a: string;
  opsi_b: string;
  opsi_c: string;
  opsi_d: string;
  jawaban_benar: "a" | "b" | "c" | "d";
};

export type HasilSubmit = {
  nim: string;
  skor: number;
  total_soal: number;
  timestamp: string;
};

export type LeaderboardEntry = {
  rank: number;
  nim: string;
  skor: number;
  total_soal: number;
  timestamp: string;
};

export type QuizSession = {
  nim: string;
  soal: Soal[];
  jawaban: Record<string, string>;
  startTime: number;
};

export type SoalResponse = {
  soal: Soal[];
};

export type SubmitResponse = {
  success: boolean;
  nim: string;
  skor: number;
  benar: number;
  totalSoal: number;
  timestamp: string;
};

export type LeaderboardResponse = {
  leaderboard: LeaderboardEntry[];
};

export type ApiError = {
  error: string;
};

