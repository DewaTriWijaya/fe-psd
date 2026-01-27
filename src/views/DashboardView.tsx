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

    // Filter options
    const komoditasOptions = [
      { value: 'PADI', label: 'Padi' },
      { value: 'JAGUNG', label: 'Jagung' },
      { value: 'KEDELAI', label: 'Kedelai' }
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

    const statusData = [
      { status: 'Tinggi', count: 30, bgColor: '#2c5f6f' },
      { status: 'Sedang', count: 8, bgColor: '#4a9d7f' },
      { status: 'Rendah', count: 4, bgColor: '#a8d5ba' }
    ]

    return () => (
      <div class="w-full px-36 py-10 text-gray-700">
        <h1 class="text-4xl font-semibold text-gray-700 mb-8">Dashboard</h1>

        {/* Filters Section */}
        <div class="grid grid-cols-4 gap-6 mb-8">
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
        <div class="grid grid-cols-3 gap-6 mb-10">
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
          lastUpdate="1 Agustus 2025"
          komoditas={selectedKomoditas.value}
          tahun={selectedTahun.value}
          bulanMulai={selectedBulanMulai.value}
          bulanAkhir={selectedBulanAkhir.value}
        />

        {/* Price Fluctuation Chart */}
        <ChartSection 
          title="Fluktuasi Harga"
          lastUpdate="1 Agustus 2025"
        />
      </div>
    )
  }
})
