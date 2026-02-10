import { defineComponent, ref, onMounted, watch } from 'vue'
import FilterSelect from '../components/FilterSelect'
import StatusCard from '../components/StatusCard'
import MapSection from '../components/MapSection'
import ChartSection from '../components/ChartSection'

export default defineComponent({
  name: 'DashboardView',
  components: {
    FilterSelect,
    StatusCard,
    MapSection,
    ChartSection
  },
  setup() {
    // Filter states
    const selectedKomoditas = ref('PADI')
    const selectedTahun = ref(2025)
    const selectedBulanMulai = ref(1)
    const selectedBulanAkhir = ref(12)

    // Price chart states
    const selectedKomoditasHarga = ref('Beras Premium')
    const selectedTahunHarga = ref(2022)
    const selectedTipeHarga = ref('eceran')

    // Filter options
    const komoditasOptions = [
      { value: 'PADI', label: 'Padi' },
      { value: 'JAGUNG', label: 'Jagung' },
      { value: 'KEDELAI', label: 'Kedelai' },
      { value: 'Beras Premium', label: 'Beras Premium' }
    ]

    const tahunOptions = [
      { value: '2025', label: '2025' },
      { value: '2024', label: '2024' },
      { value: '2023', label: '2023' }
    ]

    const bulanOptions = [
      { value: '1', label: 'Januari' },
      { value: '2', label: 'Februari' },
      { value: '3', label: 'Maret' },
      { value: '4', label: 'April' },
      { value: '5', label: 'Mei' },
      { value: '6', label: 'Juni' },
      { value: '7', label: 'Juli' },
      { value: '8', label: 'Agustus' },
      { value: '9', label: 'September' },
      { value: '10', label: 'Oktober' },
      { value: '11', label: 'November' },
      { value: '12', label: 'Desember' }
    ]

    // Price chart filter options
    const komoditasHargaOptions = ref<Array<{ value: string; label: string }>>([
      { value: 'Beras Premium', label: 'Beras Premium' },
      { value: 'Beras Medium', label: 'Beras Medium' },
      { value: 'Gula Pasir', label: 'Gula Pasir' },
      { value: 'Minyak Goreng', label: 'Minyak Goreng' },
      { value: 'Daging Ayam', label: 'Daging Ayam' },
      { value: 'Daging Sapi', label: 'Daging Sapi' },
      { value: 'Telur Ayam', label: 'Telur Ayam' },
      { value: 'Cabai Merah', label: 'Cabai Merah' },
      { value: 'Bawang Merah', label: 'Bawang Merah' }
    ])

    const tahunHargaOptions = ref<Array<{ value: string; label: string }>>([      { value: '2024', label: '2024' },
      { value: '2023', label: '2023' },
      { value: '2022', label: '2022' }
    ])

    const tipeHargaOptions = ref<Array<{ value: string; label: string }>>([
      { value: 'eceran', label: 'Eceran' }
    ])

    // Status data - will be populated from API
    const statusData = ref<Array<{ status: string; count: number; bgColor: string }>>([
      { status: 'Cukup', count: 0, bgColor: '#2d8f5a' },
      { status: 'Baik', count: 0, bgColor: '#1a6b3f' },
      { status: 'Sangat Baik', count: 0, bgColor: '#0d4a2b' }
    ])

    // Status color mapping and order
    const statusOrder = ['Cukup', 'Baik', 'Sangat Baik']
    const statusColorMap: Record<string, string> = {
      'Sangat Baik': '#0d4a2b',
      'Baik': '#1a6b3f',
      'Cukup': '#2d8f5a'
    }

    // Function to fetch production data and compute status count
    const fetchStatusData = async () => {
      try {
        const params = new URLSearchParams({
          komoditas: selectedKomoditas.value,
          tahun: selectedTahun.value.toString(),
          bulan_mulai: selectedBulanMulai.value.toString(),
          bulan_akhir: selectedBulanAkhir.value.toString()
        })

        const url = `/api/analyze/pengelompokan-produksi?${params}`
        console.log('Fetching status data from:', url)
        
        const response = await fetch(url)
        
        if (!response.ok) {
          console.warn('Data tidak ditemukan')
          // Keep current statusData with 0 counts
          return
        }
        
        const result = await response.json()
        console.log('API Response:', result)

        // Get distribusi_realisasi from response
        if (result.distribusi_realisasi && typeof result.distribusi_realisasi === 'object') {
          const realizationMap = result.distribusi_realisasi as Record<string, number>
          
          console.log('Distribusi Realisasi map:', realizationMap)

          // Transform to statusData format with colors, sorted by statusOrder
          const newStatusData = statusOrder.map(status => ({
            status,
            count: realizationMap[status] || 0,
            bgColor: statusColorMap[status] || '#2d8f5a'
          }))

          console.log('Updated status data:', newStatusData)
          statusData.value = newStatusData
        } else {
          console.warn('Response does not contain distribusi_realisasi object')
          // Keep current statusData with 0 counts
        }
      } catch (error) {
        console.error('Error fetching status data:', error)
        // Keep current statusData with 0 counts
      }
    }

// Fetch komoditas harga, tahun harga, dan tipe harga dari API
    onMounted(async () => {
      try {
        // Fetch status data from production endpoint
        await fetchStatusData()

        // Fetch komoditas harga
        const responseKomoditas = await fetch('/api/metadata/komoditas-harga')
        const resultKomoditas = await responseKomoditas.json()

        if (resultKomoditas.success && resultKomoditas.data) {
          // Transform array string menjadi format { value, label }
          komoditasHargaOptions.value = resultKomoditas.data.map((item: string) => ({
            value: item,
            label: item
          }))

          // Set default value ke item pertama jika ada
          if (resultKomoditas.data.length > 0) {
            selectedKomoditasHarga.value = resultKomoditas.data[0]
          }
        }

        // Fetch tahun harga
        const responseTahun = await fetch('/api/metadata/tahun-harga')
        const resultTahun = await responseTahun.json()

        if (resultTahun.success && resultTahun.data) {
          // Transform array number menjadi format { value, label }
          tahunHargaOptions.value = resultTahun.data.map((year: number) => ({
            value: year.toString(),
            label: year.toString()
          }))

          // Set default value ke tahun pertama jika ada
          if (resultTahun.data.length > 0) {
            selectedTahunHarga.value = resultTahun.data[0]
          }
        }

        // Fetch tipe harga
        const responseTipe = await fetch('/api/metadata/tipe-harga')
        const resultTipe = await responseTipe.json()

        if (resultTipe.success && resultTipe.data) {
          // Transform array string menjadi format { value, label }
          tipeHargaOptions.value = resultTipe.data.map((item: string) => ({
            value: item,
            label: item.charAt(0).toUpperCase() + item.slice(1)
          }))

          // Set default value ke item pertama jika ada
          if (resultTipe.data.length > 0) {
            selectedTipeHarga.value = resultTipe.data[0]
          }
        }
      } catch (error) {
        console.error('Error fetching metadata:', error)
      }
    })

    // Watch for filter changes and refetch status data
    watch(
      () => [selectedKomoditas.value, selectedTahun.value, selectedBulanMulai.value, selectedBulanAkhir.value],
      () => {
        console.log('Filter changed, fetching status data...')
        fetchStatusData()
      }
    )

    return () => (
      <div class="w-full px-36 py-10 text-gray-700">
        <h1 class="text-4xl font-semibold text-gray-700 mb-8">Dashboard</h1>

        {/* Filters Section */}
        <div class="grid grid-cols-4 gap-6 mb-8" style="margin-bottom: 2rem;">
          <FilterSelect
            label="Komoditas"
            modelValue={selectedKomoditas.value}
            onUpdate:modelValue={(val: string) => selectedKomoditas.value = val}
            options={komoditasOptions}
          />
          <FilterSelect
            label="Tahun"
            modelValue={selectedTahun.value.toString()}
            onUpdate:modelValue={(val: string) => selectedTahun.value = parseInt(val)}
            options={tahunOptions}
          />
          <FilterSelect
            label="Bulan Mulai"
            modelValue={selectedBulanMulai.value.toString()}
            onUpdate:modelValue={(val: string) => selectedBulanMulai.value = parseInt(val)}
            options={bulanOptions}
          />
          <FilterSelect
            label="Bulan Akhir"
            modelValue={selectedBulanAkhir.value.toString()}
            onUpdate:modelValue={(val: string) => selectedBulanAkhir.value = parseInt(val)}
            options={bulanOptions}
          />
        </div>

        {/* Status Cards */}
        <div class="grid grid-cols-3 gap-10 mb-8" style="gap: 2.5rem; margin-bottom: 2rem;">
          {statusData.value.map((data) => (
            <StatusCard
              key={data.status}
              status={data.status}
              count={data.count}
              bgColor={data.bgColor}
            />
          ))}
        </div>

        {/* Map Section */}
        <MapSection
          title="Persebaran Hasil Produksi"
          lastUpdate="1 Januari 2025"
          komoditas={selectedKomoditas.value}
          tahun={selectedTahun.value}
          bulanMulai={selectedBulanMulai.value}
          bulanAkhir={selectedBulanAkhir.value}
        />

        {/* Price Fluctuation Filters */}
        <div class="mb-6">
          <h2 class="text-2xl font-semibold text-gray-700 mb-4">Fluktuasi Harga</h2>
          <div class="grid grid-cols-3 gap-6" style="margin-bottom: 2rem;">
            <FilterSelect
              label="Komoditas Harga"
              modelValue={selectedKomoditasHarga.value}
              onUpdate:modelValue={(val: string) => selectedKomoditasHarga.value = val}
              options={komoditasHargaOptions.value}
            />
            <FilterSelect
              label="Tahun"
              modelValue={selectedTahunHarga.value.toString()}
              onUpdate:modelValue={(val: string) => selectedTahunHarga.value = parseInt(val)}
              options={tahunHargaOptions.value}
            />
            <FilterSelect
              label="Tipe Harga"
              modelValue={selectedTipeHarga.value}
              onUpdate:modelValue={(val: string) => selectedTipeHarga.value = val}
              options={tipeHargaOptions.value}
            />
          </div>
        </div>

        {/* Price Fluctuation Chart */}
        <ChartSection
          title="Fluktuasi Harga"
          lastUpdate="1 Januari 2025"
          komoditas={selectedKomoditasHarga.value}
          tahun={selectedTahunHarga.value}
          tipeHarga={selectedTipeHarga.value}
        />
      </div>
    )
  }
})
