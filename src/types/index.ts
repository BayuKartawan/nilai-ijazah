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
  kkm: number // Nilai minimum kelulusan (KKM = SKL, satu nilai saja)
  isPAI: boolean // Untuk menandai mapel PAI
}

export interface NilaiRaport {
  siswaId: string
  mapelId: string
  semester3: number | null
  semester4: number | null
  semester5: number | null
  semester6: number | null
  semester7: number | null
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
