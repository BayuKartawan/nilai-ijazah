<script setup lang="ts">
import { computed } from 'vue'
import { useDataStore } from '@/stores/data'
import { Printer } from 'lucide-vue-next'

const store = useDataStore()

const tahunAjaran = computed(() => {
  const now = new Date()
  const y = now.getFullYear()
  const m = now.getMonth()
  return m >= 6 ? `${y}/${y + 1}` : `${y - 1}/${y}`
})

const sortedSiswa = computed(() => store.sortedSiswa)

function doPrint() {
  window.print()
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
          <div class="cover-logo">
            <div class="cover-emblem">
              <svg viewBox="0 0 80 80" width="80" height="80">
                <circle cx="40" cy="40" r="38" fill="none" stroke="currentColor" stroke-width="2"/>
                <text x="40" y="32" text-anchor="middle" font-size="11" fill="currentColor" font-weight="700">KEMENAG</text>
                <text x="40" y="46" text-anchor="middle" font-size="9" fill="currentColor">REPUBLIK</text>
                <text x="40" y="58" text-anchor="middle" font-size="9" fill="currentColor">INDONESIA</text>
              </svg>
            </div>
          </div>
          <h1 class="cover-title">REKAP NILAI IJAZAH</h1>
          <h2 class="cover-subtitle">MADRASAH IBTIDAIYAH</h2>
          <div class="cover-line"></div>
          <div class="cover-info">
            <p>Tahun Pelajaran {{ tahunAjaran }}</p>
            <p>Jumlah Peserta Didik: {{ store.totalSiswa }} Siswa</p>
            <p>Jumlah Mata Pelajaran: {{ store.totalMapel }} Mapel</p>
          </div>
          <div class="cover-line"></div>
          <div class="cover-footer">
            <p>Disusun oleh:</p>
            <p class="cover-school">____________________________</p>
            <p class="cover-note">Nama Madrasah</p>
          </div>
        </div>
      </div>

      <!-- DAFTAR ISI -->
      <div class="page-break toc-page">
        <h2 class="section-title">DAFTAR ISI</h2>
        <div class="toc-line"></div>
        <table class="toc-table">
          <tbody>
            <tr><td>Halaman Sampul</td><td class="toc-dots"></td><td class="toc-page-num">1</td></tr>
            <tr><td>Daftar Isi</td><td class="toc-dots"></td><td class="toc-page-num">2</td></tr>
            <tr><td>BAB I — Pendahuluan</td><td class="toc-dots"></td><td class="toc-page-num">3</td></tr>
            <tr><td>BAB II — Metode Pengolahan Nilai Ijazah</td><td class="toc-dots"></td><td class="toc-page-num">4</td></tr>
            <tr><td>BAB III — Daftar Peserta Didik</td><td class="toc-dots"></td><td class="toc-page-num">5</td></tr>
            <tr><td>BAB IV — Daftar Mata Pelajaran &amp; Standar Kelulusan</td><td class="toc-dots"></td><td class="toc-page-num">6</td></tr>
            <tr><td>BAB V — Rekap Rata-rata Nilai Raport</td><td class="toc-dots"></td><td class="toc-page-num">7</td></tr>
            <tr><td>BAB VI — Rekap Nilai Ujian Madrasah</td><td class="toc-dots"></td><td class="toc-page-num">8</td></tr>
            <tr><td>BAB VII — Rekap Nilai Ijazah (Asli &amp; Katrol)</td><td class="toc-dots"></td><td class="toc-page-num">9</td></tr>
            <tr><td>BAB VIII — Penutup</td><td class="toc-dots"></td><td class="toc-page-num">10</td></tr>
          </tbody>
        </table>
      </div>

      <!-- BAB I: PENDAHULUAN -->
      <div class="page-break chapter">
        <h2 class="section-title">BAB I — PENDAHULUAN</h2>
        <div class="toc-line"></div>
        <div class="chapter-content">
          <h3>A. Latar Belakang</h3>
          <p>Dokumen rekap nilai ijazah ini disusun sebagai bentuk administrasi dan dokumentasi akademik dalam rangka penerbitan ijazah Madrasah Ibtidaiyah. Rekap ini mencakup seluruh proses pengolahan nilai mulai dari input data siswa, nilai raport, nilai ujian madrasah, hingga perhitungan nilai akhir ijazah.</p>

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
          <p>Katrol nilai dilakukan secara otomatis pada komponen ujian madrasah. Sistem menghitung selisih antara nilai ijazah terendah dengan SKL masing-masing mapel, kemudian menambahkan penyesuaian pada nilai ujian agar seluruh siswa memenuhi SKL. Mekanisme ini diterapkan secara seragam pada seluruh siswa untuk menjaga keadilan.</p>
        </div>
      </div>

      <!-- BAB III: DAFTAR SISWA -->
      <div class="page-break chapter">
        <h2 class="section-title">BAB III — DAFTAR PESERTA DIDIK</h2>
        <div class="toc-line"></div>
        <div class="chapter-content">
          <p>Berikut daftar peserta didik yang mengikuti ujian dan akan menerima ijazah:</p>
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

      <!-- BAB V: REKAP RAPORT -->
      <div class="page-break chapter">
        <h2 class="section-title">BAB V — REKAP RATA-RATA NILAI RAPORT</h2>
        <div class="toc-line"></div>
        <div class="chapter-content">
          <p>Rata-rata nilai raport semester 7–11 untuk setiap siswa:</p>
          <div class="table-wrapper">
            <table class="print-table compact fixed-table">
              <colgroup>
                <col style="width: 40px" />
                <col style="width: 250px" />
                <col v-for="m in store.mapelList" :key="m.id" />
              </colgroup>
              <thead>
                <tr>
                  <th>No</th>
                  <th>Nama</th>
                  <th v-for="m in store.mapelList" :key="m.id">{{ m.kode }}</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(s, idx) in sortedSiswa" :key="s.id">
                  <td class="num-cell">{{ idx + 1 }}</td>
                  <td class="name-cell">{{ s.nama }}</td>
                  <td v-for="m in store.mapelList" :key="m.id" class="num-cell">{{ store.getNilaiRaport(s.id, m.id)?.rataRata?.toFixed(2) ?? '-' }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- BAB VI: REKAP UJIAN -->
      <div class="page-break chapter">
        <h2 class="section-title">BAB VI — REKAP NILAI UJIAN MADRASAH</h2>
        <div class="toc-line"></div>
        <div class="chapter-content">
          <p>Nilai ujian madrasah (asli) untuk setiap siswa:</p>
          <div class="table-wrapper">
            <table class="print-table compact fixed-table">
              <colgroup>
                <col style="width: 40px" />
                <col style="width: 250px" />
                <col v-for="m in store.mapelList" :key="m.id" />
              </colgroup>
              <thead>
                <tr>
                  <th>No</th>
                  <th>Nama</th>
                  <th v-for="m in store.mapelList" :key="m.id">{{ m.kode }}</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(s, idx) in sortedSiswa" :key="s.id">
                  <td class="num-cell">{{ idx + 1 }}</td>
                  <td class="name-cell">{{ s.nama }}</td>
                  <td v-for="m in store.mapelList" :key="m.id" class="num-cell">{{ store.getNilaiUjian(s.id, m.id)?.nilai?.toFixed(2) ?? '-' }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- BAB VII: REKAP IJAZAH -->
      <div class="page-break chapter">
        <h2 class="section-title">BAB VII — REKAP NILAI IJAZAH</h2>
        <div class="toc-line"></div>
        <div class="chapter-content">
          <p>Nilai ijazah akhir (setelah katrol jika berlaku):</p>
          <div class="table-wrapper">
            <table class="print-table compact fixed-table">
              <colgroup>
                <col style="width: 40px" />
                <col style="width: 250px" />
                <col v-for="m in store.mapelList" :key="m.id" />
              </colgroup>
              <thead>
                <tr>
                  <th>No</th>
                  <th>Nama</th>
                  <th v-for="m in store.mapelList" :key="m.id">{{ m.kode }}</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(s, idx) in sortedSiswa" :key="s.id">
                  <td class="num-cell">{{ idx + 1 }}</td>
                  <td class="name-cell">{{ s.nama }}</td>
                  <td v-for="m in store.mapelList" :key="m.id" class="num-cell">{{ store.hitungNilaiIjazah(s.id, m.id, true)?.toFixed(2) ?? '-' }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- BAB VIII: PENUTUP -->
      <div class="chapter">
        <h2 class="section-title">BAB VIII — PENUTUP</h2>
        <div class="toc-line"></div>
        <div class="chapter-content">
          <p>Demikian rekap nilai ijazah ini disusun dengan sebenar-benarnya berdasarkan data nilai raport dan nilai ujian madrasah yang telah diolah menggunakan sistem Aplikasi Nilai Ijazah.</p>
          <p>Dokumen ini dapat digunakan sebagai acuan resmi dalam proses penerbitan ijazah Madrasah Ibtidaiyah tahun pelajaran {{ tahunAjaran }}.</p>

          <div class="sign-block">
            <p>__________________, _______________</p>
            <p>Kepala Madrasah,</p>
            <br /><br /><br /><br />
            <p>____________________________</p>
            <p>NIP. ____________________________</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Screen styles */
.toolbar { display: flex; align-items: center; justify-content: space-between; gap: 1rem; margin-bottom: 1.5rem; flex-wrap: wrap; }
.page-heading { font-size: 1.125rem; font-weight: 600; color: var(--text-primary); }
.page-desc { font-size: 0.875rem; color: var(--text-secondary); margin-top: 0.25rem; }

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
.cover-logo { margin-bottom: 2rem; }
.cover-emblem { display: inline-block; color: var(--text-primary); }
.cover-title { font-size: 1.5rem; font-weight: 800; color: var(--text-primary); letter-spacing: 0.1em; margin-bottom: 0.5rem; }
.cover-subtitle { font-size: 1.125rem; font-weight: 600; color: var(--text-secondary); margin-bottom: 2rem; }
.cover-line { height: 2px; background: var(--text-secondary); margin: 1.5rem 4rem; }
.cover-info { color: var(--text-secondary); line-height: 2; font-size: 0.9375rem; }
.cover-footer { margin-top: 1rem; color: var(--text-secondary); }
.cover-school { font-weight: 600; color: var(--text-primary); margin-top: 0.75rem; }
.cover-note { font-size: 0.8125rem; color: var(--text-muted); }

/* TOC */
.toc-table { width: 100%; border-collapse: collapse; }
.toc-table td { padding: 0.5rem 0; font-size: 0.9375rem; color: var(--text-primary); vertical-align: bottom; }
.toc-dots { border-bottom: 1px dotted var(--text-muted); width: 100%; }
.toc-page-num { text-align: right; width: 40px; font-weight: 600; }

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

/* Print tables */
.print-table { width: 100%; border-collapse: collapse; margin: 0.75rem 0; }
.print-table th, .print-table td { border: 1px solid var(--border-default); padding: 0.375rem 0.5rem; font-size: 0.8125rem; }
.print-table th { background: var(--bg-muted); font-weight: 600; text-align: center; color: var(--text-secondary); }
.print-table td { color: var(--text-primary); }
.print-table.compact th, .print-table.compact td { padding: 0.15rem 0.25rem; font-size: 0.65rem; }
.fixed-table { table-layout: fixed; width: 100%; }
.name-cell { white-space: nowrap; font-weight: 500; overflow: hidden; text-overflow: ellipsis; }
.num-cell { text-align: center; }
.table-wrapper { overflow-x: auto; -webkit-overflow-scrolling: touch; }

.sign-block { text-align: center; margin-top: 3rem; color: var(--text-primary); font-size: 0.875rem; line-height: 1.8; }

/* Page break hint (screen) */
.page-break { border-bottom: 2px dashed var(--border-default); padding-bottom: 2rem; margin-bottom: 2rem; }

/* PRINT */
@media print {
  @page {
    size: A4 landscape;
    margin: 1cm 1.5cm;
  }
  .no-print { display: none !important; }
  .print-doc { background: white; border: none; padding: 0; max-width: none; border-radius: 0; }
  .page-break { page-break-after: always; border-bottom: none; padding-bottom: 0; margin-bottom: 0; }
  .section-title { color: black; }
  .toc-line { background: #333; }
  .cover-border { border-color: #333; }
  .cover-title, .cover-emblem, .cover-school { color: black; }
  .cover-subtitle, .cover-info, .cover-footer, .cover-note { color: #555; }
  .cover-line { background: #333; }
  .chapter-content, .chapter-content h3, .chapter-content p, .chapter-content ol li { color: black; }
  .formula-box { background: #f5f5f5; border-color: #ccc; }
  .print-table th { background: #eee; color: #333; border-color: #999; }
  .print-table td { color: black; border-color: #999; }
  .toc-table td { color: black; }
  .sign-block { color: black; }
  body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
}

@media (max-width: 640px) {
  .toolbar { flex-direction: column; align-items: stretch; }
  .print-doc { padding: 1rem; }
  .cover-page { padding: 2rem 1rem; }
  .cover-border { padding: 2rem 1rem; }
  .cover-title { font-size: 1.125rem; }
  .cover-line { margin: 1rem 1rem; }
}
</style>
