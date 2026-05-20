<script setup lang="ts">
import { computed, ref, onMounted, onUnmounted } from 'vue'
import { useDataStore } from '@/stores/data'
import { Printer, ArrowUp } from 'lucide-vue-next'

const store = useDataStore()

const tahunAjaran = computed(() => {
  const now = new Date()
  const y = now.getFullYear()
  const m = now.getMonth()
  return m >= 6 ? `${y}/${y + 1}` : `${y - 1}/${y}`
})

const sortedSiswa = computed(() => store.sortedSiswa)
const hasKatrol = computed(() => store.nilaiUjian.some(nu => nu.isKatrol))

function doPrint() {
  window.print()
}

// Scroll to top
const showScrollTop = ref(false)

function handleScroll() {
  showScrollTop.value = window.scrollY > 400
}

function scrollToTop() {
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

onMounted(() => window.addEventListener('scroll', handleScroll))
onUnmounted(() => window.removeEventListener('scroll', handleScroll))

// === Averages for specific semesters ===
function avgRaportSiswaSem(siswaId: string, semField: 'semester7' | 'semester8' | 'semester9' | 'semester10' | 'semester11'): number | null {
  const vals: number[] = []
  store.mapelList.forEach(m => {
    const nr = store.getNilaiRaport(siswaId, m.id)
    if (nr && nr[semField] != null) {
      vals.push(nr[semField] as number)
    }
  })
  return vals.length > 0 ? vals.reduce((a, b) => a + b, 0) / vals.length : null
}

function avgRaportMapelSem(mapelId: string, semField: 'semester7' | 'semester8' | 'semester9' | 'semester10' | 'semester11'): number | null {
  const vals: number[] = []
  store.siswaList.forEach(s => {
    const nr = store.getNilaiRaport(s.id, mapelId)
    if (nr && nr[semField] != null) {
      vals.push(nr[semField] as number)
    }
  })
  return vals.length > 0 ? vals.reduce((a, b) => a + b, 0) / vals.length : null
}

function grandAvgRaportSem(semField: 'semester7' | 'semester8' | 'semester9' | 'semester10' | 'semester11'): number | null {
  const vals: number[] = []
  store.siswaList.forEach(s => {
    const val = avgRaportSiswaSem(s.id, semField)
    if (val != null) vals.push(val)
  })
  return vals.length > 0 ? vals.reduce((a, b) => a + b, 0) / vals.length : null
}

// === Averages for Raport (S7-S11 average) ===
function avgRaportSiswa(siswaId: string): number | null {
  const vals: number[] = []
  store.mapelList.forEach(m => {
    const nr = store.getNilaiRaport(siswaId, m.id)
    if (nr?.rataRata != null) vals.push(nr.rataRata)
  })
  return vals.length > 0 ? vals.reduce((a, b) => a + b, 0) / vals.length : null
}

function avgRaportMapel(mapelId: string): number | null {
  const vals: number[] = []
  store.siswaList.forEach(s => {
    const nr = store.getNilaiRaport(s.id, mapelId)
    if (nr?.rataRata != null) vals.push(nr.rataRata)
  })
  return vals.length > 0 ? vals.reduce((a, b) => a + b, 0) / vals.length : null
}

function grandAvgRaport(): number | null {
  const vals: number[] = []
  store.siswaList.forEach(s => {
    const val = avgRaportSiswa(s.id)
    if (val != null) vals.push(val)
  })
  return vals.length > 0 ? vals.reduce((a, b) => a + b, 0) / vals.length : null
}

// === Averages for Ujian Madrasah ===
function avgUjianSiswa(siswaId: string): number | null {
  const vals: number[] = []
  store.mapelList.forEach(m => {
    const nu = store.getNilaiUjian(siswaId, m.id)
    if (nu?.nilai != null) vals.push(nu.nilai)
  })
  return vals.length > 0 ? vals.reduce((a, b) => a + b, 0) / vals.length : null
}

function avgUjianMapel(mapelId: string): number | null {
  const vals: number[] = []
  store.siswaList.forEach(s => {
    const nu = store.getNilaiUjian(s.id, mapelId)
    if (nu?.nilai != null) vals.push(nu.nilai)
  })
  return vals.length > 0 ? vals.reduce((a, b) => a + b, 0) / vals.length : null
}

function grandAvgUjian(): number | null {
  const vals: number[] = []
  store.siswaList.forEach(s => {
    const val = avgUjianSiswa(s.id)
    if (val != null) vals.push(val)
  })
  return vals.length > 0 ? vals.reduce((a, b) => a + b, 0) / vals.length : null
}

// === Averages for Ijazah Asli ===
function avgIjazahAsliSiswa(siswaId: string): number | null {
  const vals: number[] = []
  store.mapelList.forEach(m => {
    const v = store.hitungNilaiIjazah(siswaId, m.id, false)
    if (v != null) vals.push(v)
  })
  return vals.length > 0 ? vals.reduce((a, b) => a + b, 0) / vals.length : null
}

function avgIjazahAsliMapel(mapelId: string): number | null {
  const vals: number[] = []
  store.siswaList.forEach(s => {
    const v = store.hitungNilaiIjazah(s.id, mapelId, false)
    if (v != null) vals.push(v)
  })
  return vals.length > 0 ? vals.reduce((a, b) => a + b, 0) / vals.length : null
}

function grandAvgIjazahAsli(): number | null {
  const vals: number[] = []
  store.siswaList.forEach(s => {
    const val = avgIjazahAsliSiswa(s.id)
    if (val != null) vals.push(val)
  })
  return vals.length > 0 ? vals.reduce((a, b) => a + b, 0) / vals.length : null
}

// === Averages for Ijazah Katrol ===
function avgIjazahKatrolSiswa(siswaId: string): number | null {
  const vals: number[] = []
  store.mapelList.forEach(m => {
    const v = store.hitungNilaiIjazah(siswaId, m.id, true)
    if (v != null) vals.push(v)
  })
  return vals.length > 0 ? vals.reduce((a, b) => a + b, 0) / vals.length : null
}

function avgIjazahKatrolMapel(mapelId: string): number | null {
  const vals: number[] = []
  store.siswaList.forEach(s => {
    const v = store.hitungNilaiIjazah(s.id, mapelId, true)
    if (v != null) vals.push(v)
  })
  return vals.length > 0 ? vals.reduce((a, b) => a + b, 0) / vals.length : null
}

function grandAvgIjazahKatrol(): number | null {
  const vals: number[] = []
  store.siswaList.forEach(s => {
    const val = avgIjazahKatrolSiswa(s.id)
    if (val != null) vals.push(val)
  })
  return vals.length > 0 ? vals.reduce((a, b) => a + b, 0) / vals.length : null
}

const semesters = [
  { field: 'semester7', label: 'SEMESTER 7', desc: 'Kelas 4 Semester 1' },
  { field: 'semester8', label: 'SEMESTER 8', desc: 'Kelas 4 Semester 2' },
  { field: 'semester9', label: 'SEMESTER 9', desc: 'Kelas 5 Semester 1' },
  { field: 'semester10', label: 'SEMESTER 10', desc: 'Kelas 5 Semester 2' },
  { field: 'semester11', label: 'SEMESTER 11', desc: 'Kelas 6 Semester 1' },
] as const

function fmt(v: number | null): string {
  return v != null ? v.toFixed(2) : '-'
}

function fmtRound(v: number | null): string {
  return v != null ? Math.round(v).toString() : '-'
}
</script>

<template>
  <div class="fade-in">
    <div class="toolbar no-print">
      <div>
        <h2 class="page-heading">Cetak Rekap Nilai Ijazah</h2>
        <p class="page-desc">Preview dokumen rekap. Klik "Cetak" untuk print atau simpan sebagai PDF.</p>
      </div>
      <button class="btn btn-primary" @click="doPrint">
        <Printer :size="16" /> Cetak / PDF
      </button>
    </div>

    <!-- ==================== PRINT CONTENT ==================== -->
    <div class="print-doc">

      <!-- SAMPUL -->
      <div class="page-break cover-page">
        <div class="cover-border">
          <div class="cover-logos">
            <img src="/assets/logo kemenag.jpeg" alt="Logo Kemenag" class="cover-logo-img" />
            <img src="/assets/logo madrasah.jpeg" alt="Logo Madrasah" class="cover-logo-img" />
          </div>
          <h1 class="cover-title">REKAP NILAI IJAZAH</h1>
          <h2 class="cover-subtitle">MADRASAH IBTIDAIYAH NW PENYENGGIR</h2>
          <div class="cover-line"></div>
          <div class="cover-info">
            <p>Tahun Pelajaran {{ tahunAjaran }}</p>
            <p>Jumlah Peserta Didik: {{ store.totalSiswa }} Siswa</p>
            <p>Jumlah Mata Pelajaran: {{ store.totalMapel }} Mapel</p>
          </div>
          <div class="cover-line"></div>
          <div class="cover-footer">
            <p>Disusun oleh:</p>
            <p class="cover-author">Bayu Kartawan, S.Kom.</p>
            <p class="cover-school">MI NW Penyenggir</p>
          </div>
        </div>
      </div>

      <!-- DAFTAR ISI -->
      <div class="page-break toc-page">
        <h2 class="section-title">DAFTAR ISI</h2>
        <div class="toc-line"></div>
        <ul class="toc-list">
          <li>Halaman Sampul</li>
          <li>Daftar Isi</li>
          <li>BAB I — Pendahuluan</li>
          <li>BAB II — Metode Pengolahan Nilai Ijazah</li>
          <li>BAB III — Daftar Peserta Didik</li>
          <li>BAB IV — Daftar Mata Pelajaran &amp; Standar Kelulusan</li>
          <li>BAB V — Rekap Nilai Raport Per Semester (Semester 7–11)</li>
          <li>BAB VI — Rekap Rata-rata Nilai Raport</li>
          <li>BAB VII — Rekap Nilai Ujian Madrasah</li>
          <li>BAB VIII — Rekap Nilai Ijazah Sebelum Katrol</li>
          <li v-if="hasKatrol">BAB IX — Rekap Nilai Ijazah Setelah Katrol</li>
          <li>BAB {{ hasKatrol ? 'X' : 'IX' }} — Rekap Nilai Ijazah (Pembulatan)</li>
          <li>BAB {{ hasKatrol ? 'XI' : 'X' }} — Penutup</li>
        </ul>
      </div>

      <!-- BAB I: PENDAHULUAN -->
      <div class="page-break chapter">
        <h2 class="section-title">BAB I — PENDAHULUAN</h2>
        <div class="toc-line"></div>
        <div class="chapter-content">
          <h3>A. Latar Belakang</h3>
          <p>Dokumen rekap nilai ijazah ini disusun sebagai bentuk administrasi dan dokumentasi akademik dalam rangka penerbitan ijazah Madrasah Ibtidaiyah NW Penyenggir. Rekap ini mencakup seluruh proses pengolahan nilai mulai dari input data siswa, nilai raport, nilai ujian madrasah, hingga perhitungan nilai akhir ijazah.</p>

          <h3>B. Tujuan</h3>
          <ol>
            <li>Mendokumentasikan proses pengolahan nilai ijazah secara transparan dan akuntabel</li>
            <li>Menjadi acuan resmi dalam penerbitan ijazah Madrasah Ibtidaiyah</li>
            <li>Memudahkan verifikasi dan validasi nilai oleh pihak-pihak terkait</li>
          </ol>

          <h3>C. Dasar Hukum</h3>
          <ol>
            <li>Peraturan Menteri Agama tentang Penyelenggaraan Pendidikan Madrasah</li>
            <li>Keputusan Direktur Jenderal Pendidikan Islam tentang Petunjuk Teknis Penerbitan Ijazah Madrasah</li>
            <li>Kurikulum Merdeka untuk Madrasah Ibtidaiyah</li>
          </ol>
        </div>
      </div>

      <!-- BAB II: METODE PENGOLAHAN -->
      <div class="page-break chapter">
        <h2 class="section-title">BAB II — METODE PENGOLAHAN NILAI IJAZAH</h2>
        <div class="toc-line"></div>
        <div class="chapter-content">
          <h3>A. Komponen Nilai</h3>
          <p>Nilai ijazah dihitung dari dua komponen utama:</p>
          <ol>
            <li><strong>Nilai Raport</strong> — Rata-rata nilai raport semester 7 sampai 11 (kelas 4 semester 1 hingga kelas 6 semester 1), dengan bobot <strong>{{ store.settingKatrol.bobotRaport }}%</strong></li>
            <li><strong>Nilai Ujian Madrasah (UM)</strong> — Nilai ujian akhir madrasah, dengan bobot <strong>{{ store.settingKatrol.bobotUjian }}%</strong></li>
          </ol>

          <h3>B. Rumus Perhitungan</h3>
          <div class="formula-box">
            <p class="formula"><strong>Rata-rata Raport</strong> = (S7 + S8 + S9 + S10 + S11) / 5</p>
            <p class="formula"><strong>Nilai Ijazah</strong> = (Rata-rata Raport × {{ store.settingKatrol.bobotRaport }}%) + (Nilai UM × {{ store.settingKatrol.bobotUjian }}%)</p>
          </div>

          <h3>C. Standar Kelulusan (SKL)</h3>
          <p>Setiap mata pelajaran memiliki Standar Kelulusan (SKL) yang ditetapkan oleh madrasah. Nilai ijazah yang berada di bawah SKL akan diidentifikasi dan dapat ditindaklanjuti dengan mekanisme katrol (penyesuaian).</p>

          <h3>D. Mekanisme Katrol Nilai Ijazah</h3>
          <p>Katrol nilai dilakukan secara otomatis pada komponen ujian madrasah untuk memastikan seluruh siswa memenuhi standar kelulusan. Berikut tahapan proses katrol:</p>
          <ol>
            <li>Sistem mencari <strong>nilai ijazah terendah</strong> per mata pelajaran dari seluruh siswa</li>
            <li>Jika nilai terendah <strong>di bawah SKL</strong> (Standar Kelulusan), maka katrol diaktifkan pada mapel tersebut</li>
            <li>Sistem menghitung <strong>selisih (gap)</strong> antara SKL dan nilai ijazah terendah</li>
            <li>Boost nilai ujian dihitung dengan rumus:
              <div class="formula-box formula-sm">
                Boost Ujian = Gap ÷ (Bobot Ujian / 100) = Gap ÷ {{ store.settingKatrol.bobotUjian / 100 }}
              </div>
            </li>
            <li>Nilai ujian <strong>semua siswa</strong> pada mapel tersebut dinaikkan sebesar boost (maksimal 100)</li>
            <li>Nilai ijazah dihitung ulang menggunakan nilai ujian yang sudah dikatrol</li>
          </ol>
          <p>Mekanisme ini diterapkan secara seragam pada seluruh siswa untuk menjaga keadilan. Proses katrol hanya mempengaruhi komponen nilai ujian, sedangkan nilai raport tetap menggunakan nilai asli.</p>
        </div>
      </div>

      <!-- BAB III: DAFTAR SISWA -->
      <div class="page-break chapter">
        <h2 class="section-title">BAB III — DAFTAR PESERTA DIDIK</h2>
        <div class="toc-line"></div>
        <div class="chapter-content">
          <p>Berikut daftar peserta didik MI NW Penyenggir yang mengikuti ujian dan akan menerima ijazah:</p>
          <table class="print-table">
            <thead>
              <tr>
                <th style="width:40px">No</th>
                <th>NISN</th>
                <th>Nama Lengkap</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(s, idx) in sortedSiswa" :key="s.id">
                <td>{{ idx + 1 }}</td>
                <td>{{ s.nisn }}</td>
                <td>{{ s.nama }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- BAB IV: DAFTAR MAPEL -->
      <div class="page-break chapter">
        <h2 class="section-title">BAB IV — DAFTAR MATA PELAJARAN &amp; STANDAR KELULUSAN</h2>
        <div class="toc-line"></div>
        <div class="chapter-content">
          <table class="print-table">
            <thead>
              <tr>
                <th style="width:40px">No</th>
                <th>Kode</th>
                <th>Nama Mata Pelajaran</th>
                <th>Kelompok</th>
                <th>SKL</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(m, idx) in store.mapelList" :key="m.id">
                <td>{{ idx + 1 }}</td>
                <td>{{ m.kode }}</td>
                <td>{{ m.nama }}</td>
                <td>{{ m.kelompok === 'A' ? 'Kelompok A' : m.kelompok === 'B' ? 'Kelompok B' : 'Muatan Lokal' }}</td>
                <td>{{ m.kkm }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- BAB V: REKAP RAPORT PER SEMESTER -->
      <div v-for="sem in semesters" :key="sem.field" class="page-break chapter">
        <h2 class="section-title">BAB V — REKAP NILAI RAPORT {{ sem.label }}</h2>
        <div class="toc-line"></div>
        <div class="chapter-content">
          <p>Nilai raport {{ sem.label.toLowerCase() }} ({{ sem.desc }}) untuk setiap siswa:</p>
          <div class="table-wrapper">
            <table class="print-table compact fixed-table">
              <colgroup>
                <col style="width: 40px" />
                <col style="width: 200px" />
                <col v-for="m in store.mapelList" :key="m.id" />
                <col style="width: 60px" />
              </colgroup>
              <thead>
                <tr>
                  <th>No</th>
                  <th>Nama</th>
                  <th v-for="m in store.mapelList" :key="m.id">{{ m.kode }}</th>
                  <th>Rata²</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(s, idx) in sortedSiswa" :key="s.id">
                  <td class="num-cell">{{ idx + 1 }}</td>
                  <td class="name-cell">{{ s.nama }}</td>
                  <td v-for="m in store.mapelList" :key="m.id" class="num-cell">
                    {{ store.getNilaiRaport(s.id, m.id)?.[sem.field]?.toFixed(2) ?? '-' }}
                  </td>
                  <td class="num-cell font-semibold">{{ fmt(avgRaportSiswaSem(s.id, sem.field)) }}</td>
                </tr>
              </tbody>
              <tfoot v-if="store.siswaList.length > 0">
                <tr class="footer-row">
                  <td colspan="2" style="font-weight:600; text-align:right">Rata² Mapel</td>
                  <td v-for="m in store.mapelList" :key="m.id" class="num-cell font-semibold">
                    {{ fmt(avgRaportMapelSem(m.id, sem.field)) }}
                  </td>
                  <td class="num-cell font-semibold">{{ fmt(grandAvgRaportSem(sem.field)) }}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      </div>

      <!-- BAB VI: REKAP RATA-RATA NILAI RAPORT -->
      <div class="page-break chapter">
        <h2 class="section-title">BAB VI — REKAP RATA-RATA NILAI RAPORT</h2>
        <div class="toc-line"></div>
        <div class="chapter-content">
          <p>Rata-rata nilai raport semester 7–11 untuk setiap siswa:</p>
          <div class="table-wrapper">
            <table class="print-table compact fixed-table">
              <colgroup>
                <col style="width: 40px" />
                <col style="width: 200px" />
                <col v-for="m in store.mapelList" :key="m.id" />
                <col style="width: 60px" />
              </colgroup>
              <thead>
                <tr>
                  <th>No</th>
                  <th>Nama</th>
                  <th v-for="m in store.mapelList" :key="m.id">{{ m.kode }}</th>
                  <th>Rata²</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(s, idx) in sortedSiswa" :key="s.id">
                  <td class="num-cell">{{ idx + 1 }}</td>
                  <td class="name-cell">{{ s.nama }}</td>
                  <td v-for="m in store.mapelList" :key="m.id" class="num-cell">{{ store.getNilaiRaport(s.id, m.id)?.rataRata?.toFixed(2) ?? '-' }}</td>
                  <td class="num-cell font-semibold">{{ fmt(avgRaportSiswa(s.id)) }}</td>
                </tr>
              </tbody>
              <tfoot v-if="store.siswaList.length > 0">
                <tr class="footer-row">
                  <td colspan="2" style="font-weight:600; text-align:right">Rata² Mapel</td>
                  <td v-for="m in store.mapelList" :key="m.id" class="num-cell font-semibold">{{ fmt(avgRaportMapel(m.id)) }}</td>
                  <td class="num-cell font-semibold">{{ fmt(grandAvgRaport()) }}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      </div>

      <!-- BAB VII: REKAP NILAI UJIAN MADRASAH -->
      <div class="page-break chapter">
        <h2 class="section-title">BAB VII — REKAP NILAI UJIAN MADRASAH</h2>
        <div class="toc-line"></div>
        <div class="chapter-content">
          <p>Nilai ujian madrasah ( UM ) untuk setiap siswa:</p>
          <div class="table-wrapper">
            <table class="print-table compact fixed-table">
              <colgroup>
                <col style="width: 40px" />
                <col style="width: 200px" />
                <col v-for="m in store.mapelList" :key="m.id" />
                <col style="width: 60px" />
              </colgroup>
              <thead>
                <tr>
                  <th>No</th>
                  <th>Nama</th>
                  <th v-for="m in store.mapelList" :key="m.id">{{ m.kode }}</th>
                  <th>Rata²</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(s, idx) in sortedSiswa" :key="s.id">
                  <td class="num-cell">{{ idx + 1 }}</td>
                  <td class="name-cell">{{ s.nama }}</td>
                  <td v-for="m in store.mapelList" :key="m.id" class="num-cell">{{ store.getNilaiUjian(s.id, m.id)?.nilai?.toFixed(2) ?? '-' }}</td>
                  <td class="num-cell font-semibold">{{ fmt(avgUjianSiswa(s.id)) }}</td>
                </tr>
              </tbody>
              <tfoot v-if="store.siswaList.length > 0">
                <tr class="footer-row">
                  <td colspan="2" style="font-weight:600; text-align:right">Rata² Mapel</td>
                  <td v-for="m in store.mapelList" :key="m.id" class="num-cell font-semibold">{{ fmt(avgUjianMapel(m.id)) }}</td>
                  <td class="num-cell font-semibold">{{ fmt(grandAvgUjian()) }}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      </div>

      <!-- BAB VIII: REKAP NILAI IJAZAH SEBELUM KATROL -->
      <div class="page-break chapter">
        <h2 class="section-title">BAB VIII — REKAP NILAI IJAZAH</h2>
        <div class="toc-line"></div>
        <div class="chapter-content">
          <p>Nilai ijazah asli (Bobot: Raport {{ store.settingKatrol.bobotRaport }}% + Ujian {{ store.settingKatrol.bobotUjian }}%):</p>
          <div class="table-wrapper">
            <table class="print-table compact fixed-table">
              <colgroup>
                <col style="width: 40px" />
                <col style="width: 200px" />
                <col v-for="m in store.mapelList" :key="m.id" />
                <col style="width: 60px" />
              </colgroup>
              <thead>
                <tr>
                  <th>No</th>
                  <th>Nama</th>
                  <th v-for="m in store.mapelList" :key="m.id">{{ m.kode }}</th>
                  <th>Rata²</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(s, idx) in sortedSiswa" :key="s.id">
                  <td class="num-cell">{{ idx + 1 }}</td>
                  <td class="name-cell">{{ s.nama }}</td>
                  <td v-for="m in store.mapelList" :key="m.id" class="num-cell" :class="{ 'below-skl': (store.hitungNilaiIjazah(s.id, m.id, false) ?? 100) < m.kkm }">{{ store.hitungNilaiIjazah(s.id, m.id, false)?.toFixed(2) ?? '-' }}</td>
                  <td class="num-cell font-semibold">{{ fmt(avgIjazahAsliSiswa(s.id)) }}</td>
                </tr>
              </tbody>
              <tfoot v-if="store.siswaList.length > 0">
                <tr class="footer-row">
                  <td colspan="2" style="font-weight:600; text-align:right">Rata² Mapel</td>
                  <td v-for="m in store.mapelList" :key="m.id" class="num-cell font-semibold">{{ fmt(avgIjazahAsliMapel(m.id)) }}</td>
                  <td class="num-cell font-semibold">{{ fmt(grandAvgIjazahAsli()) }}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      </div>

      <!-- BAB IX: REKAP NILAI IJAZAH SETELAH KATROL (hanya jika katrol aktif) -->
      <div v-if="hasKatrol" class="page-break chapter">
        <h2 class="section-title">BAB IX — REKAP NILAI IJAZAH SETELAH KATROL</h2>
        <div class="toc-line"></div>
        <div class="chapter-content">
          <p>Nilai ijazah akhir setelah katrol (Bobot: Raport {{ store.settingKatrol.bobotRaport }}% + Ujian {{ store.settingKatrol.bobotUjian }}%):</p>
          <div class="table-wrapper">
            <table class="print-table compact fixed-table">
              <colgroup>
                <col style="width: 40px" />
                <col style="width: 200px" />
                <col v-for="m in store.mapelList" :key="m.id" />
                <col style="width: 60px" />
              </colgroup>
              <thead>
                <tr>
                  <th>No</th>
                  <th>Nama</th>
                  <th v-for="m in store.mapelList" :key="m.id">{{ m.kode }}</th>
                  <th>Rata²</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(s, idx) in sortedSiswa" :key="s.id">
                  <td class="num-cell">{{ idx + 1 }}</td>
                  <td class="name-cell">{{ s.nama }}</td>
                  <td v-for="m in store.mapelList" :key="m.id" class="num-cell" :class="{ 'below-skl': (store.hitungNilaiIjazah(s.id, m.id, true) ?? 100) < m.kkm }">{{ store.hitungNilaiIjazah(s.id, m.id, true)?.toFixed(2) ?? '-' }}</td>
                  <td class="num-cell font-semibold">{{ fmt(avgIjazahKatrolSiswa(s.id)) }}</td>
                </tr>
              </tbody>
              <tfoot v-if="store.siswaList.length > 0">
                <tr class="footer-row">
                  <td colspan="2" style="font-weight:600; text-align:right">Rata² Mapel</td>
                  <td v-for="m in store.mapelList" :key="m.id" class="num-cell font-semibold">{{ fmt(avgIjazahKatrolMapel(m.id)) }}</td>
                  <td class="num-cell font-semibold">{{ fmt(grandAvgIjazahKatrol()) }}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      </div>

      <!-- BAB X/IX: REKAP NILAI IJAZAH PEMBULATAN -->
      <div class="page-break chapter">
        <h2 class="section-title">BAB {{ hasKatrol ? 'X' : 'IX' }} — REKAP NILAI IJAZAH (PEMBULATAN)</h2>
        <div class="toc-line"></div>
        <div class="chapter-content">
          <p>Nilai ijazah akhir{{ hasKatrol ? ' setelah katrol' : '' }}, dibulatkan tanpa desimal:</p>
          <div class="table-wrapper">
            <table class="print-table compact fixed-table">
              <colgroup>
                <col style="width: 40px" />
                <col style="width: 200px" />
                <col v-for="m in store.mapelList" :key="m.id" />
                <col style="width: 60px" />
              </colgroup>
              <thead>
                <tr>
                  <th>No</th>
                  <th>Nama</th>
                  <th v-for="m in store.mapelList" :key="m.id">{{ m.kode }}</th>
                  <th>Rata²</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(s, idx) in sortedSiswa" :key="s.id">
                  <td class="num-cell">{{ idx + 1 }}</td>
                  <td class="name-cell">{{ s.nama }}</td>
                  <td v-for="m in store.mapelList" :key="m.id" class="num-cell" :class="{ 'below-skl': (store.hitungNilaiIjazah(s.id, m.id, hasKatrol) ?? 100) < m.kkm }">{{ fmtRound(store.hitungNilaiIjazah(s.id, m.id, hasKatrol)) }}</td>
                  <td class="num-cell font-semibold">{{ fmtRound(hasKatrol ? avgIjazahKatrolSiswa(s.id) : avgIjazahAsliSiswa(s.id)) }}</td>
                </tr>
              </tbody>
              <tfoot v-if="store.siswaList.length > 0">
                <tr class="footer-row">
                  <td colspan="2" style="font-weight:600; text-align:right">Rata² Mapel</td>
                  <td v-for="m in store.mapelList" :key="m.id" class="num-cell font-semibold">{{ fmtRound(hasKatrol ? avgIjazahKatrolMapel(m.id) : avgIjazahAsliMapel(m.id)) }}</td>
                  <td class="num-cell font-semibold">{{ fmtRound(hasKatrol ? grandAvgIjazahKatrol() : grandAvgIjazahAsli()) }}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      </div>

      <!-- PENUTUP -->
      <div class="chapter">
        <h2 class="section-title">BAB {{ hasKatrol ? 'XI' : 'X' }} — PENUTUP</h2>
        <div class="toc-line"></div>
        <div class="chapter-content">
          <p>Demikian rekap nilai ijazah MI NW Penyenggir ini disusun dengan sebenar-benarnya berdasarkan data nilai raport dan nilai ujian madrasah yang telah diolah menggunakan sistem Aplikasi Nilai Ijazah.</p>
          <p>Dokumen ini dapat digunakan sebagai acuan resmi dalam proses penerbitan ijazah Madrasah Ibtidaiyah NW Penyenggir tahun pelajaran {{ tahunAjaran }}.</p>
          
          <div class="signature-section">
            <div class="signature-grid">
              <div class="signature-item">
                <span class="signature-title">Wali Kelas VII.A</span>
                <div class="signature-space"></div>
                <span class="signature-name">LAILA FITRIA HUDIANA, S.Pd.</span>
              </div>
              <div class="signature-item">
                <span class="signature-title">Wali Kelas VII.B</span>
                <div class="signature-space"></div>
                <span class="signature-name">DARMA SASTRAWAN, S.Pd.</span>
              </div>
              <div class="signature-item">
                <span class="signature-title">Penyusun</span>
                <div class="signature-space"></div>
                <span class="signature-name">BAYU KARTAWAN, S.Kom.</span>
              </div>
              <div class="signature-item">
                <span class="signature-title">Penanggung Jawab</span>
                <div class="signature-space"></div>
                <span class="signature-name">ABDUL HALIM, S.Pd.I.</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Scroll to Top -->
    <Transition name="fade-btn">
      <button v-if="showScrollTop" class="scroll-top-btn no-print" @click="scrollToTop" title="Kembali ke atas">
        <ArrowUp :size="20" />
      </button>
    </Transition>
  </div>
</template>

<style scoped>
/* Screen styles */
.toolbar { display: flex; align-items: center; justify-content: space-between; gap: 1rem; margin-bottom: 1.5rem; flex-wrap: wrap; }
.page-heading { font-size: 1.125rem; font-weight: 600; color: var(--text-primary); }
.page-desc { font-size: 0.875rem; color: var(--text-secondary); margin-top: 0.25rem; }

/* Scroll to top */
.scroll-top-btn {
  position: fixed;
  bottom: 2rem;
  right: 2rem;
  z-index: 50;
  width: 44px;
  height: 44px;
  border-radius: 50%;
  border: 1px solid var(--border-default);
  background: var(--bg-surface);
  color: var(--text-secondary);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 12px rgba(0,0,0,0.12);
  transition: all 0.2s ease;
}
.scroll-top-btn:hover {
  background: var(--color-primary-600);
  color: white;
  border-color: var(--color-primary-600);
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(0,0,0,0.18);
}
.fade-btn-enter-active { transition: opacity 0.2s ease, transform 0.2s ease; }
.fade-btn-leave-active { transition: opacity 0.15s ease, transform 0.15s ease; }
.fade-btn-enter-from { opacity: 0; transform: translateY(8px); }
.fade-btn-leave-to { opacity: 0; transform: translateY(8px); }

.print-doc {
  background: var(--bg-surface);
  border: 1px solid var(--border-default);
  border-radius: 0.75rem;
  padding: 2rem;
  max-width: 1100px;
  margin: 0 auto;
}

.section-title {
  font-size: 1rem;
  font-weight: 700;
  color: var(--text-primary);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 0.5rem;
}

.toc-line {
  height: 2px;
  background: var(--border-default);
  margin-bottom: 1.5rem;
}

/* Cover */
.cover-page { text-align: center; padding: 3rem 2rem; }
.cover-border { border: 3px double var(--text-secondary); padding: 3rem 2rem; border-radius: 0.5rem; }
.cover-logos {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 2rem;
  margin-bottom: 2rem;
}
.cover-logo-img {
  width: 80px;
  height: 80px;
  object-fit: contain;
  border-radius: 0.25rem;
}
.cover-title { font-size: 1.5rem; font-weight: 800; color: var(--text-primary); letter-spacing: 0.1em; margin-bottom: 0.5rem; }
.cover-subtitle { font-size: 1.125rem; font-weight: 600; color: var(--text-secondary); margin-bottom: 2rem; }
.cover-line { height: 2px; background: var(--text-secondary); margin: 1.5rem 4rem; }
.cover-info { color: var(--text-secondary); line-height: 2; font-size: 0.9375rem; }
.cover-footer { margin-top: 1rem; color: var(--text-secondary); }
.cover-author { font-weight: 600; color: var(--text-primary); margin-top: 0.5rem; font-size: 1rem; }
.cover-school { font-weight: 500; color: var(--text-secondary); margin-top: 0.25rem; font-size: 0.875rem; }

/* TOC list */
.toc-list {
  list-style: none;
  padding: 0;
  margin: 0;
}
.toc-list li {
  padding: 0.5rem 0;
  padding-left: 1rem;
  font-size: 0.9375rem;
  color: var(--text-primary);
  border-bottom: 1px solid var(--border-subtle);
  position: relative;
}
.toc-list li::before {
  content: '•';
  position: absolute;
  left: 0;
  color: var(--text-muted);
  font-weight: 700;
}
.toc-list li:last-child {
  border-bottom: none;
}

/* Chapter */
.chapter-content { line-height: 1.8; color: var(--text-primary); }
.chapter-content h3 { font-size: 0.9375rem; font-weight: 700; margin: 1.25rem 0 0.5rem; color: var(--text-primary); }
.chapter-content p { margin-bottom: 0.75rem; font-size: 0.875rem; }
.chapter-content ol { padding-left: 1.25rem; margin-bottom: 1rem; }
.chapter-content ol li { font-size: 0.875rem; margin-bottom: 0.375rem; }

.formula-box {
  background: var(--bg-muted);
  border: 1px solid var(--border-default);
  border-radius: 0.5rem;
  padding: 1rem 1.25rem;
  margin: 0.75rem 0 1rem;
}
.formula { font-family: monospace; font-size: 0.8125rem; margin-bottom: 0.375rem; }
.formula-sm { margin-top: 0.375rem; font-size: 0.8125rem; padding: 0.625rem 1rem; }

/* Print tables */
.print-table { width: 100%; border-collapse: collapse; margin: 0.75rem 0; }
.print-table th, .print-table td { border: 1px solid var(--border-default); padding: 0.375rem 0.5rem; font-size: 0.8125rem; }
.print-table th { background: var(--bg-muted); font-weight: 600; text-align: center; color: var(--text-secondary); }
.print-table td { color: var(--text-primary); }
.print-table.compact th, .print-table.compact td { padding: 0.15rem 0.25rem; font-size: 0.65rem; }
.fixed-table { table-layout: fixed; width: 100%; }
.name-cell { white-space: nowrap; font-weight: 500; overflow: hidden; text-overflow: ellipsis; }
.num-cell { text-align: center; }
.below-skl { background-color: #dc2626; color: #ffffff; font-weight: 600; }
.table-wrapper { overflow-x: auto; -webkit-overflow-scrolling: touch; }

/* Signature section */
.signature-section {
  margin-top: 3rem;
  page-break-inside: avoid;
}
.signature-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 2rem 4rem;
  margin-top: 1.5rem;
  text-align: center;
}
.signature-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}
.signature-title {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--text-secondary);
}
.signature-space {
  height: 70px;
}
.signature-name {
  font-size: 0.875rem;
  font-weight: 700;
  color: var(--text-primary);
  text-decoration: underline;
  text-underline-offset: 4px;
}

/* Page break hint (screen) */
.page-break {
  border-bottom: 2px dashed var(--border-default);
  padding-bottom: 2rem;
  margin-bottom: 2rem;
}

/* PRINT */
@media print {
  @page {
    size: A4 landscape;
    margin: 1cm 1.5cm;
  }
  .no-print, .scroll-top-btn { display: none !important; }
  .print-doc {
    background: white;
    border: none;
    padding: 0;
    max-width: none;
    border-radius: 0;
    overflow: visible !important;
  }
  .table-wrapper {
    overflow: visible !important;
  }
  .page-break {
    page-break-after: always;
    border-bottom: none;
    padding-bottom: 0;
    margin-bottom: 0;
  }
  .footer-row td {
    background: #eee !important;
    font-weight: 600;
  }
  .section-title { color: black; }
  .toc-line { background: #333; }
  .cover-border { border-color: #333; }
  .cover-title, .cover-author { color: black; }
  .cover-subtitle, .cover-info, .cover-footer, .cover-school { color: #555; }
  .cover-line { background: #333; }
  .toc-list li { color: black; border-color: #ccc; }
  .toc-list li::before { color: #666; }
  .chapter-content, .chapter-content h3, .chapter-content p, .chapter-content ol li { color: black; }
  .formula-box { background: #f5f5f5; border-color: #ccc; }
  .print-table th { background: #eee; color: #333; border-color: #999; }
  .print-table td { color: black; border-color: #999; }
  .below-skl { background-color: #dc2626 !important; color: #ffffff !important; }
  .signature-title { color: #333 !important; }
  .signature-name { color: black !important; }
  body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
}

@media (max-width: 640px) {
  .toolbar { flex-direction: column; align-items: stretch; }
  .print-doc { padding: 1rem; }
  .cover-page { padding: 2rem 1rem; }
  .cover-border { padding: 2rem 1rem; }
  .cover-title { font-size: 1.125rem; }
  .cover-line { margin: 1rem 1rem; }
  .cover-logos { gap: 1rem; }
  .cover-logo-img { width: 60px; height: 60px; }
}
</style>
