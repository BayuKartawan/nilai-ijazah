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
    { key: 'semester7', label: 'Semester 7' },
    { key: 'semester8', label: 'Semester 8' },
    { key: 'semester9', label: 'Semester 9' },
    { key: 'semester10', label: 'Semester 10' },
    { key: 'semester11', label: 'Semester 11' },
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
          'Semester 7': 'semester7',
          'Semester 8': 'semester8',
          'Semester 9': 'semester9',
          'Semester 10': 'semester10',
          'Semester 11': 'semester11',
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
  hitungNilaiIjazah: (sid: string, mid: string, useKatrol: boolean) => number | null,
  shouldRound: boolean
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
      
      const valRaport = nr?.rataRata ?? null
      const valUjian = nu?.nilai ?? null
      const valUjianKatrol = nu?.nilaiKatrol ?? nu?.nilai ?? null
      const valIjazah = hitungNilaiIjazah(siswa.id, mapel.id, false)
      const valIjazahKatrol = hitungNilaiIjazah(siswa.id, mapel.id, true)

      row.push(valRaport !== null ? (shouldRound ? Math.round(valRaport) : valRaport) : null)
      row.push(valUjian !== null ? (shouldRound ? Math.round(valUjian) : valUjian) : null)
      row.push(valUjianKatrol !== null ? (shouldRound ? Math.round(valUjianKatrol) : valUjianKatrol) : null)
      row.push(valIjazah !== null ? (shouldRound ? Math.round(valIjazah) : valIjazah) : null)
      row.push(valIjazahKatrol !== null ? (shouldRound ? Math.round(valIjazahKatrol) : valIjazahKatrol) : null)
    })
    rows.push(row)
  })

  const ws = XLSX.utils.aoa_to_sheet(rows)
  ws['!cols'] = headers.map(() => ({ wch: 16 }))
  XLSX.utils.book_append_sheet(wb, ws, 'Rekap Nilai')

  const buf = XLSX.write(wb, { bookType: 'xlsx', type: 'array' })
  saveAs(new Blob([buf], { type: 'application/octet-stream' }), `rekap_nilai_ijazah${shouldRound ? '_bulat' : ''}.xlsx`)
}

export function exportRekapIjazahAsli(
  siswaList: Siswa[],
  mapelList: Mapel[],
  hitungNilaiIjazah: (sid: string, mid: string, useKatrol: boolean) => number | null,
  shouldRound: boolean
) {
  const wb = XLSX.utils.book_new()
  const headers = ['No', 'NISN', 'Nama Siswa']
  mapelList.forEach(m => {
    headers.push(m.kode)
  })
  headers.push('Rata-rata')

  const rows: (string | number | null)[][] = [headers]
  siswaList.forEach((siswa, idx) => {
    const row: (string | number | null)[] = [idx + 1, siswa.nisn, siswa.nama]
    const vals: number[] = []
    mapelList.forEach(mapel => {
      const v = hitungNilaiIjazah(siswa.id, mapel.id, false)
      if (v != null) {
        const finalVal = shouldRound ? Math.round(v) : v
        row.push(finalVal)
        vals.push(finalVal)
      } else {
        row.push(null)
      }
    })
    const avg = vals.length > 0 ? vals.reduce((a, b) => a + b, 0) / vals.length : null
    row.push(avg !== null ? (shouldRound ? Math.round(avg) : Number(avg.toFixed(2))) : null)
    rows.push(row)
  })

  // Add footer row for per-mapel averages
  const footerRow: (string | number | null)[] = ['Rata-rata Mapel', '', '']
  mapelList.forEach(mapel => {
    const vals: number[] = []
    siswaList.forEach(siswa => {
      const v = hitungNilaiIjazah(siswa.id, mapel.id, false)
      if (v != null) {
        vals.push(shouldRound ? Math.round(v) : v)
      }
    })
    const avg = vals.length > 0 ? vals.reduce((a, b) => a + b, 0) / vals.length : null
    footerRow.push(avg !== null ? (shouldRound ? Math.round(avg) : Number(avg.toFixed(2))) : null)
  })
  footerRow.push(null)
  rows.push(footerRow)

  const ws = XLSX.utils.aoa_to_sheet(rows)
  ws['!cols'] = headers.map((_, i) => ({ wch: i <= 2 ? 16 : 12 }))
  XLSX.utils.book_append_sheet(wb, ws, 'Rekap Ijazah Asli')

  const buf = XLSX.write(wb, { bookType: 'xlsx', type: 'array' })
  saveAs(new Blob([buf], { type: 'application/octet-stream' }), `rekap_nilai_ijazah_asli${shouldRound ? '_bulat' : ''}.xlsx`)
}

export function exportRekapIjazahKatrol(
  siswaList: Siswa[],
  mapelList: Mapel[],
  hitungNilaiIjazah: (sid: string, mid: string, useKatrol: boolean) => number | null,
  shouldRound: boolean
) {
  const wb = XLSX.utils.book_new()
  const headers = ['No', 'NISN', 'Nama Siswa']
  mapelList.forEach(m => {
    headers.push(m.kode)
  })
  headers.push('Rata-rata')

  const rows: (string | number | null)[][] = [headers]
  siswaList.forEach((siswa, idx) => {
    const row: (string | number | null)[] = [idx + 1, siswa.nisn, siswa.nama]
    const vals: number[] = []
    mapelList.forEach(mapel => {
      const v = hitungNilaiIjazah(siswa.id, mapel.id, true)
      if (v != null) {
        const finalVal = shouldRound ? Math.round(v) : v
        row.push(finalVal)
        vals.push(finalVal)
      } else {
        row.push(null)
      }
    })
    const avg = vals.length > 0 ? vals.reduce((a, b) => a + b, 0) / vals.length : null
    row.push(avg !== null ? (shouldRound ? Math.round(avg) : Number(avg.toFixed(2))) : null)
    rows.push(row)
  })

  // Add footer row for per-mapel averages
  const footerRow: (string | number | null)[] = ['Rata-rata Mapel', '', '']
  mapelList.forEach(mapel => {
    const vals: number[] = []
    siswaList.forEach(siswa => {
      const v = hitungNilaiIjazah(siswa.id, mapel.id, true)
      if (v != null) {
        vals.push(shouldRound ? Math.round(v) : v)
      }
    })
    const avg = vals.length > 0 ? vals.reduce((a, b) => a + b, 0) / vals.length : null
    footerRow.push(avg !== null ? (shouldRound ? Math.round(avg) : Number(avg.toFixed(2))) : null)
  })
  footerRow.push(null)
  rows.push(footerRow)

  const ws = XLSX.utils.aoa_to_sheet(rows)
  ws['!cols'] = headers.map((_, i) => ({ wch: i <= 2 ? 16 : 12 }))
  XLSX.utils.book_append_sheet(wb, ws, 'Rekap Ijazah Katrol')

  const buf = XLSX.write(wb, { bookType: 'xlsx', type: 'array' })
  saveAs(new Blob([buf], { type: 'application/octet-stream' }), `rekap_nilai_ijazah_katrol${shouldRound ? '_bulat' : ''}.xlsx`)
}
