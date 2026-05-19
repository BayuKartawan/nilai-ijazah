import * as XLSX from 'xlsx'
import { saveAs } from 'file-saver'
import type { Siswa, Mapel, NilaiRaport, NilaiUjian } from '@/types'

// ========== EXPORT TEMPLATES ==========

export function exportTemplateSiswa() {
  const headers = ['NISN', 'Nama Lengkap']
  const example = ['0012345678', 'Ahmad Fauzi']

  const ws = XLSX.utils.aoa_to_sheet([headers, example])
  ws['!cols'] = headers.map(() => ({ wch: 25 }))
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Data Siswa')

  const buf = XLSX.write(wb, { bookType: 'xlsx', type: 'array' })
  saveAs(new Blob([buf], { type: 'application/octet-stream' }), 'template_data_siswa.xlsx')
}

/**
 * Template Nilai Raport: 1 sheet per semester (5 sheets: Semester 3–7)
 * Each sheet has columns: NISN | Nama Siswa | [mapel1] | [mapel2] | ...
 */
export function exportTemplateNilaiRaport(mapelList: Mapel[], siswaList: Siswa[]) {
  const wb = XLSX.utils.book_new()
  const semesters = [
    { key: 'semester3', label: 'Semester 3' },
    { key: 'semester4', label: 'Semester 4' },
    { key: 'semester5', label: 'Semester 5' },
    { key: 'semester6', label: 'Semester 6' },
    { key: 'semester7', label: 'Semester 7' },
  ]

  semesters.forEach(sem => {
    const headers = ['NISN', 'Nama Siswa', ...mapelList.map(m => m.kode)]
    const rows: any[][] = [headers]
    siswaList.forEach(s => {
      rows.push([s.nisn, s.nama, ...mapelList.map(() => '')])
    })

    const ws = XLSX.utils.aoa_to_sheet(rows)
    ws['!cols'] = headers.map((_, i) => ({ wch: i <= 1 ? 25 : 12 }))
    XLSX.utils.book_append_sheet(wb, ws, sem.label)
  })
  const buf = XLSX.write(wb, { bookType: 'xlsx', type: 'array' })
  saveAs(new Blob([buf], { type: 'application/octet-stream' }), 'template_nilai_raport.xlsx')
}

export function exportTemplateNilaiUjian(mapelList: Mapel[], siswaList: Siswa[]) {
  const wb = XLSX.utils.book_new()
  mapelList.forEach(mapel => {
    const headers = ['NISN', 'Nama Siswa', 'Nilai Ujian']
    const rows: any[][] = [headers]
    siswaList.forEach(s => {
      rows.push([s.nisn, s.nama, ''])
    })

    const ws = XLSX.utils.aoa_to_sheet(rows)
    ws['!cols'] = headers.map(() => ({ wch: 18 }))
    XLSX.utils.book_append_sheet(wb, ws, mapel.kode.substring(0, 31))
  })
  const buf = XLSX.write(wb, { bookType: 'xlsx', type: 'array' })
  saveAs(new Blob([buf], { type: 'application/octet-stream' }), 'template_nilai_ujian.xlsx')
}

// ========== IMPORT DATA ==========

export function parseSiswaFromExcel(file: File): Promise<Omit<Siswa, 'id'>[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer)
        const wb = XLSX.read(data, { type: 'array' })
        const sheetName = wb.SheetNames[0]
        if (!sheetName) return resolve([])
        const ws = wb.Sheets[sheetName]
        if (!ws) return resolve([])
        const rows = XLSX.utils.sheet_to_json<string[]>(ws, { header: 1 })

        const siswaList: Omit<Siswa, 'id'>[] = []
        for (let i = 1; i < rows.length; i++) {
          const row = rows[i]
          if (!row || !row[0]) continue
          siswaList.push({
            nisn: String(row[0] || ''),
            nama: String(row[1] || ''),
          })
        }
        resolve(siswaList)
      } catch (err) { reject(err) }
    }
    reader.readAsArrayBuffer(file)
  })
}

/**
 * Parse Nilai Raport from Excel: expects 5 sheets named "Semester 3"–"Semester 7"
 * Each sheet has columns: NISN | Nama Siswa | [mapel1] | [mapel2] | ...
 */
