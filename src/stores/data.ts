import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Siswa, Mapel, NilaiRaport, NilaiUjian, SettingKatrol } from '@/types'

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 5)
}

export const useDataStore = defineStore('data', () => {
  // ========== STATE ==========
  const siswaList = ref<Siswa[]>(loadFromStorage('siswaList', []))
  const mapelList = ref<Mapel[]>(loadFromStorage('mapelList', getDefaultMapel()))
  const nilaiRaport = ref<NilaiRaport[]>(loadFromStorage('nilaiRaport', []))
  const nilaiUjian = ref<NilaiUjian[]>(loadFromStorage('nilaiUjian', []))
  const settingKatrol = ref<SettingKatrol>(loadFromStorage('settingKatrol', {
    bobotRaport: 60,
    bobotUjian: 40,
  }))

  // ========== HELPERS ==========
  function loadFromStorage<T>(key: string, defaultValue: T): T {
    try {
      const stored = localStorage.getItem(`nilai-ijazah-${key}`)
      return stored ? JSON.parse(stored) : defaultValue
    } catch {
      return defaultValue
    }
  }

  function saveToStorage(key: string, value: unknown) {
    localStorage.setItem(`nilai-ijazah-${key}`, JSON.stringify(value))
  }

  function saveAll() {
    saveToStorage('siswaList', siswaList.value)
    saveToStorage('mapelList', mapelList.value)
    saveToStorage('nilaiRaport', nilaiRaport.value)
    saveToStorage('nilaiUjian', nilaiUjian.value)
    saveToStorage('settingKatrol', settingKatrol.value)
  }

  // ========== DEFAULT MAPEL (Kurikulum Merdeka MI) ==========
  function getDefaultMapel(): Mapel[] {
    return [
      { id: generateId(), kode: 'PAI-QH', nama: 'Al-Qur\'an Hadis', kelompok: 'A', kkm: 75, isPAI: true },
      { id: generateId(), kode: 'PAI-AA', nama: 'Akidah Akhlak', kelompok: 'A', kkm: 75, isPAI: true },
      { id: generateId(), kode: 'PAI-FQ', nama: 'Fikih', kelompok: 'A', kkm: 75, isPAI: true },
      { id: generateId(), kode: 'PAI-SKI', nama: 'Sejarah Kebudayaan Islam', kelompok: 'A', kkm: 75, isPAI: true },
      { id: generateId(), kode: 'BAR', nama: 'Bahasa Arab', kelompok: 'A', kkm: 75, isPAI: false },
      { id: generateId(), kode: 'PP', nama: 'Pendidikan Pancasila', kelompok: 'A', kkm: 75, isPAI: false },
      { id: generateId(), kode: 'BIN', nama: 'Bahasa Indonesia', kelompok: 'A', kkm: 75, isPAI: false },
      { id: generateId(), kode: 'MTK', nama: 'Matematika', kelompok: 'A', kkm: 75, isPAI: false },
      { id: generateId(), kode: 'IPAS', nama: 'Ilmu Pengetahuan Alam dan Sosial', kelompok: 'A', kkm: 75, isPAI: false },
      { id: generateId(), kode: 'PJOK', nama: 'Pendidikan Jasmani, Olahraga, dan Kesehatan', kelompok: 'A', kkm: 75, isPAI: false },
      { id: generateId(), kode: 'SB', nama: 'Seni dan Budaya', kelompok: 'B', kkm: 75, isPAI: false },
      { id: generateId(), kode: 'BING', nama: 'Bahasa Inggris', kelompok: 'B', kkm: 75, isPAI: false },
      { id: generateId(), kode: 'MULOK', nama: 'Bahasa Sasak', kelompok: 'C', kkm: 70, isPAI: false },
    ]
  }

  // ========== SORTED SISWA (alphabetical) ==========
  const sortedSiswa = computed(() =>
    [...siswaList.value].sort((a, b) => a.nama.localeCompare(b.nama, 'id'))
  )

  // ========== SISWA ==========
  function isNisnDuplicate(nisn: string, excludeId?: string): boolean {
    return siswaList.value.some(s => s.nisn === nisn && s.id !== excludeId)
  }

  function addSiswa(siswa: Omit<Siswa, 'id'>): { success: boolean; error?: string } {
    if (isNisnDuplicate(siswa.nisn)) {
      return { success: false, error: `NISN "${siswa.nisn}" sudah terdaftar.` }
    }
    const id = generateId()
    siswaList.value.push({ ...siswa, id })
    initNilaiForSiswa(id)
    saveAll()
    return { success: true }
  }

  function updateSiswa(id: string, data: Partial<Siswa>): { success: boolean; error?: string } {
    if (data.nisn && isNisnDuplicate(data.nisn, id)) {
      return { success: false, error: `NISN "${data.nisn}" sudah digunakan siswa lain.` }
    }
    const idx = siswaList.value.findIndex(s => s.id === id)
    if (idx !== -1) {
      siswaList.value[idx] = { ...siswaList.value[idx]!, ...data } as Siswa
      saveAll()
    }
    return { success: true }
  }

  function deleteSiswa(id: string) {
    siswaList.value = siswaList.value.filter(s => s.id !== id)
    nilaiRaport.value = nilaiRaport.value.filter(n => n.siswaId !== id)
    nilaiUjian.value = nilaiUjian.value.filter(n => n.siswaId !== id)
    saveAll()
  }

  function importSiswa(list: Omit<Siswa, 'id'>[]): { imported: number; updated: number } {
    let imported = 0
    let updated = 0
    list.forEach(s => {
      const existing = siswaList.value.find(x => x.nisn === s.nisn)
      if (existing) {
        Object.assign(existing, s)
        updated++
      } else {
        const id = generateId()
        siswaList.value.push({ ...s, id })
        initNilaiForSiswa(id)
        imported++
      }
    })
    saveAll()
    return { imported, updated }
  }

  // ========== MAPEL ==========
  function addMapel(mapel: Omit<Mapel, 'id'>) {
    const newMapel = { ...mapel, id: generateId() }
    mapelList.value.push(newMapel)
    siswaList.value.forEach(s => {
      nilaiRaport.value.push({
        siswaId: s.id, mapelId: newMapel.id,
        semester7: null, semester8: null, semester9: null, semester10: null, semester11: null,
        rataRata: null
      })
      nilaiUjian.value.push({
        siswaId: s.id, mapelId: newMapel.id,
        nilai: null, nilaiKatrol: null, isKatrol: false
      })
    })
    saveAll()
  }

  function updateMapel(id: string, data: Partial<Mapel>) {
    const idx = mapelList.value.findIndex(m => m.id === id)
    if (idx !== -1) {
      mapelList.value[idx] = { ...mapelList.value[idx]!, ...data } as Mapel
      saveAll()
    }
  }

  function deleteMapel(id: string) {
    mapelList.value = mapelList.value.filter(m => m.id !== id)
    nilaiRaport.value = nilaiRaport.value.filter(n => n.mapelId !== id)
    nilaiUjian.value = nilaiUjian.value.filter(n => n.mapelId !== id)
    saveAll()
  }

  // ========== NILAI RAPORT ==========
  function initNilaiForSiswa(siswaId: string) {
    mapelList.value.forEach(m => {
      const exists = nilaiRaport.value.find(n => n.siswaId === siswaId && n.mapelId === m.id)
      if (!exists) {
        nilaiRaport.value.push({
          siswaId, mapelId: m.id,
          semester7: null, semester8: null, semester9: null, semester10: null, semester11: null,
          rataRata: null
        })
      }
      const existsUjian = nilaiUjian.value.find(n => n.siswaId === siswaId && n.mapelId === m.id)
      if (!existsUjian) {
        nilaiUjian.value.push({
          siswaId, mapelId: m.id,
          nilai: null, nilaiKatrol: null, isKatrol: false
        })
      }
    })
  }

  function updateNilaiRaport(siswaId: string, mapelId: string, data: Partial<NilaiRaport>) {
    const idx = nilaiRaport.value.findIndex(n => n.siswaId === siswaId && n.mapelId === mapelId)
    if (idx !== -1) {
      const nr = { ...nilaiRaport.value[idx]!, ...data } as NilaiRaport
      const semesters = [nr.semester7, nr.semester8, nr.semester9, nr.semester10, nr.semester11].filter(v => v !== null) as number[]
      nr.rataRata = semesters.length > 0 ? Math.round((semesters.reduce((a, b) => a + b, 0) / semesters.length) * 100) / 100 : null
      nilaiRaport.value[idx] = nr
      saveAll()
    }
  }

  function getNilaiRaport(siswaId: string, mapelId: string): NilaiRaport | undefined {
    return nilaiRaport.value.find(n => n.siswaId === siswaId && n.mapelId === mapelId)
  }

  // ========== NILAI UJIAN ==========
  function updateNilaiUjian(siswaId: string, mapelId: string, data: Partial<NilaiUjian>) {
    const idx = nilaiUjian.value.findIndex(n => n.siswaId === siswaId && n.mapelId === mapelId)
    if (idx !== -1) {
      nilaiUjian.value[idx] = { ...nilaiUjian.value[idx]!, ...data } as NilaiUjian
      saveAll()
    }
  }

  function getNilaiUjian(siswaId: string, mapelId: string): NilaiUjian | undefined {
    return nilaiUjian.value.find(n => n.siswaId === siswaId && n.mapelId === mapelId)
  }

  // ========== KATROL NILAI IJAZAH ==========
  function katrolGlobalMapelIjazah(mapelId: string) {
    const mapel = mapelList.value.find(m => m.id === mapelId)
    if (!mapel) return

    let lowestIjazah = 100
    siswaList.value.forEach(s => {
      const ijazah = hitungNilaiIjazah(s.id, mapelId, false)
      if (ijazah !== null && ijazah < lowestIjazah) {
        lowestIjazah = ijazah
      }
    })

    if (lowestIjazah < mapel.kkm) {
      const gapIjazah = mapel.kkm - lowestIjazah
      const boostUjian = gapIjazah / (settingKatrol.value.bobotUjian / 100)
      
      siswaList.value.forEach(s => {
        const nu = getNilaiUjian(s.id, mapelId)
        if (nu && nu.nilai !== null) {
          let newVal = nu.nilai + boostUjian
          if (newVal > 100) newVal = 100
          const idx = nilaiUjian.value.findIndex(n => n.siswaId === s.id && n.mapelId === mapelId)
          if (idx !== -1) {
            nilaiUjian.value[idx]!.nilaiKatrol = newVal
            nilaiUjian.value[idx]!.isKatrol = true
          }
        }
      })
      saveAll()
    }
  }

  function katrolNilaiIjazah() {
    mapelList.value.forEach(mapel => katrolGlobalMapelIjazah(mapel.id))
  }

  // ========== NILAI IJAZAH ==========
  function hitungNilaiIjazah(siswaId: string, mapelId: string, useKatrol: boolean = false): number | null {
    const nr = getNilaiRaport(siswaId, mapelId)
    const nu = getNilaiUjian(siswaId, mapelId)
    if (!nr?.rataRata) return null

    const nilaiUjianFinal = useKatrol
      ? (nu?.nilaiKatrol ?? nu?.nilai ?? null)
      : (nu?.nilai ?? null)

    if (nilaiUjianFinal === null) return null

    const nilaiIjazah = (nr.rataRata * settingKatrol.value.bobotRaport / 100) +
                        (nilaiUjianFinal * settingKatrol.value.bobotUjian / 100)

    return Math.round(nilaiIjazah * 100) / 100
  }

  // ========== COMPUTED ==========
  const totalSiswa = computed(() => siswaList.value.length)
  const totalMapel = computed(() => mapelList.value.length)

  // ========== BACKUP / RESTORE ==========
  function exportBackup(): string {
    const data = {
      version: 3,
      exportedAt: new Date().toISOString(),
      siswaList: siswaList.value,
      mapelList: mapelList.value,
      nilaiRaport: nilaiRaport.value,
      nilaiUjian: nilaiUjian.value,
      settingKatrol: settingKatrol.value,
    }
    return JSON.stringify(data, null, 2)
  }

  function importBackup(jsonStr: string): { success: boolean; error?: string } {
    try {
      const data = JSON.parse(jsonStr)
      if (!data.siswaList || !data.mapelList) {
        return { success: false, error: 'Format file backup tidak valid.' }
      }
      siswaList.value = data.siswaList
      mapelList.value = data.mapelList
      nilaiRaport.value = data.nilaiRaport || []
      nilaiUjian.value = data.nilaiUjian || []
      settingKatrol.value = data.settingKatrol || { bobotRaport: 60, bobotUjian: 40 }
      saveAll()
      return { success: true }
    } catch {
      return { success: false, error: 'Gagal membaca file backup. Pastikan file JSON valid.' }
    }
  }

  // ========== RESET ==========
  function resetAllData() {
    siswaList.value = []
    mapelList.value = getDefaultMapel()
    nilaiRaport.value = []
    nilaiUjian.value = []
    settingKatrol.value = { bobotRaport: 60, bobotUjian: 40 }
    saveAll()
  }

  return {
    siswaList,
    sortedSiswa,
    mapelList,
    nilaiRaport,
    nilaiUjian,
    settingKatrol,

    addSiswa,
    updateSiswa,
    deleteSiswa,
    importSiswa,
    isNisnDuplicate,

    addMapel,
    updateMapel,
    deleteMapel,

    updateNilaiRaport,
    getNilaiRaport,
    initNilaiForSiswa,

    updateNilaiUjian,
    getNilaiUjian,

    katrolGlobalMapelIjazah,
    katrolNilaiIjazah,
    hitungNilaiIjazah,

    totalSiswa,
    totalMapel,

    exportBackup,
    importBackup,
    resetAllData,
    saveAll,
  }
})
