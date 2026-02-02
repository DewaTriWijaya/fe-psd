import { defineComponent, onMounted, ref, watch } from 'vue'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import garutGeoJSON from '../assets/Garut.json'

interface LegendItem {
  color: string
  label: string
}

interface KecamatanData {
  kecamatan: string
  kelompok_produksi: string
  kelompok_realisasi: string
  produksi_periode: number
  realisasi_periode: number
  target_periode: number
}

interface ApiResponse {
  detail_kecamatan: KecamatanData[]
}

export default defineComponent({
  name: 'MapSection',
  props: {
    title: {
      type: String,
      default: 'Persebaran Hasil Produksi'
    },
    lastUpdate: {
      type: String,
      default: '1 Januari 2025'
    },
    komoditas: {
      type: String,
      default: 'PADI'
    },
    tahun: {
      type: Number,
      default: 2025
    },
    bulanMulai: {
      type: Number,
      default: 1
    },
    bulanAkhir: {
      type: Number,
      default: 12
    }
  },
  setup(props) {
    const mapContainer = ref<HTMLDivElement | null>(null)
    const loading = ref(false)
    const error = ref<string | null>(null)
    let map: L.Map | null = null
    let garutLayer: L.GeoJSON | null = null

    const legendItems: LegendItem[] = [
      { color: '#0d4a2b', label: 'Tinggi' },
      { color: '#1a6b3f', label: 'Sedang' },
      { color: '#2d8f5a', label: 'Rendah' }
    ]

    // Function to get color based on production group
    const getColorFromGroup = (kelompokProduksi: string): string => {
      const group = kelompokProduksi.toLowerCase()
      if (group === 'tinggi') return '#0d4a2b'
      if (group === 'sedang') return '#1a6b3f'
      if (group === 'rendah') return '#2d8f5a'
      return '#cccccc' // Default color
    }

    // Function to get status label from color
    const getStatusLabel = (color: string) => {
      const item = legendItems.find(item => item.color === color)
      return item ? item.label : 'Unknown'
    }

    // Function to normalize kecamatan name for matching
    const normalizeKecamatanName = (name: string): string => {
      return name
        .toLowerCase()
        .replace(/^desa\s+/i, '')
        .replace(/^kecamatan\s+/i, '')
        .trim()
    }

    // Fetch data from API
    const fetchProductionData = async () => {
      loading.value = true
      error.value = null
      
      try {
        // Use relative URL to leverage Vite proxy
        const url = `/api/analyze/pengelompokan-produksi?komoditas=${props.komoditas}&tahun=${props.tahun}&bulan_mulai=${props.bulanMulai}&bulan_akhir=${props.bulanAkhir}`
        
        const response = await fetch(url)
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        
        const data: ApiResponse = await response.json()
        return data.detail_kecamatan
      } catch (err) {
        error.value = err instanceof Error ? err.message : 'Failed to fetch data'
        console.error('Error fetching production data:', err)
        return []
      } finally {
        loading.value = false
      }
    }

    // Create map data lookup
    const createDataLookup = (kecamatanData: KecamatanData[]) => {
      const lookup = new Map<string, KecamatanData>()
      
      kecamatanData.forEach(data => {
        const normalizedName = normalizeKecamatanName(data.kecamatan)
        lookup.set(normalizedName, data)
      })
      
      return lookup
    }

    // Initialize or update map
    const initializeMap = async () => {
      if (!mapContainer.value) return

      const kecamatanData = await fetchProductionData()
      const dataLookup = createDataLookup(kecamatanData)

      // Initialize map if not exists
      if (!map) {
        map = L.map(mapContainer.value).setView([-7.2, 107.9], 10)

        // Add OpenStreetMap tile layer with reduced opacity
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
          maxZoom: 18,
          opacity: 0.4,
        }).addTo(map)

        // Add a semi-transparent overlay to dim areas outside Garut
        const overlayPane = map.createPane('overlay')
        overlayPane.style.zIndex = '400'
        
        const worldBounds: L.LatLngBoundsExpression = [[-90, -180], [90, 180]]
        
        L.rectangle(worldBounds, {
          pane: 'overlay',
          fillColor: '#f8fafc',
          fillOpacity: 0.6,
          stroke: false,
          interactive: false
        }).addTo(map)
      }

      // Remove existing Garut layer if exists
      if (garutLayer && map) {
        map.removeLayer(garutLayer)
      }

      // Process GeoJSON data with API data
      const features: any[] = []
      
      Object.entries(garutGeoJSON).forEach(([name, geometry]: [string, any]) => {
        const normalizedName = normalizeKecamatanName(name)
        const kecamatanInfo = dataLookup.get(normalizedName)
        
        features.push({
          type: 'Feature',
          properties: {
            name: name,
            kecamatanData: kecamatanInfo,
            status: kecamatanInfo ? getColorFromGroup(kecamatanInfo.kelompok_produksi) : '#cccccc'
          },
          geometry: geometry
        })
      })

      const geojsonData = {
        type: 'FeatureCollection',
        features: features
      }

      // Add GeoJSON layer with styling
      garutLayer = L.geoJSON(geojsonData as any, {
        style: (feature) => {
          const color = feature?.properties?.status || '#cccccc'
          return {
            fillColor: color,
            weight: 2,
            opacity: 1,
            color: 'white',
            fillOpacity: 1
          }
        },
        onEachFeature: (feature, layer) => {
          const name = feature.properties.name
          const kecamatanData = feature.properties.kecamatanData
          
          let popupContent = `
            <div style="font-family: sans-serif; min-width: 200px;">
              <strong style="font-size: 14px;">${name}</strong><br/>
          `
          
          if (kecamatanData) {
            popupContent += `
              <hr style="margin: 8px 0; border: none; border-top: 1px solid #e5e7eb;">
              <div style="font-size: 12px; color: #666;">
                <strong>Kelompok Produksi:</strong> ${kecamatanData.kelompok_produksi}<br/>
                <strong>Kelompok Realisasi:</strong> ${kecamatanData.kelompok_realisasi}<br/>
                <strong>Produksi Periode:</strong> ${kecamatanData.produksi_periode.toLocaleString()} ton<br/>
                <strong>Target Periode:</strong> ${kecamatanData.target_periode.toFixed(2).toLocaleString()} ton<br/>
                <strong>Realisasi:</strong> ${kecamatanData.realisasi_periode.toFixed(2)}%
              </div>
            `
          } else {
            popupContent += `
              <span style="color: #999; font-size: 12px;">Data tidak tersedia</span>
            `
          }
          
          popupContent += `</div>`
          
          layer.bindPopup(popupContent)
          
          layer.on({
            mouseover: (e) => {
              const layer = e.target
              layer.setStyle({
                weight: 3,
                color: '#666',
                fillOpacity: 0.95
              })
            },
            mouseout: (e) => {
              const layer = e.target
              layer.setStyle({
                weight: 2,
                color: 'white',
                fillOpacity: 1
              })
            }
          })
        }
      })

      if (map && garutLayer) {
        garutLayer.addTo(map)
        // Fit map bounds to Garut region
        map.fitBounds(garutLayer.getBounds(), { padding: [20, 20] })
      }
    }

    onMounted(() => {
      initializeMap()
    })

    // Watch for prop changes and update map
    watch(
      () => [props.komoditas, props.tahun, props.bulanMulai, props.bulanAkhir],
      () => {
        initializeMap()
      }
    )

    return () => (
      <div class="bg-white rounded-lg p-8 border border-gray-100 shadow-sm mb-10" style="margin-bottom: 2.5rem;">
        <h2 class="text-xl font-semibold text-gray-800 mb-2">{props.title}</h2>
        <p class="text-sm text-gray-500 mb-6">Terakhir update: {props.lastUpdate}</p>
        
        {loading.value && (
          <div class="text-center py-4 text-gray-500">
            <span>Loading data...</span>
          </div>
        )}
        
        {error.value && (
          <div class="text-center py-4 text-red-500">
            <span>Error: {error.value}</span>
          </div>
        )}
        
        <div class="bg-gray-50 rounded-lg overflow-hidden">
          <div 
            ref={mapContainer} 
            style={{ height: '500px', width: '100%' }}
          ></div>
          
          <div class="flex justify-center gap-6 text-sm py-4">
            {legendItems.map((item) => (
              <div key={item.label} class="flex items-center gap-2">
                <div class="w-4 h-4 rounded" style={{ backgroundColor: item.color }}></div>
                <span class="text-gray-600">{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }
})
