import { defineComponent, ref } from 'vue'
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
    const komoditasHargaOptions = [
      { value: 'Beras Premium', label: 'Beras Premium' },
      { value: 'Beras Medium', label: 'Beras Medium' },
      { value: 'Gula Pasir', label: 'Gula Pasir' },
      { value: 'Minyak Goreng', label: 'Minyak Goreng' },
      { value: 'Daging Ayam', label: 'Daging Ayam' },
      { value: 'Daging Sapi', label: 'Daging Sapi' },
      { value: 'Telur Ayam', label: 'Telur Ayam' },
      { value: 'Cabai Merah', label: 'Cabai Merah' },
      { value: 'Bawang Merah', label: 'Bawang Merah' }
    ]

    const tahunHargaOptions = [
      { value: '2024', label: '2024' },
      { value: '2023', label: '2023' },
      { value: '2022', label: '2022' }
    ]

    const tipeHargaOptions = [
      { value: 'eceran', label: 'Eceran' },
      { value: 'grosir', label: 'Grosir' }
    ]

    const statusData = [
      { status: 'Tinggi', count: 30, bgColor: '#0d4a2b' },
      { status: 'Sedang', count: 8, bgColor: '#1a6b3f' },
      { status: 'Rendah', count: 4, bgColor: '#2d8f5a' }
    ]

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
          {statusData.map((data) => (
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
          <div class="grid grid-cols-3 gap-6">
            <FilterSelect
              label="Komoditas Harga"
              modelValue={selectedKomoditasHarga.value}
              onUpdate:modelValue={(val: string) => selectedKomoditasHarga.value = val}
              options={komoditasHargaOptions}
            />
            <FilterSelect
              label="Tahun"
              modelValue={selectedTahunHarga.value.toString()}
              onUpdate:modelValue={(val: string) => selectedTahunHarga.value = parseInt(val)}
              options={tahunHargaOptions}
            />
            <FilterSelect
              label="Tipe Harga"
              modelValue={selectedTipeHarga.value}
              onUpdate:modelValue={(val: string) => selectedTipeHarga.value = val}
              options={tipeHargaOptions}
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
