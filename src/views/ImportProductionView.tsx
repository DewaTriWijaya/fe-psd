import { defineComponent, ref } from 'vue'
import * as XLSX from 'xlsx'
import FormSelect from '../components/FormSelect'
import FileUpload from '../components/FileUpload'

interface ExcelRow {
  [key: string]: any
}

export default defineComponent({
  name: 'ImportProductionView',
  components: {
    FormSelect,
    FileUpload
  },
  setup() {
    const commodity = ref('')
    const year = ref('')
    const selectedFile = ref<File | null>(null)
    const previewData = ref<ExcelRow[]>([])
    const previewHeaders = ref<string[]>([])
    const showPreview = ref(false)
    const isProcessing = ref(false)

    const commodityOptions = [
      { value: 'PADI', label: 'Padi' },
      { value: 'JAGUNG', label: 'Jagung' },
      { value: 'KEDELAI', label: 'Kedelai' }
    ]

    const yearOptions = [
      { value: '2025', label: '2025' },
      { value: '2024', label: '2024' },
      { value: '2023', label: '2023' }
    ]

    const handleFileSelected = async (file: File) => {
      selectedFile.value = file
      isProcessing.value = true
      
      try {
        // Read Excel file
        const data = await file.arrayBuffer()
        const workbook = XLSX.read(data, { type: 'array' })
        
        // Get first sheet
        const firstSheetName = workbook.SheetNames[0]
        if (!firstSheetName) {
          alert('File tidak memiliki sheet')
          showPreview.value = false
          return
        }
        
        const worksheet = workbook.Sheets[firstSheetName]
        if (!worksheet) {
          alert('Sheet tidak dapat dibaca')
          showPreview.value = false
          return
        }
        
        // Get the range of the worksheet
        const range = XLSX.utils.decode_range(worksheet['!ref'] || 'A1')
        
        // Read headers from row 4 and row 5 (merged headers)
        // Row 4: NO, KECAMATAN, Target Produksi, HASIL PRODUKSI, (empty for months), TOTAL, REALISASI
        // Row 5: (empty), (empty), (empty), JANUARI, FEBRUARI, ..., DESEMBER, (empty), (empty)
        const headers: string[] = []
        for (let col = range.s.c; col <= range.e.c; col++) {
          const row4Cell = worksheet[XLSX.utils.encode_cell({ r: 3, c: col })] // Row 4
          const row5Cell = worksheet[XLSX.utils.encode_cell({ r: 4, c: col })] // Row 5
          
          const row4Value = row4Cell ? String(row4Cell.v).trim() : ''
          const row5Value = row5Cell ? String(row5Cell.v).trim() : ''
          
          // Combine headers: use row 5 if exists (months), otherwise use row 4
          let headerName = ''
          if (row5Value && row5Value !== '') {
            headerName = row5Value // Month names (JANUARI, FEBRUARI, etc.)
          } else if (row4Value && row4Value !== '') {
            headerName = row4Value // Main headers (NO, KECAMATAN, etc.)
          } else {
            headerName = `COLUMN_${col}` // Fallback
          }
          
          headers.push(headerName)
        }
        
        // Filter out empty headers
        const validHeaders = headers.filter(h => h && h.trim() !== '' && !h.startsWith('COLUMN_'))
        previewHeaders.value = validHeaders
        
        // Create column index mapping (only for valid headers)
        const headerIndexMap = new Map<string, number>()
        headers.forEach((h, idx) => {
          if (h && h.trim() !== '' && !h.startsWith('COLUMN_')) {
            headerIndexMap.set(h, idx)
          }
        })
        
        // Read data starting from row 6 (index 5)
        const jsonData: ExcelRow[] = []
        for (let row = 5; row <= Math.min(range.e.r, 14); row++) { // Read max 10 rows (6-15)
          const rowData: ExcelRow = {}
          
          // Only read columns that have valid headers
          validHeaders.forEach(header => {
            const colIndex = headerIndexMap.get(header)
            if (colIndex !== undefined) {
              const cellAddress = XLSX.utils.encode_cell({ r: row, c: colIndex })
              const cell = worksheet[cellAddress]
              rowData[header] = cell ? String(cell.v) : ''
            }
          })
          
          jsonData.push(rowData)
        }
        
        if (jsonData.length > 0) {
          previewData.value = jsonData
          showPreview.value = true
        } else {
          alert('File kosong atau format tidak valid')
          showPreview.value = false
        }
      } catch (error) {
        console.error('Error reading file:', error)
        alert('Gagal membaca file. Pastikan format file benar.')
        showPreview.value = false
      } finally {
        isProcessing.value = false
      }
    }

    const handleImport = async (e: Event) => {
      e.preventDefault()
      
      if (!commodity.value || !year.value || !selectedFile.value) {
        alert('Mohon lengkapi semua field')
        return
      }

      if (previewData.value.length === 0) {
        alert('Tidak ada data untuk diimport')
        return
      }

      isProcessing.value = true

      try {
        // Prepare FormData
        const formData = new FormData()
        formData.append('file', selectedFile.value)
        formData.append('komoditas', commodity.value)  // PADI, JAGUNG, KEDELAI
        formData.append('tahun', year.value)           // 2025, 2024, 2023

        // Determine endpoint based on commodity type
        // For now, using produksi endpoint
        const endpoint = '/api/upload/produksi'

        console.log('Uploading to:', endpoint)
        console.log('Komoditas:', commodity.value)
        console.log('Tahun:', year.value)
        console.log('File:', selectedFile.value.name)

        // Send to backend
        const response = await fetch(endpoint, {
          method: 'POST',
          body: formData
        })

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }

        const result = await response.json()
        console.log('Upload result:', result)

        // Show success message
        alert(`Import berhasil!\n${result.message || 'Data telah diupload'}`)
        
        // Clear form
        clearPreview()
        commodity.value = ''
        year.value = ''

      } catch (error) {
        console.error('Import error:', error)
        alert(`Gagal import data: ${error instanceof Error ? error.message : 'Unknown error'}`)
      } finally {
        isProcessing.value = false
      }
    }

    const clearPreview = () => {
      selectedFile.value = null
      previewData.value = []
      previewHeaders.value = []
      showPreview.value = false
    }

    return () => (
      <div class="w-full px-36 text-gray-700">
        <h1 class="text-4xl py-10 font-semibold text-gray-700">Import Data Produksi</h1>

        <div class="bg-white rounded-lg p-10 shadow-sm border border-gray-100">
          <form onSubmit={handleImport}>
            <FormSelect
              id="commodity"
              label="Komoditas"
              modelValue={commodity.value}
              onUpdate:modelValue={(val: string) => commodity.value = val}
              options={commodityOptions}
              placeholder="--Pilih Komoditas--"
            />

            <FormSelect
              id="year"
              label="Periode Tahun"
              modelValue={year.value}
              onUpdate:modelValue={(val: string) => year.value = val}
              options={yearOptions}
              placeholder="--Pilih Periode Tahun--"
            />

            <FileUpload
              label="File Data Produksi"
              accept=".xlsx,.xls,.csv"
              maxSize="10 MB"
              supportedFormats=".xlsx, .xls, .csv"
              onFileSelected={handleFileSelected}
            />

            {isProcessing.value && (
              <div class="mt-6 text-center py-4 bg-blue-50 rounded-lg">
                <span class="text-blue-600">Memproses file...</span>
              </div>
            )}

            {showPreview.value && previewData.value.length > 0 && (
              <div class="mt-8">
                <div class="flex justify-between items-center mb-4">
                  <h3 class="text-lg font-semibold text-gray-800">
                    Preview Data ({previewData.value.length} baris pertama)
                  </h3>
                  <button
                    type="button"
                    onClick={clearPreview}
                    class="text-sm text-red-600 hover:text-red-700 font-medium"
                  >
                    Hapus File
                  </button>
                </div>

                <div class="overflow-x-auto border border-gray-200 rounded-lg">
                  <table class="min-w-full divide-y divide-gray-200">
                    <thead class="bg-gray-50">
                      <tr>
                        {previewHeaders.value.map((header) => (
                          <th 
                            key={header}
                            class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200 last:border-r-0"
                          >
                            {header}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody class="bg-white divide-y divide-gray-200">
                      {previewData.value.map((row, index) => (
                        <tr key={index} class="hover:bg-gray-50">
                          {previewHeaders.value.map((header) => (
                            <td 
                              key={header}
                              class="px-4 py-3 text-sm text-gray-700 border-r border-gray-200 last:border-r-0"
                            >
                              {row[header] || '-'}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div class="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p class="text-sm text-yellow-800">
                    <strong>Catatan:</strong> Hanya menampilkan 10 baris pertama sebagai preview. 
                    Semua data akan diimport saat Anda klik tombol "Import Data".
                  </p>
                </div>
              </div>
            )}

            <div class="flex justify-end gap-4 pt-5">
              {showPreview.value && (
                <button 
                  type="button"
                  onClick={clearPreview}
                  class="bg-gray-200 hover:bg-gray-300 text-gray-700 py-3 px-8 rounded-md font-medium text-sm transition-colors duration-200 cursor-pointer border-none"
                >
                  Batal
                </button>
              )}
              <button 
                type="submit" 
                disabled={!showPreview.value || isProcessing.value}
                class={`py-3 px-8 rounded-md font-medium text-sm transition-colors duration-200 border-none ${
                  showPreview.value && !isProcessing.value
                    ? 'bg-teal-500 hover:bg-teal-600 text-white cursor-pointer'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                Import Data
              </button>
            </div>
          </form>
        </div>
      </div>
    )
  }
})
