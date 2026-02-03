import { defineComponent, ref, onMounted, watch } from 'vue'

interface ChartLegend {
  color: string
  label: string
}

interface StatistikBulanan {
  bulan: string
  harga_rata_rata: number
  harga_maksimum: number
  harga_minimum: number
  fluktuasi_persen: number
  volatilitas_persen: number
  standar_deviasi: number
  jumlah_data: number
}

interface StatistikKeseluruhan {
  rata_rata_tahunan: number
  harga_tertinggi: number
  harga_terendah: number
  standar_deviasi: number
  fluktuasi_persen: number
}

interface Trend {
  arah: string
  slope_harian: number
}

interface ApiResponse {
  komoditas: string
  tahun: number
  tipe_harga: string
  metadata: {
    tanggal_mulai: string
    tanggal_akhir: string
    total_data_points: number
  }
  statistik_bulanan: StatistikBulanan[]
  statistik_keseluruhan: StatistikKeseluruhan
  trend: Trend
  success: boolean
}

export default defineComponent({
  name: 'ChartSection',
  props: {
    title: {
      type: String,
      default: 'Fluktuasi Harga'
    },
    lastUpdate: {
      type: String,
      default: '1 Januari 2025'
    },
    komoditas: {
      type: String,
      default: 'Beras Premium'
    },
    tahun: {
      type: Number,
      default: 2025
    },
    tipeHarga: {
      type: String,
      default: 'eceran'
    }
  },
  setup(props) {
    const loading = ref(false)
    const error = ref<string | null>(null)
    const chartData = ref<StatistikBulanan[]>([])
    const statistikKeseluruhan = ref<StatistikKeseluruhan | null>(null)
    const trend = ref<Trend | null>(null)
    const komoditasName = ref('')
    const tahunData = ref(0)

    const legends: ChartLegend[] = [
      { color: '#f97316', label: 'Harga Maksimum' },
      { color: '#3b82f6', label: 'Harga Rata-rata' },
      { color: '#10b981', label: 'Harga Minimum' }
    ]

    // Fetch data from API
    const fetchPriceData = async () => {
      loading.value = true
      error.value = null
      
      try {
        const url = `/api/analyze/fluktuasi-harga?komoditas=${encodeURIComponent(props.komoditas)}&tahun=${props.tahun}&tipe_harga=${props.tipeHarga}`
        
        const response = await fetch(url)
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        
        const data: ApiResponse = await response.json()
        chartData.value = data.statistik_bulanan
        statistikKeseluruhan.value = data.statistik_keseluruhan
        trend.value = data.trend
        komoditasName.value = data.komoditas
        tahunData.value = data.tahun
        
        console.log('Chart data loaded:', {
          dataPoints: chartData.value.length,
          firstMonth: chartData.value[0],
          komoditas: komoditasName.value,
          tahun: tahunData.value
        })
      } catch (err) {
        error.value = err instanceof Error ? err.message : 'Failed to fetch data'
        console.error('Error fetching price data:', err)
      } finally {
        loading.value = false
      }
    }

    // Calculate chart dimensions and scales
    const getChartPath = (dataPoints: number[], allDataPoints: number[][]) => {
      if (dataPoints.length === 0) return ''
      
      const xStart = 80
      const xEnd = 1140
      const yStart = 50
      const yEnd = 350
      const width = xEnd - xStart
      const height = yEnd - yStart
      
      // Get global min/max from all data series for consistent scaling
      const allValues = allDataPoints.flat()
      const maxValue = Math.max(...allValues)
      const minValue = Math.min(...allValues)
      
      // Add padding to range to prevent flat lines when data is similar
      let range = maxValue - minValue
      if (range === 0) {
        // If all values are the same, create artificial range
        range = maxValue * 0.1 || 100
      } else if (range < maxValue * 0.01) {
        // If range is very small, add padding
        range = maxValue * 0.1
      }
      
      const points = dataPoints.map((value, index) => {
        const x = xStart + (index * (width / (dataPoints.length - 1 || 1)))
        // Center the data in the chart when range is small
        const midPoint = (maxValue + minValue) / 2
        const y = yStart + (height / 2) - ((value - midPoint) / range * height)
        return `${x},${y}`
      })
      
      return `M ${points.join(' L ')}`
    }

    // Format number to Indonesian Rupiah
    const formatRupiah = (value: number) => {
      return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
      }).format(value)
    }

    // Get month label from YYYY-MM format
    const getMonthLabel = (bulan: string) => {
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des']
      const parts = bulan.split('-')
      const monthIndex = parseInt(parts[1] || '1') - 1
      return months[monthIndex] || bulan
    }

    // Get trend icon and color
    const getTrendInfo = () => {
      if (!trend.value) return { icon: '→', color: 'text-gray-500', label: 'Stabil' }
      
      const arah = trend.value.arah.toLowerCase()
      if (arah === 'naik') return { icon: '↗', color: 'text-red-500', label: 'Naik' }
      if (arah === 'turun') return { icon: '↘', color: 'text-green-500', label: 'Turun' }
      return { icon: '→', color: 'text-gray-500', label: 'Stabil' }
    }

    onMounted(() => {
      fetchPriceData()
    })

    // Watch for prop changes and update chart
    watch(
      () => [props.komoditas, props.tahun, props.tipeHarga],
      () => {
        fetchPriceData()
      }
    )

    return () => {
      const hargaRataRata = chartData.value.map(d => d.harga_rata_rata)
      const hargaMaksimum = chartData.value.map(d => d.harga_maksimum)
      const hargaMinimum = chartData.value.map(d => d.harga_minimum)
      const trendInfo = getTrendInfo()
      
      const allDataPoints = [hargaMaksimum, hargaRataRata, hargaMinimum]
      
      // Debug logging
      if (chartData.value.length > 0) {
        const pathMax = getChartPath(hargaMaksimum, allDataPoints)
        const pathAvg = getChartPath(hargaRataRata, allDataPoints)
        const pathMin = getChartPath(hargaMinimum, allDataPoints)
        
        console.log('Chart paths:', {
          dataLength: chartData.value.length,
          hargaMaksimum,
          hargaRataRata,
          hargaMinimum,
          pathMax: pathMax.substring(0, 100),
          pathAvg: pathAvg.substring(0, 100),
          pathMin: pathMin.substring(0, 100)
        })
      }

      return (
        <div class="bg-white rounded-lg p-8 border border-gray-100 shadow-sm">
          <div class="flex justify-between items-start mb-6">
            <div>
              <h2 class="text-xl font-semibold text-gray-800 mb-1">{props.title}</h2>
              <p class="text-sm text-gray-500">
                {komoditasName.value || props.komoditas} - {tahunData.value || props.tahun} ({props.tipeHarga})
              </p>
            </div>
            {trend.value && (
              <div class={`flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-50 ${trendInfo.color}`}>
                <span class="text-2xl">{trendInfo.icon}</span>
                <div>
                  <div class="text-xs text-gray-500">Trend</div>
                  <div class="font-semibold">{trendInfo.label}</div>
                </div>
              </div>
            )}
          </div>
          
          {loading.value && (
            <div class="text-center py-12 text-gray-500">
              <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-teal-500"></div>
              <p class="mt-2">Memuat data...</p>
            </div>
          )}
          
          {error.value && (
            <div class="text-center py-12">
              <div class="bg-red-50 border border-red-200 rounded-lg p-4 inline-block">
                <p class="text-red-600">Error: {error.value}</p>
              </div>
            </div>
          )}
          
          {!loading.value && !error.value && chartData.value.length > 0 && (
            <div>
              {/* Statistics Cards */}
              {statistikKeseluruhan.value && (
                <div class="grid grid-cols-4 gap-4 mb-6">
                  <div class="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg border border-blue-200">
                    <div class="text-xs text-blue-600 font-medium mb-1">Rata-rata Tahunan</div>
                    <div class="text-lg font-bold text-blue-700">
                      {formatRupiah(statistikKeseluruhan.value.rata_rata_tahunan)}
                    </div>
                  </div>
                  <div class="bg-gradient-to-br from-orange-50 to-orange-100 p-4 rounded-lg border border-orange-200">
                    <div class="text-xs text-orange-600 font-medium mb-1">Harga Tertinggi</div>
                    <div class="text-lg font-bold text-orange-700">
                      {formatRupiah(statistikKeseluruhan.value.harga_tertinggi)}
                    </div>
                  </div>
                  <div class="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-lg border border-green-200">
                    <div class="text-xs text-green-600 font-medium mb-1">Harga Terendah</div>
                    <div class="text-lg font-bold text-green-700">
                      {formatRupiah(statistikKeseluruhan.value.harga_terendah)}
                    </div>
                  </div>
                  <div class="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-lg border border-purple-200">
                    <div class="text-xs text-purple-600 font-medium mb-1">Fluktuasi</div>
                    <div class="text-lg font-bold text-purple-700">
                      {statistikKeseluruhan.value.fluktuasi_persen.toFixed(2)}%
                    </div>
                  </div>
                </div>
              )}

              {/* Chart */}
              <div class="bg-gray-50 rounded-lg p-8">
                <div class="flex justify-center items-center">
                  <div class="text-center w-full">
                    <svg width="100%" height="450" viewBox="0 0 1200 450" class="mx-auto">
                      {/* Grid lines and Y-axis labels */}
                      {[0, 1, 2, 3, 4].map((i) => {
                        const y = 50 + (i * 75)
                        const maxValue = Math.max(...hargaMaksimum, ...hargaRataRata, ...hargaMinimum)
                        const minValue = Math.min(...hargaMaksimum, ...hargaRataRata, ...hargaMinimum)
                        const range = maxValue - minValue || 1
                        const priceValue = maxValue - (i * (range / 4))
                        const formattedPrice = priceValue >= 1000 
                          ? `${(priceValue / 1000).toFixed(1)}K`
                          : priceValue.toFixed(0)
                        
                        return (
                          <g key={`grid-${i}`}>
                            <line 
                              x1="80" 
                              y1={y} 
                              x2="1140" 
                              y2={y} 
                              stroke="#e5e7eb" 
                              stroke-width="1"
                              stroke-dasharray="4,4"
                            />
                            <text
                              x="70"
                              y={y + 4}
                              text-anchor="end"
                              fill="#6b7280"
                              font-size="12"
                              font-weight="500"
                            >
                              {formattedPrice}
                            </text>
                          </g>
                        )
                      })}

                      {/* Axes */}
                      <line x1="80" y1="350" x2="1140" y2="350" stroke="#9ca3af" stroke-width="2"/>
                      <line x1="80" y1="50" x2="80" y2="350" stroke="#9ca3af" stroke-width="2"/>
                      
                      {/* Chart lines with gradient effect */}
                      <defs>
                        {/* <linearGradient id="orangeGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                          <stop offset="0%" style="stop-color:#f97316;stop-opacity:0.3" />
                          <stop offset="100%" style="stop-color:#f97316;stop-opacity:0" />
                        </linearGradient> */}
                        <linearGradient id="blueGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                          <stop offset="0%" style="stop-color:#3b82f6;stop-opacity:0.3" />
                          <stop offset="100%" style="stop-color:#3b82f6;stop-opacity:0" />
                        </linearGradient>
                        <linearGradient id="greenGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                          <stop offset="0%" style="stop-color:#10b981;stop-opacity:0.3" />
                          <stop offset="100%" style="stop-color:#10b981;stop-opacity:0" />
                        </linearGradient>
                      </defs>

                      {/* Area fills */}
                      {hargaMaksimum.length > 0 && (
                        <path 
                          d={`${getChartPath(hargaMaksimum, allDataPoints)} L 1140,350 L 80,350 Z`}
                          fill="url(#orangeGradient)"
                        />
                      )}
                      
                      {/* Lines */}
                      <path 
                        d={getChartPath(hargaMaksimum, allDataPoints)} 
                        stroke="#f97316" 
                        stroke-width="3" 
                        fill="none"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                      />
                      <path 
                        d={getChartPath(hargaRataRata, allDataPoints)} 
                        stroke="#3b82f6" 
                        stroke-width="3" 
                        fill="none"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                      />
                      <path 
                        d={getChartPath(hargaMinimum, allDataPoints)} 
                        stroke="#10b981" 
                        stroke-width="3" 
                        fill="none"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                      />

                      {/* Data points and value labels for all three lines */}
                      {chartData.value.map((data, index) => {
                        const xStart = 80
                        const xEnd = 1140
                        const yStart = 50
                        const yEnd = 350
                        const width = xEnd - xStart
                        const height = yEnd - yStart
                        
                        const x = xStart + (index * (width / (chartData.value.length - 1 || 1)))
                        const maxValue = Math.max(...hargaMaksimum, ...hargaRataRata, ...hargaMinimum)
                        const minValue = Math.min(...hargaMaksimum, ...hargaRataRata, ...hargaMinimum)
                        
                        let range = maxValue - minValue
                        if (range === 0) {
                          range = maxValue * 0.1 || 100
                        } else if (range < maxValue * 0.01) {
                          range = maxValue * 0.1
                        }
                        
                        const midPoint = (maxValue + minValue) / 2
                        
                        // Calculate Y positions for all three values
                        const yMax = yStart + (height / 2) - ((data.harga_maksimum - midPoint) / range * height)
                        const yAvg = yStart + (height / 2) - ((data.harga_rata_rata - midPoint) / range * height)
                        const yMin = yStart + (height / 2) - ((data.harga_minimum - midPoint) / range * height)
                        
                        // Format values for labels
                        const maxLabel = data.harga_maksimum >= 1000
                          ? `${(data.harga_maksimum / 1000).toFixed(1)}K`
                          : data.harga_maksimum.toFixed(0)
                        const avgLabel = data.harga_rata_rata >= 1000
                          ? `${(data.harga_rata_rata / 1000).toFixed(1)}K`
                          : data.harga_rata_rata.toFixed(0)
                        const minLabel = data.harga_minimum >= 1000
                          ? `${(data.harga_minimum / 1000).toFixed(1)}K`
                          : data.harga_minimum.toFixed(0)
                        
                        return (
                          <g key={`point-${index}`}>
                            {/* Harga Maksimum - Orange */}
                            <circle 
                              cx={x} 
                              cy={yMax} 
                              r="5" 
                              fill="#f97316"
                              stroke="white"
                              stroke-width="2"
                            />
                            <text
                              x={x}
                              y={yMax - 12}
                              text-anchor="middle"
                              fill="#ea580c"
                              font-size="11"
                              font-weight="600"
                            >
                              {maxLabel}
                            </text>
                            
                            {/* Harga Rata-rata - Blue */}
                            <circle 
                              cx={x} 
                              cy={yAvg} 
                              r="5" 
                              fill="#3b82f6"
                              stroke="white"
                              stroke-width="2"
                            />
                            <text
                              x={x}
                              y={yAvg - 12}
                              text-anchor="middle"
                              fill="#1e40af"
                              font-size="11"
                              font-weight="600"
                            >
                              {avgLabel}
                            </text>
                            
                            {/* Harga Minimum - Green */}
                            <circle 
                              cx={x} 
                              cy={yMin} 
                              r="5" 
                              fill="#10b981"
                              stroke="white"
                              stroke-width="2"
                            />
                            <text
                              x={x}
                              y={yMin - 12}
                              text-anchor="middle"
                              fill="#047857"
                              font-size="11"
                              font-weight="600"
                            >
                              {minLabel}
                            </text>
                          </g>
                        )
                      })}
                      
                      {/* Month labels */}
                      {chartData.value.map((data, index) => {
                        const xStart = 80
                        const xEnd = 1140
                        const width = xEnd - xStart
                        const x = xStart + (index * (width / (chartData.value.length - 1 || 1)))
                        return (
                          <text 
                            key={`label-${data.bulan}`}
                            x={x} 
                            y="375" 
                            text-anchor="middle" 
                            fill="#6b7280" 
                            font-size="11"
                            font-weight="500"
                          >
                            {getMonthLabel(data.bulan)}
                          </text>
                        )
                      })}
                      
                      {/* Axis labels */}
                      <text x="355" y="300" text-anchor="middle" fill="#374151" font-size="13" font-weight="600">Bulan</text>
                      <text x="25" y="150" text-anchor="middle" fill="#374151" font-size="13" font-weight="600" transform="rotate(-90 25 150)">Harga (Rp/Kg)</text>
                    </svg>
                    
                    {/* Legend */}
                    <div class="flex justify-center gap-8 text-sm mt-6">
                      {legends.map((legend) => (
                        <div key={legend.label} class="flex items-center gap-2">
                          <div class="w-6 h-1 rounded-full" style={{ backgroundColor: legend.color }}></div>
                          <span class="text-gray-700 font-medium">{legend.label}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Monthly Details Table */}
              <div class="mt-6 bg-gray-50 rounded-lg p-6">
                <h3 class="text-sm font-semibold text-gray-700 mb-4">Detail Bulanan</h3>
                <div class="overflow-x-auto">
                  <table class="w-full text-sm">
                    <thead>
                      <tr class="border-b border-gray-300">
                        <th class="text-left py-2 px-3 text-gray-600 font-semibold">Bulan</th>
                        <th class="text-right py-2 px-3 text-gray-600 font-semibold">Rata-rata</th>
                        <th class="text-right py-2 px-3 text-gray-600 font-semibold">Maksimum</th>
                        <th class="text-right py-2 px-3 text-gray-600 font-semibold">Minimum</th>
                        <th class="text-right py-2 px-3 text-gray-600 font-semibold">Fluktuasi</th>
                        <th class="text-right py-2 px-3 text-gray-600 font-semibold">Data Points</th>
                      </tr>
                    </thead>
                    <tbody>
                      {chartData.value.map((data, index) => (
                        <tr 
                          key={data.bulan}
                          class={`border-b border-gray-200 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-blue-50 transition-colors`}
                        >
                          <td class="py-2 px-3 font-medium text-gray-700">{getMonthLabel(data.bulan)}</td>
                          <td class="py-2 px-3 text-right text-blue-600 font-semibold">{formatRupiah(data.harga_rata_rata)}</td>
                          <td class="py-2 px-3 text-right text-orange-600">{formatRupiah(data.harga_maksimum)}</td>
                          <td class="py-2 px-3 text-right text-green-600">{formatRupiah(data.harga_minimum)}</td>
                          <td class="py-2 px-3 text-right text-gray-700">{data.fluktuasi_persen.toFixed(2)}%</td>
                          <td class="py-2 px-3 text-right text-gray-500">{data.jumlah_data}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      )
    }
  }
})