export function parseNilaiRaportFromExcel(
  file: File, siswaList: Siswa[], mapelList: Mapel[]
): Promise<{ siswaId: string; mapelId: string; data: Partial<NilaiRaport> }[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer)
        const wb = XLSX.read(data, { type: 'array' })
        const results: { siswaId: string; mapelId: string; data: Partial<NilaiRaport> }[] = []

        const semesterMap: Record<string, keyof NilaiRaport> = {
          'Semester 3': 'semester3',
          'Semester 4': 'semester4',
          'Semester 5': 'semester5',
          'Semester 6': 'semester6',
          'Semester 7': 'semester7',
        }

        wb.SheetNames.forEach(sheetName => {
          const semField = semesterMap[sheetName]
          if (!semField) return

          const ws = wb.Sheets[sheetName]
          if (!ws) return
          const rows = XLSX.utils.sheet_to_json<string[]>(ws, { header: 1 })
          if (rows.length < 1) return

          // First row is headers: NISN, Nama, then mapel codes
          const headerRow = rows[0]!
          // Build mapel index mapping: column index -> mapel
          const mapelCols: { colIdx: number; mapel: Mapel }[] = []
          for (let c = 2; c < headerRow.length; c++) {
            const code = String(headerRow[c] || '').trim()
            const mapel = mapelList.find(m => m.kode === code)
            if (mapel) {
              mapelCols.push({ colIdx: c, mapel })
            }
          }

          for (let i = 1; i < rows.length; i++) {
            const row = rows[i]
            if (!row || !row[0]) continue
            const siswa = siswaList.find(s => s.nisn === String(row[0]))
            if (!siswa) continue

            mapelCols.forEach(({ colIdx, mapel }) => {
              const val = row[colIdx]
              if (val != null && val !== '') {
                results.push({
                  siswaId: siswa.id,
                  mapelId: mapel.id,
                  data: { [semField]: Number(val) }
                })
              }
            })
          }
        })
        resolve(results)
      } catch (err) { reject(err) }
    }
    reader.readAsArrayBuffer(file)
  })
}

export function parseNilaiUjianFromExcel(
  file: File, siswaList: Siswa[], mapelList: Mapel[]
): Promise<{ siswaId: string; mapelId: string; data: Partial<NilaiUjian> }[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer)
        const wb = XLSX.read(data, { type: 'array' })
        const results: { siswaId: string; mapelId: string; data: Partial<NilaiUjian> }[] = []

        wb.SheetNames.forEach(sheetName => {
          const mapel = mapelList.find(m => m.kode === sheetName)
          if (!mapel) return
          const ws = wb.Sheets[sheetName]
          if (!ws) return
          const rows = XLSX.utils.sheet_to_json<string[]>(ws, { header: 1 })

          for (let i = 1; i < rows.length; i++) {
            const row = rows[i]
            if (!row || !row[0]) continue
            // row[0] is now NISN
            const siswa = siswaList.find(s => s.nisn === String(row[0]))
            if (!siswa) continue
            results.push({
              siswaId: siswa.id, mapelId: mapel.id,
              data: { nilai: row[2] != null && row[2] !== '' ? Number(row[2]) : null }
            })
          }
        })
        resolve(results)
      } catch (err) { reject(err) }
    }
    reader.readAsArrayBuffer(file)
  })
}

// ========== EXPORT DATA ==========

export function exportRekapNilai(
  siswaList: Siswa[], mapelList: Mapel[],
  getNilaiRaport: (sid: string, mid: string) => NilaiRaport | undefined,
  getNilaiUjian: (sid: string, mid: string) => NilaiUjian | undefined,
  hitungNilaiIjazah: (sid: string, mid: string, useKatrol: boolean) => number | null
) {
  const wb = XLSX.utils.book_new()
  const headers = ['No', 'NISN', 'Nama Siswa']
  mapelList.forEach(m => {
    headers.push(`Raport ${m.kode}`)
    headers.push(`Ujian ${m.kode}`)
    headers.push(`Ujian Katrol ${m.kode}`)
    headers.push(`Ijazah ${m.kode}`)
    headers.push(`Ijazah Katrol ${m.kode}`)
  })

  const rows: (string | number | null)[][] = [headers]
  siswaList.forEach((siswa, idx) => {
    const row: (string | number | null)[] = [idx + 1, siswa.nisn, siswa.nama]
    mapelList.forEach(mapel => {
      const nr = getNilaiRaport(siswa.id, mapel.id)
      const nu = getNilaiUjian(siswa.id, mapel.id)
      row.push(nr?.rataRata ?? null)
      row.push(nu?.nilai ?? null)
      row.push(nu?.nilaiKatrol ?? nu?.nilai ?? null)
      row.push(hitungNilaiIjazah(siswa.id, mapel.id, false))
      row.push(hitungNilaiIjazah(siswa.id, mapel.id, true))
    })
    rows.push(row)
  })

  const ws = XLSX.utils.aoa_to_sheet(rows)
  ws['!cols'] = headers.map(() => ({ wch: 16 }))
  XLSX.utils.book_append_sheet(wb, ws, 'Rekap Nilai')

  const buf = XLSX.write(wb, { bookType: 'xlsx', type: 'array' })
  saveAs(new Blob([buf], { type: 'application/octet-stream' }), 'rekap_nilai_ijazah.xlsx')
}
