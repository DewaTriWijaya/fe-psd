import { defineComponent, ref } from 'vue'
import * as XLSX from 'xlsx'

interface ExcelRow {
  [key: string]: any
}

export default defineComponent({
  name: 'ImportPriceView',
  setup() {
    const commodity = ref('')
    const year = ref('')
    const fileInput = ref<HTMLInputElement | null>(null)
    const fileName = ref('')
    const selectedFile = ref<File | null>(null)
    const previewData = ref<ExcelRow[]>([])
    const previewHeaders = ref<string[]>([])
    const showPreview = ref(false)
    const isProcessing = ref(false)

    const triggerFileUpload = () => {
      fileInput.value?.click()
    }

    const loading = ref(false)
    const successMessage = ref('')
    const errorMessage = ref('')

    const handleFileChange = async (event: Event) => {
      const target = event.target as HTMLInputElement
      if (target.files && target.files.length > 0) {
        const file = target.files[0]
        if (!file) return
        
        fileName.value = file.name
        selectedFile.value = file
        
        // Clear previous messages
        successMessage.value = ''
        errorMessage.value = ''
        
        // Process file for preview
        isProcessing.value = true
        
        try {
          // Read Excel file
          const data = await file.arrayBuffer()
          const workbook = XLSX.read(data, { type: 'array' })
          
          // Get first sheet
          const firstSheetName = workbook.SheetNames[0]
          if (!firstSheetName) {
            errorMessage.value = 'File tidak memiliki sheet'
            showPreview.value = false
            return
          }
          
          const worksheet = workbook.Sheets[firstSheetName]
          if (!worksheet) {
            errorMessage.value = 'Sheet tidak dapat dibaca'
            showPreview.value = false
            return
          }
          
          // Convert to JSON (assuming first row is header)
          const jsonData: ExcelRow[] = XLSX.utils.sheet_to_json(worksheet, { 
            defval: '',
            raw: false 
          })
          
          if (jsonData.length === 0) {
            errorMessage.value = 'File kosong atau format tidak valid'
            showPreview.value = false
            return
          }
          
          // Get headers from first row
          const firstRow = jsonData[0]
          if (!firstRow) {
            errorMessage.value = 'Format data tidak valid'
            showPreview.value = false
            return
          }
          
          const headers = Object.keys(firstRow)
          previewHeaders.value = headers
          
          // Get first 10 rows for preview
          previewData.value = jsonData.slice(0, 10)
          showPreview.value = true
          
        } catch (error) {
          console.error('Error reading file:', error)
          errorMessage.value = 'Gagal membaca file. Pastikan format file benar.'
          showPreview.value = false
        } finally {
          isProcessing.value = false
        }
      }
    }

    const clearPreview = () => {
      selectedFile.value = null
      fileName.value = ''
      previewData.value = []
      previewHeaders.value = []
      showPreview.value = false
      if (fileInput.value) {
        fileInput.value.value = ''
      }
    }

    const handleImport = async (e: Event) => {
      e.preventDefault()
      
      // Clear previous messages
      successMessage.value = ''
      errorMessage.value = ''

      // Validation
      if (!selectedFile.value) {
        errorMessage.value = 'Silakan pilih file terlebih dahulu'
        return
      }

      if (previewData.value.length === 0) {
        errorMessage.value = 'Tidak ada data untuk diimport'
        return
      }
      
      // Create FormData
      const formData = new FormData()
      formData.append('file', selectedFile.value)

      loading.value = true

      try {
        const response = await fetch('/api/upload/harga', {
          method: 'POST',
          body: formData
        })

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}))
          throw new Error(errorData.message || `Upload failed with status ${response.status}`)
        }

        const result = await response.json()
        successMessage.value = 'Data harga berhasil diimport!'
        
        // Clear form and preview
        clearPreview()
        commodity.value = ''
        year.value = ''

        console.log('Upload success:', result)
      } catch (error) {
        console.error('Upload error:', error)
        errorMessage.value = error instanceof Error ? error.message : 'Terjadi kesalahan saat mengupload file'
      } finally {
        loading.value = false
      }
    }

    return () => (
      <div class="w-full px-36 text-gray-700">
        <h1 class="text-4xl py-10 font-semibold text-gray-700">Import Data Harga</h1>
        <div class="bg-white rounded-lg p-10 shadow-sm border border-gray-100">
          <form onSubmit={handleImport}>
            <div class="">
              <label for="commodity" class="block text-sm pb-2 font-medium mb-3 text-gray-900">Periode Tahun</label>
              <div class="relative">
                <select 
                  id="commodity" 
                  v-model={commodity.value}
                  class="w-full p-3 border border-gray-200 rounded-md bg-gray-50 text-sm text-gray-700 cursor-pointer appearance-none focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                  style={{ backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, backgroundPosition: 'right 0.5rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1.5em 1.5em' }}
                >
                  <option value="" disabled selected>--Pilih Periode Tahun--</option>
                  <option value="2025">2025</option>
                  <option value="2024">2024</option>
                  <option value="2023">2023</option>
                  <option value="2022">2022</option>
                </select>
              </div>
            </div>

            <div class="mb-8">
              <label class="block text-sm pb-2 font-medium mb-3 text-gray-900">File Data Harga</label>
              <div 
                class="border-2 border-dashed border-gray-300 rounded-xl py-12 px-4 text-center cursor-pointer transition-all duration-200 bg-gray-50 hover:border-gray-400 hover:bg-gray-100"
                onClick={triggerFileUpload}
              >
                <input 
                  type="file" 
                  ref={fileInput} 
                  class="hidden" 
                  accept=".xlsx,.xls,.csv"
                  onChange={handleFileChange}
                />
                <div class="flex flex-col items-center justify-center">
                  <div class="mb-4">
                     <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" class="stroke-gray-400">
                        <path d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        <path d="M14 2V8H20" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        <path d="M12 18V12" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        <path d="M9 15H15" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                  </div>
                  {!fileName.value ? (
                    <p class="text-sm text-gray-500">
                      Masukan File Data Harga, atau <span class="text-blue-600 underline font-medium">klik untuk melihat</span>
                    </p>
                  ) : (
                    <p class="text-sm font-semibold text-emerald-600">
                      Selected: {fileName.value}
                    </p>
                  )}
                </div>
              </div>
              <div class="flex justify-between pt-2 mt-2 text-xs text-gray-400">
                <span>Support file formats: .xlsx, .xls, .csv</span>
                <span>Max size: 10 MB</span>
              </div>
            </div>

            {/* Processing indicator */}
            {isProcessing.value && (
              <div class="mt-6 text-center py-4 bg-blue-50 rounded-lg">
                <span class="text-blue-600">Memproses file...</span>
              </div>
            )}

            {/* Preview Data Table */}
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

            {/* Success Message */}
            {successMessage.value && (
              <div class="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                <div class="flex items-center">
                  <svg class="w-5 h-5 text-green-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
                  </svg>
                  <span class="text-sm font-medium text-green-800">{successMessage.value}</span>
                </div>
              </div>
            )}

            {/* Error Message */}
            {errorMessage.value && (
              <div class="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <div class="flex items-center">
                  <svg class="w-5 h-5 text-red-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"/>
                  </svg>
                  <span class="text-sm font-medium text-red-800">{errorMessage.value}</span>
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
                disabled={!showPreview.value || loading.value}
                class={`py-3 px-8 rounded-md font-medium text-sm transition-colors duration-200 border-none ${
                  showPreview.value && !loading.value
                    ? 'bg-teal-500 hover:bg-teal-600 text-white cursor-pointer'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                {loading.value ? (
                  <span class="flex items-center">
                    <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Mengupload...
                  </span>
                ) : (
                  'Import Data'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    )
  }
})
