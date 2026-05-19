export interface Siswa {
  id: string
  nisn: string
  nama: string
}

export interface Mapel {
  id: string
  kode: string
  nama: string
  kelompok: 'A' | 'B' | 'C' // A: Wajib, B: Pilihan, C: Muatan Lokal
  kkm: number // SKL (Standar Kelulusan) untuk nilai ijazah
  isPAI: boolean // Untuk menandai mapel PAI
}

export interface NilaiRaport {
  siswaId: string
  mapelId: string
  semester7: number | null
  semester8: number | null
  semester9: number | null
  semester10: number | null
  semester11: number | null
  rataRata: number | null
}

export interface NilaiUjian {
  siswaId: string
  mapelId: string
  nilai: number | null // Satu nilai ujian per mapel (termasuk Fiqih)
  nilaiKatrol: number | null
  isKatrol: boolean
}

export interface SettingKatrol {
  bobotRaport: number // Persentase bobot raport (default 60%)
  bobotUjian: number // Persentase bobot ujian (default 40%)
}
