import { defineComponent, ref } from 'vue'

export default defineComponent({
  name: 'ImportProductionView',
  setup() {
    const commodity = ref('')
    const year = ref('')
    const fileInput = ref<HTMLInputElement | null>(null)
    const fileName = ref('')

    const triggerFileUpload = () => {
      fileInput.value?.click()
    }

    const handleFileChange = (event: Event) => {
      const target = event.target as HTMLInputElement
      if (target.files && target.files.length > 0) {
        fileName.value = target.files[0]?.name || ''
      }
    }

    const handleImport = (e: Event) => {
      e.preventDefault()
      console.log('Importing...', {
        commodity: commodity.value,
        year: year.value,
        fileName: fileName.value
      })
    }

    return () => (
      <div class="w-full px-36 text-gray-700">
        <h1 class="text-4xl py-10 font-semibold text-gray-700">Import Data Produksi</h1>

        <div class="bg-white rounded-lg p-10 shadow-sm border border-gray-100">
          <form onSubmit={handleImport}>
            <div class="mb-8">
              <label for="commodity" class="block text-sm pb-2 font-medium mb-3 text-gray-900">Komoditas</label>
              <div class="relative">
                <select 
                  id="commodity" 
                  v-model={commodity.value}
                  class="w-full p-3 border border-gray-200 rounded-md bg-gray-50 text-sm text-gray-700 cursor-pointer appearance-none focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                  style={{ backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, backgroundPosition: 'right 0.5rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1.5em 1.5em' }}
                >
                  <option value="" disabled selected>--Pilih Komoditas--</option>
                  <option value="padi">Padi</option>
                  <option value="jagung">Jagung</option>
                  <option value="kedelai">Kedelai</option>
                </select>
              </div>
            </div>

            <div class="mb-8 pt-5">
              <label for="year" class="block text-sm pb-2 font-medium mb-3 text-gray-900">Periode Tahun</label>
              <div class="relative">
                <select 
                  id="year" 
                  v-model={year.value}
                  class="w-full p-3 border border-gray-200 rounded-md bg-gray-50 text-sm text-gray-700 cursor-pointer appearance-none focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                  style={{ backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, backgroundPosition: 'right 0.5rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1.5em 1.5em' }}
                >
                  <option value="" disabled selected>--Pilih Periode Tahun--</option>
                  <option value="2024">2024</option>
                  <option value="2023">2023</option>
                  <option value="2022">2022</option>
                </select>
              </div>
            </div>

            <div class="mb-8 pt-5">
              <label class="block text-sm pb-2 font-medium mb-3 text-gray-900">File Data Produksi</label>
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
                      Masukan File Data Produksi, atau <span class="text-blue-600 underline font-medium">klik untuk melihat</span>
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

            <div class="flex justify-end pt-5">
              <button 
                type="submit" 
                class="bg-teal-500 hover:bg-teal-600 text-white py-3 px-8 rounded-md font-medium text-sm transition-colors duration-200 cursor-pointer border-none"
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
