import { defineComponent, ref } from 'vue'

export default defineComponent({
  name: 'DashboardView',
  setup() {
    const selectedRegion = ref('Semua Kecamatan')
    const selectedTimeRange = ref('Januari 2025 - Agustus 2025')

    return () => (
      <div class="w-full px-36 py-10 text-gray-700">
        <h1 class="text-4xl font-semibold text-gray-700 mb-8">Dashboard</h1>

        {/* Filters Section */}
        <div class="flex gap-6 mb-8">
          <div class="flex-1">
            <label class="block text-sm pb-2 font-medium text-gray-900">Wilayah:</label>
            <div class="relative">
              <select 
                v-model={selectedRegion.value}
                class="w-full p-3 border border-gray-200 rounded-md bg-white text-sm text-gray-700 cursor-pointer appearance-none focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                style={{ backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, backgroundPosition: 'right 0.5rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1.5em 1.5em' }}
              >
                <option value="Semua Kecamatan">Semua Kecamatan</option>
                <option value="Kecamatan A">Kecamatan A</option>
                <option value="Kecamatan B">Kecamatan B</option>
              </select>
            </div>
          </div>

          <div class="flex-1">
            <label class="block text-sm pb-2 font-medium text-gray-900">Berdasarkan Rentang Waktu:</label>
            <div class="relative">
              <select 
                v-model={selectedTimeRange.value}
                class="w-full p-3 border border-gray-200 rounded-md bg-white text-sm text-gray-700 cursor-pointer appearance-none focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                style={{ backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, backgroundPosition: 'right 0.5rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1.5em 1.5em' }}
              >
                <option value="Januari 2025 - Agustus 2025">Januari 2025 - Agustus 2025</option>
                <option value="2024">2024</option>
                <option value="2023">2023</option>
              </select>
            </div>
          </div>
        </div>

        {/* Status Cards */}
        <div class="grid grid-cols-3 gap-6 mb-10">
          <div class="bg-white rounded-lg p-6 border border-gray-100 shadow-sm">
            <div class="flex justify-center mb-3">
              <span class="bg-[#2c5f6f] text-white text-xs font-medium px-4 py-1 rounded-full">Status : Banyak</span>
            </div>
            <div class="text-center text-5xl font-bold text-gray-800">30</div>
          </div>

          <div class="bg-white rounded-lg p-6 border border-gray-100 shadow-sm">
            <div class="flex justify-center mb-3">
              <span class="bg-[#4a9d7f] text-white text-xs font-medium px-4 py-1 rounded-full">Status : Sedang</span>
            </div>
            <div class="text-center text-5xl font-bold text-gray-800">8</div>
          </div>

          <div class="bg-white rounded-lg p-6 border border-gray-100 shadow-sm">
            <div class="flex justify-center mb-3">
              <span class="bg-[#a8d5ba] text-white text-xs font-medium px-4 py-1 rounded-full">Status : Sedikit</span>
            </div>
            <div class="text-center text-5xl font-bold text-gray-800">4</div>
          </div>
        </div>

        {/* Map Section */}
        <div class="bg-white rounded-lg p-8 border border-gray-100 shadow-sm mb-10">
          <h2 class="text-xl font-semibold text-gray-800 mb-2">Persebaran Hasil Produksi</h2>
          <p class="text-sm text-gray-500 mb-6">Terakhir update: 1 Agustus 2025</p>
          
          <div class="flex justify-center items-center py-12 bg-gray-50 rounded-lg">
            <div class="text-center">
              <svg width="400" height="400" viewBox="0 0 400 400" class="mx-auto mb-4">
                {/* Simplified map placeholder - you would replace this with actual SVG map */}
                <rect x="50" y="50" width="300" height="300" fill="#e5e7eb" stroke="#9ca3af" stroke-width="2" rx="8"/>
                <text x="200" y="200" text-anchor="middle" fill="#6b7280" font-size="16" font-weight="500">
                  Peta Wilayah
                </text>
              </svg>
              
              <div class="flex justify-center gap-6 text-sm">
                <div class="flex items-center gap-2">
                  <div class="w-4 h-4 bg-[#2c5f6f] rounded"></div>
                  <span class="text-gray-600">Banyak</span>
                </div>
                <div class="flex items-center gap-2">
                  <div class="w-4 h-4 bg-[#4a9d7f] rounded"></div>
                  <span class="text-gray-600">Sedang</span>
                </div>
                <div class="flex items-center gap-2">
                  <div class="w-4 h-4 bg-[#a8d5ba] rounded"></div>
                  <span class="text-gray-600">Sedikit</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Price Fluctuation Chart */}
        <div class="bg-white rounded-lg p-8 border border-gray-100 shadow-sm">
          <h2 class="text-xl font-semibold text-gray-800 mb-2">Fluktuasi Harga</h2>
          <p class="text-sm text-gray-500 mb-6">Terakhir update: 1 Agustus 2025</p>
          
          <div class="bg-gray-50 rounded-lg p-8">
            <div class="flex justify-center items-center h-80">
              <div class="text-center">
                <svg width="600" height="300" viewBox="0 0 600 300">
                  {/* Chart placeholder - simplified representation */}
                  <line x1="50" y1="250" x2="550" y2="250" stroke="#9ca3af" stroke-width="1"/>
                  <line x1="50" y1="50" x2="50" y2="250" stroke="#9ca3af" stroke-width="1"/>
                  
                  {/* Sample line chart paths */}
                  <path d="M 50 200 L 100 180 L 150 170 L 200 160 L 250 150 L 300 140 L 350 130 L 400 120 L 450 110 L 500 100 L 550 95" 
                        stroke="#f97316" stroke-width="2" fill="none"/>
                  <path d="M 50 230 L 100 225 L 150 220 L 200 215 L 250 210 L 300 205 L 350 200 L 400 195 L 450 190 L 500 185 L 550 180" 
                        stroke="#3b82f6" stroke-width="2" fill="none"/>
                  
                  <text x="300" y="280" text-anchor="middle" fill="#6b7280" font-size="12">Bulan</text>
                  <text x="20" y="150" text-anchor="middle" fill="#6b7280" font-size="12" transform="rotate(-90 20 150)">Rp/Kg</text>
                </svg>
                
                <div class="flex justify-center gap-6 text-sm mt-4">
                  <div class="flex items-center gap-2">
                    <div class="w-4 h-1 bg-[#f97316]"></div>
                    <span class="text-gray-600">Produsen</span>
                  </div>
                  <div class="flex items-center gap-2">
                    <div class="w-4 h-1 bg-[#3b82f6]"></div>
                    <span class="text-gray-600">Konsumen</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }
})
